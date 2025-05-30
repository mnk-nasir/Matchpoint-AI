"""
News Startup Finder
-------------------
Scans startup/tech RSS feeds and extracts company names from headlines.
Equivalent to: newsStartupFinder.js

Extracts:
  - company name
  - headline
  - article url
  - industry keywords
"""
import re
import logging
import feedparser
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

# Expanded RSS feed sources
RSS_FEEDS = [
    # Google News - funding & startups
    "https://news.google.com/rss/search?q=startup+funding+raised&hl=en-US&gl=US&ceid=US:en",
    "https://news.google.com/rss/search?q=new+startup+launched&hl=en-US&gl=US&ceid=US:en",
    "https://news.google.com/rss/search?q=seed+funding+tech+startup&hl=en-US&gl=US&ceid=US:en",
    "https://news.google.com/rss/search?q=venture+capital+investment+startup&hl=en-US&gl=US&ceid=US:en",
    # TechCrunch RSS
    "https://techcrunch.com/feed/",
    # VentureBeat
    "https://venturebeat.com/feed/",
]

# Industry keyword taxonomy for detection
INDUSTRY_KEYWORDS = {
    "AI": ["artificial intelligence", "machine learning", "deep learning", "llm", "generative ai", "ai-powered"],
    "Fintech": ["fintech", "payments", "banking", "crypto", "blockchain", "defi", "neobank"],
    "HealthTech": ["healthtech", "medtech", "digital health", "biotech", "telemedicine", "health ai"],
    "EdTech": ["edtech", "education", "e-learning", "online learning", "lms"],
    "SaaS": ["saas", "software as a service", "cloud platform", "api platform", "b2b software"],
    "CleanTech": ["cleantech", "clean energy", "solar", "ev", "electric vehicle", "sustainability"],
    "Ecommerce": ["ecommerce", "marketplace", "d2c", "direct to consumer", "retail tech"],
    "Cybersecurity": ["cybersecurity", "security", "threat detection", "zero trust"],
    "DevTools": ["devtools", "developer tools", "developer platform", "open source"],
}

AMOUNT_PATTERN = re.compile(r"\$[\d,.]+\s*(?:million|billion|M|B|k)?", re.IGNORECASE)
ROUNDS = ["seed", "series a", "series b", "series c", "pre-seed", "angel"]


def extract_company_from_headline(headline: str) -> str:
    """
    Heuristic extraction: Company name is usually before the first dash, pipe, or comma.
    Also handles 'X raises', 'X secures', 'X launches' patterns.
    """
    # Pattern: "CompanyName raises/secures/launches..."
    match = re.match(r"^([A-Z][A-Za-z0-9\s\.]+?)\s+(raises|secures|closes|launches|unveils|announces|partners|acquires)", headline)
    if match:
        return match.group(1).strip()[:100]

    # Separator-based fallback
    for sep in [" — ", " - ", " | ", ": "]:
        if sep in headline:
            return headline.split(sep)[0].strip()[:100]

    return ""


def extract_industry_keywords(text: str) -> list:
    """Detect which industry categories appear in the text."""
    text_lower = text.lower()
    matched = []
    for category, keywords in INDUSTRY_KEYWORDS.items():
        if any(kw in text_lower for kw in keywords):
            matched.append(category)
    return matched


def extract_funding_round(text: str) -> str:
    """Extract funding round type from text."""
    text_lower = text.lower()
    for round_name in ROUNDS:
        if round_name in text_lower:
            return round_name.title()
    return ""


def run() -> list:
    """
    Main entrypoint. Scans all RSS feeds and returns a list of discovered startup signals.
    Returns list of dicts ready to be saved by the orchestrator.
    """
    discoveries = []
    seen_urls = set()

    for feed_url in RSS_FEEDS:
        try:
            feed = feedparser.parse(feed_url)
            for entry in feed.entries:
                url = entry.get("link", "")
                if not url or url in seen_urls:
                    continue
                seen_urls.add(url)

                headline = entry.get("title", "")
                if not headline:
                    continue

                company = extract_company_from_headline(headline)
                if not company or len(company) < 2:
                    continue

                # Parse published date
                published_at = None
                p = entry.get("published_parsed")
                if p:
                    try:
                        published_at = datetime(
                            year=p[0], month=p[1], day=p[2],
                            hour=p[3], minute=p[4], second=p[5],
                            tzinfo=timezone.utc
                        )
                    except Exception:
                        pass

                industry_keywords = extract_industry_keywords(headline + " " + entry.get("summary", ""))

                discoveries.append({
                    "company_name": str(company),
                    "headline": str(headline)[:500],
                    "article_url": str(url)[:1024],
                    "industry_keywords": industry_keywords,
                    "funding_round": extract_funding_round(headline),
                    "source": "news",
                    "published_at": published_at,
                })

        except Exception as e:
            logger.error(f"[NewsStartupFinder] Feed error for {feed_url}: {e}")

    logger.info(f"[NewsStartupFinder] Found {len(discoveries)} startup signals from news feeds.")
    return discoveries
