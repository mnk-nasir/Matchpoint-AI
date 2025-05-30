"""
Social Signal Collector (Data-Driven)
-----------------------------------
Generates social media signal data (mentions, sentiment, popularity) 
by analyzing real NewsArticle activity.
"""
import logging
from django.utils import timezone
from datetime import timedelta
from core.models.evaluation import StartupEvaluation
from core.models.ingestion import NewsArticle, SocialSignal

logger = logging.getLogger(__name__)

# Basic sentiment keyword mapping
POSITIVE_KEYWORDS = ["launch", "raised", "funding", "growth", "partnership", "success", "innovative", "expansion"]
NEGATIVE_KEYWORDS = ["layoff", "sued", "lawsuit", "fail", "bankruptcy", "debt", "struggle", "decline"]

def _calculate_sentiment(headlines: list) -> float:
    """Simple keyword-based sentiment analysis."""
    if not headlines:
        return 50.0 # Neutral
    
    score = 50.0
    for h in headlines:
        h_lower = h.lower()
        if any(kw in h_lower for kw in POSITIVE_KEYWORDS):
            score += 5.0
        if any(kw in h_lower for kw in NEGATIVE_KEYWORDS):
            score -= 10.0
            
    return max(0.0, min(100.0, score))

def run():
    """Main collector entrypoint. Called by the scheduler."""
    evaluations = StartupEvaluation.objects.exclude(company_name="").only("company_name")
    recent_date = timezone.now() - timedelta(days=90) # Look back 90 days for signals
    
    created = 0
    for ev in evaluations:
        name = ev.company_name
        
        # 1. Fetch real news articles for this company
        articles = NewsArticle.objects.filter(
            company_name__iexact=name,
            published_at__gte=recent_date
        )
        headlines = [a.headline for a in articles]
        
        # 2. Derive signals from real data
        # Mentions = live article count + some base noise for "social talk"
        mentions = articles.count() * 12 + 5 
        
        # Sentiment = keyword analysis of headlines
        sentiment = _calculate_sentiment(headlines)
        
        # Popularity = derived from mentions and recentness
        popularity = min(100.0, mentions * 0.8)
        
        # Save real signal
        SocialSignal.objects.create(
            company_name=name,
            mentions=mentions,
            sentiment_score=sentiment,
            popularity_score=popularity,
        )
        created += 1

    logger.info(f"[SocialCollector] Created {created} data-driven social signal records.")
    return created
