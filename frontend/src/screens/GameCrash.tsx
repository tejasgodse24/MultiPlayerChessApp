import Button from '../components/Button'
import { useNavigate } from 'react-router-dom'

const GameCrash = () => {
    const navigate = useNavigate() 
  return (
    <div className='flex justify-center'>
    
      <div className='pt-8 max-w-screen-lg w-full'>
      <div className='grid grid-cols-6 gap-4 w-full'>
        <div className='col-span-4 w-full flex-col flex justify-center items-center'>
            <h3 className='text-xl text-white'>Game Crached For Some Reason...</h3>
        </div>
        <div className='col-span-2 bg-slate-800  flex justify-center h-[90vh] overflow-y-auto'>
          <div className='pt-10'>

          <Button className="py-4 px-6" onClick={()=>{navigate("/") }} >
                Home 
          </Button> 
          </div>
        </div>

      </div>
      </div>
    </div>
  )
}

export default GameCrash
