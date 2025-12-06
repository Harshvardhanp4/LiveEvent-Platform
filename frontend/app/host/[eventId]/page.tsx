"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
//import { useAuth } from "@/components/providers/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { RoleGuard } from "@/components/auth/role-guard"
//import { HostControlPanel } from "@/components/host/host-control-panel"
import { useSession } from "@/node_modules/next-auth/react"
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
import { ScreenSharePreview } from "@/components/host/screen-share-preview"
import Link from "next/link"
import { usePageTracking, useEngagementTracking } from "@/hooks/use-analytics"
import { useSocket } from "@/components/providers/socket-provider"

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

interface Participant {
    id: string
    name: string
    joined: string
    status: "active" | "idle"
}

interface ChatMessage {
    id: string
    user: string
    message: string
    time: string
    flagged: boolean
}

interface QnAQuestion {
    id: string
    question: string
    user: string
    approved: boolean
}

export default function HostControlPage() {
    const params = useParams()
    const { data: session } = useSession()
    const user = session?.user
    const { socket } = useSocket()
    const [isLive, setIsLive] = useState(false)
    const [isMuted, setIsMuted] = useState(false)
    const [isVideoOn, setIsVideoOn] = useState(true)
    const [chatModeration, setChatModeration] = useState(true)
    const [event, setEvent] = useState<Event | null>(null)
    const [loading, setLoading] = useState(false)
    const [autoStartScreenShare, setAutoStartScreenShare] = useState(false)
    const [activeTab, setActiveTab] = useState("poll")
    
    // Poll state
    const [pollQuestion, setPollQuestion] = useState("")
    const [pollOptions, setPollOptions] = useState(["", ""])
    
    // Quiz state
    const [quizQuestion, setQuizQuestion] = useState("")
    const [quizOptions, setQuizOptions] = useState(["", ""])
    const [correctAnswers, setCorrectAnswers] = useState<boolean[]>([false, false])
    const [timeLimit, setTimeLimit] = useState(30)
    
    // Q&A state
    const [qaEnabled, setQaEnabled] = useState(false)
    const [pendingQuestions, setPendingQuestions] = useState<QnAQuestion[]>([])
    
    // Stats state
    const [participants, setParticipants] = useState<Participant[]>([])
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
    const [participantCount, setParticipantCount] = useState(0)
    const [messageCount, setMessageCount] = useState(0)
    const [engagementRate, setEngagementRate] = useState(0)
    const [eventDuration, setEventDuration] = useState("00:00")
    
    const eventStartTimeRef = useRef<Date | null>(null)
    
    //const { user } = useAuth()
    const { toast } = useToast()
    const router = useRouter()

    // Join socket room when component mounts and socket is connected
    useEffect(() => {
        if (!socket || !params.eventId) return;

        // Wait for socket to be connected before joining room
        if (socket.connected) {
            socket.emit("join-room", params.eventId as string);
        } else {
            socket.once("connect", () => {
                socket.emit("join-room", params.eventId as string);
            });
        }

        return () => {
            // Socket cleanup is handled by the socket provider
        };
    }, [socket, params.eventId]);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                setLoading(true);

                const response = await fetch(`/api/events/${params.eventId}`);

                if (response.ok) {
                    const data = await response.json();
                    setEvent(data.event);
                    // Set isLive based on event status
                    setIsLive(data.event?.isLive || false);
                    setParticipantCount(data.event?._count?.participants || 0);
                    
                    if (data.event?.isLive && !eventStartTimeRef.current) {
                        eventStartTimeRef.current = new Date();
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

    // Fetch participants
    useEffect(() => {
        const fetchParticipants = async () => {
            if (!params.eventId || !isLive) return;
            
            try {
                const response = await fetch(`/api/events/${params.eventId}`);
                if (response.ok) {
                    const data = await response.json();
                    const participantCount = data.event?._count?.participants || 0;
                    setParticipantCount(participantCount);
                    
                    // For now, we'll use a simplified participant list
                    // In a real implementation, you'd fetch from an API endpoint
                    setParticipants([
                        { id: "1", name: "Participant 1", joined: new Date().toLocaleTimeString(), status: "active" },
                        { id: "2", name: "Participant 2", joined: new Date().toLocaleTimeString(), status: "active" },
                    ]);
                }
            } catch (error) {
                console.error("Failed to fetch participants:", error);
            }
        };

        fetchParticipants();
        const interval = setInterval(fetchParticipants, 5000);
        return () => clearInterval(interval);
    }, [params.eventId, isLive]);

    // Fetch messages
    useEffect(() => {
        const fetchMessages = async () => {
            if (!params.eventId) return;
            
            try {
                const response = await fetch(`/api/events/${params.eventId}/messages`);
                if (response.ok) {
                    const data = await response.json();
                    const messages = data.messages || [];
                    setMessageCount(messages.length);
                    
                    // Format messages for display
                    const formattedMessages: ChatMessage[] = messages.slice(-10).map((msg: any, index: number) => ({
                        id: msg.id || `msg-${index}`,
                        user: msg.user?.name || "Unknown",
                        message: msg.content || "",
                        time: new Date(msg.timestamp).toLocaleTimeString(),
                        flagged: false, // You can implement flagging logic
                    }));
                    setChatMessages(formattedMessages);
                }
            } catch (error) {
                console.error("Failed to fetch messages:", error);
            }
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [params.eventId]);

    // Calculate event duration
    useEffect(() => {
        if (!isLive || !eventStartTimeRef.current) return;

        const interval = setInterval(() => {
            if (eventStartTimeRef.current) {
                const now = new Date();
                const diff = Math.floor((now.getTime() - eventStartTimeRef.current.getTime()) / 1000);
                const minutes = Math.floor(diff / 60);
                const seconds = diff % 60;
                setEventDuration(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [isLive]);

    // Calculate engagement rate
    useEffect(() => {
        if (participantCount > 0) {
            // Simple engagement calculation: (messages / participants) * 100
            const engagement = Math.min(100, Math.round((messageCount / participantCount) * 100));
            setEngagementRate(engagement);
        }
    }, [participantCount, messageCount]);

    // Fetch pending Q&A questions
    useEffect(() => {
        const fetchQnA = async () => {
            if (!params.eventId) return;
            
            try {
                // Fetch Q&A questions from API
                const response = await fetch(`/api/events/${params.eventId}/questions`);
                if (response.ok) {
                    const data = await response.json();
                    const questions = data.questions || [];
                    setPendingQuestions(questions.map((q: any) => ({
                        id: q.id,
                        question: q.question,
                        user: q.user?.name || "Anonymous",
                        approved: q.approved,
                    })));
                }
            } catch (error) {
                console.error("Failed to fetch Q&A questions:", error);
            }
        };

        if (qaEnabled) {
            fetchQnA();
            const interval = setInterval(fetchQnA, 5000);
            return () => clearInterval(interval);
        }
    }, [params.eventId, qaEnabled]);

    // Listen for new questions via socket
    useEffect(() => {
        if (!socket || !qaEnabled) return;

        const handleQuestionSubmitted = (data: any) => {
            setPendingQuestions((prev) => {
                // Avoid duplicates
                if (prev.some(q => q.id === data.id)) {
                    return prev
                }
                return [data, ...prev]
            })
        }

        const handleQuestionApproved = (data: { id: string; approved: boolean }) => {
            setPendingQuestions((prev) =>
                prev.map((q) => (q.id === data.id ? { ...q, approved: data.approved } : q))
            )
        }

        socket.on("question-submitted", handleQuestionSubmitted)
        socket.on("question-approved", handleQuestionApproved)

        return () => {
            socket.off("question-submitted", handleQuestionSubmitted)
            socket.off("question-approved", handleQuestionApproved)
        }
    }, [socket, qaEnabled])

    const goLive = async () => {
        try {
            setLoading(true);

            // Get session token
            const sessionResponse = await fetch("/api/auth/session");
            const session = await sessionResponse.json();
            
            if (!session?.user) {
                toast({
                    title: "Error",
                    description: "Please log in to go live",
                    variant: "destructive",
                });
                return;
            }

            // Get JWT token
            const tokenResponse = await fetch("/api/auth/me");
            const userData = await tokenResponse.json();
            
            const response = await fetch(`/api/goLive/${params.eventId}`, {
                method: "PATCH",
                headers: {
                    "Authorization": `Bearer ${userData.token || ""}`,
                },
            });

            const data = await response.json();

            if (response.ok) {
                setIsLive(true);
                eventStartTimeRef.current = new Date();
                if (event) {
                    setEvent({ ...event, isLive: true });
                }
                
                // Enable auto-start screen sharing
                setAutoStartScreenShare(true);
                
                toast({
                    title: "Event is Live",
                    description: "Event is now live. Starting screen share..."
                })
            } else {
                console.error("Error from server:", data.error);
                toast({
                    title: "Error",
                    description: data.error || "Failed to go live",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to go live",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }

    const endEvent = async () => {
        try {
            setLoading(true);

            // Get session token
            const sessionResponse = await fetch("/api/auth/session");
            const session = await sessionResponse.json();
            
            if (!session?.user) {
                toast({
                    title: "Error",
                    description: "Please log in to end the event",
                    variant: "destructive",
                });
                return;
            }

            // Get JWT token
            const tokenResponse = await fetch("/api/auth/me");
            const userData = await tokenResponse.json();
            
            const response = await fetch(`/api/endEvent/${params.eventId}`, {
                method: "PATCH",
                headers: {
                    "Authorization": `Bearer ${userData.token || ""}`,
                },
            });

            const data = await response.json();

            if (response.ok) {
                setIsLive(false);
                eventStartTimeRef.current = null;
                setAutoStartScreenShare(false); // Reset auto-start flag
                if (event) {
                    setEvent({ ...event, isLive: false, completedEvent: true });
                }
                toast({
                    title: "Event Ended",
                    description: "The event has been ended successfully."
                })
                // Optionally redirect to event page
                setTimeout(() => {
                    router.push(`/events/${params.eventId}`);
                }, 2000);
            } else {
                console.error("Error from server:", data.error);
                toast({
                    title: "Error",
                    description: data.error || "Failed to end event",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to end event",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }

    usePageTracking("host_control_panel", { eventId: params.eventId as string })
    const { trackInteraction } = useEngagementTracking(params.eventId as string)

    // Poll functions
    const addPollOption = () => {
        setPollOptions([...pollOptions, ""])
    }

    const updatePollOption = (index: number, value: string) => {
        const newOptions = [...pollOptions]
        newOptions[index] = value
        setPollOptions(newOptions)
    }

    const launchPoll = () => {
        if (!pollQuestion.trim() || pollOptions.some((opt) => !opt.trim())) {
            toast({
                title: "Invalid Poll",
                description: "Please fill in all poll fields.",
                variant: "destructive",
            })
            return
        }

        if (!socket) {
            toast({
                title: "Connection Error",
                description: "Socket not connected. Please refresh the page.",
                variant: "destructive",
            })
            return
        }

        const poll = {
            id: Date.now().toString(),
            question: pollQuestion,
            options: pollOptions.filter((opt) => opt.trim()),
            responses: {},
            isActive: true,
        }

        socket.emit("new-poll", { eventId: params.eventId, poll })

        toast({
            title: "Poll Launched!",
            description: "Participants can now vote in the poll.",
        })

        trackInteraction("poll_created", {
            pollType: "multiple_choice",
            timestamp: Date.now(),
        })

        // Reset form
        setPollQuestion("")
        setPollOptions(["", ""])
    }

    // Quiz functions
    const addQuizOption = () => {
        setQuizOptions([...quizOptions, ""])
        setCorrectAnswers([...correctAnswers, false])
    }

    const updateQuizOption = (index: number, value: string) => {
        const newOptions = [...quizOptions]
        newOptions[index] = value
        setQuizOptions(newOptions)
    }

    const toggleCorrectAnswer = (index: number) => {
        const newCorrectAnswers = [...correctAnswers]
        newCorrectAnswers[index] = !newCorrectAnswers[index]
        setCorrectAnswers(newCorrectAnswers)
    }

    const launchQuiz = () => {
        if (!quizQuestion.trim() || quizOptions.some((opt) => !opt.trim())) {
            toast({
                title: "Invalid Quiz",
                description: "Please fill in all quiz fields.",
                variant: "destructive",
            })
            return
        }

        const correctAnswerIndex = correctAnswers.findIndex((isCorrect) => isCorrect)
        if (correctAnswerIndex === -1) {
            toast({
                title: "Invalid Quiz",
                description: "Please select at least one correct answer.",
                variant: "destructive",
            })
            return
        }

        if (!socket) {
            toast({
                title: "Connection Error",
                description: "Socket not connected. Please refresh the page.",
                variant: "destructive",
            })
            return
        }

        const quiz = {
            id: Date.now().toString(),
            question: quizQuestion,
            options: quizOptions.filter((opt) => opt.trim()),
            correctAnswer: correctAnswerIndex,
            timeLimit,
            isActive: true,
        }

        socket.emit("new-quiz", { eventId: params.eventId, quiz })

        toast({
            title: "Quiz Launched!",
            description: "Participants can now answer the quiz.",
        })

        trackInteraction("quiz_created", {
            timestamp: Date.now(),
        })

        // Reset form
        setQuizQuestion("")
        setQuizOptions(["", ""])
        setCorrectAnswers([false, false])
        setTimeLimit(30)
    }

    // Q&A functions
    const toggleQASession = (enabled: boolean) => {
        setQaEnabled(enabled)
        if (enabled) {
            toast({
                title: "Q&A Session Started",
                description: "Participants can now submit questions.",
            })
        } else {
            toast({
                title: "Q&A Session Stopped",
                description: "Participants can no longer submit questions.",
            })
        }
    }

    const approveQuestion = (questionId: string) => {
        setPendingQuestions((prev) => prev.map((q) => (q.id === questionId ? { ...q, approved: true } : q)))
        if (socket) {
            socket.emit("question-approved", { eventId: params.eventId, questionId })
        }
        toast({
            title: "Question Approved",
            description: "The question is now visible to all participants.",
        })
    }

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
                            {/* Go Live / End Event Buttons */}
                            <div className="flex items-center space-x-2">
                                {!isLive ? (
                                    <Button
                                        onClick={async (e) => {
                                            e.preventDefault();
                                            await goLive();
                                            // Navigate to live page after going live
                                            setTimeout(() => {
                                                router.push(`/live/${params.eventId}`);
                                            }, 1000);
                                        }}
                                        disabled={loading}
                                        variant="default"
                                        size="sm"
                                        className="btn-secondary py-3 rounded-xl">
                                        <Play className="h-4 w-4 mr-2" />
                                        Go Live
                                    </Button>
                                ) : (
                                    <>
                                        <Link href={`/live/${params.eventId}`}>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="py-3 rounded-xl">
                                                <Settings className="h-4 w-4 mr-2" />
                                                View Live
                                            </Button>
                                        </Link>
                                        <Button
                                            onClick={endEvent}
                                            disabled={loading}
                                            variant="destructive"
                                            size="sm"
                                            className="py-3 rounded-xl">
                                            <Square className="h-4 w-4 mr-2" />
                                            End Event
                                        </Button>
                                    </>
                                )}
                            </div>
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
                                    {/* Screen Share Preview */}
                                    <ScreenSharePreview 
                                        eventId={params.eventId as string} 
                                        isHost={true}
                                        autoStart={autoStartScreenShare}
                                    />
                                    
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
                                                <Link href={`/live/${params.eventId}`}>
                                                    <Button className="btn-secondary flex items-center space-x-2 p-4 rounded-xl w-full">
                                                        <Eye className="w-5 h-5" />
                                                        <span>Preview</span>
                                                </Button>
                                                </Link>
                                                <Button 
                                                    className="btn-secondary flex items-center space-x-2 p-4 rounded-xl"
                                                    onClick={() => setActiveTab("poll")}
                                                >
                                                    <Plus className="w-5 h-5" />
                                                    <span>Add Poll</span>
                                                </Button>
                                                <Button 
                                                    className="btn-secondary flex items-center space-x-2 p-4 rounded-xl"
                                                    onClick={() => setActiveTab("quiz")}
                                                >
                                                    <Plus className="w-5 h-5" />
                                                    <span>Add Quiz</span>
                                                </Button>
                                                <Button 
                                                    className="btn-secondary flex items-center space-x-2 p-4 rounded-xl"
                                                    onClick={() => setActiveTab("qa")}
                                                >
                                                    <MessageCircle className="w-5 h-5" />
                                                    <span>Q&A</span>
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
                                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                                                        value={pollQuestion}
                                                        onChange={(e) => setPollQuestion(e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <div>
                                                        <Label className="text-white font-medium text-lg">Options</Label>
                                                    </div>
                                                    {pollOptions.map((option, index) => (
                                                    <Input
                                                            key={index}
                                                            className="border-white/20 text-white placeholder:text-subtle rounded-xl h-12"
                                                            placeholder={`Option ${index + 1}`}
                                                            value={option}
                                                            onChange={(e) => updatePollOption(index, e.target.value)}
                                                        />
                                                    ))}
                                                </div>
                                                <div className="space-y-2">
                                                    <Button
                                                        variant="default"
                                                        size="sm"
                                                        className="btn-secondary w-full rounded-xl"
                                                        onClick={addPollOption}
                                                    >
                                                        <Plus className="w-4 h-4 mr-2" />
                                                        Add Option
                                                    </Button>
                                                    <Button
                                                        variant="default"
                                                        size="sm"
                                                        className="btn-secondary w-full rounded-xl"
                                                        onClick={launchPoll}
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
                                                        value={quizQuestion}
                                                        onChange={(e) => setQuizQuestion(e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <div>
                                                        <Label className="text-white font-medium text-lg">Answer Options</Label>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {quizOptions.map((option, index) => (
                                                            <div key={index} className="flex items-center space-x-2 glass-card p-2 rounded-xl">
                                                            <Input
                                                                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                                                                    className="flex-1 border-white/20 text-white placeholder:text-subtle rounded-lg"
                                                                    value={option}
                                                                    onChange={(e) => updateQuizOption(index, e.target.value)}
                                                                />
                                                                <Switch 
                                                                    checked={correctAnswers[index]}
                                                                    onCheckedChange={() => toggleCorrectAnswer(index)}
                                                                />
                                                            <span className="text-subtle font-medium">Correct</span>
                                                        </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <Label className="text-white font-medium text-sm">Time Limit (seconds)</Label>
                                                            <Input
                                                                type="number"
                                                                min="10"
                                                                max="300"
                                                                value={timeLimit}
                                                                onChange={(e) => setTimeLimit(Number(e.target.value))}
                                                                className="mt-2 border-white/20 text-white rounded-xl h-12"
                                                            />
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="default"
                                                        size="sm"
                                                        className="btn-secondary w-full rounded-xl"
                                                        onClick={addQuizOption}
                                                    >
                                                        <Plus className="w-4 h-4 mr-2" />
                                                        Add Option
                                                    </Button>
                                                    <Button
                                                        variant="default"
                                                        size="sm"
                                                        className="btn-secondary w-full rounded-xl"
                                                        onClick={launchQuiz}
                                                    >
                                                        Launch Quiz
                                                    </Button>
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="qa" className="space-y-6 mt-8">
                                            <div className="space-y-6">
                                                <div className="flex items-center justify-between glass-card p-4 rounded-xl">
                                                    <div>
                                                    <Label className="text-white font-medium text-lg">Q&A Session</Label>
                                                        <p className="text-subtle text-sm mt-1">
                                                    Allow participants to submit questions during the event
                                                </p>
                                                    </div>
                                                    <Switch 
                                                        checked={qaEnabled}
                                                        onCheckedChange={toggleQASession}
                                                    />
                                                </div>
                                                
                                                {qaEnabled && (
                                                    <div className="space-y-4">
                                                        <h4 className="text-white font-medium">Pending Questions</h4>
                                                        {pendingQuestions.filter(q => !q.approved).length === 0 ? (
                                                            <p className="text-subtle text-center py-4">No pending questions</p>
                                                        ) : (
                                                            <div className="space-y-3">
                                                                {pendingQuestions.filter(q => !q.approved).map((question) => (
                                                                    <div key={question.id} className="glass-card p-4 rounded-xl">
                                                                        <div className="flex items-start justify-between">
                                                                            <div className="flex-1">
                                                                                <p className="text-white font-medium">{question.question}</p>
                                                                                <p className="text-subtle text-sm mt-1">by {question.user}</p>
                                            </div>
                                            <Button
                                                size="sm"
                                                                                className="btn-secondary ml-2"
                                                                                onClick={() => approveQuestion(question.id)}
                                                                            >
                                                                                <Eye className="w-4 h-4 mr-2" />
                                                                                Approve
                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
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
                                            <div className="text-2xl font-bold text-gradient">{participantCount.toLocaleString()}</div>
                                            <div className="text-sm text-subtle">Participants</div>
                                        </div>
                                        <div className="text-center glass-card p-4 rounded-xl hover-lift">
                                            <div className="text-2xl font-bold text-green-400">{engagementRate}%</div>
                                            <div className="text-sm text-subtle">Engagement</div>
                                        </div>
                                        <div className="text-center glass-card p-4 rounded-xl hover-lift">
                                            <div className="text-2xl font-bold text-blue-400">{messageCount.toLocaleString()}</div>
                                            <div className="text-sm text-subtle">Chat Messages</div>
                                        </div>
                                        <div className="text-center glass-card p-4 rounded-xl hover-lift">
                                            <div className="text-2xl font-bold text-purple-400">{eventDuration}</div>
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
                                            {participants.length === 0 ? (
                                                <p className="text-subtle text-center py-4">No participants yet</p>
                                            ) : (
                                                participants.map((participant) => (
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
                                                ))
                                            )}
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
