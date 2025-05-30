from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from core.serializers.auth_serializers import RegisterSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    """
    API View for user registration.
    """
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom JWT Login View to include user details in response.
    """
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            user = User.objects.get(email=request.data['email'])
            response.data['user'] = {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser,
                'is_investor': getattr(user, 'is_investor', False),
                'is_founder': getattr(user, 'is_founder', False),
            }
            response.data['redirect_to'] = '/admin/'
        return response


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        u = request.user
        data = {
            "id": str(u.id),
            "email": u.email,
            "first_name": u.first_name,
            "last_name": u.last_name,
            "is_investor": getattr(u, "is_investor", False),
            "is_founder": getattr(u, "is_founder", False),
            "is_staff": u.is_staff,
            "is_superuser": u.is_superuser,
            "date_joined": u.date_joined,
        }
        return Response(data, status=status.HTTP_200_OK)
