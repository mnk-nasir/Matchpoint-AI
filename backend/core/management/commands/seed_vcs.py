from django.core.management.base import BaseCommand
from core.models.user import User, InvestorProfile

class Command(BaseCommand):
    help = 'Seeds real-world VC profiles into the database'

    def handle(self, *args, **options):
        vcs = [
            {
                "name": "Sequoia Capital",
                "industries": ["AI", "Fintech", "SaaS", "Enterprise"],
                "stages": ["Seed", "Series A", "Series B"],
                "min_ticket": 1000000,
                "max_ticket": 50000000,
                "bio": "Legendary VC firm backer of Apple, Google, and Airbnb."
            },
            {
                "name": "Andreessen Horowitz",
                "industries": ["AI", "Web3", "Consumer", "SaaS"],
                "stages": ["Seed", "Series A", "Series B", "Growth"],
                "min_ticket": 500000,
                "max_ticket": 100000000,
                "bio": "Software is eating the world."
            },
            {
                "name": "Index Ventures",
                "industries": ["HealthTech", "Fintech", "DevTools", "SaaS"],
                "stages": ["Series A", "Series B", "Growth"],
                "min_ticket": 5000000,
                "max_ticket": 30000000,
                "bio": "Global VC firm with roots in London and Geneva."
            },
            {
                "name": "Accel",
                "industries": ["Cybersecurity", "SaaS", "Ecommerce", "Fintech"],
                "stages": ["Seed", "Series A", "Series B"],
                "min_ticket": 1000000,
                "max_ticket": 20000000,
                "bio": "Early backers of Facebook, Slack, and Atlassian."
            },
            {
                "name": "Y Combinator",
                "industries": ["AI", "SaaS", "Consumer", "B2B"],
                "stages": ["Seed"],
                "min_ticket": 500000,
                "max_ticket": 500000,
                "bio": "The world's most successful startup accelerator."
            }
        ]

        for vc in vcs:
            email = f"{vc['name'].lower().replace(' ', '')}@example.com"
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    "username": email,
                    "first_name": vc['name'],
                    "is_investor": True,
                    "is_founder": False
                }
            )
            if created:
                user.set_password("matchpoint2026")
                user.save()
            
            InvestorProfile.objects.update_or_create(
                user=user,
                defaults={
                    "firm_name": vc['name'],
                    "target_industries": vc['industries'],
                    "preferred_stages": vc['stages'],
                    "min_ticket_size": vc['min_ticket'],
                    "max_ticket_size": vc['max_ticket']
                }
            )

        self.stdout.write(self.style.SUCCESS(f'Successfully seeded {len(vcs)} real-world VC profiles.'))
