from django.db import migrations, models
import django.db.models.deletion

def migrate_steps_to_form_data(apps, schema_editor):
    StartupEvaluation = apps.get_model('core', 'StartupEvaluation')
    try:
        EvaluationStepData = apps.get_model('core', 'EvaluationStepData')
    except LookupError:
        EvaluationStepData = None

    if EvaluationStepData is None:
        return

    for eval_obj in StartupEvaluation.objects.all():
        steps = (
            EvaluationStepData.objects
            .filter(evaluation_id=eval_obj.id)
            .order_by('step_number')
        )
        if steps.exists():
            # Build a dict with step1..stepN preserving previous structure
            payload = {}
            for s in steps:
                payload[f'step{s.step_number}'] = s.step_data
            eval_obj.form_data = payload
            eval_obj.save(update_fields=['form_data'])

class Migration(migrations.Migration):

    dependencies = [
        ('core', '0002_alter_startupevaluation_user'),
    ]

    operations = [
        migrations.AddField(
            model_name='startupevaluation',
            name='form_data',
            field=models.JSONField(blank=True, null=True, verbose_name='Form Data'),
        ),
        migrations.RunPython(migrate_steps_to_form_data, migrations.RunPython.noop),
        migrations.DeleteModel(
            name='EvaluationStepData',
        ),
    ]
