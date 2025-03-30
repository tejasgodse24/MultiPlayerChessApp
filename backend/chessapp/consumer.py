import json
from channels.generic.websocket import WebsocketConsumer, AsyncWebsocketConsumer
from chessapp.game_manager import game_manager
from asgiref.sync import async_to_sync
from django.contrib.auth.models import User

from rest_framework_simplejwt.tokens import AccessToken
from asgiref.sync import sync_to_async
from chessapp.models import GameDB


class ChessConsumer(AsyncWebsocketConsumer):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.user = None
        self.room_name = None
        self.room_group_name = None

    async def connect(self):
        # print("connect : ", self.scope['url_route'])
        self.user = self.scope['user']
        try:
            token = AccessToken(self.scope['url_route']['kwargs']['token'])
            # Extract user ID from token
            user_id = token['user_id']
            # self.user = User.objects.get(id=user_id)
            self.user = await self.get_user(user_id)

            await self.accept()
        except Exception as e:
            print("error : ", e)
            
        if self.user :
            await game_manager.add_user(socket=self)
        else:
            pass

    async def disconnect(self, code):
        game_manager.remove_user(socket=self)
       

    async def receive(self, text_data=None, bytes_data=None):
        json_data = json.loads(text_data)
        # print("json_data", json_data)
        await game_manager.add_handler(socket=self, message=json_data)
        

    async def get_user(self, user_id):
        # Since Django ORM is synchronous, you might want to wrap this
        # using database_sync_to_async if needed. For simplicity, here's a synchronous call:
        return await sync_to_async(User.objects.get)(id=user_id)

    # methods for sending messages

    async def user_connected(self, event):
        await self.send(text_data=json.dumps(event["payload"]))

    async def init_game(self, event):
        await self.send(text_data=json.dumps(event["payload"]))

    async def move(self, event):
        await self.send(text_data=json.dumps(event["payload"]))

    async def game_over(self, event):
        await self.send(text_data=json.dumps(event["payload"]))

    async def wrong_turn(self, event):
        await self.send(text_data=json.dumps(event["payload"]))

    async def invalid_move(self, event):
        await self.send(text_data=json.dumps(event["payload"]))

    async def turn(self, event):
        await self.send(text_data=json.dumps(event["payload"]))

    async def reload_board(self, event):
        await self.send(text_data=json.dumps(event["payload"]))

    async def time_reload(self, event):
        await self.send(text_data=json.dumps(event["payload"]))

    async def game_not_live(self, event):
        await self.send(text_data=json.dumps(event["payload"]))

    async def connect_watch_user(self, event):
        await self.send(text_data=json.dumps(event["payload"]))

    async def bot_init_game(self, event):
        await self.send(text_data=json.dumps(event["payload"]))

    async def bot_move(self, event):
        await self.send(text_data=json.dumps(event["payload"]))

    async def remove_game(self, event):
        await self.send(text_data=json.dumps(event["payload"]))
