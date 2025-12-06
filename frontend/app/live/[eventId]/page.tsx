"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { usePageTracking, useEngagementTracking } from "@/hooks/use-analytics"
import { AnalyticsWidget } from "@/components/analytics/analytics-widget"
import { ScreenShareViewer } from "@/components/live-room/screen-share-viewer"
import { QuizEngine } from "@/components/live-event/quiz-engine"
import { LivePolls } from "@/components/live-event/live-polls"
import { QAPanel } from "@/components/live-event/qa-panel"
import { Leaderboard } from "@/components/live-event/leaderboard"
import { EnhancedChat } from "@/components/live-room/enhanced-chat"
import { useSession } from "@/node_modules/next-auth/react"
import { useParams, useRouter } from "next/navigation"
import { useSocket } from "@/components/providers/socket-provider"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Clock, Square } from "lucide-react"

interface Event {
    id: string
    title: string
    description: string
    startTime: string
    duration: number
    isLive: boolean
    completedEvent?: boolean
    bannerUrl?: string
    category: string
    visibility: string
    registrationRequired: boolean
    capacity: number
    rating: number
    host: {
        id: string
        name: string
        avatar?: string
        hostId: string
        rating: number
    }
    _count: {
        participants: number
    }
    interactiveFeatures: string[]
}

