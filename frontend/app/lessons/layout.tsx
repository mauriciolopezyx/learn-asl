"use client"

import type { ReactNode } from "react"
import { useAuthRedirect } from "@/hooks/client"
import Topbar from "@/components/topbar"

import { Loader2 } from "lucide-react"

export default function LessonsLayout({children}: {children: ReactNode}) {

    const {authenticated, queryComplete} = useAuthRedirect()

    return (
        <>
            <Topbar authenticated={authenticated} authLoading={!queryComplete} />
            {
                !queryComplete
                ?
                <Loader2 className="size-4 mx-auto my-8 animate-spin"/>
                :
                authenticated ?
                children
                :
                <h1>Not Authorized</h1>
            }
        </>
    )
    
}