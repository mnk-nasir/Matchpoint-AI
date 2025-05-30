from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0003_single_table_formdata'),
    ]

    operations = [
        migrations.AddField(
            model_name='startupevaluation',
            name='founder_profile_url',
            field=models.URLField(blank=True, max_length=500, verbose_name='Founder Portfolio / LinkedIn URL'),
        ),
    ]

