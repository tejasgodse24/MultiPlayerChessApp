import { Color, PieceSymbol, Square } from 'chess.js';
import React, { useState } from 'react'
import { MOVE } from '../screens/Game';

const ChessBoard = ({board , socket, chess, setBoard, setIsMyTurn} : {
    board: ({
        square: Square;
        type: PieceSymbol;
        color: Color;
    } | null )[][];
    socket: WebSocket;
    chess:any;
    setBoard:any;
    setIsMyTurn:any;
}) => {
  const [from, setFrom] = useState<null | Square>(null);
  const [to, setTo] = useState<null | Square>(null);

  return (
    <div className='text-white-200'>
      {board.map((row, i)=>{
        return <div key={i} className='flex'>
            {row.map((square, j)=>{
                return <div onClick={()=>{
                  const squareRepresentation = String.fromCharCode(96 + (j + 1)) + (8- i) as Square ;
                  console.log(squareRepresentation)
                  if(!from){
                    setFrom(squareRepresentation)
                  }
                  else{
                    socket.send(JSON.stringify({
                      type: MOVE,
                      move: from + squareRepresentation
                    }))

                    setFrom(null);
                    setIsMyTurn(false);

                    // chess.move({
                    //   from,
                    //   to:squareRepresentation
                    // });

                    // setBoard(chess.board());

                    // console.log({
                    //   from: from,
                    //   to:squareRepresentation
                    // })
                  }
                  
                }} key={j} className={`w-16 h-16 ${(i+j)%2===0 ? "bg-green-500": "bg-green-300"}` }>
                    <div className='flex justify-center items-center w-full h-full'>
                      {/* {square ? square.type : ""} */}
                      {square ? <img className='w-14' src={`/${square.color}${square.type}.png`} /> : null}
                    </div>
                </div>
            })}
        </div>
      })}
    </div>
  )
}

export default ChessBoard
