from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse


class SubmitNoAuthTests(APITestCase):
    def test_submit_evaluation_noauth(self):
        payload = {
            "step1": {
                "companyName": "NextGen",
                "legalStructure": "LTD",
                "incorporationYear": 2023,
                "country": "UK",
                "stage": "MVP",
                "previousFunding": 50000
            },
            "step2": {},
            "step3": {"tam": 500},
            "step4": {"monthlyRevenue": 20000, "activeUsers": 1500},
            "step5": {"foundersCount": 2, "hasTechnicalFounder": True},
            "step5": {"foundersCount": 2, "hasTechnicalFounder": True, "founderProfileUrl": "https://example.com/founder"},
            "step6": {"burnRate": 15000},
            "step7": {},
            "step8": {"exitStrategy": "Acquisition"}
        }
        url = reverse("submit-evaluation")
        res = self.client.post(url, payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        eid = res.data.get("evaluation_id")
        self.assertIsNotNone(eid)
        detail_url = reverse("evaluation-detail", kwargs={"id": eid})
        detail = self.client.get(detail_url)
        self.assertEqual(detail.status_code, status.HTTP_200_OK)
