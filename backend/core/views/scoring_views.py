from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from core.models.evaluation import StartupEvaluation
from core.services.ai_scoring.engine import calculate_startup_score


class CalculateStartupScoreAPIView(APIView):
    """
    POST /api/v1/scoring/calculate/<uuid:startup_id>
    Manually triggers the AI Opportunity Scoring Engine to recalculate
    the opportunity_score, risk_score, and market_momentum for a given startup.
    Returns the exact updated JSON snapshot.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, startup_id):
        startup = get_object_or_404(StartupEvaluation, id=startup_id)
        
        # Recalculate and securely save the score
        result = calculate_startup_score(startup)
        
        return Response(result, status=status.HTTP_200_OK)
