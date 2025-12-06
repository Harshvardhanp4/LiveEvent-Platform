"use client"

import type React from "react"
//import { useAuth } from "@/components/providers/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useSession } from "@/node_modules/next-auth/react"

interface RoleGuardProps {
    allowedRoles: string[]
    children: React.ReactNode
    redirectTo?: string
}

export function RoleGuard({ allowedRoles, children, redirectTo = "/dashboard" }: RoleGuardProps) {
    //const { user, loading } = useAuth()
    const { data: session } = useSession()
    const user = session?.user
    const router = useRouter()
    const [loading, setLoading] = useState();

    useEffect(() => {
        if (!loading && user) {
            if (!allowedRoles.includes(user.role)) {
                // Redirect based on user role if not authorized
                const roleRedirects = {
                    ADMIN: "/admin",
                    HOST: "/dashboard",
                    PARTICIPANT: "/events",
                }
                router.push(roleRedirects[user.role as keyof typeof roleRedirects] || redirectTo)
            }
        } else if (!loading && !user) {
            router.push("/auth")
        }
    }, [user, loading, allowedRoles, redirectTo, router])

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <p className="text-muted-foreground">Redirecting to login...</p>
                </div>
            </div>
        )
    }

    if (!allowedRoles.includes(user.role)) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <p className="text-muted-foreground">Redirecting...</p>
                </div>
            </div>
        )
    }

    return <>{children}</>
}
