"""
News Collector
--------------
Fetches startup-related news using Google News RSS feeds (no API key required).
Parses headlines and stores new articles to the NewsArticle model.
"""
import logging
import feedparser
from datetime import datetime, timezone
from django.utils import timezone as dj_tz
from core.models.ingestion import NewsArticle

logger = logging.getLogger(__name__)

RSS_FEEDS = [
    "https://news.google.com/rss/search?q=startup+funding&hl=en-US&gl=US&ceid=US:en",
    "https://news.google.com/rss/search?q=tech+startup+investment&hl=en-US&gl=US&ceid=US:en",
    "https://news.google.com/rss/search?q=startup+series+A+B+funding&hl=en-US&gl=US&ceid=US:en",
]


def extract_company_from_title(title: str) -> str:
    """Heuristic: The company name is usually before the first dash or comma."""
    for sep in [" - ", " | ", ", "]:
        if sep in title:
            return title.split(sep)[0].strip()
    return ""


def run():
    """Main collector entrypoint. Called by the scheduler."""
    total_created = 0
    for feed_url in RSS_FEEDS:
        try:
            feed = feedparser.parse(feed_url)
            for entry in feed.entries:
                url = entry.get("link", "")
                if not url or NewsArticle.objects.filter(url=url).exists():
                    continue

                title = entry.get("title", "")
                company = extract_company_from_title(title)

                # Parse published date
                published_at = None
                if entry.get("published_parsed"):
                    try:
                        published_at = datetime(*entry.published_parsed[:6], tzinfo=timezone.utc)
                    except Exception:
                        pass

                NewsArticle.objects.create(
                    company_name=company,
                    headline=title,
                    url=url,
                    source=feed.feed.get("title", "Google News"),
                    published_at=published_at,
                )
                total_created += 1
        except Exception as e:
            logger.error(f"News collector error for {feed_url}: {e}")

    logger.info(f"[NewsCollector] Created {total_created} new articles.")
    return total_created
