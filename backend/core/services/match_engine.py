import logging
from typing import List, Dict, Any
from core.models.evaluation import StartupEvaluation
from core.models.user import InvestorProfile
from core.models.matching import StartupInvestorMatch

logger = logging.getLogger(__name__)

def match_startup_with_investors(startup_id: str) -> List[Dict[str, Any]]:
    """
    MatchPoint AI Match Engine
    Matches a startup with investors based on:
    1. Industry Preference
    2. Geographic Preference
    3. Investment Size
    4. Investment Stage
    5. Portfolio Strategy
    
    Returns a sorted list of matched investors.
    """
    try:
        startup = StartupEvaluation.objects.get(id=startup_id)
    except StartupEvaluation.DoesNotExist:
        logger.error(f"[MatchEngine] Startup {startup_id} not found.")
        return []
        
    investors = InvestorProfile.objects.all().select_related('user')
    form_data = startup.form_data or {}
    
    # 1. Startup Attributes
    s_industry = startup.industry if hasattr(startup, 'industry') else form_data.get('step1', {}).get('industry', '')
    s_country = startup.country or form_data.get('step1', {}).get('country', '')
    s_stage = str(startup.stage).upper()
    s_description = startup.company_name + " " + form_data.get('step1', {}).get('solution', '') + " " + s_industry
    
    try:
        s_funding_raised = float(startup.funding_raised)
    except (ValueError, TypeError):
        s_funding_raised = 0.0

    matches = []
    
    for inv in investors:
        score = 50 # Base neutral score
        rationale_parts = []
        
        # 1. Industry Preference (30 points)
        if s_industry and inv.target_industries:
            if any(s_industry.lower() in t.lower() or t.lower() in s_industry.lower() for t in inv.target_industries):
                score += 30
                rationale_parts.append("Strong Industry Fit")
            else:
                score -= 10
        
        # 2. Geographic Preference (20 points)
        if s_country and inv.target_regions:
            if any(s_country.lower() in r.lower() or r.lower() in s_country.lower() for r in inv.target_regions):
                score += 20
                rationale_parts.append("Location Aligned")
        
        # 3. Investment Stage (20 points)
        if s_stage and inv.target_stages:
            inv_stages = [stage.upper() for stage in inv.target_stages]
            if s_stage in inv_stages:
                score += 20
                rationale_parts.append("Target Stage Aligned")
                
        # 4. Investment Size (Check size logic) (15 points)
        if inv.typical_check_size > 0:
            if s_funding_raised <= inv.typical_check_size * 2: # Very basic threshold logic
                score += 15
                rationale_parts.append("Check Size Compatible")
                
        # 5. Portfolio Strategy (15 points thesis keyword match)
        if inv.thesis_keywords and s_description:
            matched_keywords = [k for k in inv.thesis_keywords if k.lower() in s_description.lower()]
            if matched_keywords:
                score += min(15, len(matched_keywords) * 5)
                rationale_parts.append(f"Thesis Match ({', '.join(matched_keywords[:2])})")

        # Fallback rationale
        if not rationale_parts:
            rationale_parts.append("General Portfolio Alignment")
            
        final_score = max(0, min(100, int(score)))
        rationale = " & ".join(rationale_parts)
        
        # Only suggest investors if score is decently high (> 40)
        if final_score > 40:
            matches.append({
                "investor": inv,
                "matchScore": final_score,
                "rationale": rationale
            })
            
    # Sort matches
    matches.sort(key=lambda x: x['matchScore'], reverse=True)
    
    # Save the highest matches to the DB persistently (Top 10 max to save space)
    result_list = []
    for m in matches[:10]:
        inv = m['investor']
        
        # Update or create DB record securely
        StartupInvestorMatch.objects.update_or_create(
            startup=startup,
            investor=inv,
            defaults={
                "match_score": m["matchScore"],
                "rationale": m["rationale"]
            }
        )
        
        # Build API payload
        firm_name = inv.firm_name or inv.user.company or f"{inv.user.first_name} {inv.user.last_name}".strip() or "Anonymous Investor"
        result_list.append({
            "investor": firm_name,
            "investorId": str(inv.user.id),
            "matchScore": m["matchScore"],
            "rationale": m["rationale"]
        })
        
    logger.info(f"[MatchEngine] Calculated {len(result_list)} valid matches for startup {startup_id}")
    return result_list
