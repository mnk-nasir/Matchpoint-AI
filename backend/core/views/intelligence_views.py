from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from core.models.evaluation import StartupEvaluation
from core.models.matching import StartupSignal, StartupInvestorMatch
from core.services.market_intelligence.engine import calculate_market_intelligence
from core.services.investor_matching.engine import calculate_investor_matches

class MarketIntelligenceAPIView(APIView):
    """
    Returns market intelligence data for a specific startup.
    Triggers calculation if data is missing or stale.
    """
    def get(self, request, startup_id):
        startup = get_object_or_404(StartupEvaluation, id=startup_id)
        
        # Try to get existing signal
        signal = getattr(startup, 'market_signal', None)
        
        # For now, we'll re-calculate on every GET to ensure it's fresh for the demo
        # (In production, we'd check freshness)
        signal = calculate_market_intelligence(startup)
        
        return Response({
            "newsScore": signal.news_score,
            "sentimentScore": signal.sentiment_score,
            "momentumScore": signal.industry_momentum,
            "marketMomentum": signal.market_momentum,
            "recentNewsActivity": signal.recent_news_activity,
            "investorAttention": signal.investor_attention
        })

class InvestorMatchesAPIView(APIView):
    """
    Returns ranked investor matches for a specific startup.
    """
    def get(self, request, startup_id):
        startup = get_object_or_404(StartupEvaluation, id=startup_id)
        
        # Refresh matches
        matches = calculate_investor_matches(startup)
        
        data = []
        for m in matches[:5]: # Top 5
            data.append({
                "investor": m.investor.firm_name or m.investor.user.first_name,
                "matchScore": m.match_score,
                "rationale": m.rationale
            })
            
        return Response(data)
