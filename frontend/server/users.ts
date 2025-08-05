"use server";
import { auth } from "@/lib/auth"
 
export const signIn = async (email: string, password: string) => {
    try {
        await auth.api.signInEmail({
            body: {
                email: email,
                password: password,
            }
        })
        return {
            success: true,
            message: "Signed in successfully!"
        }
    } catch (error) {
        const e = error as Error
        return {
            success: false,
            message: e.message || "An unknown error occured."
        }
    }
}

export const signUp = async (username: string, email: string, password: string) => {
    try {
        await auth.api.signUpEmail({
            body: {
                email: email,
                password: password,
                name: username
            }
        })
        return {
            success: true,
            message: "Registered successfully!"
        }
    } catch (error) {
        const e = error as Error
        return {
            success: false,
            message: e.message || "An unknown error occured."
        }
    }
}