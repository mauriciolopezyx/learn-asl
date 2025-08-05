"use client"

import { z } from "zod"
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from "react-hook-form"
import { Form } from "@/components/ui/form"
import InputElement from "@/components/form-elements"
import { toast } from "sonner"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Loader2 } from "lucide-react"

import { signUp } from "@/server/users"

const formSchema = z.object({
    name: z.string().min(5, {
        message: "Username must be at least 5 characters"
    }),
    email: z.string().min(5, {
        message: "Email must be at least 5 characters"
    }),
    password: z.string().min(5, {
        message: "Password must be at least 5 characters"
    }),
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

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {

    const router = useRouter() 
    const [loading, setLoading] = useState<boolean>(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: ""
        }
    })

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setLoading(true)
        console.log(values)
        const {success, message} = await signUp(values.name, values.email, values.password)
        if (success) {
            toast.success(message as string)
            router.push("/dashboard")
        } else {
            toast.error(message as string)
        }
        setLoading(false)
    }

    const registerWithGoogle = async () => {
        await authClient.signIn.social({
            provider: "google"
        })
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">Welcome</CardTitle>
                    <CardDescription>
                    Register with your Google Account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <div className="grid gap-6">
                                <div className="flex flex-col gap-4">
                                    <Button type="button" onClick={registerWithGoogle} variant="outline" className="w-full">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                        <path
                                            d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                                            fill="currentColor"
                                        />
                                        </svg>
                                        Register with Google
                                    </Button>
                                </div>
                                <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                                    <span className="bg-card text-muted-foreground relative z-10 px-2">
                                        Or continue with
                                    </span>
                                </div>
                                <div className="grid gap-6">
                                    <div className="grid gap-3">
                                        <Label htmlFor="name">Username</Label>
                                        <InputElement
                                            name="name"
                                            placeholder=""
                                            type="text"
                                            isOptional={false}
                                        />
                                    </div>
                                    <div className="grid gap-3">
                                        <Label htmlFor="email">Email</Label>
                                        <InputElement
                                            name="email"
                                            placeholder=""
                                            type="email"
                                            isOptional={false}
                                        />
                                    </div>
                                    <div className="grid gap-3">
                                        <Label htmlFor="password">Password</Label>
                                        <InputElement
                                            name="password"
                                            placeholder=""
                                            type="password"
                                            isOptional={false}
                                        />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={loading === true}>
                                        {loading ? <Loader2 className="size-4 animate-spin"/> : "Register"}
                                    </Button>
                                </div>
                                <div className="text-center text-sm">
                                    Have an account?{" "}
                                    <Link href="/login" className="underline underline-offset-4">
                                        Login
                                    </Link>
                                </div>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
            <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
            By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
            and <a href="#">Privacy Policy</a>.
            </div>
        </div>
    )
}