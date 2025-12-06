"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
//import { useAuth } from "@/components/providers/auth-provider"
import Link from "next/link"
import { useSession } from "@/node_modules/next-auth/react"

interface HostControlButtonProps {
    eventId: string
    className?: string
    size?: "sm" | "default" | "lg"
}

export function HostControlButton({ eventId, className, size = "default" }: HostControlButtonProps) {
    const { data: session } = useSession()
    const user = session?.user
    //const { user } = useAuth()
    const [hasAccess, setHasAccess] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const checkHostAccess = async () => {
            if (!user) {
                setLoading(false)
                return
            }

            try {
                const token = localStorage.getItem("token")
                const response = await fetch(`/api/events/${eventId}/host-access`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })

                const data = await response.json()
                setHasAccess(data.hasAccess)
            } catch (error) {
                console.error("Failed to check host access:", error)
                setHasAccess(false)
            } finally {
                setLoading(false)
            }
        }

        checkHostAccess()
    }, [user, eventId])

    if (loading || !hasAccess) {
        return null
    }

    return (
        <Link href={`/host/${eventId}`}>
            <Button size={size} className={`bg-purple-600 hover:bg-purple-700 text-white ${className}`}>
                <Settings className="h-4 w-4 mr-2" />
                Host Control Panel
            </Button>
        </Link>
    )
}
