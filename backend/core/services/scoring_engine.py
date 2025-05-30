from typing import Dict, Any, List, Tuple
from decimal import Decimal
import logging

logger = logging.getLogger(__name__)

class StartupScoringEngine:
    """
    Professional Scoring Engine for Startup Evaluation.
    
    This engine takes validated startup data and calculates a comprehensive score,
    rating, and identifies key strengths, weaknesses, and risk flags.
    
    The scoring logic is broken down into modular components:
    - Identity & Legal
    - Market Potential
    - Traction & Product
    - Financial Health
    - Funding History
    - Team Composition
    - Exit Strategy
    """

    # Scoring Constants
    MAX_SCORE = 200  # Theoretical max, though rating scales to 180+
    
    # Rating Thresholds
    RATING_THRESHOLDS = {
        'HIGH_POTENTIAL': 180,
        'STRONG': 120,
        'MODERATE': 60,
        'HIGH_RISK': 0
    }

    def __init__(self, data: Dict[str, Any]):
        """
        Initialize the scoring engine with validated data.
        
        Args:
            data: A dictionary containing all the startup data points 
                  (flattened or nested as per the form structure).
        """
        self.data = data
        self._total_score = 0
        self._risk_flags: List[str] = []
        self._strengths: List[str] = []
        self._weaknesses: List[str] = []
        self._section_scores: Dict[str, Dict[str, int]] = {}

    def calculate(self) -> Dict[str, Any]:
        """
        Orchestrate the scoring process.
        
        Returns:
            Dict containing:
            - total_score (int)
            - rating (str)
            - risk_flags (list)
            - strengths (list)
            - weaknesses (list)
        """
        # Reset state
        self._total_score = 0
        self._risk_flags = []
        self._strengths = []
        self._weaknesses = []

        # Execute scoring modules
        self._score_identity()
        self._score_market()
        self._score_traction()
        self._score_financial()
        self._score_funding()
        self._score_team()
        self._score_exit()

        # Determine Final Rating
        rating = self._determine_rating()

        return {
            'total_score': int(self._total_score),
            'rating': rating,
            'risk_flags': self._risk_flags,
            'strengths': self._strengths,
            'weaknesses': self._weaknesses,
            'section_scores': self._section_scores
        }

    def _determine_rating(self) -> str:
        """Determines the rating label based on the total score."""
        score = self._total_score
        
        if score >= self.RATING_THRESHOLDS['HIGH_POTENTIAL']:
            return 'HIGH_POTENTIAL'
        elif score >= self.RATING_THRESHOLDS['STRONG']:
            return 'STRONG'
        elif score >= self.RATING_THRESHOLDS['MODERATE']:
            return 'MODERATE'
        else:
            return 'HIGH_RISK'

    def _add_score(self, points: int, reason: str = None):
        """Helper to add score and log reason if needed."""
        self._total_score += points
        # logging could go here
    
    def _record_section(self, key: str, score: int, out_of: int):
        """Record per-section score breakdown."""
        self._section_scores[key] = {'score': int(score), 'outOf': int(out_of)}

    def _score_identity(self):
        """
        Evaluates Legal Structure, Incorporation, and basic setup.
        Max Points: 20
        """
        score = 0
        company_name = self.data.get('company_name')
        legal_structure = self.data.get('legal_structure')
        incorporation_year = self.data.get('incorporation_year')
        
        if company_name and len(company_name) > 2:
            score += 5
            
        if legal_structure in ['C-Corp', 'LLC', 'LTD', 'Pvt Ltd']:
            score += 10
            self._strengths.append(f"Formal legal structure: {legal_structure}")
        elif legal_structure:
             score += 5
        else:
            self._risk_flags.append("No legal structure defined")

        if incorporation_year:
            import datetime
            years_active = datetime.datetime.now().year - int(incorporation_year)
            if years_active > 1:
                score += 5
                self._strengths.append(f"Operating for {years_active}+ years")
            elif years_active < 0:
                self._risk_flags.append("Invalid incorporation year")

        self._add_score(score)
        self._record_section('identity', score, 20)

    def _score_market(self):
        """
        Evaluates Market Size (TAM/SAM/SOM), Target Audience, and Competition.
        Max Points: 40
        """
        score = 0
        tam = self.data.get('tam_size', 0)  # Total Addressable Market in millions
        competition = self.data.get('competition_level') # High, Medium, Low
        
        # Market Size Logic
        try:
            tam_val = float(tam)
            if tam_val > 1000: # > 1 Billion
                score += 20
                self._strengths.append("Massive Market Potential (>1B)")
            elif tam_val > 100: # > 100 Million
                score += 15
                self._strengths.append("Large Market Potential (>100M)")
            elif tam_val > 10:
                score += 10
            else:
                score += 5
                self._weaknesses.append("Niche or Small Market Size")
        except (ValueError, TypeError):
            pass # Handle missing or invalid data gracefully

        # Competition Logic
        if competition == 'Low':
            score += 20
            self._strengths.append("First-mover advantage or low competition")
        elif competition == 'Medium':
            score += 10
        elif competition == 'High':
            score += 5
            self._risk_flags.append("High market competition")
            
        self._add_score(score)
        self._record_section('market', score, 40)

    def _score_traction(self):
        """
        Evaluates Product Stage, Users, and Retention.
        Max Points: 40
        """
        score = 0
        stage = self.data.get('stage') # IDEA, MVP, GROWTH, etc.
        users = self.data.get('active_users', 0)
        
        # Stage Scoring
        if stage == 'GROWTH':
            score += 20
            self._strengths.append("In Growth Stage")
        elif stage == 'SERIES_A':
            score += 18
        elif stage == 'SEED':
            score += 15
        elif stage == 'MVP':
            score += 10
            self._strengths.append("MVP Launched")
        elif stage == 'IDEA':
            score += 2
            self._weaknesses.append("Still in Idea Stage")
            
        # User Traction
        try:
            user_count = int(users)
            if user_count > 10000:
                score += 20
                self._strengths.append("Significant User Traction (>10k users)")
            elif user_count > 1000:
                score += 15
            elif user_count > 100:
                score += 10
            elif user_count > 0:
                score += 5
            else:
                if stage not in ['IDEA']:
                     self._weaknesses.append("Low user traction for current stage")
        except (ValueError, TypeError):
            pass

        self._add_score(score)
        self._record_section('traction', score, 40)

    def _score_financial(self):
        """
        Evaluates Revenue, Burn Rate, and Margins.
        Max Points: 30
        """
        score = 0
        mrr = self.data.get('mrr', 0) # Monthly Recurring Revenue
        burn_rate = self.data.get('burn_rate', 0)
        
        try:
            mrr_val = float(mrr)
            if mrr_val > 50000:
                score += 20
                self._strengths.append("Strong MRR (>$50k)")
            elif mrr_val > 10000:
                score += 15
            elif mrr_val > 1000:
                score += 10
            elif mrr_val > 0:
                score += 5
            else:
                self._weaknesses.append("Pre-revenue")
                
            # Burn Rate Check
            burn_val = float(burn_rate)
            if burn_val > 0 and mrr_val > 0:
                runway = mrr_val / burn_val if burn_val > 0 else 0
                if runway < 0.5: # Spending 2x earning
                     self._risk_flags.append("High Burn Rate relative to Revenue")
                elif runway > 1.5:
                     score += 10
                     self._strengths.append("Healthy Cash Flow Management")

        except (ValueError, TypeError):
            pass
            
        self._add_score(score)
        self._record_section('financials', score, 30)

    def _score_funding(self):
        """
        Evaluates Previous Funding and Cap Table.
        Max Points: 20
        """
        score = 0
        raised = self.data.get('funding_raised', 0)
        
        try:
            raised_val = float(raised)
            if raised_val > 1000000:
                score += 20
                self._strengths.append("Proven Fundraising Ability (>$1M)")
            elif raised_val > 100000:
                score += 15
            elif raised_val > 0:
                score += 10
            else:
                # Bootstrapped can be good too depending on context, 
                # but for scoring "funding" strictly:
                score += 5 
                self._strengths.append("Bootstrapped / Capital Efficient")
        except (ValueError, TypeError):
            pass
            
        self._add_score(score)
        self._record_section('funding', score, 20)

    def _score_team(self):
        """
        Evaluates Founder Experience, Team Size, and Roles.
        Max Points: 30
        """
        score = 0
        founders_count = self.data.get('founders_count', 1)
        has_technical_founder = self.data.get('has_technical_founder', False)
        team_size = self.data.get('team_size', 1)
        
        try:
            f_count = int(founders_count)
            if f_count > 1:
                score += 10
                self._strengths.append("Co-founder team (Reduced founder risk)")
            else:
                self._risk_flags.append("Solo Founder (Key person risk)")
        except:
            pass
            
        if has_technical_founder:
            score += 10
            self._strengths.append("Technical Founder present")
        else:
            self._weaknesses.append("Missing Technical Leadership")
            
        try:
            t_size = int(team_size)
            if t_size > 5:
                score += 10
        except:
            pass
            
        self._add_score(score)
        self._record_section('team', score, 30)

    def _score_exit(self):
        """
        Evaluates Exit Strategy clarity and potential.
        Max Points: 20
        """
        score = 0
        exit_strategy = self.data.get('exit_strategy') # IPO, Acquisition, etc.
        
        if exit_strategy == 'IPO':
            score += 20
            self._strengths.append("Ambitious Exit Strategy (IPO)")
        elif exit_strategy == 'Acquisition':
            score += 15
            self._strengths.append("Clear Exit Path (Acquisition)")
        elif exit_strategy:
            score += 10
        else:
            self._weaknesses.append("Undefined Exit Strategy")
            
        self._add_score(score)
        self._record_section('exit', score, 20)
