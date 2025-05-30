"""
Enrichment Runner
-----------------
Scans unprocessed news articles, extracts structured intelligence,
and saves it to the database.
"""
import logging
from core.models.ingestion import NewsArticle
from core.models.enrichment import EnrichedStartup, FundingEvent
from core.models.evaluation import StartupEvaluation
from core.services.ai_scoring.engine import calculate_startup_score
from core.services.market_intelligence.engine import calculate_market_intelligence
from core.services.investor_matching.engine import calculate_investor_matches
from .extractor import enrich_text

logger = logging.getLogger(__name__)


def run():
    """Main enrichment runner. Called by the scheduler."""
    # In a real app we'd flag which articles are "processed". 
    # For now, we process the last 100 recent articles looking for funding events.
    articles = NewsArticle.objects.order_by("-published_at")[:100]
    
    created_startups = 0
    created_events = 0
    
    for article in articles:
        text = f"{article.headline}"
        intel = enrich_text(text)
        
        company = intel.get("company")
        if not company or company == "Unknown":
            continue
            
        startup, created = EnrichedStartup.objects.get_or_create(
            company_name=company,
            defaults={"industry": intel.get("industry", "Technology")}
        )
        if created:
            created_startups += 1
            
        # If there's a funding amount found, log it
        amount = intel.get("funding_amount")
        if amount:
            # Prevent duplicate events for the same article headline/startup
            event, e_created = FundingEvent.objects.get_or_create(
                startup=startup,
                amount=amount,
                round_name=intel.get("funding_round", "Unknown"),
                defaults={
                    "currency": "USD",
                    "source_url": article.url,
                    "announced_on": article.published_at
                }
            )
            if e_created:
                created_events += 1

        # Attempt to find the matching primary StartupEvaluation profile to update its score
        eval_profile = StartupEvaluation.objects.filter(company_name__icontains=company).first()
        if eval_profile:
            calculate_startup_score(eval_profile)
            calculate_market_intelligence(eval_profile)
            calculate_investor_matches(eval_profile)

    logger.info(f"[EnrichmentRunner] Structured {created_startups} new startups and {created_events} funding events.")
    return {"startups": created_startups, "events": created_events}
