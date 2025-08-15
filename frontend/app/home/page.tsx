"use client"

import CameraStreamingManager from "@/components/camera-streaming-manager"
import { serverPrediction } from "@/hooks/websocket-manager"

// Scenarios
// 1. Camera is on, but not streaming
// 2. Camera is on and is streaming (to Spring Boot)
// 3. Camera turns off and also stops streaming

export default function HomePage() {

    function onPrediction(pred: serverPrediction) {

    }

    return (
        <>
            <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
                <div className="flex w-full justify-center items-center">
                    <div className="w-full max-w-[350px] flex flex-col gap-6">
                        <CameraStreamingManager onPrediction={onPrediction} />
                    </div>
                    <img id="wireframe-display" width={350} height={350} className="max-h-[350px]"/>
                </div>
            </div>
        </>
    )
    
}
