"use client"

import { isAuthenticated } from "@/lib/utils"
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from "react"

const matchers = ["/home", "/lessons"]

export function useAuthRedirect() {
    const router = useRouter()
    const pathName = usePathname()
    const {authenticated=false, isLoading=true, mutate} = isAuthenticated()
    const [queryComplete, setQueryComplete] = useState<boolean>(false)

    useEffect( () => {
        mutate()
    }, [])

    useEffect( () => {
        if (!isLoading) {
            const timeoutId = setTimeout(() => {
                if (!authenticated && matchers.includes(pathName)) {
                    router.replace("/login")
                }
                setQueryComplete(true)
            }, 250)

            return () => {
                clearTimeout(timeoutId)
            }
        }
    }, [isLoading, authenticated, pathName, router])

    return {authenticated, queryComplete}
}