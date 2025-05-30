from rest_framework.views import APIView
from rest_framework.generics import ListAPIView, RetrieveAPIView, CreateAPIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.exceptions import NotFound

from core.models.evaluation import StartupEvaluation
from core.serializers.evaluation_serializers import (
    StartupEvaluationSerializer,
    EvaluationCreateSerializer,
    EvaluationDetailSerializer
)
from core.repositories.evaluation_repository import EvaluationRepository
from core.services.scoring_engine import StartupScoringEngine

class CreateEvaluationAPIView(CreateAPIView):
    """
    API View to create a new evaluation draft.
    """
    serializer_class = EvaluationCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # Use repository to handle creation
        EvaluationRepository.create_evaluation(
            user=self.request.user,
            **serializer.validated_data
        )

class SubmitFullEvaluationAPIView(APIView):
    """
    API View to submit a full evaluation, calculate score, and save results.
    """
    # Allow Any temporarily for frontend integration without auth
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        data = request.data

        # Support both legacy flat payload and new step1..step8 payload
        steps_payload = None
        if all(k in data for k in ['step1', 'step2', 'step3', 'step4', 'step5', 'step6', 'step7', 'step8']):
            steps_payload = data
            # Flatten minimal base fields from step data for model validation
            s1 = data.get('step1', {}) or {}
            s3 = data.get('step3', {}) or {}
            s4 = data.get('step4', {}) or {}
            s5 = data.get('step5', {}) or {}
            s6 = data.get('step6', {}) or {}
            s7 = data.get('step7', {}) or {}
            s8 = data.get('step8', {}) or {}

            flat_for_model = {
                'company_name': s1.get('companyName'),
                'legal_structure': s1.get('legalStructure'),
                'incorporation_year': s1.get('incorporationYear'),
                'country': s1.get('country'),
                'stage': (s1.get('stage') or 'IDEA').upper().replace('-', '_'),
                'funding_raised': s1.get('previousFunding') or 0,
                'founder_profile_url': s5.get('founderProfileUrl') or s7.get('founderProfileUrl'),
            }
            valid_stages = {c for c, _ in StartupEvaluation.Stage.choices}
            st = flat_for_model['stage']
            if st not in valid_stages:
                if isinstance(st, str) and (st.startswith('SERIES_') or st == 'PUBLIC'):
                    flat_for_model['stage'] = 'GROWTH'
                else:
                    flat_for_model['stage'] = 'IDEA'

            # Build engine input from raw steps
            engine_input = {
                'company_name': flat_for_model['company_name'],
                'legal_structure': flat_for_model['legal_structure'],
                'incorporation_year': flat_for_model['incorporation_year'],
                'country': flat_for_model['country'],
                'stage': flat_for_model['stage'],
                'funding_raised': flat_for_model['funding_raised'],
                'tam_size': s3.get('tam'),
                'competition_level': s3.get('competitors') and 'Medium' or None,
                'active_users': s4.get('activeUsers'),
                'mrr': s4.get('monthlyRevenue'),
                'burn_rate': s6.get('burnRate'),
                'founders_count': s5.get('foundersCount'),
                'has_technical_founder': s5.get('hasTechnicalFounder'),
                'exit_strategy': s8.get('exitStrategy'),
            }
        else:
            engine_input = data
            flat_for_model = data

        # 1. Validate Basic Data
        create_serializer = EvaluationCreateSerializer(data=flat_for_model)
        create_serializer.is_valid(raise_exception=True)
        validated_data = create_serializer.validated_data

        # 2. Run Scoring Engine
        engine = StartupScoringEngine(engine_input)
        score_result = engine.calculate()

        # 3. Save Evaluation via Repository
        # Merge validated model data with scoring results
        
        # Determine user: if authenticated use request.user, otherwise use None or a default/guest user
        user = request.user if request.user.is_authenticated else None
        
        evaluation = EvaluationRepository.create_evaluation(
            user=user,
            total_score=score_result['total_score'],
            rating=score_result['rating'],
            **validated_data
        )

        # 4. Persist full form payload in single table
        if steps_payload is not None:
            evaluation.form_data = steps_payload
            evaluation.save(update_fields=['form_data'])
        else:
            steps_field = data.get('steps')
            if isinstance(steps_field, (list, dict)):
                evaluation.form_data = steps_field
                evaluation.save(update_fields=['form_data'])

        # 5. Return Response
        return Response({
            'evaluation_id': evaluation.id,
            'company_name': evaluation.company_name,
            'total_score': score_result['total_score'],
            'rating': score_result['rating'],
            'risk_flags': score_result['risk_flags'],
            'strengths': score_result['strengths'],
            'weaknesses': score_result['weaknesses'],
            'section_scores': score_result.get('section_scores', {}),
            'created_at': evaluation.created_at
        }, status=status.HTTP_201_CREATED)

class AnalyticsSummaryAPIView(APIView):
    """
    Analytics summary for benchmarking and trends.
    Public access returns only aggregate benchmarks; authenticated users also get their history.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        from django.db.models import Avg, Max, Count
        user_history = []
        if request.user and request.user.is_authenticated:
            qs = EvaluationRepository.get_user_evaluations(request.user)
            user_history = [
                {'ts': e.created_at, 'total_score': e.total_score, 'rating': e.rating}
                for e in qs
            ]
        all_qs = StartupEvaluation.objects.all()
        aggregate = all_qs.aggregate(
            avg_score=Avg('total_score'), max_score=Max('total_score'), count=Count('id')
        )
        by_stage = list(
            all_qs.values('stage').annotate(avg_score=Avg('total_score'), count=Count('id')).order_by('stage')
        )
        return Response({
            'user_history': user_history,
            'benchmark': {
                'avg_total_score': float(aggregate['avg_score'] or 0),
                'max_total_score': int(aggregate['max_score'] or 0),
                'total_evaluations': int(aggregate['count'] or 0),
                'by_stage': by_stage,
            }
        }, status=status.HTTP_200_OK)

class UserEvaluationListAPIView(ListAPIView):
    """
    API View to list all evaluations for the authenticated user.
    """
    serializer_class = StartupEvaluationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return EvaluationRepository.get_user_evaluations(self.request.user)

class EvaluationDetailAPIView(RetrieveAPIView):
    """
    API View to retrieve full details of a specific evaluation.
    """
    serializer_class = EvaluationDetailSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'id'

    def get_object(self):
        evaluation_id = self.kwargs.get('id')
        evaluation = EvaluationRepository.get_evaluation_detail(
            evaluation_id=evaluation_id,
            user=self.request.user if self.request.user.is_authenticated else None
        )
        if not evaluation:
            raise NotFound("Evaluation not found or access denied.")
        return evaluation
