"""
Management command: run_ingestion_scheduler
-------------------------------------------
Runs a background APScheduler process that executes the data ingestion
collectors on a cron schedule.

Usage:
    python manage.py run_ingestion_scheduler

Schedule:
    - News collection:     every 6 hours
    - Registry sync:       every 24 hours (daily)
    - Social signals:      every 12 hours
"""
import logging
from django.core.management.base import BaseCommand
from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.interval import IntervalTrigger

logger = logging.getLogger(__name__)


def collect_news():
    from core.services.data_ingestion.news_collector import run
    logger.info("[Scheduler] Running News Collector...")
    count = run()
    logger.info(f"[Scheduler] News Collector done. {count} articles ingested.")


def collect_registry():
    from core.services.data_ingestion.registry_collector import run
    logger.info("[Scheduler] Running Registry Collector...")
    result = run()
    logger.info(f"[Scheduler] Registry Collector done. Result: {result}")


def collect_social():
    from core.services.data_ingestion.social_collector import run
    logger.info("[Scheduler] Running Social Signal Collector...")
    count = run()
    logger.info(f"[Scheduler] Social Collector done. {count} signals ingested.")


def run_enrichment():
    from core.services.data_enrichment.runner import run
    logger.info("[Scheduler] Running Data Enrichment Engine...")
    result = run()
    logger.info(f"[Scheduler] Enrichment Engine done. Result: {result}")


def run_discovery():
    from core.services.startup_discovery.agent import run
    logger.info("[Scheduler] Running Startup Discovery Agent...")
    result = run()
    logger.info(
        f"[Scheduler] Discovery Agent done. "
        f"news={result.get('news', 0)}, "
        f"social={result.get('social', 0)}, "
        f"launch={result.get('launch', 0)}, "
        f"skipped={result.get('skipped', 0)}"
    )


class Command(BaseCommand):
    help = "Runs the Data Ingestion Engine with a scheduled background process."

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS("Starting Data Ingestion Engine..."))

        scheduler = BlockingScheduler(timezone="UTC")

        # News: every 6 hours
        scheduler.add_job(
            collect_news,
            trigger=IntervalTrigger(hours=6),
            id="news_collector",
            name="Startup News Collector",
            replace_existing=True,
        )

        # Registry: every 24 hours
        scheduler.add_job(
            collect_registry,
            trigger=IntervalTrigger(hours=24),
            id="registry_collector",
            name="Company Registry Collector",
            replace_existing=True,
        )

        # Social: every 12 hours
        scheduler.add_job(
            collect_social,
            trigger=IntervalTrigger(hours=12),
            id="social_collector",
            name="Social Signal Collector",
            replace_existing=True,
        )

        # Enrichment: every 1 hour
        scheduler.add_job(
            run_enrichment,
            trigger=IntervalTrigger(hours=1),
            id="enrichment_engine",
            name="Data Enrichment Engine",
            replace_existing=True,
        )

        # Discovery Agent: every 12 hours
        scheduler.add_job(
            run_discovery,
            trigger=IntervalTrigger(hours=12),
            id="startup_discovery_agent",
            name="Startup Discovery Agent",
            replace_existing=True,
        )

        self.stdout.write(self.style.SUCCESS(
            "\n📡 Scheduler active:\n"
            "   • News:            every 6 hours\n"
            "   • Registry:        every 24 hours\n"
            "   • Social:          every 12 hours\n"
            "   • Enrichment:      every 1 hour\n"
            "   • Discovery Agent: every 12 hours\n"
            "\nPress Ctrl+C to stop.\n"
        ))

        # Run an immediate initial pass before scheduling
        collect_news()
        collect_registry()
        collect_social()
        run_enrichment()
        run_discovery()

        try:
            scheduler.start()
        except (KeyboardInterrupt, SystemExit):
            self.stdout.write(self.style.WARNING("\nIngestion scheduler stopped."))
