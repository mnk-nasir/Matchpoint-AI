from core.models import InvestorInterestLead, AcceleratorInterestLead
from typing import Optional, Dict, Any


def create_investor_lead(validated: Dict[str, Any], meta: Dict[str, Optional[str]]):
    return InvestorInterestLead.objects.create(
        **validated,
        source_ip=meta.get("ip"),
        user_agent=meta.get("ua") or "",
    )


def create_accelerator_lead(validated: Dict[str, Any], meta: Dict[str, Optional[str]]):
    return AcceleratorInterestLead.objects.create(
        **validated,
        source_ip=meta.get("ip"),
        user_agent=meta.get("ua") or "",
        cohort_size=validated.get("cohort_size") or None,
    )

