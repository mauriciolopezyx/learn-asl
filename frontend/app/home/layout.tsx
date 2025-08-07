"use client"

import type { ReactNode } from "react"
import { isAuthenticated } from "@/lib/utils"
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from "react"
import Topbar from "@/components/topbar"

export default function HomeLayout({children}: {children: ReactNode}) {
    
    const router = useRouter()
    const pathName = usePathname()

    const {authenticated=false, isLoading=true, mutate} = isAuthenticated()

    useEffect( () => {
        mutate()
    }, [])

    useEffect( () => {
        if (!isLoading && !authenticated && pathName === "/home") {
            router.replace("/login")
        }
    }, [isLoading, authenticated, pathName, router])

    return (
        <>
            <Topbar authenticated={authenticated} authLoading={isLoading} />
            {children}
        </>
    )
}