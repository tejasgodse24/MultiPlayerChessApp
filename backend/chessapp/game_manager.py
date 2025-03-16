
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


    def add_user(self, socket):
        if socket.user in self.users:
            # print("user exists")
            # game = [g for g in self.games if g.player1.user == socket.user or g.player2.user == socket.user]
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
            send_direct_message(
                socket, 
                socket, 
                USER_CONNECTED, 
                {
                    "type": USER_CONNECTED,
                    "message":"You are connected..."
                }
            )
            self.users.append(socket.user)
        self.print_all()


    def remove_user(self, socket):
        # game = [g for g in self.games if g.player1 == socket or g.player2 == socket]
        # game = [g for g in self.games if g.player1 == socket or (True if g.player2 is None else g.player2 == socket) ]
        game = [g for g in self.games if (g.gamedb_obj.is_bot_mode == True and g.player1 == socket) or (g.gamedb_obj.is_bot_mode == False and (g.player1 == socket or g.player2 == socket))]

        if game:
            game = game[0]
            print('user with game disconnected..', game)
            
        print('only user disconnected..')
        self.print_all()


    def add_handler(self, socket, message):
        if message["type"] == INIT_GAME:
            if self.pending_user:
                if self.pending_user.user == socket.user:
                    return
                game = Game(self.pending_user, socket, message)
                self.games.append(game)
                self.pending_user = None
            else:
                self.pending_user = socket

        elif message["type"] == MOVE:
            print(len(self.games))
            # game = [g for g in self.games if g.player1 == socket or g.player2 == socket][0]
            # game = [g for g in self.games if g.player1 == socket or (True if g.player2 is None else g.player2 == socket)][0]
            game = [g for g in self.games if (g.gamedb_obj.is_bot_mode == True and g.player1 == socket) or (g.gamedb_obj.is_bot_mode == False and (g.player1 == socket or g.player2 == socket))][0]
            if game:
                game.make_move(socket, message["move"])

        elif message["type"] == GAME_OVER:  #game over from client side (due to time over )
            # game = [g for g in self.games if g.player1 == socket or g.player2 == socket]
            game = [g for g in self.games if (g.gamedb_obj.is_bot_mode == True and g.player1 == socket) or (g.gamedb_obj.is_bot_mode == False and (g.player1 == socket or g.player2 == socket))]

            if len(game) > 0:
                game = game[0]
                game.time_over(socket, message["looser_color"])
                self.users.remove(game.player1.user)
                self.users.remove(game.player2.user)
                self.games.remove(game)

        elif message["type"] == CONNECT_WATCH_USER: 
            print("CONNECT_WATCH_USER ::: ")
            game = [g for g in self.games if g.gamedb_obj.gameid == int(message["gameid"])]
            print(game)
            if game :
                game = game[0]
                if game.player1 == socket:
                    print("already playing game player1")
                elif game.player2 == socket:
                    print("already playing game player2")
                else:
                    self.watch_users.append(socket.user)
                    self.users.remove(socket.user)
                    game.add_watch_user(socket)
            else:
                print("Game is not going live")
                send_direct_message(
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
                print("user exists")
                # game = [g for g in self.games if g.player1.user == socket.user or g.player2.user == socket.user]
                game = [g for g in self.games if (g.gamedb_obj.is_bot_mode == True and g.player1 == socket) or (g.gamedb_obj.is_bot_mode == False and (g.player1 == socket or g.player2 == socket))]

                if game:
                    print("game also exists")
                    game = game[0]
                    if game.player1.user == socket.user:
                        game.player1 = socket
                        print("condition: 1")
                    else:
                        game.player2 = socket
                        print("condition: 2")

                    game.reload_board_position(socket)
                else:
                    print("user exists but game not exists")
            else:
                print("user not exists")
        elif message["type"] == BOT_INIT_GAME:
            game = GameBot(socket, message)  #player2 = None

            self.games.append(game)
            # self.bot_games.append(game)
            self.pending_user = None

            self.bot_game_users.append(socket.user)
            self.users.remove(socket.user)
        elif message["type"] == BOT_MOVE:
            print(len(self.games))
            game = [g for g in self.games if g.player1 == socket][0]
            if game:
                game.bot_move()
            
        self.print_all()



# common object of GameManager
game_manager = GameManager()