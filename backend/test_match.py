import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
from core.models.evaluation import StartupEvaluation
from core.services.match_engine import match_startup_with_investors

startup = StartupEvaluation.objects.first()
if startup:
    print(f"Testing real match engine for startup: {startup.company_name} (ID: {startup.id})")
    matches = match_startup_with_investors(str(startup.id))
    print(f"Matches calculated: {len(matches)}")
    for m in matches:
        print(f" - {m['investor']} ({m['matchScore']}%): {m['rationale']}")
else:
    print("No startups found to test.")
