import { useEffect, useState } from 'react'
import { getToken } from '../services/localStorageService'
import { useNavigate } from 'react-router-dom'
import { RELOAD_BOARD } from '../screens/Game'
const WS_URL = import.meta.env.VITE_WS_URL;

export const useSocket = ()=> {
    const [socket, setSocket] = useState<WebSocket | null>(null)

    const {access, refresh} = getToken();

    const navigate = useNavigate();

    useEffect(()=>{
        const ws = new WebSocket(`${WS_URL}/${access}`)
        ws.onopen = ()=>{
            console.log("websocket is connected")
            setSocket(ws);

            ws.send(JSON.stringify({ type: RELOAD_BOARD }));
            
        }
        ws.onclose = ()=>{
            setSocket(null);
        }

        ws.onerror = ()=>{
            navigate("/")
        }
    }, [])
    return socket
}
