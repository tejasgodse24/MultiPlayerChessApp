
from chessapp.game_manager import game_manager

def clear_game_manager():
    game_manager.games.clear()
    game_manager.bot_games.clear()
    game_manager.pending_user = None
    game_manager.users.clear()
    game_manager.watch_users.clear()
    game_manager.bot_game_users.clear()



def remove_games(games):
    game_manager.games = [g for g in game_manager.games if g not in games]
    game_manager.bot_games = [g for g in game_manager.bot_games if g not in games]

    

def remove_games_with_users(games):
    users = {g.player1.user for g in games if g.player1} | {g.player2.user for g in games if g.player2}

    game_manager.games = [g for g in game_manager.games if g not in games]
    game_manager.bot_games = [g for g in game_manager.bot_games if g not in games]
    
    game_manager.users = [u for u in game_manager.users if u not in users]
        
        
