import React, { useEffect, useState } from 'react'
import ChessBoard from '../components/ChessBoard'
import Button from '../components/Button'
import { useSocket } from '../hooks/useSocket'
import { Chess } from 'chess.js'
import Popup from '../components/Popup'
import { DiVim } from 'react-icons/di'
import { Bounce, toast } from 'react-toastify'


export const INIT_GAME = "init_game"
export const MOVE = "move"
export const GAME_OVER = "game_over"
export const INVALID_MOVE = "invalid_move"
export const WRONG_TURN = "wrong_turn"
export const TURN = "turn"



const Game = () => {

  const socket = useSocket();
  const [chess, setChess] = useState(new Chess())
  const [board, setBoard] = useState(chess.board())
  const [isStarted, setIsStarted] = useState(false)
  const [isMyTurn, setIsMyTurn] = useState(false)
  const [isPopupOpen, setIsPopupOpen] = useState(true);

  const showToast = (msg: string)=>{
    toast(msg, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
      transition: Bounce,
      });
  }

  useEffect(()=>{
    if(!socket){
      return
    }
    socket.onmessage = (event) =>{
      const message = JSON.parse(event.data)
      console.log(message)

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
            console.log("Game Move")
            const move = message.move;
            console.log("move", move.slice(0, 2), move.slice(2, 4))

            chess.move(move);

            setBoard(chess.board()); 
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
          showToast(message.msg);
          setIsMyTurn(true)
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
          <ChessBoard chess={chess} setBoard={setBoard} board={board} socket={socket} setIsMyTurn={setIsMyTurn} />
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
        </div>

      </div>
      </div>
    </div>
  )
}

export default Game
