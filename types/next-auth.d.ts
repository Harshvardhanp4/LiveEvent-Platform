import type { DefaultSession } from "next-auth"
import type { Provider } from "@prisma/client"

declare module "next-auth" {
    interface Session {
        accessToken?: string;
        user: {
            id: string
            email: string
            name?: string | null
            image?: string | null
            provider: Provider
            role: string
        } & DefaultSession["user"]
    }

    interface User {
        id: string
        email: string
        name?: string | null
        image?: string | null
        provider: Provider
        role: string
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        email: string
        name?: string | null
        image?: string | null
        provider: Provider
        accessToken?: string
        role: string 
    }
}
