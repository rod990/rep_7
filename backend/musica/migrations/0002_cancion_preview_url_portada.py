from django.db import migrations, models
class Migration(migrations.Migration):
    dependencies = [
        ('musica', '0001_initial'),
    ]
    operations = [
        migrations.AddField(
            model_name='cancion',
            name='preview_url',
            field=models.URLField(blank=True, default='', max_length=500),
        ),
        migrations.AddField(
            model_name='cancion',
            name='portada',
            field=models.URLField(blank=True, default='', max_length=500),
        ),
    ]
