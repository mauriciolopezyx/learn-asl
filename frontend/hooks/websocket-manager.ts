import SockJS from "sockjs-client"
import { Client, IMessage } from "@stomp/stompjs"

export type serverPrediction = {
    confidence: number,
    prediction: string
}

export type websocketConfig = {
    endpoint: string,
    frameRate: number,
    quality: number,
    width: number,
    height: number
}

const SERVER_URL = "http://localhost:8080/ws-learn-asl"

// client.subscribe(`/topic/lesson/${lesson}`, (message: IMessage) => {

export class websocketManager {

    private client: Client | null = null
    private videoElement: HTMLVideoElement | null = null
    private canvas: HTMLCanvasElement
    private context: CanvasRenderingContext2D | null
    private frameInterval: number | null = null
    private config: websocketConfig
    private streaming: boolean = false

    constructor(config: websocketConfig) {
        this.config = config
        this.canvas = document.createElement("canvas")
        this.context = this.canvas.getContext("2d")
    }

    public connect(videoElement: HTMLVideoElement, responseHandler?: (any: any) => void) {
        this.videoElement = videoElement
        const socket: WebSocket = new SockJS(SERVER_URL)
        const client = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            onConnect: () => {
                this.startStreaming()
                client.subscribe(this.config.endpoint, (message: IMessage) => {
                    const response = JSON.parse(message.body)
                    if (!response) return
                    if (response.wireframe) {
                        const imgElement = document.getElementById("wireframe-display") as HTMLImageElement
                        if (!imgElement) return
                        imgElement.src = `data:image/jpeg;base64,${response.wireframe}`
                    }

                    if (responseHandler) {
                        responseHandler(response)
                    }
                })
            }
        })
        
        this.client = client
        this.client.activate()
    }

    public disconnect() {
        if (!this.client) return

        this.client.deactivate()
        this.client = null
        this.streaming = false

        if (this.frameInterval) {
            clearInterval(this.frameInterval)
            this.frameInterval = null
        }
    }

    public isStreaming() {
        return this.streaming
    }

    /* ------------ */

    private startStreaming() {
        if (this.frameInterval) return

        this.streaming = true
        const INTERVAL = 1000 / this.config.frameRate

        this.frameInterval = window.setInterval(() => { 
            if (!this.context || !this.canvas || !this.videoElement || !this.client) return
            
            this.context.save()

            // Mirror horizontally
            this.context.translate(this.canvas.width, 0)
            this.context.scale(-1, 1)

            this.context.drawImage(
                this.videoElement,
                0, 0,
                this.config.width, this.config.height,
                0, 0,
                this.canvas.width, this.canvas.height
            )

            this.context.restore()

            // header prefix isn't needed
            const base64Url = this.canvas.toDataURL("image/jpeg", this.config.quality).split(",")[1]
            
            this.client.publish({
                destination: "/app/lesson/video-input",
                body: JSON.stringify({
                    frameUrl: base64Url
                })
            })
        }, INTERVAL)
    }

}