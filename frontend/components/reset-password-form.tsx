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
    const [loading, setLoading] = useState<boolean>(false)

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

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setLoading(true)
        //const {success, message} = await signIn(values.email, values.password)
        // if (success) {
        //     toast.success(message as string)
        //     router.push("/dashboard")
        // } else {
        //     toast.error(message as string)
        // }
        setLoading(false)
    }
    
    // you'd probably perform a query here if they had a password previously or not. (You never had forgot password btw)
    // FIRST MAKE THOSE THAT FORGOT PASSWORD VERIFY WITH CODE. if they don't have an email they can't do it
    
    const hasPassword = false
    const conditionalTitle = hasPassword ? "Enter your current and newly chosen password:" : "Create your new password below:"

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
                                    { hasPassword ? <div className="grid gap-3">
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