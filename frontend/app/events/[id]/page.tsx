"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
//import { useAuth } from "@/components/providers/auth-provider"
import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import {
    Calendar,
    Users,
    Play,
    Edit,
    Share,
    Star,
    MapPin,
    Settings,
    CalendarPlus,
    ArrowLeft,
    CheckCircle,
    Heart,
    Share2,
} from "lucide-react"
import { useSession } from "@/node_modules/next-auth/react"
import { AvatarImage } from "@radix-ui/react-avatar"

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
        image: string
        hostId: string
        rating: number
    }
    _count: {
        participants: number
    }
    interactiveFeatures: string[]
}

export default function EventDetailPage() {
    const params = useParams()
    const { data: session } = useSession()
    const user = session?.user
    // const { user } = useAuth()
    const [event, setEvent] = useState<Event | null>(null)
    const [loading, setLoading] = useState(true)
    const [joining, setJoining] = useState(false)
    const [hasJoined, setHasJoined] = useState(false)
    const { toast } = useToast()

    useEffect(() => {
        if (params.id) {
            fetchEvent(params.id as string);
        }
    }, [params?.id]);

    const fetchEvent = async (id: string) => {
        try {
            setLoading(true);

            const response = await fetch(`/api/events/${id}`);

            if (response.ok) {
                const data = await response.json();
                setEvent(data.event);
                setHasJoined(data.hasJoined)

                toast({
                    title: "Event loaded",
                    description: "Event details fetched successfully.",
                });
            } else {
                toast({
                    title: "Failed to load event",
                    description: "Could not fetch the event details.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Failed to fetch event:", error);

            toast({
                title: "Error",
                description: "Something went wrong while fetching the event.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    // const fetchEvent = async () => {
    //     try {
    //         // Mock data for demonstration
    //         const mockEvent: Event = {
    //             id: params.id as string,
    //             title: "Tech Innovation Summit 2024",
    //             description:
    //                 "Join us for an exciting journey through the latest technological innovations. This interactive summit features keynote speakers, live Q&A sessions, polls, and networking opportunities. Discover emerging trends in AI, blockchain, IoT, and more while connecting with like-minded professionals from around the world.",
    //             startTime: "2024-12-15T14:00:00Z",
    //             duration: 3,
    //             isLive: false,
    //             category: "Technology",
    //             visibility: "Public",
    //             registrationRequired: true,
    //             capacity: 2000,
    //             rating: 4.8,
    //             host: {
    //                 id: "host1",
    //                 name: "rohitpithani13",
    //                 hostId: "user_J75QR13Q77793",
    //                 rating: 4.8,
    //             },
    //             _count: { participants: 1247 },
    //             interactiveFeatures: ["Live Chat", "Live Polls", "Interactive Quiz", "HD Video Streaming", "Networking"],
    //         }
    //         setEvent(mockEvent)
    //     } catch (error) {
    //         console.error("Failed to fetch event:", error)
    //     } finally {
    //         setLoading(false)
    //     }
    // }

    const handleJoinEvent = async () => {
        if (!user) {
            toast({
                title: "Please log in",
                description: "You need to be logged in to join events.",
                variant: "destructive",
            })
            return
        }

        setJoining(true)
        try {
            const response = await fetch(`/api/events/${params.id}/join`, {
                method: "POST",
            })

            const data = await response.json();

            if (response.ok) {
                toast({
                    title: "Joined event!",
                    description: "You have successfully joined the event.",
                })
                setHasJoined(true)
                fetchEvent(params.id as string);
            } else if (data.error) {
                setHasJoined(true)
                toast({
                    title: "Already Registered",
                    description: "You have alredy registered for the event"
                })
            } else {
                toast({
                    title: "Failed to join",
                    description: "Could not join the event. Please try again.",
                    variant: "destructive",
                })
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Something went wrong. Please try again.",
                variant: "destructive",
            })
        } finally {
            setJoining(false)
        }
    }

    const isHost = user?.id === event?.host.id || user?.role === "ADMIN" || user?.role === "HOST"
    const capacityPercentage = event ? Math.round((event._count.participants / event.capacity) * 100) : 0

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900">
                <Navbar />
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
                <Navbar />
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-white mb-4">Event Not Found</h1>
                        <p className="text-slate-400">The event you're looking for doesn't exist.</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-900">
            <Navbar />

            <div className="container mx-auto px-6 py-8">
                {/* Hero Section */}
                <div className="relative mb-8 rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                    {/* Banner Image with Overlay */}
                    <div className="relative">
                        <img
                            src={event.bannerUrl || "/placeholder.svg"}
                            alt={event.title}
                            className="w-full h-75 object-cover rounded-t-lg brightness-[0.6] contrast-[1.1]"
                        />

                        {/* Top-left Badge */}
                        <div className="absolute top-4 left-4">
                            <Badge className={`${event.isLive
                                ? "bg-red-600/20 text-red-400 border-red-600/30 animate-pulse"
                                : "bg-blue-600/20 text-blue-400 border-blue-600/30"
                                }`}>
                                {event.isLive ? "🔴 Live" : "Scheduled"}
                            </Badge>
                        </div>

                        {/* Top-right Buttons */}
                        <div className="absolute top-4 right-4 flex space-x-2">
                            <Button
                                size="sm"
                                variant="ghost"
                                className="bg-black/30 hover:bg-black/50 text-white border border-white/20"
                            >
                                <Heart className="w-4 h-4" />
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="bg-black/30 hover:bg-black/50 text-white border border-white/20"
                            >
                                <Share2 className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Text Overlay */}
                        <div className="absolute bottom-4 left-4">
                            <h1 className="text-3xl sm:text-4xl font-bold text-white drop-shadow-md">
                                {event.title}
                            </h1>
                            <p className="text-white text-sm drop-shadow-sm">
                                Hosted by {event.host.name}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* About This Event */}
                        <Card className="bg-slate-800 border-slate-700">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-white">About This Event</CardTitle>
                                    <div className="flex items-center gap-1">
                                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                        <span className="text-white font-semibold">{event.rating}</span>
                                    </div>
                                </div>
                                <p className="text-slate-400">Event ID: {event.id}</p>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Event Details */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="h-5 w-5 text-purple-400" />
                                        <div>
                                            <p className="text-white font-medium">
                                                {new Date(event.startTime).toLocaleDateString("en-US", {
                                                    weekday: "long",
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                })}
                                            </p>
                                            <p className="text-slate-400 text-sm">
                                                {new Date(event.startTime).toLocaleTimeString()} - {event.duration}hours
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <MapPin className="h-5 w-5 text-purple-400" />
                                        <div>
                                            <p className="text-white font-medium">Virtual Event</p>
                                            <p className="text-slate-400 text-sm">Online platform</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Users className="h-5 w-5 text-purple-400" />
                                        <div>
                                            <p className="text-white font-medium">{event._count.participants.toLocaleString()} Registered</p>
                                            {/* <p className="text-slate-400 text-sm">of {event.capacity.toLocaleString()} capacity</p> */}
                                        </div>
                                    </div>
                                </div>

                                {/* Event Description */}
                                <div>
                                    <h3 className="text-white font-semibold mb-3">Event Description</h3>
                                    <p className="text-slate-300 leading-relaxed">{event.description}</p>
                                </div>

                                {/* Interactive Features */}
                                {/* <div>
                                    <h3 className="text-white font-semibold mb-3">Interactive Features</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        {event.interactiveFeatures.map((feature, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4 text-green-400" />
                                                <span className="text-slate-300 text-sm">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div> */}

                                {/* Event Settings */}
                                <div>
                                    <h3 className="text-white font-semibold mb-3">Event Settings</h3>
                                    <div className="flex gap-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-slate-400">Visibility:</span>
                                            <Badge variant="outline" className="border-slate-600 text-slate-300">
                                                {event.visibility}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-slate-400">Registration:</span>
                                            <Badge variant="outline" className="border-slate-600 text-slate-300">
                                                {event.registrationRequired ? "Required" : "Open"}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Event Host */}
                        <Card className="bg-slate-800 border-slate-700">
                            <CardHeader>
                                <CardTitle className="text-white">Event Host</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-16 w-16">
                                        <AvatarImage src={event.host.image || "/placeholder.svg"} />
                                        <AvatarFallback className="bg-purple-600 text-white text-lg">
                                            {event.host.name.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <h3 className="text-white font-semibold text-lg">{event.host.name}</h3>
                                        <p className="text-slate-400">Event Organizer</p>
                                        <p className="text-slate-500 text-sm">Host ID: {event.host.id}</p>
                                        <div className="flex items-center gap-1 mt-1">
                                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                            <span className="text-slate-300 text-sm">{event.host.rating} Rating</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Manage Event / Join Event */}
                        {isHost ? (
                            <Card className="bg-slate-800 border-slate-700">
                                <CardHeader>
                                    <CardTitle className="text-white">Manage Event</CardTitle>
                                    <p className="text-slate-400 text-sm">Control your event settings and go live</p>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <Link href={`/host/${event.id}`}>
                                            <Button className="w-full bg-purple-600 hover:bg-purple-700">
                                                <Settings className="h-4 w-4 mr-2" />
                                                Host Control Panel
                                            </Button>
                                        </Link>
                                    </div>
                                    <Link href={`/events/${event.id}/edit`}>
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                        >
                                            <Edit className="w-4 h-4 mr-2" />
                                            Edit Event
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="bg-slate-800 border-slate-700">
                                <CardHeader>
                                    <CardTitle className="text-white">Join Event</CardTitle>
                                    <p className="text-slate-400 text-sm">Register to participate in this event</p>
                                </CardHeader>
                                <CardContent>
                                    <Button onClick={handleJoinEvent} disabled={joining || !user || hasJoined} className="w-full mb-4" size="lg">
                                        {joining ? "Joining..." : hasJoined ? "Registered" : "Register for Event"}
                                    </Button>
                                    {!user && (
                                        <p className="text-xs text-slate-500 text-center">
                                            <Link href="/auth" className="text-purple-400 hover:underline">
                                                Log in
                                            </Link>{" "}
                                            to join this event
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Event Statistics */}
                        <Card className="bg-slate-800 border-slate-700">
                            <CardHeader>
                                <CardTitle className="text-white">Event Statistics</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Registered</span>
                                    <span className="text-white font-semibold">{event._count.participants.toLocaleString()}</span>
                                </div>
                                {/* <div className="flex justify-between">
                                    <span className="text-slate-400">Capacity</span>
                                    <span className="text-white font-semibold">{event.capacity.toLocaleString()}</span>
                                </div> */}
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Duration</span>
                                    <span className="text-white font-semibold">{event.duration}hours</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Status</span>
                                    <Badge className="bg-blue-600">Published</Badge>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">{capacityPercentage}% capacity filled</span>
                                    </div>
                                    <Progress value={capacityPercentage} className="h-2" />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card className="bg-slate-800 border-slate-700">
                            <CardHeader>
                                <CardTitle className="text-white">Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {/* <Button variant="outline" className="w-full justify-start">
                                    <Share className="h-4 w-4 mr-2" />
                                    Share Event
                                </Button>
                                <Button variant="outline" className="w-full justify-start">
                                    <CalendarPlus className="h-4 w-4 mr-2" />
                                    Add to Calendar
                                </Button> */}
                                <Link href="/dashboard">
                                    <Button variant="outline" className="w-full justify-start">
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Back to Dashboard
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
