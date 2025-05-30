from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.authentication import BaseAuthentication
from core.services.ai_service import generate_narrative, fallback_narrative

class AINarrativeAPIView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    def post(self, request):
        data = request.data or {}
        company = data.get("company") or {}
        score = data.get("score") or 0
        sections = data.get("sections") or []
        # Temporary: Always use deterministic narrative to avoid client errors
        return Response(fallback_narrative(company, score), status=status.HTTP_200_OK)
