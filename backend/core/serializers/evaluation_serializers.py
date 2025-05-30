from rest_framework import serializers
from core.models.evaluation import StartupEvaluation
from django.utils.translation import gettext_lazy as _
import datetime

class StartupEvaluationSerializer(serializers.ModelSerializer):
    """
    Standard serializer for listing and basic retrieval of StartupEvaluation.
    """
    class Meta:
        model = StartupEvaluation
        fields = [
            'id', 
            'company_name', 
            'legal_structure', 
            'country', 
            'stage', 
            'total_score', 
            'rating', 
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'total_score', 'rating', 'created_at', 'updated_at']





class EvaluationCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating a new evaluation.
    Handles validation for initial fields.
    """
    class Meta:
        model = StartupEvaluation
        fields = [
            'company_name', 
            'legal_structure', 
            'incorporation_year', 
            'country', 
            'stage', 
            'funding_raised',
            'founder_profile_url',
        ]

    def validate_incorporation_year(self, value):
        """
        Validate incorporation year is realistic.
        """
        current_year = datetime.datetime.now().year
        if value and (value < 1900 or value > current_year):
            raise serializers.ValidationError(
                _("Incorporation year must be between 1900 and {year}.").format(year=current_year)
            )
        return value

    def validate_funding_raised(self, value):
        """
        Ensure funding raised is non-negative.
        """
        if value < 0:
            raise serializers.ValidationError(_("Funding raised cannot be negative."))
        return value


class EvaluationDetailSerializer(serializers.ModelSerializer):
    """
    Detailed serializer including all fields and the full form payload.
    """
    form_data = serializers.JSONField(read_only=True)
    formatted_rating = serializers.SerializerMethodField()

    class Meta:
        model = StartupEvaluation
        fields = [
            'id',
            'company_name',
            'legal_structure',
            'incorporation_year',
            'country',
            'stage',
            'funding_raised',
            'founder_profile_url',
            'total_score',
            'rating',
            'formatted_rating',
            'created_at',
            'updated_at',
            'form_data'
        ]
        read_only_fields = ['total_score', 'rating', 'created_at', 'updated_at']

    def get_formatted_rating(self, obj):
        """
        Returns the human-readable label for the rating.
        """
        return obj.get_rating_display()
