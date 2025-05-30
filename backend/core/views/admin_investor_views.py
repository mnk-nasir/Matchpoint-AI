from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from core.serializers.investor_admin_serializers import (
    InvestorAdminCreateSerializer,
    InvestorAdminListSerializer,
    InvestorFromLeadSerializer,
)

User = get_user_model()


class InvestorAdminListCreateAPIView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAdminUser]
    serializer_class = InvestorAdminCreateSerializer
    pagination_class = None

    def get_queryset(self):
        qs = User.objects.filter(is_investor=True).order_by("-date_joined")
        email = self.request.query_params.get("email")
        if email:
            qs = qs.filter(email__icontains=email)
        return qs

    def get_serializer_class(self):
        if self.request.method.lower() == "get":
            return InvestorAdminListSerializer
        return InvestorAdminCreateSerializer


class InvestorFromLeadAPIView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, *args, **kwargs):
        serializer = InvestorFromLeadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        out = InvestorAdminListSerializer(user)
        return Response(out.data, status=status.HTTP_201_CREATED)

