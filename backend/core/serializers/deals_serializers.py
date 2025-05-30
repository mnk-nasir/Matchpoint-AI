from rest_framework import serializers
from core.models.deals import Watchlist, PipelineStage, Contact
from core.models.evaluation import StartupEvaluation

class PipelineStageSerializer(serializers.ModelSerializer):
    startup_name = serializers.CharField(source='startup.company_name', read_only=True)
    startup_industry = serializers.CharField(source='startup.industry', read_only=True)
    startup_logo_url = serializers.CharField(source='startup.form_data.step1.companyLogoUrl', read_only=True, default="")
    startup_funding_ask = serializers.CharField(source='startup.form_data.step6.amountRaising', read_only=True, default="")
    startup_risk_score = serializers.IntegerField(source='startup.total_score', read_only=True)

    class Meta:
        model = PipelineStage
        fields = ['id', 'startup', 'startup_name', 'startup_industry', 'startup_logo_url', 'startup_funding_ask', 'startup_risk_score', 'stage', 'updated_at', 'created_at']
        read_only_fields = ['id', 'user', 'updated_at', 'created_at']


class WatchlistSerializer(serializers.ModelSerializer):
    startup_name = serializers.CharField(source='startup.company_name', read_only=True)
    startup_industry = serializers.CharField(source='startup.industry', read_only=True)
    startup_logo_url = serializers.CharField(source='startup.form_data.step1.companyLogoUrl', read_only=True, default="")
    startup_funding_ask = serializers.CharField(source='startup.form_data.step6.amountRaising', read_only=True, default="")
    startup_risk_score = serializers.IntegerField(source='startup.total_score', read_only=True)

    class Meta:
        model = Watchlist
        fields = ['id', 'startup', 'startup_name', 'startup_industry', 'startup_logo_url', 'startup_funding_ask', 'startup_risk_score', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']


class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = ['id', 'name', 'role', 'company', 'email', 'phone', 'country', 'tags', 'notes', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']
