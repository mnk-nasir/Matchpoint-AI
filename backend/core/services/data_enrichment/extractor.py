"""
Data Enrichment Extractor Engine
--------------------------------
Uses regular expressions to extract structured startup & funding data
from unstructured text (e.g., news headlines).

Example Input: "AI startup XYZ raised $5M in seed funding"
Example Output: {"company": "XYZ", "industry": "AI", "funding_amount": 5000000, "funding_round": "Seed"}
"""
import re
from decimal import Decimal

# Extended lists for accuracy
INDUSTRIES = [
    "AI", "Artificial Intelligence", "SaaS", "FinTech", "HealthTech",
    "EdTech", "PropTech", "Cybersecurity", "Blockchain", "Web3",
    "Robotics", "CleanTech", "ClimateTech", "Biotech", "E-commerce"
]

ROUNDS = [
    "Pre-Seed", "Seed", "Series A", "Series B", "Series C", 
    "Series D", "Series E", "Series F", "Bridge", "Debt",
    "Venture Round", "Angel", "Crowdfunding", "Post-IPO Equity"
]


def extract_startup_entities(text: str) -> dict:
    """Extracts the company name from a sentence securely."""
    # Look for patterns like "{industry} startup {Company}" OR "Startup {Company} raised"
    match = re.search(r'(?i)startup\s+([A-Z][A-Za-z0-9]+)', text)
    if match:
        name = match.group(1).strip()
        # Edge case: avoid matching "The"
        if name.lower() not in ['the', 'a', 'an']:
            return {"company": name}
    
    # Fallback: Capitalized word right before "raised", "secures", "announces"
    match2 = re.search(r'([A-Z][A-Za-z0-9]+)\s+(raised|secures|announces|closes)', text)
    if match2:
        return {"company": match2.group(1).strip()}
        
    return {"company": "Unknown"}


def extract_funding_events(text: str) -> dict:
    """Extracts funding amount and round name from unstructured text."""
    result = {"funding_amount": None, "funding_round": "Unknown"}

    # --- 1. Amount Extraction ---
    # Looks for "$5M", "$5.5M", "$150K", "$1.2B"
    amt_match = re.search(r'\$(\d+(?:\.\d+)?)([KMB])', text, re.IGNORECASE)
    if amt_match:
        val = float(amt_match.group(1))
        multiplier = amt_match.group(2).upper()
        if multiplier == 'K':
            val *= 1_000
        elif multiplier == 'M':
            val *= 1_000_000
        elif multiplier == 'B':
            val *= 1_000_000_000
        result["funding_amount"] = int(val)
        
    # --- 2. Round Extraction ---
    text_lower = text.lower()
    best_round = "Unknown"
    for r in ROUNDS:
        # Match word bounds so "Seed" doesn't catch inside "Seeding"
        if re.search(rf'\b{r.lower()}\b', text_lower):
            best_round = r
            break  
    result["funding_round"] = best_round

    return result


def detect_industry(text: str) -> str:
    """Detects industry using keyword matching."""
    text_lower = text.lower()
    for ind in INDUSTRIES:
        if ind.lower() in text_lower:
            # Special case for "AI" to avoid matching inside words like "said"
            if ind == "AI":
                if not re.search(r'\bai\b', text_lower):
                    continue
            return ind
    return "Technology"


def enrich_text(text: str) -> dict:
    """Combines all extraction methods into one structured dictionary step."""
    company_data = extract_startup_entities(text)
    funding_data = extract_funding_events(text)
    industry_data = {"industry": detect_industry(text)}

    return {
        **company_data,
        **industry_data,
        **funding_data
    }