export default function LiveEventRoom() {
    const [currentUserScore, setCurrentUserScore] = useState(540)
    const [event, setEvent] = useState<Event | null>(null)
    const [loading, setLoading] = useState(false)
    const [eventEnded, setEventEnded] = useState(false)
    const params = useParams()
    const { data: session } = useSession()
    const user = session?.user
    const eventId = params.eventId as string
    const router = useRouter()
    const { socket } = useSocket()
    const { toast } = useToast()

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                setLoading(true);

                const response = await fetch(`/api/events/${params.eventId}`);

                if (response.ok) {
                    const data = await response.json();
                    setEvent(data.event);

                    // Check if event is already ended
                    if (data.event.completedEvent || !data.event.isLive) {
                        setEventEnded(true);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch event:", error);
            } finally {
                setLoading(false);
            }
        };

        if (params.eventId) {
            fetchEvent();
        }
    }, [params.eventId]);

    // Join socket room when component mounts and socket is connected
    useEffect(() => {
        if (!socket || !eventId) return;

        // Wait for socket to be connected before joining room
        if (socket.connected) {
            socket.emit("join-room", eventId);
        } else {
            socket.once("connect", () => {
                socket.emit("join-room", eventId);
            });
        }

        return () => {
            // Socket cleanup is handled by the socket provider
        };
    }, [socket, eventId]);

    // Listen for EVENT_ENDED WebSocket event
    useEffect(() => {
        if (!socket) return;

        const handleEventEnded = (data: any) => {
            setEventEnded(true);
            if (event) {
                setEvent({ ...event, isLive: false, completedEvent: true });
            }
            toast({
                title: "Event Ended",
                description: "The host has ended this live event.",
                variant: "default",
            });
            // Redirect after 3 seconds
            setTimeout(() => {
                router.push(`/events/${eventId}`);
            }, 3000);
        };

        socket.on("event-ended", handleEventEnded);

        return () => {
            socket.off("event-ended", handleEventEnded);
        };
    }, [socket, event, eventId, router, toast]);

    usePageTracking("live_event_room", { eventId })
    const { trackInteraction, trackEngagement } = useEngagementTracking(eventId)

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900">

                <div className="container mx-auto px-4 py-8">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
                        <p className="mt-4 text-slate-400">Loading event...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (!event) {
        return (
            <div className="min-h-screen bg-slate-900">

                <div className="container mx-auto px-4 py-8">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-white mb-4">Event Not Found</h1>
                        <p className="text-slate-400">The event you're looking for doesn't exist.</p>
                    </div>
                </div>
            </div>
        )
    }

    if (eventEnded || (!event.isLive && event.completedEvent)) {
        return (
            <div className="min-h-screen bg-slate-900">
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center max-w-2xl mx-auto">
                        <div className="mb-6">
                            <div className="w-24 h-24 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-4xl">📺</span>
                            </div>
                            <h1 className="text-3xl font-bold text-white mb-2">Event Has Ended</h1>
                            <p className="text-slate-400 mb-6">
                                The live event "{event.title}" has been ended by the host.
                            </p>
                        </div>
                        <div className="flex gap-4 justify-center">
                            <Button
                                onClick={() => router.push(`/events/${eventId}`)}
                                variant="default"
                            >
                                View Event Details
                            </Button>
                            <Button
                                onClick={() => router.push("/events")}
                                variant="outline"
                            >
                                Browse Events
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-900">
            {/* Header */}
            <header className="bg-slate-800 border-b border-slate-700 px-2 py-1 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg"></div>
                            <span className="font-bold">EventFlow</span>
                        </div>
                        {/* <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                            🔴 LIVE
                        </Badge> */}
                    </div>

                    {/* <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                            <Users className="w-4 h-4" />
                            <span>1,247</span>
                        </div>
                        <ThemeToggle />
                        <Button variant="outline" size="sm">
                            Leave Event
                        </Button>
                    </div> */}
                </div>
            </header>

            <div className="container mx-auto px-4 py-4">
                <div className="grid lg:grid-cols-4 gap-6 h-[calc(75vh-120px)]">
                    {/* Main Video Area */}
                    <div className="lg:col-span-3 space-y-4">
                        {/* Screen Share Viewer - Always show when event is live */}
                        {event?.isLive && !eventEnded ? (
                            <ScreenShareViewer eventId={eventId} />
                        ) : eventEnded ? (
                            <Card className="rounded-2xl shadow-lg">
                                <CardContent className="p-12 text-center">
                                    <div className="space-y-4">
                                        <div className="w-20 h-20 bg-gray-600 rounded-full flex items-center justify-center mx-auto">
                                            <Square className="w-10 h-10 text-white" />
                                        </div>
                                        <h2 className="text-2xl font-bold">Event Has Ended</h2>
                                        <p className="text-muted-foreground">This live event has concluded.</p>
                                        <Button onClick={() => router.push(`/events/${eventId}`)}>
                                            View Event Details
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="rounded-2xl shadow-lg">
                                <CardContent className="p-12 text-center">
                                    <div className="space-y-4">
                                        <div className="w-20 h-20 bg-yellow-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
                                            <Clock className="w-10 h-10 text-white" />
                                        </div>
                                        <h2 className="text-2xl font-bold">Event Not Started</h2>
                                        <p className="text-muted-foreground">This event has not started yet. Please check back later.</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Interactive Panel */}
                        <Card className="rounded-2xl shadow-lg">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">Interactive Session</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Tabs defaultValue="quiz" className="w-full">
                                    <TabsList className="grid w-full grid-cols-3">
                                        <TabsTrigger value="quiz">Live Quiz</TabsTrigger>
                                        <TabsTrigger value="poll">Live Poll</TabsTrigger>
                                        <TabsTrigger value="qa">Q&A</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="quiz" className="space-y-4">
                                        <QuizEngine eventId={eventId} onScoreUpdate={setCurrentUserScore} />
                                    </TabsContent>

                                    <TabsContent value="poll" className="space-y-4">
                                        <LivePolls eventId={eventId} />
                                    </TabsContent>

                                    <TabsContent value="qa" className="space-y-4">
                                        <QAPanel eventId={eventId} />
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4 flex flex-col h-full min-h-0">
                        {/* Chat - Aligned with video player height (500px) */}
                        <div className="flex-1 min-h-[500px] max-h-full overflow-hidden">
                            <EnhancedChat eventId={eventId} isHost={user?.role === "HOST" || user?.role === "ADMIN"} />
                        </div>

                        {/* Leaderboard */}
                        <div className="flex-shrink-0">
                            <Leaderboard eventId={eventId} currentUserScore={currentUserScore} />
                        </div>
                    </div>
                </div>
            </div>

            <AnalyticsWidget />
        </div>
    )
}
