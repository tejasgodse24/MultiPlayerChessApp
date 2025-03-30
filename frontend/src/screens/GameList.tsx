import { useEffect, useState } from 'react';
import Button from '../components/Button';
import { useNavigate } from 'react-router-dom';

interface Game {
  gameid: number;
  white_player1_username: string;
  black_player2_username: string;
  status: string;
  fen_string: string;
  white_player1_remaining_time: number;
  black_player2_remaining_time: number;
  created_at: string;
  updated_at: string;
}

const GameList = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const BASE_API_URL = import.meta.env.VITE_BASE_API_URL;

  const navigate = useNavigate();

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch(BASE_API_URL + "chessapp/get-all-games/");
        if (!response.ok) {
          throw new Error("Failed to fetch games");
        }
        const data = await response.json();
        setGames(data);
      } catch (error) {
        console.error("Error fetching games:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  if (loading) {
    return <p className="text-center text-white mt-4">Loading games...</p>;
  }

  return (
    <div className="flex justify-center">
      <div className="pt-8 max-w-screen-lg w-full px-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 w-full">
          <div className="w-full flex flex-col justify-center items-center md:col-span-4">
            {games.length === 0 ? (
              <p className="text-center text-white">No Games Found</p>
            ) : (
              <div className="max-h-[80vh] w-full flex justify-center items-center overflow-y-auto">
                <div className="space-y-4 w-full">
                  {games.map((game) => (
                    <div className="border-2 p-2 rounded-md text-white" key={game.gameid}>
                      <div>
                        <strong>White:</strong> {game.white_player1_username}{' '}
                        <strong> v/s </strong>
                        <strong>Black:</strong> {game.black_player2_username}
                      </div>
                      <div className="flex justify-center mt-2">
                        <Button
                          className="py-1 px-2 text-base"
                          onClick={() => {
                            navigate(`/watchgame/${game.gameid}`);
                          }}
                        >
                          Watch Game
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="bg-slate-800 flex justify-center items-center md:col-span-2 h-auto md:h-[90vh] overflow-y-auto">
            <div className="pt-10">
              <Button className="py-4 px-6" onClick={() => { navigate("/"); }}>
                Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameList;
