from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.urls import reverse


class LeadsAPITests(APITestCase):
    def test_create_investor_lead_minimal(self):
        url = reverse("investor-interest")
        payload = {"name": "Unit Tester", "email": "unit@example.com"}
        res = self.client.post(url, payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertIn("id", res.data)
        self.assertEqual(res.data["name"], payload["name"])
        self.assertEqual(res.data["email"], payload["email"])

    def test_create_accelerator_lead_minimal(self):
        url = reverse("accelerator-interest")
        payload = {"program_name": "Test Program", "email": "prog@example.com"}
        res = self.client.post(url, payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertIn("id", res.data)
        self.assertEqual(res.data["program_name"], payload["program_name"])
        self.assertEqual(res.data["email"], payload["email"])


class AIHealthTests(APITestCase):
    def test_ai_health_endpoint(self):
        url = reverse("ai-health")
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("openai", res.data)
        self.assertIn("gemini", res.data)

from django.test import SimpleTestCase
from core.services.ai_service import select_formatted_response, generate_response

SAMPLE_CTX = {
    "companies": [
        {"id": "1", "name": "Alpha", "stage": "SEED", "country": "UK", "score": 72, "mrr": 15000, "rating": "MODERATE"},
        {"id": "2", "name": "Beta", "stage": "SERIES_A", "country": "US", "score": 130, "mrr": 80000, "rating": "STRONG"},
        {"id": "3", "name": "Gamma", "stage": "PRE_SEED", "country": "DE", "score": 40, "mrr": None, "rating": "HIGH_RISK"},
    ]
}

class AIFormattingTests(SimpleTestCase):
    def test_table_detection(self):
        q = "Show the company table with columns"
        res = select_formatted_response(q, SAMPLE_CTX)
        self.assertIsNotNone(res)
        self.assertIn("Company Table:", res)
        self.assertIn("Name | Stage | Score | MRR | Country | Rating", res)
        self.assertIn("Alpha", res)

    def test_compare_detection(self):
        q = "Compare the top startups"
        res = select_formatted_response(q, SAMPLE_CTX)
        self.assertIsNotNone(res)
        self.assertIn("Comparison:", res)
        self.assertIn("Metric |", res)

    def test_unsupported_format_fallbacks(self):
        q = "Give me a chart of companies"
        res = select_formatted_response(q, SAMPLE_CTX)
        self.assertIsNotNone(res)
        self.assertIn("not supported", res.lower())
        self.assertIn("Company Table:", res)

    def test_generate_response_fallback_summary(self):
        q = "Give a quick summary of visible startups"
        res = generate_response(q, SAMPLE_CTX)
        self.assertIn("Summary", res)

    def test_company_metric_mrr(self):
        q = "What is the MRR of Alpha?"
        res = select_formatted_response(q, SAMPLE_CTX)
        self.assertIsNotNone(res)
        self.assertIn("Alpha MRR:", res)

    def test_company_profile(self):
        q = "Tell me about Beta"
        res = select_formatted_response(q, SAMPLE_CTX)
        self.assertIsNotNone(res)
        self.assertIn("Company Profile:", res)
        self.assertIn("Beta", res)
