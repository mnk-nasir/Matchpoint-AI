from django.db import models


class BaseLead(models.Model):
    email = models.EmailField()
    phone = models.CharField(max_length=64, blank=True, default="")
    focus = models.TextField(blank=True, default="")
    source_ip = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        abstract = True
        ordering = ("-created_at",)


class InvestorInterestLead(BaseLead):
    name = models.CharField(max_length=200)
    linkedin = models.URLField(blank=True, default="")
    firm = models.CharField(max_length=200, blank=True, default="")
    role = models.CharField(max_length=120, blank=True, default="")

    def __str__(self) -> str:
        return f"InvestorLead<{self.name} | {self.email}>"


class AcceleratorInterestLead(BaseLead):
    program_name = models.CharField(max_length=200)
    website = models.URLField(blank=True, default="")
    contact_name = models.CharField(max_length=200, blank=True, default="")
    cohort_size = models.PositiveIntegerField(null=True, blank=True)

    def __str__(self) -> str:
        return f"AcceleratorLead<{self.program_name} | {self.email}>"

