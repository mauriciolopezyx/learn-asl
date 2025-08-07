"use client"

import { z } from "zod"
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from "react-hook-form"
import { Form } from "@/components/ui/form"
import InputElement from "@/components/form-elements"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useMutation } from '@tanstack/react-query'
import { Loader2 } from "lucide-react"

const formSchema = z.object({
    email: z.string().min(5, {
        message: "Email must be at least 5 characters"
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

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {

    const router = useRouter() 

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: ""
        }
    })

    const {isPending:loading, isError, error:verifyError, mutate:confirmMutate} = useMutation({
        mutationFn: async (values: z.infer<typeof formSchema>) => {
            console.log("submitting forgot password email send attempt")
            const response = await fetch("http://localhost:8080/auth/forgot-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    email: values.email
                })
            })
            if (!response.ok) {
                const payload = await response.text()
                throw new Error(payload)
            }
            return values.email
        },
        onSuccess: (email: string) => {
            router.push(`/verify?email=${email}&forgotPassword=true`)
        },
        onError: (e: any) => {
            toast.error(e?.message ?? "Failed to initiate forgot password process")
        }
    })

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        confirmMutate(values)
    }
    
    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader className="text-center mt-4">
                    <CardTitle className="text-xl">Forgot Password</CardTitle>
                    <CardDescription>Enter your email to receive a verification code:</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <div className="grid gap-6">
                                <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                                </div>
                                <div className="grid gap-6">
                                    <div className="grid gap-3">
                                        <Label htmlFor="email">Email</Label>
                                        <div className="w-full relative">
                                            <InputElement
                                                name="email"
                                                placeholder=""
                                                type="email"
                                                isOptional={false}
                                            />
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