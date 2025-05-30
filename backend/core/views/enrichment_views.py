from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from core.models.enrichment import EnrichedStartup
from core.serializers.enrichment_serializers import EnrichedStartupSerializer
from core.services.data_enrichment.extractor import enrich_text


class EnrichedStartupListAPIView(generics.ListAPIView):
    """GET /api/v1/enrichment/startups — List structured startup intel."""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = EnrichedStartupSerializer
    queryset = EnrichedStartup.objects.all().prefetch_related("funding_events")


class EnrichmentTestAPIView(APIView):
    """POST /api/v1/enrichment/test — Test the regex extraction logic."""
    permission_classes = [permissions.AllowAny]  # Allow easy testing

    def post(self, request):
        text = request.data.get("text", "")
        if not text:
            return Response({"error": "No text provided"}, status=400)
            
        result = enrich_text(text)
        return Response(result)
