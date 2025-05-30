from core.models.evaluation import StartupEvaluation
from core.services.match_engine import match_startup_with_investors

startup = StartupEvaluation.objects.first()
if startup:
    print(f"Testing real match engine for startup: {startup.company_name} (ID: {startup.id})")
    matches = match_startup_with_investors(str(startup.id))
    print(f"Matches calculated: {len(matches)}")
    for m in matches:
        # Check either dict key or object formatting based on return
        investor_name = m.get('investor')
        score = m.get('matchScore')
        rationale = m.get('rationale')
        if not isinstance(investor_name, str) and hasattr(investor_name, 'firm_name'):
            investor_name = investor_name.firm_name
        print(f" - {investor_name} ({score}%): {rationale}")
else:
    print("No startups found to test.")
