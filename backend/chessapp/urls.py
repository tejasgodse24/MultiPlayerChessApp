
from django.urls import path
from chessapp.views import *

urlpatterns = [
    path('get-all-games/', get_all_running_games, name="running_games")
]
