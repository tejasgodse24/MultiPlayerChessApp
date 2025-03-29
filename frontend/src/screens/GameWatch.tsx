import  { useEffect, useState } from 'react'
import Button from '../components/Button'
import { useSocket } from '../hooks/useSocket'
import { Chess } from 'chess.js'
import Popup from '../components/Popup'
import showToast from '../services/toastService'
import { useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import ChessBoard2 from '../components/ChessBoard2'


export const INIT_GAME = "init_game"
export const MOVE = "move"
export const GAME_OVER = "game_over"
export const INVALID_MOVE = "invalid_move"
export const WRONG_TURN = "wrong_turn"
export const TURN = "turn"
export const RELOAD_BOARD = "reload_board"
export const TIME_RELOAD = "time_reload"
export const USER_CONNECTED = "user_connected"
export const GAME_NOT_LIVE = "game_not_live"
export const CONNECT_WATCH_USER= "connect_watch_user"


const GAME_TIME_MS = 10 * 60 * 1000;
// const GAME_TIME_MS = 1 * 60 * 1000;



const GameWatch = () => {

  const socket2 = useSocket();
  const [chess] = useState(new Chess())
  const [board, setBoard] = useState(chess.board())
  // const [isConnected, setIsConnected] = useState(false)

  const [isStarted, setIsStarted] = useState(false)
  const [isGameOver, setIsGameOver] = useState(false)

  const [isPopupOpen] = useState(true);


  const [moveStack, setMoveStack] = useState<any[]>([]);

  const [incomingMove, setIncomingMove] = useState<string>("")

  const [userName] = useState<string>(useSelector((state:any) => state.auth.username))

  const [isGameTimed, setIsGameTimed] = useState(false);
  const [player1TimeConsumed, setPlayer1TimeConsumed] = useState(0);
  const [player2TimeConsumed, setPlayer2TimeConsumed] = useState(0);


  const [currTurn, setCurrTurn] = useState<string>("")
  const { gameid } = useParams();

  const navigate = useNavigate();

  useEffect(()=>{
    if(!socket2){
        console.log("not socket is here")
      return
    }
    
    socket2.onmessage = (event) =>{
      const message = JSON.parse(event.data)
      console.log(message);
      switch(message.type){
        case USER_CONNECTED:
          // setIsConnected(true)
          console.log("user connected", message.message)
          break;
        case MOVE:
            let move = message.move;
            chess.move(move);
            setIncomingMove(move);  //incoming from ws server
            setBoard(chess.board()); 
            setCurrTurn(message.next_turn_player_color);
          
            
            setMoveStack((prevMove:any) => [...prevMove, `${message.move_player_name} : ${move}`]);
           
            setPlayer1TimeConsumed(message.player1_time_consumed);
            setPlayer2TimeConsumed(message.player2_time_consumed);

            break;
        case GAME_OVER:
          showToast("Game Over");
          showToast(`Winner is ${message.winner}`);
          // setChess(new Chess());
          // setBoard(chess.board());
          // setIsStarted(false);
          setIsGameOver(true)

          setTimeout(() => {
            navigate("/")
          }, 5000);
          
          break;
        // case RELOAD_BOARD:
        //   console.log("reload board : ", message)
        
        //   chess.load(message.fen_string)
        //   setIncomingMove(message.last_move); //incoming from ws server
        //   setBoard(chess.board());
        //   setCurrTurn(message.next_turn_player_color)

        //   break;

        case TIME_RELOAD:
          setPlayer1TimeConsumed(message.player1_time_consumed);
          setPlayer2TimeConsumed(message.player2_time_consumed);
        
          setIsStarted(true);
          break;
        case CONNECT_WATCH_USER:
            console.log("CONNECT_WATCH_USER : ", message)
          
            chess.load(message.fen_string)
            setIncomingMove(message.last_move); //incoming from ws server
            setBoard(chess.board());
            setCurrTurn(message.next_turn_player_color)
            setIsStarted(true);

            if(message.is_game_timed == true){
              setIsGameTimed(true)
            }

            break;

        case GAME_NOT_LIVE:
            showToast(message.message);
            break;
        default:
          console.log("default : ", message)
          break;
      }
    }
  }, [socket2, chess])


  
  useEffect(() => {
    if (isStarted && isGameTimed) {
      const interval = setInterval(() => {
        if (chess.turn() === 'w') {
          setPlayer1TimeConsumed((p) => p + 100);
        } else {
          setPlayer2TimeConsumed((p) => p + 100);
        }
      }, 100);

      if(isGameOver == true){
        clearInterval(interval)
      }
      return () => clearInterval(interval);
    }
  }, [isStarted, userName]);

  const getTimer = (timeConsumed: number, timeUser: string) => {
    const timeLeftMs = GAME_TIME_MS - timeConsumed;
    const minutes = Math.floor(timeLeftMs / (1000 * 60));
    const remainingSeconds = Math.floor((timeLeftMs % (1000 * 60)) / 1000);

    return (
      <div className="text-white">
        {timeUser} Time Left: {minutes < 10 ? '0' : ''}
        {minutes}:{remainingSeconds < 10 ? '0' : ''}
        {remainingSeconds}
      </div>
    );
  };

  if(!socket2) return <div>Connecting...</div>


  return (
    

    <div className='flex justify-center'>
      {isPopupOpen && (
        <Popup />
      )}
      <div className='pt-8 max-w-screen-lg w-full'>
      <div className='grid grid-cols-6 gap-4 w-full'>
        <div className='col-span-4 w-full flex-col flex justify-center items-center'>


          <div className='p-4 w-3/4  text-green-500 flex flex-row justify-between'>
            {
              isGameTimed &&  getTimer(player2TimeConsumed, "black")
            }
            <p> {`Turn : ${currTurn}`} </p>  
          </div>
        
          <ChessBoard2 board={board} incomingMove={incomingMove} /> 

          <div className='p-4 w-3/4  text-green-500 flex flex-row justify-between'>
            {
              isGameTimed && getTimer(player1TimeConsumed, "white")
            }
          </div>
          
          
        </div>
        <div className='col-span-2 bg-slate-800  flex justify-center h-[90vh] overflow-y-auto'>
          <div className='pt-10'>


          {!isStarted && <Button className="py-4 px-6" onClick={()=>{
            socket2.send(JSON.stringify({
              type:CONNECT_WATCH_USER,
              gameid: gameid
            }))
            // setIsConnected(true);
          }} >
                Watch Live Game 
          </Button> }

          {!isGameOver &&  <Button className="py-4 px-6" onClick={()=>{
            navigate("/")
          }} >
                Home 
          </Button> }

          </div>
          {
            isStarted && 

            <div className='col-span-2 bg-slate-800 flex flex-col items-center'>
              <h4 className='text-white my-7'>Moves</h4>
              {
              <div className='flex flex-col gap-2 text-white'>
                  {moveStack.map((move:any, index:any) => (
                    <div key={index}>{move}</div>
                  ))}
              </div>
              }
          </div>
          }
          
        </div>

      </div>
      </div>
    </div>
  )
}

export default GameWatch
