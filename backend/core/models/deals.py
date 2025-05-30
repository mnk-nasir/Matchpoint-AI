from django.db import models
import uuid
from .user import User
from .evaluation import StartupEvaluation

class Watchlist(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='watchlist')
    startup = models.ForeignKey(StartupEvaluation, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'startup')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} watching {self.startup.company_name}"


class PipelineStage(models.Model):
    STAGE_CHOICES = [
        ('New Startups', 'New Startups'),
        ('Reviewing', 'Reviewing'),
        ('Shortlisted', 'Shortlisted'),
        ('Due Diligence', 'Due Diligence'),
        ('Negotiation', 'Negotiation'),
        ('Invested', 'Invested'),
        ('Rejected', 'Rejected'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='pipeline_stages')
    startup = models.ForeignKey(StartupEvaluation, on_delete=models.CASCADE)
    stage = models.CharField(max_length=50, choices=STAGE_CHOICES, default='New Startups')
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'startup')
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.user.email} - {self.startup.company_name} - {self.stage}"


class Contact(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='contacts')
    name = models.CharField(max_length=255)
    role = models.CharField(max_length=255, blank=True, null=True)
    company = models.CharField(max_length=255, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=50, blank=True, null=True)
    country = models.CharField(max_length=255, blank=True, null=True)
    tags = models.JSONField(default=list, blank=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.company})"
