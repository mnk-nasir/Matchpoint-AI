import uuid
from django.db import models


class EnrichedStartup(models.Model):
    """Structured startup intelligence derived from raw data."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company_name = models.CharField(max_length=255, unique=True, db_index=True)
    industry = models.CharField(max_length=100, blank=True, default="")
    description = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "startups"
        ordering = ["-updated_at"]
        verbose_name = "Structured Startup"

    def __str__(self):
        return f"{self.company_name} ({self.industry})"


class FundingEvent(models.Model):
    """Structured funding events linked to startups."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    startup = models.ForeignKey(EnrichedStartup, on_delete=models.CASCADE, related_name="funding_events")
    amount = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    currency = models.CharField(max_length=10, default="USD")
    round_name = models.CharField(max_length=100, blank=True, default="")
    announced_on = models.DateTimeField(null=True, blank=True)
    source_url = models.URLField(max_length=1024, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "funding_events"
        ordering = ["-announced_on", "-created_at"]
        verbose_name = "Funding Event"

    def __str__(self):
        amt = f"${self.amount:,.0f}" if self.amount else "Undisclosed"
        return f"{self.startup.company_name} — {self.round_name} ({amt})"
