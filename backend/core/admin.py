from django.contrib import admin
from core.models import InvestorInterestLead, AcceleratorInterestLead


@admin.register(InvestorInterestLead)
class InvestorInterestLeadAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "firm", "role", "created_at")
    search_fields = ("name", "email", "firm", "role")
    list_filter = ("created_at",)


@admin.register(AcceleratorInterestLead)
class AcceleratorInterestLeadAdmin(admin.ModelAdmin):
    list_display = ("program_name", "email", "contact_name", "cohort_size", "created_at")
    search_fields = ("program_name", "email", "contact_name")
    list_filter = ("created_at",)
