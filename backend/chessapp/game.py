from datetime import datetime
import chess
from chessapp.messages import * 
from chessapp.message_service import send_direct_message
from asgiref.sync import async_to_sync
from chessapp.models import GameDB, Move
from datetime import timedelta


class Game:
    def __init__(self, player1, player2, message) -> None:
        self.player1 = player1
        self.player2 = player2
        self.board = chess.Board()
        self.start_time = datetime.now()
        self.gamedb_obj = GameDB.objects.create(
                            white_player1 = player1.user, 
                            black_player2 = player2.user, 
                            status = "IN_PROGRESS", 
                            fen_string = self.board.fen(), 
                            white_player1_remaining_time = 100, 
                            black_player2_remaining_time = 100
                        )
        self.fen_string = self.board.fen()
        self.last_move_player_name = ""
        self.last_move = ""
        self.last_move_time = datetime.now()

        self.player1_time_consumed = 0
        self.player2_time_consumed = 0
        self.is_game_timed = message["is_game_timed"] 

        player1.room_name = str(self.gamedb_obj.gameid)
        player1.room_group_name = f"rm_grp_{str(self.gamedb_obj.gameid)}"
        async_to_sync(player1.channel_layer.group_add)(player1.room_group_name, player1.channel_name)

        player2.room_name = str(self.gamedb_obj.gameid)
        player2.room_group_name = f"rm_grp_{str(self.gamedb_obj.gameid)}"
        async_to_sync(player2.channel_layer.group_add)(player2.room_group_name, player2.channel_name)

        async_to_sync(player2.channel_layer.group_send)(
            player2.room_group_name,
            {
                "type": INIT_GAME, 
                "payload":{
                    "type": INIT_GAME, 
                    "white": player1.user.email, 
                    "black": player2.user.email,
                    "is_game_timed": self.is_game_timed 
                } 
            }
        )
        
    def reload_board_position(self, socket):
        print("reload game : ", socket.user)

        # -----------------------------------------------------------------------------------------------
        # update time of disconncted player

        if self.last_move_player_name == "":
            if socket == self.player1:
                self.player1_time_consumed = self.player1_time_consumed  + (round((datetime.now() - self.last_move_time).total_seconds()) * 1000)
            elif socket == self.player2:
                pass
        elif self.last_move_player_name == self.player1.user.username:
            if socket == self.player2:
                self.player2_time_consumed = self.player2_time_consumed + (round((datetime.now() - self.last_move_time).total_seconds()) * 1000 )
            elif socket == self.player1:
                pass
        elif self.last_move_player_name == self.player2.user.username:
            if socket == self.player1:
                self.player1_time_consumed = self.player1_time_consumed  + (round((datetime.now() - self.last_move_time).total_seconds()) * 1000 )
            elif socket == self.player2:
                pass

        # -----------------------------------------------------------------------------------------------
        # send msg to reconnected player to reload board's current postion

        print("relaod-game-values")
        print(self.gamedb_obj.fen_string, self.last_move, "white" if socket == self.player1 else "black", "white" if self.last_move_player_name == self.player1.user.username else "black", self.player1_time_consumed, self.player2_time_consumed)
        
        send_direct_message(
            socket, 
            socket, 
            RELOAD_BOARD, 
            {
                "type": RELOAD_BOARD, 
                "fen_string": self.fen_string,
                "last_move" : self.last_move, 
                "color":"white" if socket == self.player1 else "black",    #color which is disconnected
                "last_move_username" : self.player1.user.email if self.last_move_player_name == self.player1.user.username else self.player2.user.email
            }
        )
        socket.room_name = str(self.gamedb_obj.gameid)
        socket.room_group_name = f"rm_grp_{str(self.gamedb_obj.gameid)}"
        async_to_sync(socket.channel_layer.group_add)(socket.room_group_name, socket.channel_name)

        # ------------------------------------------------------------------------------------

        if len(self.board.move_stack) % 2 == 0:    # means player2 just made the move
           
            async_to_sync(socket.channel_layer.group_send)(
                socket.room_group_name,
                {
                    "type": TIME_RELOAD, 
                    "payload": {
                        "type": TIME_RELOAD, 
                        "last_move_player_color":"black",
                        "player1_time_consumed": self.player1_time_consumed,
                        "player2_time_consumed": self.player2_time_consumed
                    }
                }
            )
        else:
            print("player1 made move")

            async_to_sync(socket.channel_layer.group_send)(
                socket.room_group_name,
                {
                    "type": TIME_RELOAD, 
                    "payload": {
                        "type": TIME_RELOAD, 
                        "last_move_player_color":"white",
                        "player1_time_consumed": self.player1_time_consumed,
                        "player2_time_consumed": self.player2_time_consumed
                    }
                }
            )



    def make_move(self, socket, move):
        print("move",move)

        # -----------------------------------------------------------------------------------------------
        # validation 1:  if user of wrong turn plays a move 

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
        
        # -----------------------------------------------------------------------------------------------
        # create chess move
        player_move = chess.Move.from_uci(move)

        # -----------------------------------------------------------------------------------------------
        # validation 2:  chech if move is valid 

        if player_move in self.board.legal_moves:
            # update board / push move
            self.board.push(player_move)
            print("valid move")
        else:
            send_direct_message(socket, socket, INVALID_MOVE, {"type": INVALID_MOVE, "msg": "invalid move"})
            print("invalid move")
            return
        # ----------------------------------------------------------

        # -----------------------------------------------------------------------------------------------
        # validation 3: check if is game over ?

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


            async_to_sync(socket.channel_layer.group_send)(
                socket.room_group_name,
                {
                    "type": GAME_OVER, 
                    "payload":{
                        "type": GAME_OVER, 
                        "winner" : winner
                    } 
                }
            )

        # -----------------------------------------------------------------------------------------------


        # -----------------------------------------------------------------------------------------------
        # just to knwo who makes move and send username in response and update respective time

        print((datetime.now() - self.last_move_time), round((datetime.now() - self.last_move_time).total_seconds()))

        if len(self.board.move_stack) % 2 == 0:    # means player2 just made the move
            self.last_move_player_name = self.player2.user.username
            
            self.player2_time_consumed = self.player2_time_consumed + (round((datetime.now() - self.last_move_time).total_seconds()) * 1000)
            
            self.last_move_time = datetime.now()
        else:
            self.last_move_player_name = self.player1.user.username

            self.player1_time_consumed = self.player1_time_consumed + (round((datetime.now() - self.last_move_time).total_seconds()) * 1000)
            
            self.last_move_time = datetime.now()
            
        print("last move time", self.last_move_time)

        # -----------------------------------------------------------------------------------------------



        # -----------------------------------------------------------------------------------------------
        # send msg of move played for both players and other details
        # send turn msg also for who's turn next ?

        if len(self.board.move_stack) % 2 == 0:    # means player2 just made the move
            print("player2 made move")

            async_to_sync(socket.channel_layer.group_send)(
                socket.room_group_name,
                {
                    "type": MOVE, 
                    "payload": {
                        "type": MOVE, 
                        "move": move, 
                        "move_player_name":self.last_move_player_name,  
                        "move_player_color":"black",
                        "next_turn_player_color" : "white",
                        "player1_time_consumed": self.player1_time_consumed,
                        "player2_time_consumed": self.player2_time_consumed
                    }
                }
            )
        else:
            print("player1 made move")

            async_to_sync(socket.channel_layer.group_send)(
                socket.room_group_name,
                {
                    "type": MOVE, 
                    "payload": {
                        "type": MOVE, 
                        "move": move, 
                        "move_player_name":self.last_move_player_name, 
                        "move_player_color":"white",
                        "next_turn_player_color" : "black",
                        "player1_time_consumed": self.player1_time_consumed,
                        "player2_time_consumed": self.player2_time_consumed
                    }
                }
            )
        # -----------------------------------------------------------------------------------------------



        # -----------------------------------------------------------------------------------------------
        # save fen string of current position and remaining times also

        self.gamedb_obj.fen_string = self.board.fen()
        self.fen_string = self.board.fen()
        self.gamedb_obj.save()
        # -----------------------------------------------------------------------------------------------


        # -----------------------------------------------------------------------------------------------
        # create current move in db

        move_obj = Move.objects.create(
            gameid = self.gamedb_obj, 
            move_number = 0, 
            move_from = move[0:2], 
            move_to = move[2:]
            )
        
        #set last move
        self.last_move = move
        # -----------------------------------------------------------------------------------------------

        print("board")
        print(self.board)
    
    def time_over(self, socket, color):

        print("game over : time over")
        
        self.gamedb_obj.status = "COMPLETED"
        self.gamedb_obj.save()

        if color == "white":
            winner = "Black"
        elif color == "black":
            winner = "White"
        else:
            winner = "Draw"

        print("game over : sending msg")

        async_to_sync(socket.channel_layer.group_send)(
            socket.room_group_name,
            {
                "type": GAME_OVER, 
                "payload": {"type": GAME_OVER, "winner" : winner} 
            }
        )


    def add_watch_user(self, socket):

        print("add_watch_user ::: ")

        send_direct_message(
            socket, 
            socket, 
            CONNECT_WATCH_USER, 
            {
                "type": CONNECT_WATCH_USER, 
                "fen_string": self.fen_string,
                "last_move" : self.last_move, 
                "last_move_username" : self.player1.user.email if self.last_move_player_name == self.player1.user.username else self.player2.user.email,
                "next_turn_player_color" : "white" if self.last_move_player_name == self.player1.user.username else "black"
            }
        )

        socket.room_name = str(self.gamedb_obj.gameid)
        socket.room_group_name = f"rm_grp_{str(self.gamedb_obj.gameid)}"
        async_to_sync(socket.channel_layer.group_add)(socket.room_group_name, socket.channel_name)


    
        
