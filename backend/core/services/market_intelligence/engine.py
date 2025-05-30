import logging
from typing import Dict, Any
from django.utils import timezone
from datetime import timedelta
from core.models.ingestion import NewsArticle, SocialSignal
from core.models.enrichment import FundingEvent
from core.models.matching import StartupSignal

logger = logging.getLogger(__name__)

def calculate_market_intelligence(startup) -> StartupSignal:
    """
    Calculates market intelligence scores based on real news and social signals.
    """
    # 1. News Mentions Score (Last 30 days)
    recent_date = timezone.now() - timedelta(days=30)
    news_count = NewsArticle.objects.filter(
        company_name__iexact=startup.company_name,
        published_at__gte=recent_date
    ).count()
    
    # Cap news score at 100 (e.g., 20+ articles = 100%)
    news_score = min(100, news_count * 5)
    
    # 2. Sentiment Score
    latest_social = SocialSignal.objects.filter(
        company_name__iexact=startup.company_name
    ).order_by('-collected_at').first()
    
    sentiment_score = int(latest_social.sentiment_score) if latest_social else 50
    
    # 3. Industry Momentum
    # Base it on funding events in the same industry category
    industry = "Technology" # Default
    if hasattr(startup, 'form_data') and startup.form_data:
        industry = startup.form_data.get('industry', 'Technology')
        
    funding_count = FundingEvent.objects.filter(
        startup__industry__iexact=industry,
        created_at__gte=recent_date
    ).count()
    
    momentum_score = min(100, 40 + (funding_count * 10))
    
    # 4. Map to Labels
    def get_level(score):
        if score >= 75: return StartupSignal.Level.HIGH
        if score >= 45: return StartupSignal.Level.MEDIUM
        return StartupSignal.Level.LOW

    def get_trend(score):
        if score >= 70: return StartupSignal.Trend.RISING
        if score >= 40: return StartupSignal.Trend.STABLE
        return StartupSignal.Trend.FALLING

    # Create or Update Signal
    signal, created = StartupSignal.objects.update_or_create(
        startup=startup,
        defaults={
            "news_score": news_score,
            "sentiment_score": sentiment_score,
            "industry_momentum": momentum_score,
            "market_momentum": get_level(momentum_score),
            "investor_attention": get_trend(sentiment_score),
            "recent_news_activity": get_level(news_score),
        }
    )
    
    return signal
