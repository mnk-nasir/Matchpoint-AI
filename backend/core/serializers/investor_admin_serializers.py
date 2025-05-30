from django.contrib.auth import get_user_model
from rest_framework import serializers
from core.models import InvestorInterestLead

User = get_user_model()


class InvestorAdminCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name", "password"]
        read_only_fields = ["id"]

    def create(self, validated_data):
        # Ensure investor flag is set
        user = User.objects.create_user(
            username=validated_data["email"],
            email=validated_data["email"],
            password=validated_data["password"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
        )
        user.is_investor = True
        user.is_founder = False
        user.save(update_fields=["is_investor", "is_founder"])
        return user


class InvestorAdminListSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name", "is_investor", "date_joined"]


class InvestorFromLeadSerializer(serializers.Serializer):
    lead_id = serializers.IntegerField()
    password = serializers.CharField(write_only=True, min_length=8)

    def create(self, validated_data):
        lead = InvestorInterestLead.objects.get(pk=validated_data["lead_id"])
        first_name = lead.name.split(" ")[0] if lead.name else ""
        last_name = " ".join(lead.name.split(" ")[1:]) if lead.name and len(lead.name.split(" ")) > 1 else ""
        user = User.objects.create_user(
            username=lead.email,
            email=lead.email,
            password=validated_data["password"],
            first_name=first_name,
            last_name=last_name,
        )
        user.is_investor = True
        user.is_founder = False
        user.save(update_fields=["is_investor", "is_founder"])
        return user

