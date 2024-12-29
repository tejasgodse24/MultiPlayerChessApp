from datetime import datetime
import chess
from chessapp.messages import * 
from chessapp.message_service import send_direct_message
from asgiref.sync import async_to_sync
from chessapp.models import GameDB, Move


class Game:
    def __init__(self, player1, player2) -> None:
        self.player1 = player1
        self.player2 = player2
        self.board = chess.Board()
        self.start_time = datetime.now()
        self.gamedb_obj = GameDB.objects.create(
                            white_player1 = player1.user, black_player2 = player2.user, status = "IN_PROGRESS"
                        )

        send_direct_message(player2, player1, INIT_GAME, {"type": INIT_GAME, "color": "white"})
        send_direct_message(player1, player2, INIT_GAME, {"type": INIT_GAME, "color": "Black"} )



    def make_move(self, socket, move):
        print("move",move)
        # validation here 
        # is it this users move
        if len(self.board.move_stack) % 2 == 0 and self.player2 == socket:
            print("wrong turn 1")
            send_direct_message(socket, socket, WRONG_TURN, {"type": WRONG_TURN, "msg": "Not Your Turn"})
            return
        
        if len(self.board.move_stack) % 2 == 1 and self.player1 == socket:
            print("wrong turn 2")
            send_direct_message(socket, socket, WRONG_TURN, {"type": WRONG_TURN, "msg": "Not Your Turn"})
            return
        
        player_move = chess.Move.from_uci(move)

        # is it valid move
        if player_move in self.board.legal_moves:
            # update board / push move
            self.board.push(player_move)
            print("valid move")
        else:
            send_direct_message(socket, socket, INVALID_MOVE, {"type": INVALID_MOVE, "msg": "invalid move"})
            print("invalid move")
            return

        # check if is game over ?
        if self.board.is_game_over():
            # send message that game is over to both players
            print("game over")
            outcome = self.board.outcome()
            send_direct_message(self.player1, 
                                self.player2, 
                                GAME_OVER, 
                                {"type": GAME_OVER, "winner" : "White" if outcome is True else "Black" if outcome is False else "Draw"} 
                                )
            send_direct_message(self.player2, 
                                self.player1, 
                                GAME_OVER, 
                                {"type": GAME_OVER, "winner" : "White" if outcome is True else "Black" if outcome is False else "Draw"} 
                                )

        # send msg both player1, player2 even if anyone makes move
        send_direct_message(self.player1, self.player2, MOVE, {"type": MOVE, "move": move})
        send_direct_message(self.player2, self.player1, MOVE, {"type": MOVE, "move": move})

        if len(self.board.move_stack) % 2 == 0:    # means player2 just made the move
            print("player2 made move")
            send_direct_message(self.player2, self.player1, TURN, {"type": TURN, "msg": "Your Turn"})
        else:
            print("player1 made move")
            send_direct_message(self.player1, self.player2, TURN, {"type": TURN, "msg": "Your Turn"})

        Move.objects.create(gameid = self.gamedb_obj, move_number = 0, move_from = move[0:2], move_to = move[2:])

        print("board")
        print(self.board)

        # send updated board to both users