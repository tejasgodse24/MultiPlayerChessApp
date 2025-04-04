import { Color, PieceSymbol, Square } from 'chess.js';
import  { useState } from 'react'
import { MOVE } from '../screens/Game';

const ChessBoard = ({board , socket, isMyTurn, incomingMove, myColorRef} : {
    board: ({
        square: Square;
        type: PieceSymbol;
        color: Color;
    } | null )[][];
    socket: WebSocket;
    isMyTurn:any;
    incomingMove?: string;
    myColorRef:string;
}) => {
  const [from, setFrom] = useState<null | Square>(null);
  // const [to, setTo] = useState<null | Square>(null);

  // console.log(incomingMove);
  
  return (
    <div className={`text-white-200 ${myColorRef == "black" ? "rotate-180" : ""} p-2`}>
      {board.map((row, i)=>{
        return <div key={i} className='flex'>
            {row.map((square, j)=>{
                return <div onClick={()=>{
                  
                  if(isMyTurn){
                    const squareRepresentation = String.fromCharCode(96 + (j + 1)) + (8- i) as Square ;
                    // console.log(squareRepresentation)
                    if(!square && !from){
                      // console.log("clicked on blank cell at start ...")
                    }
                    else if(!from){
                      setFrom(squareRepresentation)
                    }
                    else{
                      if(from == squareRepresentation){
                        // console.log("same")
                      }
                      else{
                        socket.send(JSON.stringify({
                          type: MOVE,
                          move: from + squareRepresentation
                        }))
                        setFrom(null);
                      }

                    }
                  }
                }} key={j} id={String.fromCharCode(96 + (j + 1)) + (8- i)} className={`w-12 h-12 sm:w-16 sm:h-16 ${String.fromCharCode(96 + (j + 1)) + (8- i) == incomingMove?.slice(0,2) || String.fromCharCode(96 + (j + 1)) + (8- i) == incomingMove?.slice(2, 4) ? "bg-yellow-600" : (i+j)%2===0 ? "bg-green-500": "bg-green-300"} ` } >
                    <div className='flex justify-center items-center w-full h-full'>
                      {square ? <img className={`w-10 sm:w-14 ${myColorRef == "black" ? "rotate-180" : ""}`} src={`/${square.color}${square.type}.png`} /> : null}
                    </div>
                </div>
            })}
        </div>
      })}
    </div>
  )
}

export default ChessBoard
