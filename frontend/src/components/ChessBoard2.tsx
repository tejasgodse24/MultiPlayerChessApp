import { Color, PieceSymbol, Square } from 'chess.js';

const ChessBoard2 = ({board, incomingMove} : {
    board: ({
        square: Square;
        type: PieceSymbol;
        color: Color;
    } | null )[][];
    incomingMove?: string;
}) => {

  return (
    <div className={`text-white-200`}>
      {board.map((row, i)=>{
        return <div key={i} className='flex'>
            {row.map((square, j)=>{
                return <div key={j} id={String.fromCharCode(96 + (j + 1)) + (8- i)} className={`w-12 h-12 sm:w-16 sm:h-16 ${String.fromCharCode(96 + (j + 1)) + (8- i) == incomingMove?.slice(0,2) || String.fromCharCode(96 + (j + 1)) + (8- i) == incomingMove?.slice(2, 4) ? "bg-yellow-600" : (i+j)%2===0 ? "bg-green-500": "bg-green-300"}`}>
                    <div className='flex justify-center items-center w-full h-full'>
                      {square ? <img className={`w-10 sm:w-14`} src={`/${square.color}${square.type}.png`} /> : null}
                    </div>
                </div>
            })}
        </div>
      })}
    </div>
  )
}

export default ChessBoard2
