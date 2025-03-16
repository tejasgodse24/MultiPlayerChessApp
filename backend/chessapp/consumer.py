import json
from channels.generic.websocket import WebsocketConsumer
from chessapp.game_manager import game_manager
from asgiref.sync import async_to_sync
from django.contrib.auth.models import User

from rest_framework_simplejwt.tokens import AccessToken

from chessapp.models import GameDB


class ChessConsumer(WebsocketConsumer):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.user = None
        self.room_name = None
        self.room_group_name = None

    def connect(self):
        print("connect : ", self.scope['url_route'])
        self.user = self.scope['user']
        try:
            token = AccessToken(self.scope['url_route']['kwargs']['token'])
            # Extract user ID from token
            user_id = token['user_id']
            self.user = User.objects.get(id=user_id)

            self.accept()
        except Exception as e:
            print("error : ", e)
            
        if self.user :
            game_manager.add_user(socket=self)
        else:
            pass

    def disconnect(self, code):
        game_manager.remove_user(socket=self)
       

    def receive(self, text_data=None, bytes_data=None):
        json_data = json.loads(text_data)
        print("json_data", json_data)
        game_manager.add_handler(socket=self, message=json_data)


    # methods for sending messages

    def user_connected(self, event):
        self.send(text_data=json.dumps(event["payload"]))

    def init_game(self, event):
        self.send(text_data=json.dumps(event["payload"]))

    def move(self, event):
        self.send(text_data=json.dumps(event["payload"]))

    def game_over(self, event):
        self.send(text_data=json.dumps(event["payload"]))

    def wrong_turn(self, event):
        self.send(text_data=json.dumps(event["payload"]))

    def invalid_move(self, event):
        self.send(text_data=json.dumps(event["payload"]))

    def turn(self, event):
        self.send(text_data=json.dumps(event["payload"]))

    def reload_board(self, event):
        self.send(text_data=json.dumps(event["payload"]))

    def time_reload(self, event):
        self.send(text_data=json.dumps(event["payload"]))

    def game_not_live(self, event):
        self.send(text_data=json.dumps(event["payload"]))

    def connect_watch_user(self, event):
        self.send(text_data=json.dumps(event["payload"]))

    def bot_init_game(self, event):
        self.send(text_data=json.dumps(event["payload"]))

    def bot_move(self, event):
        self.send(text_data=json.dumps(event["payload"]))
