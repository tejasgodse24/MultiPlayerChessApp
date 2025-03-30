
from chessapp.game import Game
from chessapp.game_bot import GameBot
from chessapp.messages import * 
from datetime import datetime
from datetime import timedelta
from chessapp.message_service import *

class GameManager:
    def __init__(self) -> None:
        self.games = []
        self.bot_games = []
        self.pending_user = None
        self.users = []
        self.watch_users = []
        self.bot_game_users = []


    def print_all(self):
        print("\n all games===")
        for g in self.games:
            print(g, end=" ")

        print("\n all users ===")
        for u in self.users:
            print(u, end=" ")

        print(f"\n pending_user ==={self.pending_user}")


    async def add_user(self, socket):
        if socket.user in self.users:
            # print("user exists")
            game = [g for g in self.games if (g.gamedb_obj.is_bot_mode == True and g.player1 == socket) or (g.gamedb_obj.is_bot_mode == False and (g.player1 == socket or g.player2 == socket))]

            if game:
                # print("game also exists")
                game = game[0]
                if game.player1.user == socket.user:
                    game.player1 = socket
                    # print("condition: 1")
                else:
                    game.player2 = socket
                    # print("condition: 2")

                # game.reload_board_position(socket)
            else:
                # print("user exists but game not exists")
                pass
        else:
            await send_direct_message(
                socket, 
                socket, 
                USER_CONNECTED, 
                {
                    "type": USER_CONNECTED,
                    "message":"You are connected..."
                }
            )
            self.users.append(socket.user)
        # self.print_all()


    def remove_user(self, socket):
        game = [g for g in self.games if (g.gamedb_obj.is_bot_mode == True and g.player1 == socket) or (g.gamedb_obj.is_bot_mode == False and (g.player1 == socket or g.player2 == socket))]

        if game:
            game = game[0]
            # print('user with game disconnected..', game)
            
        # print('only user disconnected..')
        # self.print_all()


    async def add_handler(self, socket, message):
        if message["type"] == INIT_GAME:
            if self.pending_user:
                if self.pending_user.user == socket.user:
                    return
                game = await Game.create(self.pending_user, socket, message)
                self.games.append(game)
                self.pending_user = None
            else:
                self.pending_user = socket

        elif message["type"] == MOVE:
            # print(len(self.games))
            game = [g for g in self.games if (g.gamedb_obj.is_bot_mode == True and g.player1 == socket) or (g.gamedb_obj.is_bot_mode == False and (g.player1 == socket or g.player2 == socket))][0]
            if game:
                await game.make_move(socket, message["move"])

        elif message["type"] == GAME_OVER:  #game over from client side (due to time over )
            game = [g for g in self.games if (g.gamedb_obj.is_bot_mode == True and g.player1 == socket) or (g.gamedb_obj.is_bot_mode == False and (g.player1 == socket or g.player2 == socket))]

            if len(game) > 0:
                game = game[0]
                await game.time_over(socket, message["looser_color"])
                self.users.remove(game.player1.user)
                self.users.remove(game.player2.user)
                self.games.remove(game)

        elif message["type"] == CONNECT_WATCH_USER: 
            # print("CONNECT_WATCH_USER ::: ")
            game = [g for g in self.games if g.gamedb_obj.gameid == int(message["gameid"])]
            # print(game)
            if game :
                game = game[0]
                if game.player1 == socket:
                    pass
                    # print("already playing game player1")
                elif game.player2 == socket:
                    pass
                    # print("already playing game player2")
                else:
                    self.watch_users.append(socket.user)
                    self.users.remove(socket.user)
                    await game.add_watch_user(socket)
            else:
                # print("Game is not going live")
                await send_direct_message(
                    socket, 
                    socket, 
                    GAME_NOT_LIVE, 
                    {
                        "type": GAME_NOT_LIVE,
                        "message":"game is not going live"
                    }
                )
        elif message["type"] == RELOAD_BOARD: 
            if socket.user in self.users:
                # print("user exists")
                game = [g for g in self.games if (g.gamedb_obj.is_bot_mode == True and g.player1 == socket) or (g.gamedb_obj.is_bot_mode == False and (g.player1 == socket or g.player2 == socket))]

                if game:
                    # print("game also exists")
                    game = game[0]
                    if game.player1.user == socket.user:
                        game.player1 = socket
                        # print("condition: 1")
                    else:
                        game.player2 = socket
                        # print("condition: 2")

                    await game.reload_board_position(socket)
                else:
                    pass
                    # print("user exists but game not exists")
            else:
                # print("user not exists")
                pass
        elif message["type"] == BOT_INIT_GAME:
            game = await GameBot.create(socket, message)
            self.games.append(game)
            # self.bot_games.append(game)
            self.pending_user = None

            self.bot_game_users.append(socket.user)
            self.users.remove(socket.user)
        elif message["type"] == BOT_MOVE:
            # print(len(self.games))
            game = [g for g in self.games if g.player1 == socket][0]
            if game:
                await game.bot_move()

        elif message["type"] == REMOVE_GAME:
            from chessapp.helpers import remove_games_with_users
            # print("REMOVE_GAME ::: ")
            games = [g for g in self.games if g.player1 == socket or g.player2 == socket]
            if games:
                remove_games_with_users(games)
            
        # self.print_all()



# common object of GameManager
game_manager = GameManager()