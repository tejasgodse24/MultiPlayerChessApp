import React, { useEffect, useState } from 'react'
import ChessBoard from '../components/ChessBoard'
import Button from '../components/Button'
import { useSocket } from '../hooks/useSocket'
import { Chess, Square } from 'chess.js'
import Popup from '../components/Popup'
import { DiVim } from 'react-icons/di'
import { Bounce, toast } from 'react-toastify'
import showToast from '../services/toastService'


export const INIT_GAME = "init_game"
export const MOVE = "move"
export const GAME_OVER = "game_over"
export const INVALID_MOVE = "invalid_move"
export const WRONG_TURN = "wrong_turn"
export const TURN = "turn"
export const RELOAD_BOARD = "reload_board"



const Game = () => {

  const socket = useSocket();
  const [chess, setChess] = useState(new Chess())
  const [board, setBoard] = useState(chess.board())
  const [isStarted, setIsStarted] = useState(false)
  const [isMyTurn, setIsMyTurn] = useState(false)
  const [isPopupOpen, setIsPopupOpen] = useState(true);

  // const [moveStack, setMoveStack] = useState<any>("")
  const [moveStack, setMoveStack] = useState<any[]>([]);

  useEffect(()=>{
    if(!socket){
      return
    }
    socket.onmessage = (event) =>{
      const message = JSON.parse(event.data)

      switch(message.type){
        case INIT_GAME:
          showToast("Game Initialized");
          showToast(`Your Color is ${message.color}`);

          setBoard(chess.board());

          setIsStarted(true);
          if(message.color == "white"){
            setIsMyTurn(true);
          }
          break;
        case MOVE:
            let move = message.move;
            chess.move(move);
            setBoard(chess.board()); 

            // setMoveStack((prevMove:any)=>[prevMove + move])
            setMoveStack((prevMove:any) => [...prevMove, `${message.move_player_name} : ${move}`]);
            console.log(moveStack);
            
            break;
        case GAME_OVER:
          showToast("Game Over");
          showToast(`Winner is ${message.winner}`);
          break;
        case INVALID_MOVE:
          setIsMyTurn(true);
          showToast(message.msg);
          break;
        case WRONG_TURN:
          showToast(message.msg);
          break;
        case TURN:
          setIsMyTurn(true)
          break;
        case RELOAD_BOARD:
          showToast("Game Reloaded");

          chess.load(message.fen_string)

          setBoard(chess.board());
          setIsStarted(true);
          break;
          
      }
    }
  }, [socket])

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
            isStarted &&  (<div className='p-4 text-green-500 text-xl'><p> {isMyTurn ? "Your Turn" : "Opponant's Turn"} </p></div>)
          }
          <ChessBoard chess={chess} setBoard={setBoard} board={board} socket={socket} isMyTurn={isMyTurn} setIsMyTurn={setIsMyTurn} />
        </div>
        <div className='col-span-2 bg-slate-800 w-full flex justify-center'>
          <div className='pt-10'>

          {!isStarted && <Button className="py-4 px-6" onClick={()=>{
            socket.send(JSON.stringify({
              type:INIT_GAME
            }))
          }} >
                Play 
          </Button> }

          </div>
          {
            isStarted && 

            <div className='col-span-2 bg-slate-800 w-full flex flex-col items-center'>
              <h4 className='text-white my-7'>Moves</h4>
              {
              <div className='flex flex-col gap-2 text-white'>
                {/* {moveStack.map((item:any, i:any)=> {
                  <div key={i}>{item}</div>
                })} */}

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
