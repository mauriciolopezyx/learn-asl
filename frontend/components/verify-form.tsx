"use client"

import { z } from "zod"
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from "react-hook-form"
import { Form } from "@/components/ui/form"
import InputElement from "@/components/form-elements"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useMutation } from '@tanstack/react-query'
import { useSearchParams } from "next/navigation"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { LuEye, LuEyeClosed } from "react-icons/lu"

const formSchema = z.object({
    code: z.string().length(6, {
        message: "Code must be 6 digits"
    })
})

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

export function VerifyForm() {

    const router = useRouter()
    const searchParams = useSearchParams()

    const verificationEmail = searchParams.get("email") ?? ""
    const forgotPassword = searchParams.get("forgotPassword") === "true"

    const verifyEndpoint = forgotPassword ? "http://localhost:8080/auth/forgot-password/code" : "http://localhost:8080/auth/verify"
    const resendEndpoint = forgotPassword ? "http://localhost:8080/auth/forgot-password/code/resend" : "http://localhost:8080/auth/resend"
    const redirectUrl = forgotPassword ? "/reset-password" : "/home"

    console.log("forget password?", forgotPassword)
    
    function maskEmail(email: string) {
        const [local, domain] = email.split('@')
        if (!domain) return email
        return email[0] + '*'.repeat(local.length-1) + '@' + domain
    }

    const [showPassword, setShowPassword] = useState<boolean>(false);
    function toggleVisibility() {
        setShowPassword(prev => !prev)
    }

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            code: ""
        }
    })

    const {isPending:loading, isError, error:verifyError, mutate:confirmMutate} = useMutation({
        mutationFn: async (values: z.infer<typeof formSchema>) => {
            console.log("submitting verify attempt")
            const response = await fetch(verifyEndpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    email: verificationEmail,
                    verificationCode: values.code
                })
            })
            if (!response.ok) {
                const payload = await response.text()
                throw new Error(payload)
            }
            const json = await response.json()
            return json
        },
        onSuccess: (json) => {
            const suffix = (json?.token && forgotPassword) ? `?token=${json.token}&email=${verificationEmail}` : ""
            router.push(redirectUrl + suffix)
        },
        onError: (e: any) => {
            toast.error(e?.message ?? "Failed to verify")
        }
    })

    const {data:resendMessage, mutate:resendMutate} = useMutation({
        mutationFn: async () => {
            console.log("submitting resend code")
            const response = await fetch(resendEndpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    email: verificationEmail
                })
            })
            if (!response.ok) {
                const payload = await response.text()
                throw new Error(payload)
            }
            return "Successfully resent verification code!"
        },
        onSuccess: () => {
            console.log("successfully resent code!")
            toast.info("Successfully resent code!")
        },
        onError: (e: any) => {
            toast.error(e?.message ?? "Failed to resend code")
        }
    })

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        confirmMutate(values)
    }

    function onResend() {
        resendMutate()
    }

    return (
        <div className={cn("flex flex-col gap-6")}>
            <Card>
                <CardHeader className="text-center mt-4">
                    <CardTitle className="text-xl">Verify</CardTitle>
                    <CardDescription>Please enter the verification code that was just sent to {maskEmail(verificationEmail)}:</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <div className="grid gap-6">
                                <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                                </div>
                                <div className="grid gap-6">
                                    <div className="grid gap-3">
                                        <Label htmlFor="code">Code</Label>
                                        <div className="w-full relative">
                                            <InputElement
                                                name="code"
                                                placeholder=""
                                                type={showPassword ? "text" : "password"}
                                                isOptional={false}
                                            />
                                            {!showPassword ? <LuEye className="absolute right-5 top-1/3 cursor-pointer" onClick={toggleVisibility} />
                                            : <LuEyeClosed className="absolute right-5 top-1/3 cursor-pointer" onClick={toggleVisibility} />
                                            }
                                        </div>
                                    </div>
                                    <Button type="submit" className="w-full" disabled={loading === true}>
                                        {loading ? <Loader2 className="size-4 animate-spin"/> : "Confirm"}
                                    </Button>
                                </div>
                                <div className="text-center text-sm">
                                    Didn&apos;t receive the email?{" "}
                                    <div className="inline underline underline-offset-4 cursor-pointer" onClick={onResend}>
                                        Resend
                                    </div>
                                </div>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}