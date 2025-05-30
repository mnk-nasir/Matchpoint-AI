import os
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parents[1]))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
import django
django.setup()

from rest_framework.test import APIRequestFactory
from core.views.evaluation_views import SubmitFullEvaluationAPIView

payload = {
    "step1": {
        "companyName": "MySQLTestCo",
        "legalStructure": "LTD",
        "incorporationYear": 2024,
        "country": "UK",
        "stage": "MVP",
        "previousFunding": 25000
    },
    "step2": {"coreProblem": "X", "solution": "Y"},
    "step3": {"tam": 750},
    "step4": {"monthlyRevenue": 10000, "activeUsers": 500},
    "step5": {"foundersCount": 2, "hasTechnicalFounder": True},
    "step6": {"burnRate": 8000},
    "step7": {"vision": "Scale"},
    "step8": {"exitStrategy": "Acquisition"}
}

factory = APIRequestFactory()
request = factory.post('/api/v1/evaluations/submit/', payload, format='json')
view = SubmitFullEvaluationAPIView.as_view()
response = view(request)
print(response.status_code)
print(response.data)
