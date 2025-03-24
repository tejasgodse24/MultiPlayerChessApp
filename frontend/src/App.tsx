
import { BrowserRouter, Route, Routes } from "react-router";
import Landing from './screens/Landing';
import Game from './screens/Game';
import Login from './screens/Login';
import GameWatch from './screens/GameWatch';
import GameList from './screens/GameList';
import GameCrash from "./screens/GameCrash";

function App() {

  return (
    <div className='h-screen bg-slate-900'>
      <BrowserRouter>
      <Routes>
        <Route path='/' element={<Landing />} />
        <Route path='/login' element={<Login />} />
        <Route path='/game' element={<Game />} />
        <Route path='/listgames' element={<GameList />} />
        <Route path='/watchgame/:gameid' element={<GameWatch />} />
        <Route path='/gamecrash' element={<GameCrash />} />
      </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
