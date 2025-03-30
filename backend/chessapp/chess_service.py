import chess
import chess.engine
from django.conf import settings

def make_bot_move(board):
    engine_path = settings.CHESS_ENGINE_PATH
    engine = chess.engine.SimpleEngine.popen_uci(engine_path)

    # Get bot's move
    result = engine.play(board, chess.engine.Limit(time=2))
    engine.quit()
    return result.move
    
