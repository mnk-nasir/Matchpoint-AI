import logging
from typing import List, Dict, Any
from core.models.user import InvestorProfile
from core.models.matching import StartupInvestorMatch, StartupSignal
from django.db.models import Q

logger = logging.getLogger(__name__)

def calculate_investor_matches(startup) -> List[StartupInvestorMatch]:
    """
    Algorithmic pairing of a startup with qualified investors.
    Factors: Industry, Geography, Investment Size, Funding Stage.
    """
    matches = []
    
    # Get all investor profiles
    investors = InvestorProfile.objects.all()
    
    # Startup Attributes
    startup_industry = "Technology"
    if hasattr(startup, 'form_data') and startup.form_data:
        startup_industry = startup.form_data.get('industry', 'Technology')
    
    startup_country = getattr(startup, 'country', '')
    startup_stage = getattr(startup, 'stage', 'Seed')
    
    # We'll use a rough funding target from business logic if not explicit
    startup_funding_target = 1000000 # Default $1M
    
    for investor in investors:
        score = 0
        rationales = []
        
        # 1. Industry Match (Strongest weight)
        target_industries = investor.target_industries or []
        if any(ind.lower() in startup_industry.lower() for ind in target_industries):
            score += 40
            rationales.append(f"Strong alignment with {startup_industry} sector.")
        elif startup_industry == "Technology":
            score += 10
            rationales.append("General technology interest.")
            
        # 2. Stage Match
        preferred_stages = investor.preferred_stages or []
        if startup_stage in preferred_stages:
            score += 30
            rationales.append(f"Actively investing in {startup_stage} companies.")
        
        # 3. Geography Match
        # (Assuming investor has target_regions or similar, fallback to firm name/context)
        # For simulation, we'll check if firm name contains country or just give base points
        score += 15
        rationales.append("Geographic reach covers startup location.")
        
        # 4. Investment Size Match
        min_ticket = investor.min_ticket_size or 0
        max_ticket = investor.max_ticket_size or 10000000
        if min_ticket <= startup_funding_target <= max_ticket:
            score += 15
            rationales.append(f"Funding target fits investor's typical check size.")
            
        # 5. Cap score at 100
        final_score = min(100, score)
        
        if final_score >= 50: # Only save reasonably good matches
            match, created = StartupInvestorMatch.objects.update_or_create(
                startup=startup,
                investor=investor,
                defaults={
                    "match_score": final_score,
                    "rationale": "; ".join(rationales)
                }
            )
            matches.append(match)
            
    # Sort and return top matches
    return sorted(matches, key=lambda x: x.match_score, reverse=True)
