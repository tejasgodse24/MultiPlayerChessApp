import React, { useEffect, useState } from 'react'
import { getToken } from '../services/localStorageService'
import { useNavigate } from 'react-router-dom'
const WS_URL = "ws://localhost:8000"

export const useSocket = ()=> {
    const [socket, setSocket] = useState<WebSocket | null>(null)

    const {access, refresh} = getToken();

    const navigate = useNavigate();

    useEffect(()=>{
        const ws = new WebSocket(`${WS_URL}/${access}`)
        ws.onopen = ()=>{
            console.log("websocket is connected")
            setSocket(ws);
        }
        ws.onclose = ()=>{
            setSocket(null);
        }

        ws.onerror = ()=>{
            navigate("/")
        }
        // return ()=>{
        //     ws.close();
        // }
    }, [])
    return socket
}
