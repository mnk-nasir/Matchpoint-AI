import uuid
from django.db import models


class NewsArticle(models.Model):
    """Startup-related news article collected from RSS feeds."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company_name = models.CharField(max_length=255, blank=True, default="")
    headline = models.TextField()
    url = models.URLField(max_length=1024, unique=True)
    source = models.CharField(max_length=255, blank=True, default="")
    published_at = models.DateTimeField(null=True, blank=True)
    collected_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-published_at"]
        verbose_name = "News Article"

    def __str__(self):
        return f"{self.company_name} — {self.headline[:60]}"


class CompanyRegistryEntry(models.Model):
    """Company registration data collected from registry sources."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company_name = models.CharField(max_length=255, db_index=True)
    incorporation_year = models.IntegerField(null=True, blank=True)
    country = models.CharField(max_length=100, blank=True, default="")
    directors = models.JSONField(default=list, blank=True)
    collected_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-collected_at"]
        verbose_name = "Company Registry Entry"

    def __str__(self):
        return f"{self.company_name} ({self.country})"


class SocialSignal(models.Model):
    """Social media signal data collected for a company."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company_name = models.CharField(max_length=255, db_index=True)
    mentions = models.IntegerField(default=0)
    sentiment_score = models.FloatField(default=0.0, help_text="0-100 score")
    popularity_score = models.FloatField(default=0.0, help_text="0-100 score")
    collected_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-collected_at"]
        verbose_name = "Social Signal"

    def __str__(self):
        return f"{self.company_name} — sentiment: {self.sentiment_score}"
