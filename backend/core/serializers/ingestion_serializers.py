from rest_framework import serializers
from core.models.ingestion import NewsArticle, CompanyRegistryEntry, SocialSignal


class NewsArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsArticle
        fields = ["id", "company_name", "headline", "url", "source", "published_at", "collected_at"]


class CompanyRegistrySerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyRegistryEntry
        fields = ["id", "company_name", "incorporation_year", "country", "directors", "collected_at", "updated_at"]


class SocialSignalSerializer(serializers.ModelSerializer):
    class Meta:
        model = SocialSignal
        fields = ["id", "company_name", "mentions", "sentiment_score", "popularity_score", "collected_at"]
