from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from decouple import config


class Command(BaseCommand):
    help = "Creates a default admin user if it does not exist"

    def handle(self, *args, **options):
        User = get_user_model()
        # The project authenticates with email as username. We use a safe default email.
        default_email = config("DEFAULT_ADMIN_EMAIL", default="admin@matchpoint.local")
        default_password = config("DEFAULT_ADMIN_PASSWORD", default="Admin123")
        first_name = config("DEFAULT_ADMIN_FIRST_NAME", default="Admin")
        last_name = config("DEFAULT_ADMIN_LAST_NAME", default="")

        if User.objects.filter(email=default_email).exists():
            self.stdout.write(self.style.WARNING(f"Admin user already exists: {default_email}"))
            return

        user = User.objects.create_superuser(
            username=default_email,  # username field exists but login uses email
            email=default_email,
            password=default_password,
            first_name=first_name,
            last_name=last_name,
        )
        user.is_investor = True
        user.is_founder = False
        user.save(update_fields=["is_investor", "is_founder"])
        self.stdout.write(self.style.SUCCESS(f"Created admin user {default_email} with default password"))

