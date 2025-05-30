from rest_framework import serializers
from core.models.enrichment import EnrichedStartup, FundingEvent


class FundingEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = FundingEvent
        fields = ["id", "amount", "currency", "round_name", "announced_on", "source_url"]


class EnrichedStartupSerializer(serializers.ModelSerializer):
    funding_events = FundingEventSerializer(many=True, read_only=True)

    class Meta:
        model = EnrichedStartup
        fields = ["id", "company_name", "industry", "description", "funding_events", "updated_at"]
