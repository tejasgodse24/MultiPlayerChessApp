from rest_framework.response import Response
from rest_framework.decorators import api_view
from chessapp.models import GameDB
from chessapp.serializers import GameDBSerializer
from chessapp.game_manager import game_manager

@api_view(['GET'])
def get_all_running_games(request):
    if request.method == "GET":
        gameid_list = [g.gamedb_obj.gameid for g in game_manager.games if g.gamedb_obj.status == "IN_PROGRESS" ]
        games = GameDB.objects.filter(pk__in = gameid_list)
        serializer = GameDBSerializer(games, many=True)
        return Response(serializer.data)