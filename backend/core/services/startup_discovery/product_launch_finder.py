"""
Product Launch Finder
----------------------
Detects startups launching new products from product launch feeds.
Equivalent to: productLaunchFinder.js

Sources:
  - ProductHunt RSS (via Google News search)
  - App store launch announcements  
  - Tech launch RSS aggregators

Extracts:
  - product name
  - company name
  - category
"""
import re
import logging
import feedparser

logger = logging.getLogger(__name__)

PRODUCT_LAUNCH_FEEDS = [
    # Google News: product launches
    "https://news.google.com/rss/search?q=startup+product+launch+new+app&hl=en-US&gl=US&ceid=US:en",
    "https://news.google.com/rss/search?q=new+SaaS+platform+launched&hl=en-US&gl=US&ceid=US:en",
    "https://news.google.com/rss/search?q=tech+company+launches+new+product&hl=en-US&gl=US&ceid=US:en",
    "https://news.google.com/rss/search?q=app+launch+new+startup&hl=en-US&gl=US&ceid=US:en",
]

PRODUCT_CATEGORIES = {
    "Mobile App": ["app", "ios", "android", "mobile"],
    "SaaS Platform": ["saas", "platform", "software", "dashboard", "tool"],
    "API / Developer Tool": ["api", "sdk", "developer", "devops", "cli"],
    "AI Product": ["ai", "gpt", "model", "intelligence", "assistant", "chatbot"],
    "Marketplace": ["marketplace", "exchange", "connect", "network"],
    "Hardware": ["device", "hardware", "wearable", "sensor", "iot"],
    "Fintech Product": ["wallet", "payment", "card", "banking", "insurance"],
    "Health App": ["health", "wellness", "fitness", "medical", "therapy"],
}

LAUNCH_VERBS = ["launches", "released", "debuts", "unveils", "introduces", "ships", "goes live", "available now"]


def is_launch_headline(text: str) -> bool:
    """Check if the headline describes a product launch."""
    text_lower = text.lower()
    return any(verb in text_lower for verb in LAUNCH_VERBS)


def detect_product_category(text: str) -> str:
    """Detect what category of product is being launched."""
    text_lower = text.lower()
    for category, keywords in PRODUCT_CATEGORIES.items():
        if any(kw in text_lower for kw in keywords):
            return category
    return "Tech Product"


def extract_product_and_company(headline: str) -> dict:
    """
    Extract product name and company from launch headlines.

    Patterns:
    - "CompanyName launches ProductName"
    - "ProductName by CompanyName"
    - "CompanyName releases ProductName for X"
    """
    result = {"product_name": "", "company_name": ""}

    # Pattern: "CompanyName launches/releases ProductName"
    match = re.match(
        r"^([A-Z][A-Za-z0-9\s\.]{2,50}?)\s+(?:launches?|releases?|unveils?|introduces?|ships?)\s+(.+?)(?:\s+for\s+|\s+to\s+|,|\.|$)",
        headline,
        re.IGNORECASE,
    )
    if match:
        result["company_name"] = match.group(1).strip()[:100]
        result["product_name"] = match.group(2).strip()[:150]
        return result

    # Pattern: "ProductName by CompanyName"
    match2 = re.search(r"(.+?)\s+by\s+([A-Z][A-Za-z0-9\s\.]{2,50})", headline)
    if match2:
        result["product_name"] = match2.group(1).strip()[:150]
        result["company_name"] = match2.group(2).strip()[:100]
        return result

    # Fallback: company = text before dash separator, product = after
    for sep in [" — ", " - ", " | "]:
        if sep in headline:
            parts = headline.split(sep, 1)
            result["company_name"] = parts[0].strip()[:100]
            result["product_name"] = parts[1].strip()[:150] if len(parts) > 1 else ""
            return result

    # Last resort: just take first sequence as company
    result["company_name"] = headline[:80].strip()
    return result


def run() -> list:
    """
    Main entrypoint. Scans product launch feeds and returns structured signals.
    """
    discoveries = []
    seen_urls = set()

    for feed_url in PRODUCT_LAUNCH_FEEDS:
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

                # Only process actual launch headlines
                if not is_launch_headline(headline):
                    continue

                extracted = extract_product_and_company(headline)
                company = extracted.get("company_name", "")
                if not company or len(company) < 2:
                    continue

                category = detect_product_category(headline + " " + entry.get("summary", ""))

                discoveries.append({
                    "company_name": str(company),
                    "product_name": str(extracted.get("product_name", "")),
                    "category": str(category),
                    "headline": str(headline)[:500],
                    "article_url": str(url)[:1024],
                    "industry_keywords": [str(category)],
                    "source": "launch",
                })

        except Exception as e:
            logger.error(f"[ProductLaunchFinder] Feed error for {feed_url}: {e}")

    logger.info(f"[ProductLaunchFinder] Found {len(discoveries)} product launch signals.")
    return discoveries
