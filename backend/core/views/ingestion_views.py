from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from core.models.ingestion import NewsArticle, CompanyRegistryEntry, SocialSignal
from core.serializers.ingestion_serializers import (
    NewsArticleSerializer,
    CompanyRegistrySerializer,
    SocialSignalSerializer,
)


class NewsArticleListAPIView(generics.ListAPIView):
    """GET /api/v1/ingestion/news — Latest startup news articles."""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = NewsArticleSerializer

    def get_queryset(self):
        qs = NewsArticle.objects.all()
        company = self.request.query_params.get("company")
        if company:
            qs = qs.filter(company_name__icontains=company)
        return qs[:50]


class CompanyRegistryListAPIView(generics.ListAPIView):
    """GET /api/v1/ingestion/registry — Company registry entries."""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CompanyRegistrySerializer

    def get_queryset(self):
        qs = CompanyRegistryEntry.objects.all()
        company = self.request.query_params.get("company")
        if company:
            qs = qs.filter(company_name__icontains=company)
        return qs[:50]


class SocialSignalListAPIView(generics.ListAPIView):
    """GET /api/v1/ingestion/social — Social signals for companies."""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = SocialSignalSerializer

    def get_queryset(self):
        qs = SocialSignal.objects.all()
        company = self.request.query_params.get("company")
        if company:
            qs = qs.filter(company_name__icontains=company)
        return qs[:50]


class IngestionStatusAPIView(APIView):
    """GET /api/v1/ingestion/status — Summary of ingested data counts."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response({
            "news_articles": NewsArticle.objects.count(),
            "registry_entries": CompanyRegistryEntry.objects.count(),
            "social_signals": SocialSignal.objects.count(),
        })


class TriggerIngestionAPIView(APIView):
    """POST /api/v1/ingestion/trigger — Manually trigger a collection run."""
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        collector = request.data.get("collector", "all")
        results = {}

        if collector in ("news", "all"):
            from core.services.data_ingestion.news_collector import run as run_news
            results["news"] = run_news()

        if collector in ("registry", "all"):
            from core.services.data_ingestion.registry_collector import run as run_registry
            results["registry"] = run_registry()

        if collector in ("social", "all"):
            from core.services.data_ingestion.social_collector import run as run_social
            results["social"] = run_social()

        return Response({"status": "ok", "results": results})
