"""
Company Registry Collector
--------------------------
Seeds company registry data from existing StartupEvaluation records.
In production this would connect to Companies House, Open Corporates, etc.
"""
import logging
from core.models.evaluation import StartupEvaluation
from core.models.ingestion import CompanyRegistryEntry

logger = logging.getLogger(__name__)


def run():
    """Main collector entrypoint. Called by the scheduler."""
    evaluations = StartupEvaluation.objects.exclude(company_name="").only(
        "company_name", "incorporation_year", "country", "form_data"
    )
    created = 0
    updated = 0
    for ev in evaluations:
        form_data = ev.form_data or {}
        step5 = form_data.get("step5", {})
        directors = []
        founder_name = step5.get("founderName", "")
        if founder_name:
            directors.append({"name": founder_name, "role": "CEO & Founder"})

        obj, was_created = CompanyRegistryEntry.objects.update_or_create(
            company_name=ev.company_name,
            defaults={
                "incorporation_year": ev.incorporation_year,
                "country": ev.country or "",
                "directors": directors,
            }
        )
        if was_created:
            created += 1
        else:
            updated += 1

    logger.info(f"[RegistryCollector] Created {created}, updated {updated} entries.")
    return {"created": created, "updated": updated}
