"use client"

import { z } from "zod"
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from "react-hook-form"
import { Form } from "@/components/ui/form"
import InputElement from "@/components/form-elements"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useMutation } from '@tanstack/react-query'
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { LuEye, LuEyeClosed } from "react-icons/lu"

const formSchema = z.object({
    old: z.string(),
    new: z.string().min(5, {
        message: "New password must be at least 5 characters"
    })
})

import { createAuthClient } from "better-auth/client"
const authClient =  createAuthClient()

/* ------------------------------- */

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {

    const router = useRouter()
    const searchParams = useSearchParams()

    const hasExistingPassword = searchParams.get("hasExisting") === "true"
    const token = searchParams.get("token")
    const email = searchParams.get("email")
    const conditionalTitle = hasExistingPassword ? "Enter your current and newly chosen password:" : "Create your new password below:"
    const endpoint = token ? "http://localhost:8080/auth/forgot-password/reset" : "http://localhost:8080/user/me/password"
    // redirect will be /dashboard no matter what

    const [showOldPassword, setShowOldPassword] = useState<boolean>(false)
    const [showNewPassword, setShowNewPassword] = useState<boolean>(false)
    function toggleOldVisibility() {
        setShowOldPassword(prev => !prev)
    }
    function toggleNewVisibility() {
        setShowNewPassword(prev => !prev)
    }

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            old: "",
            new: ""
        }
    })

    const {isPending:loading, isError, error, mutate} = useMutation({
        mutationFn: async (values: z.infer<typeof formSchema>) => {
            console.log("submitting reset password *Attempt*")
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    ...(hasExistingPassword && {oldPassword: values.old}),
                    ...(token && {forgotToken: token}),
                    ...(email && {email: email}),
                    newPassword: values.new
                })
            })
            if (!response.ok) {
                const payload = await response.text()
                throw new Error(payload)
            }
            toast.success("Successfully reset your password!")
        },
        onSuccess: () => {
            router.push("/home")
        },
        onError: (e: any) => {
            toast.error(e?.message ?? "Failed to register")
        }
    })

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        mutate(values)
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader className="text-center mt-4">
                    <CardTitle className="text-xl">Reset Password</CardTitle>
                    <CardDescription>{conditionalTitle}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <div className="grid gap-6">
                                <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                                </div>
                                <div className="grid gap-6">
                                    { hasExistingPassword ? <div className="grid gap-3">
                                        <Label htmlFor="old">Old Password</Label>
                                        <div className="w-full relative">
                                            <InputElement
                                                name="old"
                                                placeholder=""
                                                type={showOldPassword ? "text" : "password"}
                                                isOptional={false}
                                            />
                                            {!showOldPassword ? <LuEye className="absolute right-5 top-3/10 cursor-pointer" onClick={toggleOldVisibility} />
                                            : <LuEyeClosed className="absolute right-5 top-3/10 cursor-pointer" onClick={toggleOldVisibility} />
                                            }
                                        </div>
                                    </div> : null }
                                    <div className="grid gap-3">
                                        <Label htmlFor="new">New Password</Label>
                                        <div className="w-full relative">
                                            <InputElement
                                                name="new"
                                                placeholder=""
                                                type={showNewPassword ? "text" : "password"}
                                                isOptional={false}
                                            />
                                            {!showNewPassword ? <LuEye className="absolute right-5 top-3/10 cursor-pointer" onClick={toggleNewVisibility} />
                                            : <LuEyeClosed className="absolute right-5 top-3/10 cursor-pointer" onClick={toggleNewVisibility} />
                                            }
                                        </div>
                                    </div>
                                    <Button type="submit" className="w-full" disabled={loading === true}>
                                        {loading ? <Loader2 className="size-4 animate-spin"/> : "Confirm"}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}