from django.urls import path
from chessapp.consumer import ChessConsumer

websocket_urlpatterns = [
    path("<str:token>", ChessConsumer.as_asgi())
]