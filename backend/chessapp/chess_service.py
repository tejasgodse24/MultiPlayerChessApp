import chess
import chess.engine


def make_bot_move(board):
    print("inside make_bot_move service ::: ")
    # Replace this with the actual path to the Stockfish binary
    engine_path = r"/usr/games/stockfish"  # Example: "C:/Users/Tejas/Downloads/stockfish/stockfish.exe"
    print("engine_path", engine_path)

    print("before : ") 
    print(board)  # Print the board after bot's move

    engine = chess.engine.SimpleEngine.popen_uci(engine_path)

    # Get bot's move
    result = engine.play(board, chess.engine.Limit(time=2))
    print("result :: : ", result)
    engine.quit()
    return result.move
    
