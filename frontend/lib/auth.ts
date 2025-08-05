import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { Pool } from "pg";
 
export const auth = betterAuth({
    socialProviders: {
        google: { 
            clientId: process.env.GOOGLE_CLIENT_ID as string, 
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
        }, 
    },
    database: new Pool({ 
        connectionString: process.env.DATABASE_URL 
    }),
    emailAndPassword: { 
        enabled: true, 
    },
    plugins: [nextCookies()]
})