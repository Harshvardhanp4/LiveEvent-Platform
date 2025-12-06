"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity } from "lucide-react"
import { useParams } from "next/navigation"

export function AnalyticsWidget() {
    const params = useParams()
    const eventId = params.eventId as string
    const [participantCount, setParticipantCount] = useState(0)
    const [messageCount, setMessageCount] = useState(0)
    const [engagementRate, setEngagementRate] = useState(0)

    useEffect(() => {
        const fetchAnalytics = async () => {
            if (!eventId) return

            try {
                // Fetch event data for participant count
                const eventResponse = await fetch(`/api/events/${eventId}`)
                if (eventResponse.ok) {
                    const eventData = await eventResponse.json()
                    const participants = eventData.event?._count?.participants || 0
                    setParticipantCount(participants)

                    // Fetch messages for message count
                    const messagesResponse = await fetch(`/api/events/${eventId}/messages`)
                    if (messagesResponse.ok) {
                        const messagesData = await messagesResponse.json()
                        const messages = messagesData.messages?.length || 0
                        setMessageCount(messages)

                        // Calculate engagement rate
                        if (participants > 0) {
                            // Simple engagement: (messages / participants) * 100, capped at 100%
                            const engagement = Math.min(100, Math.round((messages / participants) * 100))
                            setEngagementRate(engagement)
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to fetch analytics:", error)
            }
        }

        fetchAnalytics()
        // Update every 5 seconds
        const interval = setInterval(fetchAnalytics, 5000)

        return () => clearInterval(interval)
    }, [eventId])

    return (
        <div className="min-h-screen bg-slate-900">
            <div className="fixed bottom-4 right-4 z-50">
                <Card className="w-64 bg-background/95 backdrop-blur-sm border shadow-lg">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                                <Activity className="w-4 h-4 text-green-500" />
                                <span className="text-sm font-medium">Live Analytics</span>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                                Real-time
                            </Badge>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Active Users:</span>
                                <span className="font-medium">{participantCount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Messages:</span>
                                <span className="font-medium">{messageCount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Engagement:</span>
                                <span className="font-medium text-green-600">{engagementRate}%</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
