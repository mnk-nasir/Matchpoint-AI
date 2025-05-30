import os
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parents[1]))
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()
from core.repositories.evaluation_repository import EvaluationRepository

e = EvaluationRepository.create_evaluation(
    user=None,
    company_name='StoreTest',
    legal_structure='LTD',
    incorporation_year=2024,
    country='UK',
    stage='MVP',
    funding_raised=0,
    total_score=100,
    rating='MODERATE'
)
EvaluationRepository.save_step_data(e.id, 1, {'companyName': 'StoreTest'})
print(e.id)
