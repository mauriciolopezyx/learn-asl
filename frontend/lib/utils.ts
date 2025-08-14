import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { useMutation } from '@tanstack/react-query'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isAuthenticated() {
  const {data: authenticated, isPending:isLoading, mutate} = useMutation({
    mutationFn: async () => {
        console.log("Checking authentication...")
        const response = await fetch("http://localhost:8080/user/ok", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include"
        })
        if (!response.ok) {
          return false
        }
        return true
    }
  })

  return {authenticated, isLoading, mutate}
}


// --vvv For Camera Streaming vvv--

export const isCameraSupported = (): boolean => {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
}

export const requestCameraAccess = async (
  options: MediaStreamConstraints = { video: true, audio: false }
): Promise<{ stream: MediaStream | null; error: string | null }> => {
  if (!isCameraSupported()) {
    return {
      stream: null,
      error: "Your browser doesn't support camera access. Please try a different browser."
    }
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia(options)
    return { stream, error: null }
  } catch (err: any) {

    console.error("Camera access error:", err)
    
    if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
      return {
        stream: null,
        error: "Camera access denied. Please grant permission to use your camera."
      }
    } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
      return {
        stream: null,
        error: "No camera detected. Please connect a camera and try again."
      }
    } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
      return {
        stream: null,
        error: "Camera is in use by another application. Please close other apps using your camera."
      }
    } else if (err.name === "OverconstrainedError") {
      return {
        stream: null,
        error: "Camera constraints not satisfied. Please try with different settings."
      }
    } else if (err.name === "TypeError" || err.name === "TypeError") {
      return {
        stream: null,
        error: "Invalid camera constraints specified."
      }
    } else {
      return {
        stream: null,
        error: `Camera error: ${err.message || "Unknown error"}`
      }
    }
  }
}

export const stopAllMediaStreams = (stream: MediaStream | null): void => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop())
  }
}