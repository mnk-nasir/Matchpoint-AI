import os
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parents[1]))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
import django
django.setup()
from core.models.evaluation import StartupEvaluation
print(StartupEvaluation.objects.count())
last = StartupEvaluation.objects.order_by('-created_at').first()
if last:
    print(last.id, last.company_name, last.total_score, last.rating)
    print('form_data keys:', isinstance(last.form_data, dict) and list(last.form_data.keys()))
