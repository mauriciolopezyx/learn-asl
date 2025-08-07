"use client"

import { z } from "zod"
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from "react-hook-form"
import { Form } from "@/components/ui/form"
import InputElement from "@/components/form-elements"
import { toast } from "sonner"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMutation } from '@tanstack/react-query'
import { useState } from "react"
import { LuEye, LuEyeClosed } from "react-icons/lu"
import { Loader2 } from "lucide-react"

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

    const [showPassword, setShowPassword] = useState<boolean>(false);
    function toggleVisibility() {
        setShowPassword(prev => !prev)
    }

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: ""
        }
    })

    const {isPending:loading, isError, error, mutate} = useMutation({
        mutationFn: async (registerData: z.infer<typeof formSchema>) => {
            console.log("submitting with:")
            console.log(registerData)
            const response = await fetch("http://localhost:8080/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    username: registerData.name,
                    email: registerData.email,
                    password: registerData.password
                })
            })
            if (!response.ok) {
                const payload = await response.text()
                throw new Error(payload)
            }
            return registerData.email
        },
        onSuccess: (email: string) => {
            router.push(`/verify?email=${email}`)
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
                    <CardTitle className="text-xl">Register</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <div className="grid gap-6">
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
                                        <div className="w-full relative">
                                            <InputElement
                                                name="password"
                                                placeholder=""
                                                type={showPassword ? "text" : "password"}
                                                isOptional={false}
                                            />
                                            {!showPassword ? <LuEye className="absolute right-5 top-3/10 cursor-pointer" onClick={toggleVisibility} />
                                            : <LuEyeClosed className="absolute right-5 top-3/10 cursor-pointer" onClick={toggleVisibility} />
                                            }
                                        </div>
                                    </div>
                                    <Button type="submit" className="w-full" disabled={loading === true}>
                                        {loading ? <Loader2 className="size-4 animate-spin"/> : "Register"}
                                    </Button>
                                </div>
                                <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                                    <span className="bg-card text-muted-foreground relative z-10 px-2">
                                        or
                                    </span>
                                </div>
                                <div className="flex flex-col gap-4">
                                    <a href="http://localhost:8080/oauth2/authorization/google" className="w-full">
                                        <Button type="button" variant="outline" className="w-full">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                            <path
                                                d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                                                fill="currentColor"
                                            />
                                            </svg>
                                            Register with Google
                                        </Button>
                                    </a>
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
        </div>
    )
}