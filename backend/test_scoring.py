import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
from core.models.evaluation import StartupEvaluation
from core.services.ai_scoring.engine import calculate_startup_score

startup = StartupEvaluation.objects.first()
if startup:
    print(f"Testing score for: {startup.company_name}")
    print("Previous Total Score:", startup.total_score)
    result = calculate_startup_score(startup)
    print("New AI Engine Output:", result)
else:
    print("No startups found in DB to test.")
