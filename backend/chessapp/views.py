from rest_framework.response import Response
from rest_framework.decorators import api_view
from accounts.views import User
from chessapp.helpers import clear_game_manager, remove_games_with_users
from chessapp.models import GameDB
from chessapp.serializers import GameDBSerializer, GameManagerSerializer
from chessapp.game_manager import game_manager
from rest_framework import status

@api_view(['GET'])
def get_all_running_games(request):
    if request.method == "GET":
        gameid_list = [g.gamedb_obj.gameid for g in game_manager.games if g.gamedb_obj.status == "IN_PROGRESS" and g.gamedb_obj.is_bot_mode == False]
        games = GameDB.objects.filter(pk__in = gameid_list)
        serializer = GameDBSerializer(games, many=True)
        return Response(serializer.data)
    

@api_view(['POST'])
def change_game_manager(request):
    if request.method == "POST":
        try:
            serializer = GameManagerSerializer(data = request.data)
            if serializer.is_valid():
                secret_key = serializer.validated_data.get("secret_key")
                flag = serializer.validated_data.get("flag")
                email = serializer.validated_data.get("email")

                

                if flag == 0:   #clear all game_manager
                    clear_game_manager()
                    return Response({"message": "game_manager cleared Successfully"}, status=status.HTTP_200_OK)
                elif flag == 1:     # remove games which have this email as user and all its corresponding users within those games
                    user_obj = User.objects.get(email = email)
                    users = [user_obj]
                    games = [g for g in game_manager.games if g.player1.user.email == email or g.player2.user.email]
                    users.extend([g.player1.user for g in games if g.player1.user != user_obj])
                    users.extend([g.player2.user for g in games if g.player2.user != user_obj])
                    # remove_games(games)
                    remove_games_with_users(users)
                    return Response({"message": "Removed games which have this email as user and all its corresponding users within those games"}, status=status.HTTP_200_OK)
                return Response({"message": "Selcet Correct Flag"}, status=status.HTTP_200_OK)
            else:
                return Response({"message": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(serializer.data)
    