"""
LinkedIn Signal Finder (Simulation)
-------------------------------------
Detects startups mentioned in founder/launch announcements.
Equivalent to: linkedinSignalFinder.js

In a production environment this would be connected to a LinkedIn
scraping service or RapidAPI LinkedIn endpoint. This simulation
reads from existing SocialSignal records and simulates discovering
new companies from "founder announcement" type posts.

Extracts:
  - company name
  - founder name
  - announcement type
"""
import re
import logging
import feedparser

logger = logging.getLogger(__name__)

# In real deployment, these would be LinkedIn API calls.
# Simulated with RSS feeds that mimic founder announcements in startup media.
FOUNDER_ANNOUNCEMENT_FEEDS = [
    # Google News: founder launches, joins, announces
    "https://news.google.com/rss/search?q=founder+launches+startup&hl=en-US&gl=US&ceid=US:en",
    "https://news.google.com/rss/search?q=entrepreneur+announces+new+venture&hl=en-US&gl=US&ceid=US:en",
    "https://news.google.com/rss/search?q=ex+google+facebook+founder+startup&hl=en-US&gl=US&ceid=US:en",
    "https://news.google.com/rss/search?q=stealth+startup+emerge+launch&hl=en-US&gl=US&ceid=US:en",
]

ANNOUNCEMENT_TYPES = {
    "launch": ["launches", "launched", "unveils", "introduces", "reveals"],
    "funding": ["raises", "secures", "closes", "funded", "investment"],
    "hiring": ["hiring", "expanding team", "joins as ceo", "joins as cto", "appoints"],
    "partnership": ["partners", "partnership", "collaboration", "teams up"],
    "acquisition": ["acquired", "acquires", "acquisition", "merges"],
}

FOUNDER_TITLES = ["ceo", "cto", "co-founder", "founder", "cofounder", "chief executive"]


def detect_announcement_type(text: str) -> str:
    """Classify what type of announcement this is."""
    text_lower = text.lower()
    for ann_type, keywords in ANNOUNCEMENT_TYPES.items():
        if any(kw in text_lower for kw in keywords):
            return ann_type
    return "announcement"


def extract_founder_and_company(headline: str) -> dict:
    """
    Try to extract founder name and company name from typical patterns:
    'John Smith, CEO of AcmeCorp, announces...'
    'AcmeCorp founder Jane Doe launches...'
    """
    result = {"founder_name": "", "company_name": "", "announcement_type": ""}

    # Pattern: "Name, [title] of CompanyName"
    match = re.search(
        r"([A-Z][a-z]+ [A-Z][a-z]+),?\s+(?:co-)?(?:founder|ceo|cto|chief\s+\w+)\s+(?:of|at)\s+([A-Z][A-Za-z0-9\s\.]+?)(?:,|\.|$)",
        headline,
        re.IGNORECASE,
    )
    if match:
        result["founder_name"] = match.group(1).strip()[:100]
        result["company_name"] = match.group(2).strip()[:100]

    # Pattern: "CompanyName founder Name"
    if not result["company_name"]:
        match2 = re.match(r"^([A-Z][A-Za-z0-9\s\.]{3,50})\s+(?:co-)?founder\s+([A-Z][a-z]+ [A-Z][a-z]+)", headline)
        if match2:
            result["company_name"] = match2.group(1).strip()
            result["founder_name"] = match2.group(2).strip()

    # Fallback: grab the first capitalized word sequence as company
    if not result["company_name"]:
        for sep in [" — ", " - ", " | ", ": "]:
            if sep in headline:
                result["company_name"] = headline.split(sep)[0].strip()[:100]
                break

    result["announcement_type"] = detect_announcement_type(headline)
    return result


def run() -> list:
    """
    Main entrypoint. Scans founder announcement feeds and returns structured signals.
    """
    discoveries = []
    seen_urls = set()

    for feed_url in FOUNDER_ANNOUNCEMENT_FEEDS:
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

                extracted = extract_founder_and_company(headline)
                company = extracted.get("company_name", "")
                if not company or len(company) < 2:
                    continue

                discoveries.append({
                    "company_name": str(company),
                    "founder_name": str(extracted.get("founder_name", "")),
                    "announcement_type": str(extracted.get("announcement_type", "announcement")),
                    "headline": str(headline)[:500],
                    "article_url": str(url)[:1024],
                    "industry_keywords": [],
                    "source": "social",
                })

        except Exception as e:
            logger.error(f"[LinkedInSignalFinder] Feed error for {feed_url}: {e}")

    logger.info(f"[LinkedInSignalFinder] Found {len(discoveries)} founder announcement signals.")
    return discoveries
