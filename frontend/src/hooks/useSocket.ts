import React, { useEffect, useState } from 'react'
const WS_URL = "ws://localhost:8000"

export const useSocket = ()=> {
    const [socket, setSocket] = useState<WebSocket | null>(null)

    useEffect(()=>{
        const ws = new WebSocket(WS_URL)
        ws.onopen = ()=>{
            console.log("websocket is connected")
            setSocket(ws);
        }
        ws.onclose = ()=>{
            setSocket(null);
        }
        // return ()=>{
        //     ws.close();
        // }
    }, [])
    return socket
}
