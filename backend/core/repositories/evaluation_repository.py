from typing import List, Optional, Dict, Any
from uuid import UUID
from django.db import transaction
from django.core.exceptions import ObjectDoesNotExist
from core.models.evaluation import StartupEvaluation
from django.contrib.auth import get_user_model

User = get_user_model()

class EvaluationRepository:
    """
    Repository class for handling database operations related to Startup Evaluation.
    Separates database logic from business logic.
    """

    @staticmethod
    @transaction.atomic
    def create_evaluation(user: Optional[User], company_name: str, **kwargs) -> StartupEvaluation:
        """
        Creates a new StartupEvaluation record.
        
        Args:
            user: The user instance creating the evaluation (Optional).
            company_name: Name of the startup.
            **kwargs: Additional fields for StartupEvaluation.
            
        Returns:
            Created StartupEvaluation instance.
        """
        evaluation = StartupEvaluation.objects.create(
            user=user,
            company_name=company_name,
            **kwargs
        )
        return evaluation

    # Removed per single-table design: step data is embedded in StartupEvaluation.form_data

    @staticmethod
    def update_score(evaluation_id: UUID, total_score: int, rating: Optional[str] = None) -> StartupEvaluation:
        """
        Updates the score and rating of an evaluation.
        
        Args:
            evaluation_id: UUID of the evaluation.
            total_score: Calculated score.
            rating: Optional rating enum value (HIGH_RISK, MODERATE, etc.).
            
        Returns:
            Updated StartupEvaluation instance.
        """
        update_fields = {'total_score': total_score}
        if rating:
            update_fields['rating'] = rating
            
        StartupEvaluation.objects.filter(id=evaluation_id).update(**update_fields)
        
        # Fetch the fresh instance
        return StartupEvaluation.objects.get(id=evaluation_id)

    @staticmethod
    def get_user_evaluations(user: User) -> List[StartupEvaluation]:
        """
        Retrieves all evaluations for a specific user, ordered by creation date.
        
        Args:
            user: The user instance.
            
        Returns:
            QuerySet/List of StartupEvaluation.
        """
        return StartupEvaluation.objects.filter(user=user).order_by('-created_at')

    @staticmethod
    def get_evaluation_detail(evaluation_id: UUID, user: Optional[User]) -> Optional[StartupEvaluation]:
        """
        Retrieves a single evaluation detail, ensuring it belongs to the user.
        Prefetches related step data for efficiency.
        
        Args:
            evaluation_id: UUID of the evaluation.
            user: The user instance requesting the detail.
            
        Returns:
            StartupEvaluation instance or None if not found.
        """
        try:
            qs = StartupEvaluation.objects.all()
            # Access policy:
            # - Anonymous: can view any evaluation detail (public investor browsing)
            # - Staff or investor users: can view any evaluation detail
            # - Other authenticated users: can only view their own evaluations
            if user is None:
                return qs.get(id=evaluation_id)
            if getattr(user, "is_staff", False) or getattr(user, "is_investor", False):
                return qs.get(id=evaluation_id)
            return qs.get(id=evaluation_id, user=user)
        except StartupEvaluation.DoesNotExist:
            return None
