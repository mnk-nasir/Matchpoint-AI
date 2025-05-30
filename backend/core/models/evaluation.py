import uuid
from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _

class StartupEvaluation(models.Model):
    """
    Main model for storing startup evaluation data.
    Linked to the user who created it.
    """
    class Stage(models.TextChoices):
        IDEA = 'IDEA', _('Idea Stage')
        MVP = 'MVP', _('MVP Launched')
        PRE_SEED = 'PRE_SEED', _('Pre-Seed')
        SEED = 'SEED', _('Seed')
        SERIES_A = 'SERIES_A', _('Series A')
        GROWTH = 'GROWTH', _('Growth')

    class Rating(models.TextChoices):
        HIGH_RISK = 'HIGH_RISK', _('High Risk')
        MODERATE = 'MODERATE', _('Moderate')
        STRONG = 'STRONG', _('Strong')
        HIGH_POTENTIAL = 'HIGH_POTENTIAL', _('High Potential')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='evaluations',
        verbose_name=_('Founder'),
        null=True,
        blank=True
    )
    
    # Company Details
    company_name = models.CharField(_('Company Name'), max_length=255, db_index=True)
    legal_structure = models.CharField(_('Legal Structure'), max_length=100, blank=True)
    incorporation_year = models.PositiveIntegerField(_('Incorporation Year'), null=True, blank=True)
    country = models.CharField(_('Country'), max_length=100, blank=True)
    
    # Financial & Status
    stage = models.CharField(
        _('Current Stage'), 
        max_length=20, 
        choices=Stage.choices, 
        default=Stage.IDEA,
        db_index=True
    )
    
    funding_raised = models.DecimalField(
        _('Total Funding Raised (USD)'), 
        max_digits=15, 
        decimal_places=2, 
        default=0.00
    )
    founder_profile_url = models.URLField(
        _('Founder Portfolio / LinkedIn URL'),
        max_length=500,
        blank=True
    )
    
    # Full Form Payload (single-table storage)
    form_data = models.JSONField(_('Form Data'), null=True, blank=True)

    # Evaluation Results
    total_score = models.IntegerField(_('Total Score'), default=0, db_index=True)
    rating = models.CharField(
        _('Rating Classification'), 
        max_length=20, 
        choices=Rating.choices, 
        blank=True,
        null=True,
        db_index=True
    )
    
    created_at = models.DateTimeField(_('Created At'), auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(_('Updated At'), auto_now=True)

    class Meta:
        verbose_name = _('Startup Evaluation')
        verbose_name_plural = _('Startup Evaluations')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['rating', 'total_score']),
        ]

    def __str__(self):
        return f"{self.company_name} ({self.created_at.strftime('%Y-%m-%d')})"


