"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
//import { useAuth } from "@/components/providers/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { RoleGuard } from "@/components/auth/role-guard"
//import { HostControlPanel } from "@/components/host/host-control-panel"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Play,
    Pause,
    Square,
    Users,
    MessageCircle,
    BarChart3,
    Mic,
    MicOff,
    Video,
    VideoOff,
    Share,
    Plus,
    Eye,
    Clock,
    Settings,
} from "lucide-react"
import Link from "next/link"
import { usePageTracking, useEngagementTracking } from "@/hooks/use-analytics"

interface Event {
    id: string
    title: string
    description: string
    startTime: string
    duration: number
    isLive: boolean
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

export default function HostControlPage() {
    const params = useParams()
    const { data: session } = useSession()
    const user = session?.user
    const [isLive, setIsLive] = useState(true)
    const [isMuted, setIsMuted] = useState(false)
    const [isVideoOn, setIsVideoOn] = useState(true)
    const [chatModeration, setChatModeration] = useState(true)
    const [event, setEvent] = useState<Event | null>(null)
    const [loading, setLoading] = useState(false)
    //const { user } = useAuth()
    const { toast } = useToast()
    const router = useRouter()

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                setLoading(true);

                const response = await fetch(`/api/events/${params.eventId}`);

                if (response.ok) {
                    const data = await response.json();
                    setEvent(data.event);

                    console.log("Event details fetched successfully.")
                } else {
                    console.log("Faile to load event")
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

    const goLive = async () => {
        try {
            setLoading(true);

            const response = await fetch(`/api/goLive/${params.eventId}`, {
                method: "PATCH",
            });

            const data = await response.json();

            if (response.ok) {
                console.log("Event is now live:", data);
                toast({
                    title: "Event is Live",
                    description: "Event is now Live."
                })
            } else {
                console.error("Error from server:", data.error);
            }
        } catch (error) {
            console.log("Update error: ", error);
        }
    }

    usePageTracking("host_control_panel", { eventId: "tech-summit-2024" })
    const { trackInteraction } = useEngagementTracking("tech-summit-2024")

    const participants = [
        { id: 1, name: "Alice Johnson", joined: "2:15 PM", status: "active" },
        { id: 2, name: "Bob Smith", joined: "2:18 PM", status: "active" },
        { id: 3, name: "Carol Davis", joined: "2:20 PM", status: "idle" },
        { id: 4, name: "David Wilson", joined: "2:22 PM", status: "active" },
    ]

    const chatMessages = [
        { id: 1, user: "Alice", message: "Great presentation!", time: "2:34 PM", flagged: false },
        { id: 2, user: "Bob", message: "When is the Q&A?", time: "2:35 PM", flagged: false },
        { id: 3, user: "Spam User", message: "Check out this link!", time: "2:36 PM", flagged: true },
    ]

    // Security check - verify host access
    useEffect(() => {
        const verifyHostAccess = async () => {
            try {
                const response = await fetch(`/api/events/${params.eventId}/host-access`)

                const data = await response.json()

                if (!data.hasAccess) {
                    toast({
                        title: "Access Denied",
                        description: "You don't have permission to access this host panel.",
                        variant: "destructive",
                    })
                    router.push(`/events/${params.eventId}`)
                }
            } catch (error) {
                console.error("Access verification failed:", error)
                router.push("/dashboard")
            }
        }

        if (user && params.eventId) {
            verifyHostAccess()
        }
    }, [user, params.eventId, router, toast])

    return (
        <RoleGuard allowedRoles={["HOST", "ADMIN"]}>
            {/* <HostControlPanel /> */}
            <div className="min-h-screen bg-slate-900">
                {/* Header */}
                <header className="bg-slate-800 border-b border-slate-700 px-2 py-1 backdrop-blur-sm sticky top-0 z-50">
                    <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg"></div>
                                <span className="font-bold">EventFlow</span>
                            </div>
                            {/* <Badge variant={isLive ? "destructive" : "secondary"}>{isLive ? "🔴 LIVE" : "⏸️ PAUSED"}</Badge> */}
                        </div>
                        <div className="flex items-center space-x-2">
                            {/* <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                            <Users className="w-4 h-4" />
                            <span>1,247</span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>45:32</span>
                        </div> */}
                            {/* Go Live Card */}
                            <div>
                                <Link href={`/live/${params.eventId}`}>
                                    <Button
                                        onClick={goLive}
                                        variant="default"
                                        size="sm"
                                        className="btn-secondary w-full py-3 rounded-xl">
                                        <Settings className="h-4 w-4 mr-2" />
                                        Go Live
                                    </Button>
                                </Link>
                            </div>
                            {/* <ThemeToggle /> */}
                            {/* <Button variant="outline" size="sm">
                            End Event
                        </Button> */}
                        </div>
                    </div>
                </header>

                <div className="container mx-auto px-4 py-6">
                    <div className="grid lg:grid-cols-4 gap-6">
                        {/* Main Control Area */}
                        <div className="lg:col-span-3 space-y-6">
                            {/* Stream Controls */}
                            <Card className="glass-card hover-lift rounded-2xl">
                                <CardHeader className="space-y-10">
                                    <div >
                                        <span className="text-2xl font-bold heading-primary text-white flex items-center space-x-3">{event?.title}</span>
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl heading-primary text-white flex items-center space-x-3">
                                            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                                                <Video className="w-4 h-4 text-white" />
                                            </div>
                                            <span>Stream Controls</span>
                                        </CardTitle>
                                        <CardDescription className="text-lg text-subtle">
                                            Manage your live stream and presentation
                                        </CardDescription>
                                    </div>

                                </CardHeader>
                                <CardContent className="space-y-8">
                                    <div className="grid md:grid-cols-2 gap-8">
                                        {/* Stream Status */}
                                        <div className="space-y-6">
                                            <h4 className="text-xl font-semibold text-white">Stream Status</h4>
                                            <div className="flex items-center space-x-4">
                                                <Button
                                                    variant={isLive ? "destructive" : "default"}
                                                    onClick={() => {
                                                        setIsLive(!isLive)
                                                        trackInteraction(isLive ? "pause_stream" : "start_stream", {
                                                            timestamp: Date.now(),
                                                        })
                                                    }}
                                                    className={`flex items-center space-x-2 px-6 py-3 text-lg rounded-xl ${isLive ? "btn-danger" : "btn-primary"}`
                                                    }
                                                >
                                                    {isLive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                                                    <span>{isLive ? "Pause Stream" : "Start Stream"}</span>
                                                </Button>
                                                <Button className="btn-secondary flex items-center space-x-2 px-6 py-3 text-lg rounded-xl">
                                                    <Square className="w-5 h-5" />
                                                    <span>Stop</span>
                                                </Button>
                                            </div>

                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="glass-card p-4 rounded-xl hover-lift">
                                                    <div className="flex items-center justify-between">
                                                        <Label htmlFor="audio-toggle" className="text-white font-medium">
                                                            Audio
                                                        </Label>
                                                        <Button
                                                            id="audio-toggle"
                                                            variant="default"
                                                            size="sm"
                                                            onClick={() => setIsMuted(!isMuted)}
                                                            className="btn-secondary"
                                                        >
                                                            {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="glass-card p-4 rounded-xl hover-lift">
                                                    <div className="flex items-center justify-between">
                                                        <Label htmlFor="video-toggle" className="text-white font-medium">
                                                            Video
                                                        </Label>
                                                        <Button
                                                            id="video-toggle"
                                                            variant="default"
                                                            size="sm"
                                                            onClick={() => setIsVideoOn(!isVideoOn)}
                                                            className="btn-secondary"
                                                        >
                                                            {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Quick Actions */}
                                        <div className="space-y-6">
                                            <h4 className="text-xl font-semibold text-white">Quick Actions</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <Button className="btn-secondary flex items-center space-x-2 p-4 rounded-xl">
                                                    <Share className="w-5 h-5" />
                                                    <span>Share Screen</span>
                                                </Button>
                                                <Button className="btn-secondary flex items-center space-x-2 p-4 rounded-xl">
                                                    <Plus className="w-5 h-5" />
                                                    <span>Add Poll</span>
                                                </Button>
                                                <Button className="btn-secondary flex items-center space-x-2 p-4 rounded-xl">
                                                    <Plus className="w-5 h-5" />
                                                    <span>Add Quiz</span>
                                                </Button>
                                                <Button className="btn-secondary flex items-center space-x-2 p-4 rounded-xl">
                                                    <Eye className="w-5 h-5" />
                                                    <span>Preview</span>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Interactive Content Management */}
                            <Card className="rounded-2xl shadow-lg">
                                <CardHeader>
                                    <CardTitle className="text-2xl heading-primary text-white">Interactive Content</CardTitle>
                                    <CardDescription className="text-lg text-subtle">Create and manage polls, quizzes, and Q&A sessions</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Tabs defaultValue="poll" className="w-full">
                                        <TabsList className="grid w-full grid-cols-3 rounded-xl p-1">
                                            <TabsTrigger
                                                className="rounded-lg data-[state=active]:text-white text-subtle"
                                                value="poll">Create Poll
                                            </TabsTrigger>
                                            <TabsTrigger
                                                className="rounded-lg  data-[state=active]:text-white text-subtle"
                                                value="quiz">Create Quiz
                                            </TabsTrigger>
                                            <TabsTrigger
                                                className="rounded-lg data-[state=active]:text-white text-subtle"
                                                value="qa">Q&A Session
                                            </TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="poll" className="space-y-6 mt-8">
                                            <div className="space-y-6">
                                                <div>
                                                    <Label
                                                        className="text-white font-medium text-lg"
                                                        htmlFor="poll-question">Poll Question
                                                    </Label>
                                                    <Input
                                                        id="poll-question"
                                                        placeholder="What's your favorite programming language?"
                                                        className="mt-2 border-white/20 text-white placeholder:text-subtle rounded-xl h-12"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <div>
                                                        <Label className="text-white font-medium text-lg">Options</Label>
                                                    </div>
                                                    <Input
                                                        className=" border-white/20 text-white placeholder:text-subtle rounded-xl h-12"
                                                        placeholder="Option 1" />
                                                    <Input
                                                        className=" border-white/20 text-white placeholder:text-subtle rounded-xl h-12"
                                                        placeholder="Option 2" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Button
                                                        variant="default"
                                                        size="sm"
                                                        className="btn-secondary w-full rounded-xl">
                                                        <Plus className="w-4 h-4 mr-2" />
                                                        Add Option
                                                    </Button>
                                                    <Button
                                                        variant="default"
                                                        size="sm"
                                                        className="btn-secondary w-full rounded-xl"
                                                        onClick={() => {
                                                            trackInteraction("poll_created", {
                                                                pollType: "multiple_choice",
                                                                timestamp: Date.now(),
                                                            })
                                                        }}
                                                    >
                                                        Launch Poll
                                                    </Button>
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="quiz" className="space-y-6 mt-8">
                                            <div className="space-y-6">
                                                <div>
                                                    <Label
                                                        htmlFor="quiz-question"
                                                        className="text-white font-medium text-lg"
                                                    >Quiz Question</Label>
                                                    <Textarea
                                                        id="quiz-question"
                                                        placeholder="Which technology is most likely to revolutionize healthcare?"
                                                        className="mt-2 border-white/20 text-white placeholder:text-subtle rounded-xl"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <div>
                                                        <Label className="text-white font-medium text-lg">Answer Options</Label>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="flex items-center space-x-2 glass-card p-2 rounded-xl">
                                                            <Input
                                                                placeholder="Option A"
                                                                className="flex-1 border-white/20 text-white placeholder:text-subtle rounded-lg" />
                                                            <Switch />
                                                            <span className="text-subtle font-medium">Correct</span>
                                                        </div>
                                                        <div className="flex items-center space-x-2 glass-card p-2 rounded-xl">
                                                            <Input
                                                                placeholder="Option B"
                                                                className="flex-1 border-white/20 text-white placeholder:text-subtle rounded-lg" />
                                                            <Switch />
                                                            <span className="text-subtle font-medium">Correct</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Button
                                                        variant="default"
                                                        size="sm"
                                                        className="btn-secondary w-full rounded-xl">
                                                        <Plus className="w-4 h-4 mr-2" />
                                                        Add Option
                                                    </Button>
                                                    <Button
                                                        variant="default"
                                                        size="sm"
                                                        className="btn-secondary w-full rounded-xl"
                                                        onClick={() => {
                                                            trackInteraction("poll_created", {
                                                                pollType: "multiple_choice",
                                                                timestamp: Date.now(),
                                                            })
                                                        }}
                                                    >
                                                        Launch Poll
                                                    </Button>
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="qa" className="space-y-6 mt-8">
                                            <div className="space-y-6">
                                                <div className="flex items-center space-x-2 glass-card p-2 rounded-xl">
                                                    <Label className="text-white font-medium text-lg">Q&A Session</Label>
                                                    <Switch />
                                                </div>
                                                <p className="text-subtle mt-2">
                                                    Allow participants to submit questions during the event
                                                </p>
                                            </div>
                                            <Button
                                                variant="default"
                                                size="sm"
                                                className="btn-secondary w-full py-3 rounded-xl">
                                                Start Q&A Session
                                            </Button>
                                        </TabsContent>
                                    </Tabs>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-8">
                            {/* Event Stats */}
                            <Card className="rounded-2xl shadow-lg">
                                <CardHeader>
                                    <CardTitle className="text-xl heading-primary text-white flex items-center space-x-3">
                                        <div className="w-6 h-6 rounded-lg gradient-primary flex items-center justify-center">
                                            <BarChart3 className="w-4 h-4 text-white" />
                                        </div>
                                        <span>Live Stats</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-center glass-card p-4 rounded-xl hover-lift">
                                            <div className="text-2xl font-bold text-gradient">1,247</div>
                                            <div className="text-sm text-subtle">Participants</div>
                                        </div>
                                        <div className="text-center glass-card p-4 rounded-xl hover-lift">
                                            <div className="text-2xl font-bold text-green-400">94%</div>
                                            <div className="text-sm text-subtle">Engagement</div>
                                        </div>
                                        <div className="text-center glass-card p-4 rounded-xl hover-lift">
                                            <div className="text-2xl font-bold text-blue-400">342</div>
                                            <div className="text-sm text-subtle">Chat Messages</div>
                                        </div>
                                        <div className="text-center glass-card p-4 rounded-xl hover-lift">
                                            <div className="text-2xl font-bold text-purple-400">45:32</div>
                                            <div className="text-sm text-subtle">Duration</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Participants */}
                            <Card className="rounded-2xl shadow-lg">
                                <CardHeader>
                                    <CardTitle className="text-xl heading-primary text-white flex items-center space-x-3">
                                        <div className="w-6 h-6 rounded-lg gradient-primary flex items-center justify-center">
                                            <Users className="w-4 h-4 text-white" />
                                        </div>
                                        <span>Participants</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ScrollArea className="h-64">
                                        <div className="space-y-3">
                                            {participants.map((participant) => (
                                                <div
                                                    key={participant.id}
                                                    className="flex items-center justify-between p-3 rounded-xl card-hover glass-card"
                                                >
                                                    <div>
                                                        <div className="font-medium text-white">{participant.name}</div>
                                                        <div className="text-sm text-subtle">Joined {participant.joined}</div>
                                                    </div>
                                                    <Badge
                                                        variant={participant.status === "active" ? "default" : "secondary"}
                                                        className={participant.status === "active" ? "badge-success" : "badge-secondary"}
                                                    >
                                                        {participant.status}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </CardContent>
                            </Card>

                            {/* Chat Moderation */}
                            <Card className="rounded-2xl shadow-lg">
                                <CardHeader>
                                    <CardTitle className="text-xl heading-primary text-white flex items-center space-x-3">
                                        <div className="w-6 h-6 rounded-lg gradient-primary flex items-center justify-center">
                                            <MessageCircle className="w-4 h-4 text-white" />
                                        </div>
                                        <span>Chat Moderation</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="glass-card p-4 rounded-xl">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="chat-moderation" className="text-white font-medium">
                                                Auto Moderation
                                            </Label>
                                            <Switch id="chat-moderation" checked={chatModeration} onCheckedChange={setChatModeration} />
                                        </div>
                                    </div>

                                    <ScrollArea className="h-40">
                                        <div className="space-y-3">
                                            {chatMessages.map((msg) => (
                                                <div
                                                    key={msg.id}
                                                    className={`p-3 rounded-xl text-sm ${msg.flagged ? "bg-red-500/20 border border-red-500/30" : "glass-card"
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="font-medium text-white">{msg.user}</span>
                                                        {msg.flagged && (
                                                            <Badge variant="destructive" className="text-xs badge-danger">
                                                                Flagged
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-subtle">{msg.message}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </CardContent>
                            </Card>

                        </div>
                    </div>
                </div>
            </div>
        </RoleGuard>
    )
}
