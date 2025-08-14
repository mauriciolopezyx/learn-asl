"use client"

import CameraStreamingManager from "@/components/camera-streaming-manager"

// Scenarios
// 1. Camera is on, but not streaming
// 2. Camera is on and is streaming (to Spring Boot)
// 3. Camera turns off and also stops streaming

export default function HomePage() {

    return (
        <>
            <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
                <div className="flex w-full max-w-sm flex-col gap-6">
                    <CameraStreamingManager />
                </div>
            </div>
        </>
    )
    
}
