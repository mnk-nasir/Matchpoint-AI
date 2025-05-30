from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from core.views.evaluation_views import (
    CreateEvaluationAPIView,
    SubmitFullEvaluationAPIView,
    UserEvaluationListAPIView,
    EvaluationDetailAPIView,
    AnalyticsSummaryAPIView
)
from core.views.auth_views import RegisterView, CustomTokenObtainPairView, MeView
from core.views.ai_views import AINarrativeAPIView
from core.views.leads_views import InvestorInterestAPIView, AcceleratorInterestAPIView
from core.views.admin_investor_views import InvestorAdminListCreateAPIView, InvestorFromLeadAPIView
from core.views.investor_views import InvestorDashboardStatsAPIView, StartupsListAPIView
from core.views.chat_views import InvestorChatAPIView, InvestorChatStreamAPIView, InvestorChatSessionsAPIView, InvestorChatSessionDetailAPIView, AIHealthAPIView

urlpatterns = [
    # Auth Endpoints
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me/', MeView.as_view(), name='auth_me'),

    # Evaluation Endpoints
    path('evaluations/create/', CreateEvaluationAPIView.as_view(), name='create-evaluation'),
    path('evaluations/submit/', SubmitFullEvaluationAPIView.as_view(), name='submit-evaluation'),
    path('evaluations/list/', UserEvaluationListAPIView.as_view(), name='list-evaluations'),
    path('evaluations/<uuid:id>/', EvaluationDetailAPIView.as_view(), name='evaluation-detail'),
    path('evaluations/analytics/summary/', AnalyticsSummaryAPIView.as_view(), name='analytics-summary'),
    path('ai/narrative/', AINarrativeAPIView.as_view(), name='ai-narrative'),
    path('ai/narrative', AINarrativeAPIView.as_view(), name='ai-narrative-no-slash'),
    
    # Leads / Interest
    path('leads/investors/', InvestorInterestAPIView.as_view(), name='investor-interest'),
    path('leads/accelerators/', AcceleratorInterestAPIView.as_view(), name='accelerator-interest'),
    
    # Admin Investors
    path('admin/investors/', InvestorAdminListCreateAPIView.as_view(), name='admin-investors'),
    path('admin/investors/from-lead/', InvestorFromLeadAPIView.as_view(), name='admin-investor-from-lead'),
    
    # Investor Dashboard APIs
    path('investor/dashboard-stats', InvestorDashboardStatsAPIView.as_view(), name='investor-dashboard-stats'),
    path('startups', StartupsListAPIView.as_view(), name='startups-list'),
    path('investor/chat', InvestorChatAPIView.as_view(), name='investor-chat'),
    path('investor/chat/', InvestorChatAPIView.as_view(), name='investor-chat-slash'),
    path('investor/chat/stream', InvestorChatStreamAPIView.as_view(), name='investor-chat-stream'),
    path('investor/chat/sessions', InvestorChatSessionsAPIView.as_view(), name='investor-chat-sessions'),
    path('investor/chat/sessions/<uuid:id>', InvestorChatSessionDetailAPIView.as_view(), name='investor-chat-session-detail'),
    path('ai/health', AIHealthAPIView.as_view(), name='ai-health'),
]
