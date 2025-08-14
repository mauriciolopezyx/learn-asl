import SockJS from "sockjs-client"
import { Client, IMessage } from "@stomp/stompjs"
import { useRef, useEffect } from "react"

// TODO: fix 8/14+
const URL = "http://localhost:8080/"

export function websocketManager() {
    const clientRef = useRef<Client | null>(null)

    const connect = () => {
        if (clientRef.current?.connected) return
        
        const socket: WebSocket = new SockJS(URL)
        const client = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000
        })
        
        clientRef.current = client
        client.activate()
    }

    const disconnect = () => {
        if (clientRef.current) {
        clientRef.current.deactivate()
        clientRef.current = null
        }
    }

    const sendFrame = (frameData: string) => {
        if (clientRef.current?.connected) {
        clientRef.current.publish({
            destination: '/app/video-frame',
            body: frameData
        })
        }
    }

    useEffect(() => {
        return () => disconnect()
    }, [])

    return { connect, disconnect, sendFrame, isConnected: clientRef.current?.connected || false }
}