
import './App.css'
import { BrowserRouter, Route, Routes } from "react-router";
import Landing from './screens/Landing';
import Game from './screens/Game';
import Login from './screens/Login';

function App() {

  return (
    <div className='h-screen bg-slate-900'>
      <BrowserRouter>
      <Routes>
        <Route path='/' element={<Landing />} />
        <Route path='/login' element={<Login />} />
        <Route path='/game' element={<Game />} />
      </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
