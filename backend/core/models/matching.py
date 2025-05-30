import uuid
from django.db import models
from django.utils.translation import gettext_lazy as _

from .evaluation import StartupEvaluation
from .user import InvestorProfile

class StartupSignal(models.Model):
    """
    Stores market intelligence signals (news, social, momentum) for a startup.
    """
    class Level(models.TextChoices):
        LOW = 'Low', _('Low')
        MEDIUM = 'Medium', _('Medium')
        HIGH = 'High', _('High')

    class Trend(models.TextChoices):
        RISING = 'Rising', _('Rising')
        STABLE = 'Stable', _('Stable')
        FALLING = 'Falling', _('Falling')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    startup = models.OneToOneField(
        StartupEvaluation, 
        on_delete=models.CASCADE, 
        related_name="market_signal"
    )

    news_score = models.IntegerField(default=0)
    sentiment_score = models.IntegerField(default=0)
    industry_momentum = models.IntegerField(default=0)

    market_momentum = models.CharField(max_length=20, choices=Level.choices, default=Level.MEDIUM)
    investor_attention = models.CharField(max_length=20, choices=Trend.choices, default=Trend.STABLE)
    recent_news_activity = models.CharField(max_length=20, choices=Level.choices, default=Level.MEDIUM)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "startup_signals"
        verbose_name = _('Startup Signal')
        verbose_name_plural = _('Startup Signals')

    def __str__(self):
        return f"Signal for {self.startup.company_name} (News: {self.news_score}%)"

class StartupInvestorMatch(models.Model):
    """
    Stores the algorithmic pairing results of the Investor Match Engine.
    Links a Startup to a qualified Investor.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    startup = models.ForeignKey(
        StartupEvaluation, 
        on_delete=models.CASCADE, 
        related_name="investor_matches"
    )
    investor = models.ForeignKey(
        InvestorProfile, 
        on_delete=models.CASCADE, 
        related_name="startup_matches"
    )
    
    match_score = models.IntegerField(_('Match Score'), default=0, db_index=True)
    rationale = models.TextField(_('Match Rationale'), blank=True, default="")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "startup_investor_matches"
        unique_together = ('startup', 'investor')
        ordering = ["-match_score"]
        verbose_name = _('Startup-Investor Match')
        verbose_name_plural = _('Startup-Investor Matches')

    def __str__(self):
        return f"{self.startup.company_name} <-> {self.investor.firm_name or self.investor.user.first_name} ({self.match_score})"
