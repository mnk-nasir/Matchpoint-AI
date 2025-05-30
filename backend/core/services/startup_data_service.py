from typing import Dict, Any, List
from core.models.evaluation import StartupEvaluation
from django.db.models import QuerySet
from core.repositories.evaluation_repository import EvaluationRepository


def _safe_str(x: Any) -> str:
    try:
        return str(x)[:500]
    except Exception:
        return ""

def _get_field(fd: Any, key: str):
    if isinstance(fd, dict):
        if key in fd:
            return fd.get(key)
        for v in fd.values():
            if isinstance(v, dict) and key in v:
                return v.get(key)
    elif isinstance(fd, list):
        for item in fd:
            if isinstance(item, dict):
                if key in item:
                    return item.get(key)
                for v in item.values():
                    if isinstance(v, dict) and key in v:
                        return v.get(key)
    return None

def _serialize_eval(e: StartupEvaluation) -> Dict[str, Any]:
    fd = e.form_data or {}
    return {
        "id": str(e.id),
        "name": e.company_name,
        "industry": None,
        "revenue": _get_field(fd, "monthlyRevenue"),
        "growth_rate": _get_field(fd, "growthRate"),
        "burn_rate": _get_field(fd, "burnRate"),
        "funding_ask": _get_field(fd, "amountRaising"),
        "valuation": _get_field(fd, "preMoneyValuation"),
        "risk_score": e.total_score,
        "founder_experience": {
            "founders_count": _get_field(fd, "foundersCount"),
            "has_technical_founder": _get_field(fd, "hasTechnicalFounder"),
        },
        "market_size": _get_field(fd, "tam"),
        "stage": e.stage,
        "country": e.country,
        "rating": e.rating,
    }

def fetch_investor_context(user, query: str, *, ids: List[str] | None = None, stage: str | None = None, min_score: int | None = None, limit: int = 10) -> Dict[str, Any]:
    """
    Returns structured context for investor QA strictly from platform data.
    """
    qs: QuerySet[StartupEvaluation] = StartupEvaluation.objects.all().order_by("-total_score")
    if ids:
        qs = qs.filter(id__in=ids)
    if stage:
        qs = qs.filter(stage=stage)
    if min_score is not None:
        qs = qs.filter(total_score__gte=min_score)
    qs = qs[:limit]
    companies: List[Dict[str, Any]] = []
    for e in qs:
        fd = e.form_data or {}
        companies.append(
            {
                "id": str(e.id),
                "name": e.company_name,
                "stage": e.stage,
                "country": e.country,
                "score": e.total_score,
                "rating": e.rating,
                "mrr": _get_field(fd, "monthlyRevenue"),
                "active_users": _get_field(fd, "activeUsers"),
                "paying_customers": _get_field(fd, "payingCustomers"),
                "burn_rate": _get_field(fd, "burnRate"),
                "amount_raising": _get_field(fd, "amountRaising"),
            }
        )

    ctx: Dict[str, Any] = {
        "investor_id": _safe_str(getattr(user, "id", "anon")),
        "query": _safe_str(query),
        "companies": companies,
    }
    return ctx
