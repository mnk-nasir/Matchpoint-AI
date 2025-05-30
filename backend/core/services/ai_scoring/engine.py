"""
AI Opportunity Scoring Engine
-----------------------------
Calculates dynamic Opportunity and Risk scores for startups based on 
both internal form data and external ingested signals (news, social).
"""
import logging
from core.models.ingestion import SocialSignal
from core.models.enrichment import FundingEvent

logger = logging.getLogger(__name__)


def calculate_startup_score(startup) -> dict:
    """
    Computes based on:
    - Market Momentum
    - Funding Activity
    - Team Strength
    - News Sentiment 
    - Investor Attention
    """
    name = startup.company_name
    
    # 1. Base Score from internal form
    base_score = startup.total_score or 50
    opportunity_score = base_score
    risk_score = 100 - base_score 
    
    # 2. Team Strength (Internal signal)
    # Check if they have a co-founder or strong team mapped in form_data
    form_data = startup.form_data or {}
    team_data = form_data.get("step5", {})
    if team_data.get("coFounders", "") != "no":
        opportunity_score += 10
        risk_score -= 5

    # 3. News Sentiment & Investor Attention (External Social Signals)
    social_signal = SocialSignal.objects.filter(company_name__icontains=name).first()
    if social_signal:
        # High sentiment boosts opportunity, lowers risk
        sentiment = social_signal.sentiment_score
        if sentiment > 80:
            opportunity_score += 15
            risk_score -= 10
        elif sentiment < 40:
            opportunity_score -= 10
            risk_score += 15
            
        # Popularity (Investor attention)
        if social_signal.popularity_score > 75:
            opportunity_score += 10

    # 4. Funding Activity (External Enrichment)
    funding_events = FundingEvent.objects.filter(startup__company_name__icontains=name)
    funding_dollars = sum([f.amount for f in funding_events if f.amount])
    if funding_dollars > 1_000_000:
        opportunity_score += 15
        risk_score -= 10
    elif funding_events.exists():
        opportunity_score += 5
        
    # Cap scores between 0 and 100
    opportunity_score = max(0, min(100, int(opportunity_score)))
    risk_score = max(0, min(100, int(risk_score)))
    
    # 5. Market Momentum Label
    if opportunity_score >= 80:
        momentum = "High"
    elif opportunity_score >= 50:
        momentum = "Medium"
    else:
        momentum = "Low"

    # Save the updated scores directly to the DB model
    startup.opportunity_score = opportunity_score
    startup.risk_score = risk_score
    startup.market_momentum = momentum
    startup.save(update_fields=['opportunity_score', 'risk_score', 'market_momentum'])
    
    logger.info(f"[ScoringEngine] Ranked {name}: Opp={opportunity_score}, Risk={risk_score}, Momentum={momentum}")

    return {
        "opportunityScore": opportunity_score,
        "riskScore": risk_score,
        "marketMomentum": momentum
    }
