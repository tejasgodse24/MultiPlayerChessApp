from rest_framework import serializers
from chessapp.models import GameDB


class GameDBSerializer(serializers.ModelSerializer):
    white_player1_username = serializers.SerializerMethodField()
    black_player2_username = serializers.SerializerMethodField()

    class Meta:
        model = GameDB
        fields = "__all__"
        extra_fields = ["white_player1_username", "get_black_player2_username"]
    
    def get_white_player1_username(self, obj):
        return obj.white_player1.username if obj.white_player1 else ""
    
    def get_black_player2_username(self, obj):
        return obj.black_player2.username if obj.black_player2 else ""

