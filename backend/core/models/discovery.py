import uuid
from django.db import models
from django.utils.translation import gettext_lazy as _


class DiscoveredStartup(models.Model):
    """
    Stores startups automatically discovered by the Startup Discovery Agent.
    Each entry represents a new company detected from external signals before
    it is formally evaluated and added to StartupEvaluation.
    """

    class Source(models.TextChoices):
        NEWS = "news", _("News Feed")
        SOCIAL = "social", _("Social Signal / LinkedIn")
        LAUNCH = "launch", _("Product Launch")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Core identity
    company_name = models.CharField(_("Company Name"), max_length=255, db_index=True)
    founder_name = models.CharField(_("Founder Name"), max_length=255, blank=True, default="")
    product_name = models.CharField(_("Product Name"), max_length=255, blank=True, default="")

    # Discovery context
    source = models.CharField(
        _("Discovery Source"),
        max_length=20,
        choices=Source.choices,
        default=Source.NEWS,
        db_index=True,
    )
    headline = models.TextField(_("Headline / Announcement"), blank=True, default="")
    article_url = models.URLField(_("Source URL"), max_length=1024, blank=True, default="")
    industry_keywords = models.JSONField(_("Industry Keywords"), default=list, blank=True)
    category = models.CharField(_("Product Category"), max_length=100, blank=True, default="")
    announcement_type = models.CharField(_("Announcement Type"), max_length=100, blank=True, default="")

    # Promotion status
    is_converted = models.BooleanField(
        _("Converted to Startup Evaluation"),
        default=False,
        help_text="True once this discovery is converted to a StartupEvaluation record.",
    )

    discovered_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "discovered_startups"
        ordering = ["-discovered_at"]
        verbose_name = _("Discovered Startup")
        verbose_name_plural = _("Discovered Startups")
        indexes = [
            models.Index(fields=["source", "-discovered_at"]),
        ]

    def __str__(self):
        return f"{self.company_name} [{self.get_source_display()}] ({self.discovered_at.strftime('%Y-%m-%d')})"
