from typing import Any, Dict, List
from django.db.models import Count
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status

from core.models import StartupEvaluation


class InvestorDashboardStatsAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        total = StartupEvaluation.objects.count()
        # Treat strong and high potential as "AI matched" for now
        ai_matched = StartupEvaluation.objects.filter(
            rating__in=[StartupEvaluation.Rating.STRONG, StartupEvaluation.Rating.HIGH_POTENTIAL]
        ).count()
        # Placeholders until watchlist/meetings features exist
        saved = 0
        meetings = 0

        # Use stage as a proxy for sector until sector taxonomy exists
        by_stage = (
            StartupEvaluation.objects.values("stage")
            .annotate(count=Count("id"))
            .order_by("stage")
        )
        sectors: List[Dict[str, Any]] = [
            {"name": row["stage"], "count": row["count"]} for row in by_stage
        ]

        by_rating = (
            StartupEvaluation.objects.values("rating")
            .annotate(count=Count("id"))
            .order_by("rating")
        )
        total_for_buckets = sum(r["count"] for r in by_rating) or 1
        risk_buckets = [
            {
                "label": (r["rating"] or "UNKNOWN"),
                "count": r["count"],
                "percent": round((r["count"] / total_for_buckets) * 100, 2),
            }
            for r in by_rating
        ]

        data = {
            "total_startups": total,
            "ai_matched": ai_matched,
            "saved": saved,
            "meetings": meetings,
            "sectors": sectors,
            "risk_buckets": risk_buckets,
        }
        return Response(data, status=status.HTTP_200_OK)


class StartupsListAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        try:
            limit = int(request.query_params.get("limit", "5"))
        except ValueError:
            limit = 5
        qs = StartupEvaluation.objects.order_by("-created_at")[:limit]
        rows: List[Dict[str, Any]] = []
        for e in qs:
            # Extract optional industry and funding ask from form_data if present
            industry = None
            funding_ask = None
            try:
                fd = e.form_data or {}
                s6 = fd.get("step6") or {}
                funding_ask = s6.get("amountRaising")
                # Industry placeholder: no canonical field, keep None/blank
            except Exception:
                pass
            rows.append(
                {
                    "id": str(e.id),
                    "name": e.company_name,
                    "industry": industry,
                    "funding_ask": funding_ask,
                    "risk_score": e.total_score,
                }
            )
        return Response({"results": rows}, status=status.HTTP_200_OK)

