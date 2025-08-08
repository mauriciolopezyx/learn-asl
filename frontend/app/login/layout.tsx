"use client"

import type { ReactNode } from "react"
import { useAuthRedirect } from "@/hooks/client"
import Topbar from "@/components/topbar"

export default function LoginLayout({children}: {children: ReactNode}) {

    const {authenticated, queryComplete} = useAuthRedirect()

    return (
        <>
            <Topbar authenticated={authenticated} authLoading={!queryComplete} />
            {children}
        </>
    )

}