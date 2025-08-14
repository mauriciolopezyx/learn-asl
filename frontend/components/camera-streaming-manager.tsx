import { websocketManager } from "@/hooks/websocket-manager"
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

export default function CameraStreamingManager() {
    const { connect, disconnect, sendFrame, isConnected } = websocketManager()

    const videoRef = useRef<HTMLVideoElement>(null)
    const streamRef = useRef<MediaStream | null>(null)

    const [accessGranted, setAccessGranted] = useState<boolean>(false)
    const [active, setActive] = useState<boolean>(false) // camera can be on (active) but not streaming to backend
    const [streaming, setStreaming] = useState<boolean>(false)

    async function startCamera() {
        if (active || streamRef.current || streaming) { return }

        try {
            const { stream, error:accessError } = await requestCameraAccess({ 
                video: { 
                    facingMode: "user",
                    width: { ideal: 640 },
                    height: { ideal: 480 }
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
        if (!active || !streamRef.current) { return }
        stopAllMediaStreams(streamRef.current)
        streamRef.current = null
        if (videoRef.current) {
            videoRef.current.srcObject = null
        }
        setActive(false)
        // TODO: stop streaming here
    }

    function toggleCamera() {
        if (active && streamRef.current) {
            stopCamera()
        } else if (!active && !streamRef.current) {
            startCamera()
        }
    }

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
            <video 
                ref={videoRef}
                autoPlay 
                playsInline
                muted
                className={`w-full bg-black h-[350px] object-cover block ${active ? "block" : "hidden"}`}
            />
            {!active ?
            <div className="w-full h-[350px] bg-black flex flex-col justify-center items-center gap-4">
                <h4 className="font-bold text-white">No camera detected</h4>
            </div>
            : null
            }
            <div className="flex justify-center items-center flex-wrap gap-4">
                <Button className="rounded-full w-15 h-15" onClick={toggleCamera}>
                    {active ? <BsCameraVideoFill /> : <BsCameraVideoOffFill />}
                </Button>
                {active
                ?
                <Button className="rounded-full w-15 h-15" onClick={toggleCamera}>
                    {streaming ? <PiCloudCheckFill /> : <PiCloudFill />}
                </Button>
                : null
                }
            </div>
        </>
    )
}