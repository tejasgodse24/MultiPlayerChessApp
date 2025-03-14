# Generated by Django 5.1.3 on 2025-02-01 18:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chessapp', '0003_gamedb_fen_string'),
    ]

    operations = [
        migrations.AddField(
            model_name='gamedb',
            name='black_player2_remaining_time',
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name='gamedb',
            name='white_player1_remaining_time',
            field=models.PositiveIntegerField(default=0),
        ),
    ]
