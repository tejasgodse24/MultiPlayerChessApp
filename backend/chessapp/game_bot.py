

import asyncio
from datetime import datetime, timedelta
import chess
import chess.engine
from chessapp.messages import * 
from chessapp.message_service import send_direct_message  
from asgiref.sync import sync_to_async
from channels.db import database_sync_to_async
from chessapp.models import GameDB, Move
from django.conf import settings
from chessapp.chess_service import make_bot_move 

class GameBot:
    def __init__(self, player1, message) -> None:
        # Minimal synchronous initialization
        self.player1 = player1
        self.player2 = None
        self.board = chess.Board()
        self.start_time = datetime.now()
        self.fen_string = self.board.fen()
        self.last_move_player_name = ""
        self.last_move = ""
        self.last_move_time = datetime.now()
        # These will be set in async setup:
        self.gamedb_obj = None

    @classmethod
    async def create(cls, player1, message):
        """
        Async factory method to initialize a GameBot instance and run async setup.
        """
        instance = cls(player1, message)
        await instance.setup_game()
        return instance

    async def setup_game(self):
        """
        Create the DB record asynchronously and set up channel groups.
        """
        self.gamedb_obj = await self.create_game_db_record()
        room_name = str(self.gamedb_obj.gameid)
        self.player1.room_name = room_name
        self.player1.room_group_name = f"rm_grp_{room_name}"
        # Add player1 to the channel group
        await self.player1.channel_layer.group_add(
            self.player1.room_group_name,
            self.player1.channel_name
        )
        # Send initial bot game message
        await self.player1.channel_layer.group_send(
            self.player1.room_group_name,
            {
                "type": BOT_INIT_GAME,
                "payload": {
                    "type": BOT_INIT_GAME,
                    "white": self.player1.user.email,
                    "black": "Bot",
                    "is_game_timed": False
                }
            }
        )

    @database_sync_to_async
    def create_game_db_record(self):
        return GameDB.objects.create(
            white_player1=self.player1.user, 
            black_player2=None, 
            status="IN_PROGRESS", 
            fen_string=self.board.fen(), 
            white_player1_remaining_time=100, 
            black_player2_remaining_time=100,
            is_bot_mode=True
        )

    async def reload_board_position(self, socket):
        # print("reload game : ", socket.user)
        # print("reload-game-values")
        
        socket.room_name = str(self.gamedb_obj.gameid)
        socket.room_group_name = f"rm_grp_{socket.room_name}"
       
        await socket.channel_layer.group_add(
            socket.room_group_name,
            socket.channel_name
        )
        # Send reload message
        await socket.channel_layer.group_send(
            socket.room_group_name,
            {
                "type": RELOAD_BOARD,
                "payload": {
                    "type": RELOAD_BOARD,
                    "fen_string": self.fen_string,
                    "last_move": self.last_move,
                    "color": "white" if socket == self.player1 else "black",
                    "last_move_username": self.player1.user.email if self.last_move_player_name == self.player1.user.username else "Bot"
                }
            }
        )

    async def make_move(self, socket, move):
        # print("game bot obj move", move)

        # --- Validation Checks ---
        if socket is not None:
            # check turn validity:
            if len(self.board.move_stack) % 2 == 0 and socket is None:
                # print("wrong turn 1")
                await send_direct_message(socket, socket, WRONG_TURN, {"type": WRONG_TURN, "msg": "Not Your Turn"})
                return
            if len(self.board.move_stack) % 2 == 1 and self.player1 == socket:
                # print("wrong turn 2")
                await send_direct_message(socket, socket, WRONG_TURN, {"type": WRONG_TURN, "msg": "Not Your Turn"})
                return
            if move[0:2] == move[2:]:
                await send_direct_message(socket, socket, INVALID_MOVE, {"type": INVALID_MOVE, "msg": "invalid move"})
                # print("same square move: invalid")
                return

        
        player_move = chess.Move.from_uci(move)
        if player_move in self.board.legal_moves:
            self.board.push(player_move)
            # print("valid move")
        else:
            if socket:
                await send_direct_message(socket, socket, INVALID_MOVE, {"type": INVALID_MOVE, "msg": "invalid move"})
            # print("invalid move")
            return

        # --- Check for Game Over ---
        if self.board.is_game_over():
            # print("game over")
            self.gamedb_obj.status = "COMPLETED"
            await self.save_game_state()
            outcome = self.board.outcome()
            if outcome.winner is True:
                winner = "White"
            elif outcome.winner is False:
                winner = "Black"
            else:
                winner = "Draw"
            await self.player1.channel_layer.group_send(
                self.player1.room_group_name,
                {
                    "type": GAME_OVER,
                    "payload": {
                        "type": GAME_OVER,
                        "winner": winner
                    }
                }
            )
            return  # End execution after game over

        # --- Update Last Move Information ---
        if len(self.board.move_stack) % 2 == 0:
            self.last_move_player_name = "bot"
        else:
            self.last_move_player_name = self.player1.user.username
        self.last_move_time = datetime.now()
        # print("last move time", self.last_move_time)

        # --- Send Move Message ---
        payload = {
            "type": BOT_MOVE if socket is None else MOVE,
            "move": move,
            "move_player_name": self.last_move_player_name,
            "move_player_color": "black" if len(self.board.move_stack) % 2 == 0 else "white",
            "next_turn_player_color": "white" if len(self.board.move_stack) % 2 == 0 else "black"
        }
        await self.player1.channel_layer.group_send(
            self.player1.room_group_name,
            {
                "type": BOT_MOVE if socket is None else MOVE,
                "payload": payload
            }
        )

        # --- Save Game State ---
        self.gamedb_obj.fen_string = self.board.fen()
        self.fen_string = self.board.fen()
        await self.save_game_state()

        # --- Create Move Record in DB ---
        await self.create_move_record(move)

        # Set last move
        self.last_move = move
        # print("board")
        # print(self.board)

    @database_sync_to_async
    def save_game_state(self):
        self.gamedb_obj.save()

    @database_sync_to_async
    def create_move_record(self, move):
        return Move.objects.create(
            gameid=self.gamedb_obj, 
            move_number=0, 
            move_from=move[0:2], 
            move_to=move[2:]
        )

    async def add_watch_user(self, socket):
        # print("add_watch_user ::: ")
        await send_direct_message(
            socket, 
            socket, 
            CONNECT_WATCH_USER, 
            {
                "type": CONNECT_WATCH_USER, 
                "fen_string": self.fen_string,
                "last_move": self.last_move, 
                "last_move_username": self.player1.user.email if self.last_move_player_name == self.player1.user.username else "Bot",
                "next_turn_player_color": "white" if self.last_move_player_name == self.player1.user.username else "black"
            }
        )
        socket.room_name = str(self.gamedb_obj.gameid)
        socket.room_group_name = f"rm_grp_{socket.room_name}"
        await socket.channel_layer.group_add(
            socket.room_group_name,
            socket.channel_name
        )

    async def bot_move(self):
        # print("inside bot_move ::: ")
        # If make_bot_move is CPU-bound, run it in an executor.
        loop = asyncio.get_running_loop()
        b_move = await loop.run_in_executor(None, make_bot_move, self.board)
        # print("Bot Move OK ::: ", b_move)
        await self.make_move(None, str(b_move))

