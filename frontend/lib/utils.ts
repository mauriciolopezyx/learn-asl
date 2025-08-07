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