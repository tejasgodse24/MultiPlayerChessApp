from django.db import models
from django.contrib.auth.models import User

class GameDB(models.Model):
    gameid = models.AutoField(primary_key=True)
    white_player1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name="white_player1")
    black_player2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name="black_player2")
    status = models.CharField(max_length=100)
    fen_string = models.CharField(max_length=90, default="")
    white_player1_remaining_time = models.PositiveIntegerField(default=0)
    black_player2_remaining_time = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Move(models.Model):
    id = models.AutoField(primary_key=True)
    gameid = models.ForeignKey(GameDB, on_delete=models.CASCADE)
    move_number = models.IntegerField()
    move_from = models.CharField(max_length=2)
    move_to = models.CharField(max_length=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    def __str__(self):
        return str(self.gameid.gameid) + ":" + self.move_from + self.move_to


