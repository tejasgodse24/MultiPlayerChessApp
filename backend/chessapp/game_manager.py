
from chessapp.game import Game
from chessapp.messages import * 

class GameManager:
    def __init__(self) -> None:
        self.games = []
        self.pending_user = None
        self.users = []

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
            print("user exists")
            game = [g for g in self.games if g.player1.user == socket.user or g.player2.user == socket.user]
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
                pass
        else:
            self.users.append(socket.user)
        self.print_all()


    def remove_user(self, socket):
        game = [g for g in self.games if g.player1 == socket or g.player2 == socket]
        if game:
            game = game[0]
            print('user with game disconnected..', game)
            
        print('only user disconnected..')
        self.print_all()


    def add_handler(self, socket, message):
        if message["type"] == INIT_GAME:
            if self.pending_user:
                game = Game(self.pending_user, socket)
                self.games.append(game)
                self.pending_user = None
            else:
                self.pending_user = socket

        elif message["type"] == MOVE:
            print(len(self.games))
            game = [g for g in self.games if g.player1 == socket or g.player2 == socket][0]
            if game:
                game.make_move(socket, message["move"])

        self.print_all()


# common object of GameManager
game_manager = GameManager()