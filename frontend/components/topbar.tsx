"use client"

import Link from "next/link"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuContent } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import ThemeDropdown from "@/components/theme-dropdown"
import { IoMdPerson } from "react-icons/io"
import { MdExitToApp } from "react-icons/md"
import { BiSolidWrench } from "react-icons/bi"
import { CgDanger } from "react-icons/cg"
import { useMutation } from '@tanstack/react-query'
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function Topbar(
    {
        authenticated,
        authLoading
    }:
    {
        authenticated: boolean,
        authLoading: boolean
    }
) {

    const router = useRouter()

    const {isPending:retrieveLoading, mutate:resetPasswordMutate} = useMutation({
        mutationFn: async () => {
            const response = await fetch("http://localhost:8080/user/me/password", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            })
            if (!response.ok) {
                const payload = await response.text()
                throw new Error(payload)
            }
            const json = await response.json()
            return json.hasPassword
        },
        onSuccess: (hasPassword: boolean) => {
            router.push(`/reset-password?hasExisting=${hasPassword}`)
        },
        onError: (e: any) => {
            toast.error(e?.message ?? "Failed to retrieve password status")
        }
    })

    const {isPending:logoutLoading, mutate:logoutMutate} = useMutation({
        mutationFn: async () => {
            const response = await fetch("http://localhost:8080/logout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            })
            if (!response.ok) {
                const payload = await response.text()
                throw new Error(payload)
            }
        },
        onSuccess: () => {
            console.log("Successfully logged out")
            router.push("/login")
        },
        onError: (e: any) => {
            toast.error(e?.message ?? "Failed to logout")
        }
    })

    return (
    <header className="sticky top-0 z-50 w-full border-b bg-white dark:border-gray-800 dark:bg-gray-950">
        <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
        <div className="flex-1">
            <Link href="/" className="flex items-center gap-2 font-bold" prefetch={false}>
                <span>Learn ASL</span>
            </Link>
        </div>
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            <Link
            href="/home"
            className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
            prefetch={false}
            >
            Home
            </Link>
            <Link
            href="/lessons"
            className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
            prefetch={false}
            >
            Lessons
            </Link>
        </nav>
        <div className="flex flex-1 items-center gap-4 justify-end">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                    <SearchIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    <span className="sr-only">Search</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[300px] p-4">
                    <div className="relative">
                    <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <Input type="search" placeholder="Search..." className="pl-8 w-full" />
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>

            <ThemeDropdown />

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                    <IoMdPerson className="rounded-full"/>
                    <span className="sr-only">Toggle user menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    {authLoading ? <Loader2 className="size-4 mx-auto my-8 animate-spin"/>
                    : authenticated ?
                    <>
                        <DropdownMenuItem onClick={() => {resetPasswordMutate()}}>
                            <BiSolidWrench className="h-full" />
                            <span>Reset Password</span>
                            {retrieveLoading ? <Loader2 className="size-4 mx-auto animate-spin"/> : null}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {logoutMutate()}}>
                            <MdExitToApp className="h-full" />
                            <span>Log Out</span>
                            {logoutLoading ? <Loader2 className="size-4 mx-auto animate-spin"/> : null}
                        </DropdownMenuItem>
                    </>
                    :
                    <>
                        <DropdownMenuItem>
                            <Link href="/login">
                                <CgDanger className="inline mr-2" />
                                <span>{"Login to continue"}</span>
                            </Link>
                        </DropdownMenuItem>
                    </>
                }
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
        </div>
    </header>
    )
}

function SearchIcon({className}: {className: string}) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}