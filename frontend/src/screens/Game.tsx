import { useEffect, useRef, useState } from 'react'
import ChessBoard from '../components/ChessBoard'
import Button from '../components/Button'
import { useSocket } from '../hooks/useSocket'
import { Chess } from 'chess.js'
import Popup from '../components/Popup'
import showToast from '../services/toastService'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'


export const INIT_GAME = "init_game"
export const MOVE = "move"
export const GAME_OVER = "game_over"
export const INVALID_MOVE = "invalid_move"
export const WRONG_TURN = "wrong_turn"
export const TURN = "turn"
export const RELOAD_BOARD = "reload_board"
export const TIME_RELOAD = "time_reload"
export const USER_CONNECTED = "user_connected"

export const BOT_INIT_GAME = "bot_init_game"
export const BOT_MOVE = "bot_move"

export const REMOVE_GAME = "remove_game"

const GAME_TIME_MS = 10 * 60 * 1000;
// const GAME_TIME_MS = 1 * 60 * 1000;



const Game = () => {

  const socket = useSocket();
  const [chess, setChess] = useState(new Chess())
  const [board, setBoard] = useState(chess.board())
  const [isConnected, setIsConnected] = useState(false)

  const [isStarted, setIsStarted] = useState(false)
  const [isGameOver, setIsGameOver] = useState(false)

  const [isMyTurn, setIsMyTurn] = useState(false)
  const [isPopupOpen, setIsPopupOpen] = useState(true);

  const myColorRef = useRef("");

  const [moveStack, setMoveStack] = useState<any[]>([]);

  const [incomingMove, setIncomingMove] = useState<string>("")

  const [userName, setUserName] = useState<string>(useSelector((state:any) => state.auth.username))

  const [isGameTimed, setIsGameTimed] = useState(false);
  const [player1TimeConsumed, setPlayer1TimeConsumed] = useState(0);
  const [player2TimeConsumed, setPlayer2TimeConsumed] = useState(0);

  const [includeTime, setIncludeTime] = useState(false);
  // const [isBotGame, setIsBotGame] = useState(false);
  const isBotGameRef = useRef(false);


  const navigate = useNavigate();

  useEffect(()=>{
    if(!socket){
      console.log("socket is not there")
      // navigate("/gamecrash")
      return
    }
    
    socket.onmessage = (event) =>{
      const message = JSON.parse(event.data)

      switch(message.type){
        case USER_CONNECTED:
          console.log("user connected", message.message)
          break;
        case INIT_GAME:
          showToast("Game Initialized");
          console.log("INIT_GAME : ", message)
          if(message.white == userName){
            showToast(`Your Color is white`);
            
            myColorRef.current = "white";
            setIsMyTurn(true);
          }
          else{
            showToast(`Your Color is black`);
          
            myColorRef.current = "black";
          }
          setBoard(chess.board());
          setIsStarted(true);

          if(message.is_game_timed == true){
            setIsGameTimed(true)
          }
          
          
          break;
        case MOVE:
            let move = message.move;
            chess.move(move);
            setIncomingMove(move);  //incoming from ws server
            setBoard(chess.board()); 
            console.log("next_turn_player_color", myColorRef.current, message.next_turn_player_color)
            if(message.next_turn_player_color == myColorRef.current){
              setIsMyTurn(true)
            }
            else{
              setIsMyTurn(false);
            }
            
            
            setMoveStack((prevMove:any) => [...prevMove, `${message.move_player_name} : ${move}`]);
            console.log(moveStack);

            if(isGameTimed == true){
              setPlayer1TimeConsumed(message.player1_time_consumed);
              setPlayer2TimeConsumed(message.player2_time_consumed);
            }

            console.log("isBotGame :: ", isBotGameRef.current)
            if(isBotGameRef.current){
            console.log("inside isBotGame :: ")
              socket.send(
                JSON.stringify({type: BOT_MOVE})
              )
            }

            break;
        case GAME_OVER:
          console.log("Game Over: Game Over")
          showToast("Game Over");
          showToast(`Winner is ${message.winner}`);
          // setChess(new Chess());
          // setBoard(chess.board());
          // setIsStarted(false);
          setIsGameOver(true)

          if(myColorRef.current = "white"){
            socket.send(
              JSON.stringify({type: REMOVE_GAME})
            )
          }
          
          setTimeout(() => {
            navigate("/")
          }, 5000);
          break;
        // case INVALID_MOVE:
        //   setIsMyTurn(true);
        //   // showToast(message.msg);
        //   break;
        // case WRONG_TURN:
        //   showToast(message.msg);
        //   break;
        // case TURN:
        //   setIsMyTurn(true)
        //   break;
        case RELOAD_BOARD:
          console.log("reload board : ", message)
          if(message.color == "white"){
            myColorRef.current = "white";
          }
          else{
            myColorRef.current = "black";
          }
          chess.load(message.fen_string)
          setIncomingMove(message.last_move); //incoming from ws server
          setBoard(chess.board());

          if(userName == message.last_move_username){
            console.log(userName,  message.last_move_username)
          }
          else{
            setIsMyTurn(true);
          }
          break;

        case TIME_RELOAD:
          console.log("time reload : ", message)

          if(isGameTimed == true){
            setPlayer1TimeConsumed(message.player1_time_consumed);
            setPlayer2TimeConsumed(message.player2_time_consumed);
          }

          if(message.last_move_player_color == "white"){
            if(myColorRef.current == "black"){
              setIsMyTurn(true);
            }
          }
          else{
            if(myColorRef.current == "white"){
              setIsMyTurn(true);
            }
          }
          setIsStarted(true);
          break;
        case BOT_INIT_GAME:
          showToast("Bot Game Initialized");
          console.log("INIT_GAME : ", message)
          if(message.white == userName){
            showToast(`Your Color is white`);
            
            myColorRef.current = "white";
            setIsMyTurn(true);
          }
          else{
            showToast(`Your Color is black`);
          
            myColorRef.current = "black";
          }
          setBoard(chess.board());
          setIsStarted(true);
          // setIsBotGame(true);
          isBotGameRef.current = true

          if(message.is_game_timed == true){
            setIsGameTimed(true)
          }
          
          break;
        case BOT_MOVE:
          let b_move = message.move;
          chess.move(b_move);
          setIncomingMove(b_move);  //incoming from ws server
          setBoard(chess.board()); 
          console.log("next_turn_player_color", myColorRef.current, message.next_turn_player_color)
          if(message.next_turn_player_color == myColorRef.current){
            setIsMyTurn(true)
          }
          else{
            setIsMyTurn(false);
          }
          
          
          setMoveStack((prevMove:any) => [...prevMove, `${message.move_player_name} : ${b_move}`]);
          console.log(moveStack);

          if(isGameTimed == true){
            setPlayer1TimeConsumed(message.player1_time_consumed);
            setPlayer2TimeConsumed(message.player2_time_consumed);
          }
          // console.log("isBotGame :: ", isBotGameRef.current)
          // if(isBotGameRef.current){
          // console.log("inside isBotGame :: ")
          //   socket.send(
          //     JSON.stringify({type: BOT_MOVE})
          //   )
          // }

          break;
        default:
          console.log("default : ", message)
          break;
      }
    }
  }, [socket, chess])


  
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

  useEffect(() => {

      if(socket && myColorRef.current == "white" && player1TimeConsumed >= GAME_TIME_MS){
        setIsStarted(false);
        setIsGameOver(true);
        socket.send(
          JSON.stringify({type: GAME_OVER, looser_color: myColorRef.current})
        )
      }
      else if(socket && myColorRef.current == "black" && player2TimeConsumed >= GAME_TIME_MS){
        setIsStarted(false);
        setIsGameOver(true);
        socket.send(
          JSON.stringify({type: GAME_OVER, looser_color: myColorRef.current})
        )
      }

  }, [player1TimeConsumed, player2TimeConsumed])

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

  if(!socket) return <div>Connecting...</div>




  return (
    

    <div className='flex justify-center'>
      {isPopupOpen && (
        <Popup />
      )}
      <div className='pt-8 max-w-screen-lg w-full'>
      <div className='grid grid-cols-6 gap-4 w-full'>
        <div className='col-span-4 w-full flex-col flex justify-center items-center'>

          {
            isStarted && 
            <div className='p-4 w-3/4  text-green-500 flex flex-row justify-between'>
              {isGameTimed && getTimer(myColorRef.current == "white"
                  ? player2TimeConsumed
                  : player1TimeConsumed, "Opponant's"
              )}
              <p> {isMyTurn ? "Turn : You" : "Turn : Opponant"} </p>  
          </div>
          }
          
        
          <ChessBoard board={board} socket={socket} isMyTurn={isMyTurn} incomingMove={incomingMove} myColorRef={myColorRef.current} /> 
          
          {
            isStarted && 
            <div className='p-4 w-3/4  text-green-500 flex flex-row justify-between'>
              {isGameTimed && getTimer(myColorRef.current == "black"
                  ? player2TimeConsumed
                  : player1TimeConsumed, ""
              )}
          </div>
          }
          
          
          
        </div>
        <div className='col-span-2 bg-slate-800  flex justify-center h-[90vh] overflow-y-auto'>
          <div className='pt-10'>
            {
              !isStarted && 
              <div className="flex justify-center items-center text-white mb-4">
                <input
                  type="checkbox"
                  id="includeTime"
                  checked={includeTime}
                  onChange={() => setIncludeTime(!includeTime)}
                  className="mr-2"
                />
                <label htmlFor="includeTime">Include Time Limit</label>
              </div>
            }
          
            <div className='flex flex-col gap-4'>
          
          {!isStarted && !isConnected && <Button className="py-3 px-2 text-lg" onClick={()=>{
            socket.send(JSON.stringify({
              type:INIT_GAME,
              "is_game_timed": includeTime
            }))
            setIsConnected(true);
          }} >
                Play Online
          </Button> }


          {!isStarted && !isConnected && <Button className="py-3 px-2 text-lg" onClick={()=>{
            socket.send(JSON.stringify({
              type:BOT_INIT_GAME,
              "is_game_timed": false
            }))
            setIsConnected(true);
          }} >
                Play Bots
          </Button> }


          {!isStarted && isConnected && <div className="py-4 px-6"  >
               <p className='text-white'> Waiting form other user to connect ... </p>
          </div> }


          {!isGameOver && !isConnected &&  <Button className="py-3 px-2 text-lg" onClick={()=>{
            navigate("/")
          }} >
                Home 
          </Button> }


          </div>

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

export default Game
