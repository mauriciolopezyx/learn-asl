import { type serverPrediction, websocketManager, type websocketConfig } from "@/hooks/websocket-manager"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useRef } from "react"
import { toast } from "sonner"
import { isCameraSupported, requestCameraAccess, stopAllMediaStreams } from "@/lib/utils"
import { BsCameraVideoFill, BsCameraVideoOffFill } from "react-icons/bs"
import { PiCloudFill, PiCloudCheckFill } from "react-icons/pi"

// Scenarios
// 1. Camera is on, but not streaming
// 2. Camera is on and is streaming (to Spring Boot)
// 3. Camera turns off and also stops streaming

export default function CameraStreamingManager({onPrediction}: {onPrediction: (pred: serverPrediction) => void} ) {

    const videoRef = useRef<HTMLVideoElement>(null)
    const streamRef = useRef<MediaStream | null>(null) // can also be thought of as whether or not the camera is on

    // v To actually instantiate a new websocket connection object (takes care of canvas, context, interval, all logic basically)
    const websocketManagerRef = useRef<websocketManager | null>(null)
    
    // v Even though we'd like to rely on the refs only to conditionally render stuff, they don't cause re-renders
    const [active, setActive] = useState<boolean>(false)
    const [streaming, setStreaming] = useState<boolean>(false)

    const [accessGranted, setAccessGranted] = useState<boolean>(false)
    const [predictionInfo, setPrediction] = useState<serverPrediction | null>(null)

    async function startCamera() {
        if (streamRef.current) { return }

        try {
            const { stream, error:accessError } = await requestCameraAccess({ 
                video: { 
                    facingMode: "user",
                    width: { ideal: 350 },
                    height: { ideal: 350 }
                } 
            })

            if (accessError) {
                toast.error(`(1) Failed to start camera: ${accessError}`)
                return
            }
            if (!stream) {
                toast.error(`(2) Failed to start camera: ${accessError}`)
                return
            }

            streamRef.current = stream

            if (videoRef.current) {
                setAccessGranted(true)
                setActive(true)

                videoRef.current.srcObject = stream
                videoRef.current.onloadedmetadata = async () => {
                    if (videoRef.current) {
                        await videoRef.current.play()
                    }
                }
            }

        } catch (err: any) {

        }
    }

    async function stopCamera() {
        if (!streamRef.current) { return }
        stopAllMediaStreams(streamRef.current)
        streamRef.current = null
        if (videoRef.current) {
            videoRef.current.srcObject = null
        }
        stopStreaming()
        setActive(false)
    }

    function toggleCamera() {
        if (streamRef.current) {
            stopCamera()
        } else {
            startCamera()
        }
    }

    // *--------------* //

    function startStreaming() {
        if (websocketManagerRef.current || !videoRef.current) return

        // we pass receivedPrediction to websocketManager so that both the CSM and page.tsx can receive the server prediciton
        function receivedPrediction(pred: serverPrediction) {
            setPrediction(pred) // current component
            onPrediction(pred) // page.tsx that was passed on instantiation of CSM
        }

        const lesson = 1
        const config: websocketConfig = {
            endpoint: `/user/topic/lesson/${lesson}`,
            frameRate: 4,
            quality: 0.85,
            width: 350,
            height: 350
        }
        websocketManagerRef.current = new websocketManager(config)
        websocketManagerRef.current.connect(videoRef.current, receivedPrediction)
        setStreaming(true)
        toast.success("Started streaming!")
    }

    function stopStreaming() {
        if (!websocketManagerRef.current || !videoRef.current) return
        websocketManagerRef.current.disconnect()
        websocketManagerRef.current = null
        setStreaming(false)
        toast.success("Stopped streaming!")
    }

    function toggleStreaming() {
        if (websocketManagerRef.current) {
            stopStreaming()
        } else {
            startStreaming()
        }
    }

    // *--------------* //

    useEffect( () => {
        if (!isCameraSupported()) {
            console.error("Your browser doesn't support camera access")
            return
        }

        const timer = setTimeout(() => {
            console.log("Starting camera from useEffect...")
            startCamera()
        }, 500)

        return () => clearTimeout(timer)
    }, [])

    useEffect(() => {
        return () => {
            if (streamRef.current) {
                stopAllMediaStreams(streamRef.current)
            }
        }
    }, [])

    return (
        <>
            {predictionInfo 
            ?
            <div className="flex justify-between">
                <h3 className="bg-gray-300 dark:bg-gray-600 p-2 rounded-md shadow-md">
                    Confidence: <span className="font-bold">{`${Math.round(predictionInfo.confidence * 10000) / 100}%`}</span>
                </h3>
                <h4 className="bg-gray-300 dark:bg-gray-600 p-2 rounded-md shadow-md">
                   Predicted: <span className="font-bold">{predictionInfo.prediction}</span>
                </h4>
            </div>
            : null
            }
            <video 
                ref={videoRef}
                autoPlay 
                playsInline
                muted
                className={`w-full bg-black h-[350px] object-cover block ${active ? "block" : "hidden"}`}
            />
            {!active ?
            <div className="w-full h-[350px] bg-black flex flex-col justify-center items-center gap-4">
                <h5 className="font-bold text-white">No camera detected</h5>
            </div>
            : null
            }
            <div className="flex justify-center items-center flex-wrap gap-4">
                <Button className={`rounded-full w-15 h-15 ${active ? "bg-green-700" : "bg-red-700"}`} onClick={toggleCamera}>
                    {active ? <BsCameraVideoFill /> : <BsCameraVideoOffFill/>}
                </Button>
                {active
                ?
                <Button className={`rounded-full w-15 h-15 ${streaming ? "bg-green-700" : "bg-red-700"}`} onClick={toggleStreaming}>
                    {streaming ? <PiCloudCheckFill /> : <PiCloudFill />}
                </Button>
                : null
                }
            </div>
        </>
    )
}