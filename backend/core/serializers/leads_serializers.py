from rest_framework import serializers
from core.models import InvestorInterestLead, AcceleratorInterestLead


class InvestorInterestSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvestorInterestLead
        fields = [
            "id",
            "name",
            "linkedin",
            "email",
            "phone",
            "firm",
            "role",
            "focus",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class AcceleratorInterestSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcceleratorInterestLead
        fields = [
            "id",
            "program_name",
            "website",
            "contact_name",
            "email",
            "phone",
            "cohort_size",
            "focus",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

