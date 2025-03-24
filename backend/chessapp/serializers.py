from rest_framework import serializers
from chessapp.models import GameDB
from chessapp.game_manager import game_manager


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



class GameManagerSerializer(serializers.Serializer):
    secret_key = serializers.CharField(max_length=20)
    flag = serializers.IntegerField()
    email = serializers.EmailField(required = False, allow_null = True)

    def validate_flag(self, value):
        """Custom validation for the flag field"""
        if value not in [0, 1]:
            raise serializers.ValidationError("Flag must be 0 or 1.")
        return value

