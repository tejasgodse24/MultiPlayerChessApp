from django.urls import path
from chessapp.consumer import ChessConsumer

websocket_urlpatterns = [
    path("", ChessConsumer.as_asgi())
]