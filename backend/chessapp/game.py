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
                            white_player1 = player1.user, black_player2 = player2.user, status = "IN_PROGRESS", fen_string = self.board.fen()
                        )
        self.last_move_player_name = ""

        send_direct_message(player2, player1, INIT_GAME, {"type": INIT_GAME, "color": "white"})
        send_direct_message(player1, player2, INIT_GAME, {"type": INIT_GAME, "color": "Black"} )


    def reload_board_position(self, socket):
        print("reload game : ", socket.user)
        send_direct_message(socket, socket, RELOAD_BOARD, {"type": RELOAD_BOARD, "fen_string": self.gamedb_obj.fen_string})

        if len(self.board.move_stack) % 2 == 0:    # means player2 just made the move
            print("reload player2 made move")
            send_direct_message(self.player2, self.player1, TURN, {"type": TURN, "msg": "Your Turn"})
        else:
            print("reload player1 made move")
            send_direct_message(self.player1, self.player2, TURN, {"type": TURN, "msg": "Your Turn"})
        

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
        
        if move[0:2] == move[2:]:
            send_direct_message(socket, socket, INVALID_MOVE, {"type": INVALID_MOVE, "msg": "invalid move"})
            print("same sqaure move : invalid")
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
            
            self.gamedb_obj.status = "COMPLETED"
            self.gamedb_obj.save()

            outcome = self.board.outcome()
            
            if outcome.winner is True:
                winner = "White"
            elif outcome.winner is False:
                winner = "Black"
            else:
                winner = "Draw"

            send_direct_message(self.player1, 
                                self.player2, 
                                GAME_OVER, 
                                {"type": GAME_OVER, "winner" : winner} 
                                )
            send_direct_message(self.player2, 
                                self.player1, 
                                GAME_OVER, 
                                {"type": GAME_OVER, "winner" : winner} 
                                )
        
        # just to knwo who makes move and send username in response
        if len(self.board.move_stack) % 2 == 0:    # means player2 just made the move
            self.last_move_player_name = self.player2.user.username
        else:
            self.last_move_player_name = self.player1.user.username


        # send msg both player1, player2 even if anyone makes move
        send_direct_message(self.player1, self.player2, MOVE, {"type": MOVE, "move": move, "move_player_name":self.last_move_player_name})
        send_direct_message(self.player2, self.player1, MOVE, {"type": MOVE, "move": move, "move_player_name":self.last_move_player_name})

        if len(self.board.move_stack) % 2 == 0:    # means player2 just made the move
            print("player2 made move")
            send_direct_message(self.player2, self.player1, TURN, {"type": TURN, "msg": "Your Turn"})
        else:
            print("player1 made move")
            send_direct_message(self.player1, self.player2, TURN, {"type": TURN, "msg": "Your Turn"})

        # save fen string of current position 
        self.gamedb_obj.fen_string = self.board.fen()
        self.gamedb_obj.save()

        # create move in db
        Move.objects.create(gameid = self.gamedb_obj, move_number = 0, move_from = move[0:2], move_to = move[2:])

        print("board")
        print(self.board)
