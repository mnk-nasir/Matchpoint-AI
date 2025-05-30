"""
Startup Intelligence API Views
Exposes the 5 core startup intelligence endpoints:

  GET /api/v1/startups                   - List all startups with intelligence data
  GET /api/v1/startups/<id>              - Full startup intelligence profile
  GET /api/v1/ai-opportunities           - AI-scored opportunity list (sorted by score)
  GET /api/v1/startups/<id>/matches      - Investor matches for a specific startup
  GET /api/v1/startups/<id>/news         - News articles related to a specific startup
"""
import logging
from typing import Any, Dict, List

from django.shortcuts import get_object_or_404
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from core.models.evaluation import StartupEvaluation
from core.models.ingestion import NewsArticle
from core.models.matching import StartupInvestorMatch
from core.services.ai_scoring.engine import calculate_startup_score
from core.services.match_engine import match_startup_with_investors

logger = logging.getLogger(__name__)


def _extract_form_intelligence(evaluation: StartupEvaluation) -> Dict[str, Any]:
    """
    Extracts structured intelligence data from a StartupEvaluation object.
    Safely parses JSON form_data, returning rich startup fields.
    """
    fd = evaluation.form_data or {}
    s1 = fd.get("step1") or {}
    s2 = fd.get("step2") or {}
    s3 = fd.get("step3") or {}
    s4 = fd.get("step4") or {}
    s5 = fd.get("step5") or {}
    s6 = fd.get("step6") or {}

    industry = (
        s1.get("sector") or s1.get("industry") or s1.get("industryType")
        or s2.get("sector") or s2.get("industry") or s2.get("industryFocus")
        or s3.get("sector") or s3.get("industry") or None
    )
    solution = s2.get("solution") or s2.get("productDescription") or s1.get("tagline") or ""
    problem = s2.get("problemStatement") or s2.get("problem") or ""
    founders_count = s5.get("foundersCount") or s5.get("teamSize") or 1
    funding_ask = s6.get("amountRaising") or s6.get("fundingAsk") or None
    mrr = s4.get("monthlyRevenue") or s4.get("mrr") or 0
    tam_size = s3.get("tamSize") or s3.get("marketSize") or None
    website = s1.get("website") or s1.get("companyWebsite") or ""
    logo_url = s1.get("companyLogoUrl") or s1.get("logo") or ""

    return {
        "industry": industry,
        "solution": solution,
        "problem": problem,
        "founders_count": founders_count,
        "funding_ask": funding_ask,
        "mrr": mrr,
        "tam_size": tam_size,
        "website": website,
        "logo_url": logo_url,
    }


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/v1/startups
# ─────────────────────────────────────────────────────────────────────────────
class StartupListAPIView(APIView):
    """
    Returns a paginated list of all startups with core intelligence data.
    Query params:
      ?limit=N   (default 20, max 100)
      ?stage=X   (optional filter: IDEA, SEED, SERIES_A, etc.)
      ?search=X  (optional filter by company name)
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        try:
            limit = min(int(request.query_params.get("limit", "20")), 100)
        except ValueError:
            limit = 20

        qs = StartupEvaluation.objects.order_by("-created_at")

        # Optional filters
        stage = request.query_params.get("stage")
        if stage:
            qs = qs.filter(stage__iexact=stage)

        search = request.query_params.get("search")
        if search:
            qs = qs.filter(company_name__icontains=search)

        qs = qs[:limit]

        results: List[Dict[str, Any]] = []
        for e in qs:
            intel = _extract_form_intelligence(e)
            results.append({
                "id": str(e.id),
                "company_name": e.company_name,
                "stage": e.stage,
                "country": e.country,
                "industry": intel["industry"],
                "funding_raised": float(e.funding_raised),
                "funding_ask": intel["funding_ask"],
                "logo_url": intel["logo_url"],
                "opportunity_score": e.opportunity_score,
                "risk_score": e.risk_score,
                "market_momentum": e.market_momentum,
                "rating": e.rating,
                "created_at": e.created_at.isoformat(),
            })

        return Response({
            "count": len(results),
            "results": results
        }, status=status.HTTP_200_OK)


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/v1/startups/<id>
# ─────────────────────────────────────────────────────────────────────────────
class StartupDetailAPIView(APIView):
    """
    Returns the full intelligence profile for a single startup.
    Includes all scored fields, form intelligence, and funding data.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, startup_id, *args, **kwargs):
        startup = get_object_or_404(StartupEvaluation, id=startup_id)
        intel = _extract_form_intelligence(startup)

        data = {
            "id": str(startup.id),
            "company_name": startup.company_name,
            "stage": startup.stage,
            "country": startup.country,
            "legal_structure": startup.legal_structure,
            "incorporation_year": startup.incorporation_year,
            "funding_raised": float(startup.funding_raised),
            "rating": startup.rating,

            # AI Scores
            "opportunity_score": startup.opportunity_score,
            "risk_score": startup.risk_score,
            "market_momentum": startup.market_momentum,
            "total_score": startup.total_score,

            # Extracted Intelligence
            "industry": intel["industry"],
            "solution": intel["solution"],
            "problem": intel["problem"],
            "founders_count": intel["founders_count"],
            "funding_ask": intel["funding_ask"],
            "mrr": intel["mrr"],
            "tam_size": intel["tam_size"],
            "website": intel["website"],
            "logo_url": intel["logo_url"],

            "created_at": startup.created_at.isoformat(),
            "updated_at": startup.updated_at.isoformat(),
        }

        return Response(data, status=status.HTTP_200_OK)


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/v1/ai-opportunities
# ─────────────────────────────────────────────────────────────────────────────
class AIOpportunitiesIntelligenceAPIView(APIView):
    """
    Returns the top AI-scored opportunities sorted by opportunity_score.
    Recalculates and saves scores for any startup that hasn't been scored yet.
    Query params:
      ?limit=N   (default 10, max 50)
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        try:
            limit = min(int(request.query_params.get("limit", "10")), 50)
        except ValueError:
            limit = 10

        qs = StartupEvaluation.objects.order_by("-opportunity_score")[:limit]

        results: List[Dict[str, Any]] = []
        for e in qs:
            # If score has never been calculated, compute it now
            if e.opportunity_score == 0 and e.risk_score == 0:
                try:
                    scores = calculate_startup_score(e)
                    e.opportunity_score = scores.get("opportunityScore", 0)
                    e.risk_score = scores.get("riskScore", 50)
                    e.market_momentum = scores.get("marketMomentum", "Medium")
                    e.save(update_fields=["opportunity_score", "risk_score", "market_momentum"])
                except Exception as ex:
                    logger.warning(f"[AIOpportunities] Could not score {e.company_name}: {ex}")

            intel = _extract_form_intelligence(e)
            results.append({
                "id": str(e.id),
                "company_name": e.company_name,
                "stage": e.stage,
                "country": e.country,
                "industry": intel["industry"],
                "logo_url": intel["logo_url"],
                "opportunity_score": e.opportunity_score,
                "risk_score": e.risk_score,
                "market_momentum": e.market_momentum,
                "rating": e.rating,
                "funding_raised": float(e.funding_raised),
            })

        return Response({
            "count": len(results),
            "results": results
        }, status=status.HTTP_200_OK)


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/v1/startups/<id>/matches
# ─────────────────────────────────────────────────────────────────────────────
class StartupMatchesAPIView(APIView):
    """
    Returns a sorted list of investor matches for a specific startup.
    Triggers a fresh match calculation if no saved matches exist.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, startup_id, *args, **kwargs):
        startup = get_object_or_404(StartupEvaluation, id=startup_id)

        # Check if we have saved matches already
        saved_matches = StartupInvestorMatch.objects.filter(
            startup=startup
        ).select_related("investor__user").order_by("-match_score")

        if saved_matches.exists():
            # Return from cached DB rows
            results = []
            for m in saved_matches[:10]:
                inv = m.investor
                firm = (
                    inv.firm_name
                    or inv.user.company
                    or f"{inv.user.first_name} {inv.user.last_name}".strip()
                    or "Anonymous Investor"
                )
                results.append({
                    "investor": firm,
                    "investorId": str(inv.user.id),
                    "matchScore": m.match_score,
                    "rationale": m.rationale,
                })
        else:
            # Compute fresh matches and save them
            results = match_startup_with_investors(str(startup.id))

        if not results:
            return Response({
                "count": 0,
                "results": [],
                "message": "No matching investors found for this startup yet."
            }, status=status.HTTP_200_OK)

        return Response({
            "startup_id": str(startup.id),
            "company_name": startup.company_name,
            "count": len(results),
            "results": results,
        }, status=status.HTTP_200_OK)


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/v1/startups/<id>/news
# ─────────────────────────────────────────────────────────────────────────────
class StartupNewsAPIView(APIView):
    """
    Returns news articles related to a specific startup.
    Matches articles by company name (case-insensitive).
    Query params:
      ?limit=N   (default 10, max 50)
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, startup_id, *args, **kwargs):
        startup = get_object_or_404(StartupEvaluation, id=startup_id)

        try:
            limit = min(int(request.query_params.get("limit", "10")), 50)
        except ValueError:
            limit = 10

        # Match news by company name
        articles = NewsArticle.objects.filter(
            company_name__icontains=startup.company_name
        ).order_by("-published_at")[:limit]

        # Fallback: try partial match (first word of company name)
        if not articles.exists():
            first_word = startup.company_name.split()[0] if startup.company_name else ""
            if first_word and len(first_word) > 3:
                articles = NewsArticle.objects.filter(
                    headline__icontains=first_word
                ).order_by("-published_at")[:limit]

        results = []
        for a in articles:
            results.append({
                "id": str(a.id),
                "headline": a.headline,
                "source": a.source,
                "url": a.url,
                "published_at": a.published_at.isoformat() if a.published_at else None,
                "collected_at": a.collected_at.isoformat(),
            })

        return Response({
            "startup_id": str(startup.id),
            "company_name": startup.company_name,
            "count": len(results),
            "results": results,
        }, status=status.HTTP_200_OK)
