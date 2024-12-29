import React from 'react'

const Button = ({onClick, children, className} : {onClick: ()=> void, children: React.ReactNode, className?:string}) => {
  return (
    <button onClick={onClick} className={`bg-green-500 hover:bg-green-700 text-2xl text-white font-bold rounded  ${className}`}>
     {children}
    </button>
  )
}

export default Button
