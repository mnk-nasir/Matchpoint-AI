"""
Startup Discovery Agent — Orchestrator
---------------------------------------
Runs all three discovery collectors, de-duplicates results, saves
new companies to the DiscoveredStartup table, and optionally promotes
them to StartupEvaluation if they cross a confidence threshold.

Called by the APScheduler every 12 hours.
"""
import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

# Minimum company name length to be considered valid
MIN_COMPANY_NAME_LEN = 3
# Maximum so we don't accidentally save full sentences
MAX_COMPANY_NAME_LEN = 80


def _is_valid_company_name(name: str) -> bool:
    """Basic validation for extracted company names."""
    if not name:
        return False
    name = name.strip()
    if len(name) < MIN_COMPANY_NAME_LEN or len(name) > MAX_COMPANY_NAME_LEN:
        return False
    # Reject if it's mostly lowercase (likely a sentence fragment)
    if name == name.lower():
        return False
    # Reject common noise phrases
    noise = {"the", "a company", "new startup", "this startup", "our company", "their startup"}
    if name.lower() in noise:
        return False
    return True


def run() -> Dict[str, int]:
    """
    Main entrypoint for the Startup Discovery Agent.
    Returns a summary dict with counts per source.
    """
    from core.models.discovery import DiscoveredStartup
    from core.services.startup_discovery import news_startup_finder
    from core.services.startup_discovery import linkedin_signal_finder
    from core.services.startup_discovery import product_launch_finder

    logger.info("[DiscoveryAgent] Starting Startup Discovery Agent run...")

    all_signals: List[Dict[str, Any]] = []

    # 1. News Startup Finder
    try:
        news_signals = news_startup_finder.run()
        all_signals.extend(news_signals)
        logger.info(f"[DiscoveryAgent] News signals: {len(news_signals)}")
    except Exception as e:
        logger.error(f"[DiscoveryAgent] NewsStartupFinder failed: {e}")

    # 2. LinkedIn/Social Signal Finder
    try:
        social_signals = linkedin_signal_finder.run()
        all_signals.extend(social_signals)
        logger.info(f"[DiscoveryAgent] Social signals: {len(social_signals)}")
    except Exception as e:
        logger.error(f"[DiscoveryAgent] LinkedInSignalFinder failed: {e}")

    # 3. Product Launch Finder
    try:
        launch_signals = product_launch_finder.run()
        all_signals.extend(launch_signals)
        logger.info(f"[DiscoveryAgent] Launch signals: {len(launch_signals)}")
    except Exception as e:
        logger.error(f"[DiscoveryAgent] ProductLaunchFinder failed: {e}")

    # De-duplicate by (company_name + article_url)
    seen_keys = set()
    unique_signals = []
    for signal in all_signals:
        key = (signal.get("company_name", "").lower().strip(), signal.get("article_url", ""))
        if key not in seen_keys:
            seen_keys.add(key)
            unique_signals.append(signal)

    # Save new discoveries to DB
    from core.models.evaluation import StartupEvaluation

    counts = {"news": 0, "social": 0, "launch": 0, "skipped": 0, "promoted": 0}

    for signal in unique_signals:
        company_name = signal.get("company_name", "").strip()

        if not _is_valid_company_name(company_name):
            counts["skipped"] += 1
            continue

        # Skip if URL was already seen in DB
        article_url = signal.get("article_url", "")
        if article_url and DiscoveredStartup.objects.filter(article_url=article_url).exists():
            counts["skipped"] += 1
            continue

        source = signal.get("source", "news")
        try:
            discovery, created = DiscoveredStartup.objects.get_or_create(
                company_name=company_name,
                article_url=article_url,
                defaults={
                    "source": source,
                    "founder_name": signal.get("founder_name", ""),
                    "product_name": signal.get("product_name", ""),
                    "headline": signal.get("headline", ""),
                    "industry_keywords": signal.get("industry_keywords", []),
                    "category": signal.get("category", ""),
                    "announcement_type": signal.get("announcement_type", ""),
                }
            )
            
            if created:
                counts[source] = counts.get(source, 0) + 1
                
                # REQUIREMENT: If company does not exist in the database, automatically create a new startup entry.
                if not StartupEvaluation.objects.filter(company_name__iexact=company_name).exists():
                    StartupEvaluation.objects.create(
                        company_name=company_name,
                        stage=StartupEvaluation.Stage.SEED if signal.get("funding_round") else StartupEvaluation.Stage.IDEA,
                        # Store discovery metadata in form_data for later review
                        form_data={
                            "discovery_source": source,
                            "discovery_headline": signal.get("headline"),
                            "discovery_url": article_url,
                            "industry_keywords": signal.get("industry_keywords", []),
                            "automatic_discovery": True
                        }
                    )
                    counts["promoted"] += 1
                    discovery.is_converted = True
                    discovery.save()

        except Exception as e:
            logger.warning(f"[DiscoveryAgent] Could not save '{company_name}': {e}")
            counts["skipped"] += 1

    total = sum(v for k, v in counts.items() if k in ["news", "social", "launch"])
    logger.info(
        f"[DiscoveryAgent] Complete. Saved {total} new signals, "
        f"Promoted {counts['promoted']} to StartupEvaluation. "
        f"(news={counts['news']}, social={counts['social']}, launch={counts['launch']}, "
        f"skipped={counts['skipped']})"
    )
    return counts
