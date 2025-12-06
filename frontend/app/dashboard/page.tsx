"use client"

import { useEffect, useState } from "react"
//import { useAuth } from "@/components/providers/auth-provider"
import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { Calendar, Users, Play, Plus, Clock, TrendingUp, Video, Star, Trophy } from "lucide-react"
import { useSession } from "@/node_modules/next-auth/react"
import { useToast } from "@/hooks/use-toast"

interface Event {
    id: string
    title: string
    description: string
    startTime: string
    isLive: boolean
    completedEvent: boolean
    role: "host" | "participant"
    _count: {
        participants: number
    }
}

interface DashboardStats {
    eventsAttended: number
    hoursWatched: number
    quizScore: number
    networkSize: number
}

export default function DashboardPage() {
    const { data: session } = useSession()
    const user = session?.user
    const [events, setEvents] = useState<Event[]>([])
    const [stats, setStats] = useState<DashboardStats>({
        eventsAttended: 12,
        hoursWatched: 48,
        quizScore: 94,
        networkSize: 156,
    })
    const [loading, setLoading] = useState(true)
    const [visibleCount, setVisibleCount] = useState(5);
    const [showCompletedOnly, setShowCompletedOnly] = useState(false);
    const { toast } = useToast()

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/events");
            if (response.ok) {
                const data = await response.json();
                setEvents(data.events);
                toast({
                    title: "Events loaded",
                    description: "Dashboard events fetched successfully.",
                });
            } else {
                toast({
                    title: "Failed to load events",
                    description: "Could not fetch dashboard events.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
            toast({
                title: "Error",
                description: "Something went wrong while fetching events.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const filteredEvents = events
        .filter((event) => {
            if (showCompletedOnly) {
                return event.completedEvent === true;
            }
            // Show only upcoming events (startTime is in the future from current date and time)
            const now = new Date();
            const eventStartTime = new Date(event.startTime);
            // Only show events that haven't started yet (startTime is in the future)
            return eventStartTime > now && !event.completedEvent;
        })
        .sort((a, b) => {
            // Sort by start time (earliest first)
            return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
        });

    const visibleEvents = filteredEvents.slice(0, visibleCount);

    // Find the current live event
    const liveEvent = events.find((event) => event.isLive === true && !event.completedEvent);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900">
                <Navbar />
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
                        <p className="mt-4 text-slate-400">Loading dashboard...</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-900">
            <Navbar />

            <div className="container mx-auto px-6 py-8">
                {/* Welcome Section */}
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
                        Welcome back,{" "}
                        <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                            {user?.name?.split(" ")[0] || "User"}!
                        </span>
                    </h1>
                    <p className="text-xl text-slate-400">Here's what's happening with your events</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <Card className="bg-slate-800 border-slate-700 rounded-2xl shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 rounded-xl bg-purple-600/20 flex items-center justify-center">
                                    <Calendar className="w-6 h-6 text-purple-400" />
                                </div>
                                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                    <TrendingUp className="w-3 h-3 mr-1" />
                                    +2
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm text-slate-400 mb-1">Events Attended</p>
                                <p className="text-3xl font-bold text-white">{stats.eventsAttended}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-800 border-slate-700 rounded-2xl shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center">
                                    <Clock className="w-6 h-6 text-blue-400" />
                                </div>
                                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                    <TrendingUp className="w-3 h-3 mr-1" />
                                    +8
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm text-slate-400 mb-1">Hours Watched</p>
                                <p className="text-3xl font-bold text-white">{stats.hoursWatched}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-800 border-slate-700 rounded-2xl shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 rounded-xl bg-yellow-600/20 flex items-center justify-center">
                                    <Trophy className="w-6 h-6 text-yellow-400" />
                                </div>
                                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                    <TrendingUp className="w-3 h-3 mr-1" />
                                    +5%
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm text-slate-400 mb-1">Quiz Score</p>
                                <p className="text-3xl font-bold text-white">{stats.quizScore}%</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-800 border-slate-700 rounded-2xl shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 rounded-xl bg-green-600/20 flex items-center justify-center">
                                    <Users className="w-6 h-6 text-green-400" />
                                </div>
                                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                    <TrendingUp className="w-3 h-3 mr-1" />
                                    +12
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm text-slate-400 mb-1">Network Size</p>
                                <p className="text-3xl font-bold text-white">{stats.networkSize}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-8">
                    {/* Quick Actions and Live Now - Side by Side */}
                <div className="grid lg:grid-cols-3 gap-8">
                        {/* Quick Actions */}
                        <div className="lg:col-span-2">
                            <Card className="bg-slate-800 border-slate-700 rounded-2xl shadow-lg h-full">
                            <CardHeader>
                                <CardTitle className="text-2xl text-white">Quick Actions</CardTitle>
                                <CardDescription className="text-slate-400">Get started with common tasks</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <Link href="/events">
                                        <Button
                                            variant="outline"
                                            className="w-full h-20 flex flex-col items-center space-y-2 border-slate-600 text-slate-300 hover:bg-slate-700"
                                        >
                                            <Calendar className="w-6 h-6" />
                                            <span className="font-semibold">Browse Events</span>
                                        </Button>
                                    </Link>
                                    <Link href="/events/builder">
                                        <Button
                                            variant="outline"
                                            className="w-full h-20 flex flex-col items-center space-y-2 border-slate-600 text-slate-300 hover:bg-slate-700"
                                        >
                                            <Plus className="w-6 h-6" />
                                            <span className="font-semibold">Create Events</span>
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                        </div>

                        {/* Live Now - Aligned with Quick Actions */}
                        <div className="h-full">
                            {liveEvent ? (
                                <Card className="relative overflow-hidden bg-gradient-to-br from-red-600/20 via-red-700/15 to-red-800/10 border-2 border-red-500/40 rounded-2xl shadow-xl ring-2 ring-red-500/20 hover:ring-red-500/30 transition-all duration-300 h-full flex flex-col">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full blur-2xl"></div>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-lg text-white flex items-center space-x-2">
                                            <div className="relative">
                                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                                <div className="absolute inset-0 w-2 h-2 bg-red-500 rounded-full animate-ping opacity-75"></div>
                                            </div>
                                            <span>Live Now</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="relative flex-1 flex flex-col justify-between">
                                        <div className="space-y-3">
                                            <div>
                                                <h4 className="font-semibold text-white text-base mb-1.5 line-clamp-2">{liveEvent.title}</h4>
                                                <div className="flex items-center space-x-1.5 text-xs text-slate-300">
                                                    <Users className="w-3.5 h-3.5 text-red-400" />
                                                    <span>{liveEvent._count.participants} participants</span>
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <div className="flex items-center justify-between text-xs text-slate-400">
                                                    <span>Event Progress</span>
                                                    <span className="font-semibold text-red-400">Live</span>
                                                </div>
                                                <Progress value={100} className="h-1.5 bg-slate-700" />
                                            </div>
                                        </div>
                                        <Link href={`/live/${liveEvent.id}`} className="block mt-4">
                                            <Button size="sm" className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold shadow-md shadow-red-500/25 hover:shadow-red-500/40 transition-all duration-200">
                                                <Play className="w-3.5 h-3.5 mr-1.5" />
                                                Join Live Event
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card className="bg-slate-800 border-slate-700 rounded-2xl shadow-lg h-full flex flex-col">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-lg text-white flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                                            <span>Live Now</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex-1 flex flex-col items-center justify-center text-center">
                                        <div className="w-12 h-12 rounded-full bg-slate-700/50 flex items-center justify-center mb-3">
                                            <Video className="w-6 h-6 text-slate-400" />
                                        </div>
                                        <h3 className="text-base font-semibold text-white mb-1.5">No Events Live Right Now</h3>
                                        <p className="text-xs text-slate-400 mb-4 px-2">
                                            There are currently no live events. Check back later or browse upcoming events.
                                        </p>
                                        <Link href="/events">
                                            <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                                                <Calendar className="w-3.5 h-3.5 mr-1.5" />
                                                Browse Events
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>

                    {/* Upcoming Events - Full Width */}
                        <Card className="bg-slate-800 border-slate-700 rounded-2xl shadow-lg">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-2xl text-white mb-2">
                                        {showCompletedOnly ? "Completed Events" : "Upcoming Events"}
                                    </CardTitle>
                                    <CardDescription className="text-slate-400">
                                        {showCompletedOnly
                                            ? "Events you’ve hosted recently"
                                            : "Events you're hosting or coming your way"}
                                    </CardDescription>
                                </div>
                                <Button
                                    onClick={() => setShowCompletedOnly(prev => !prev)}
                                    className="flex flex-col items-center space-y-2 border-slate-600 text-slate-300 hover:bg-slate-700"
                                >
                                    {/* <Video className="w-6 h-6" /> */}
                                    <span className="font-semibold">
                                        {showCompletedOnly ? "Upcoming Events" : "Completed Events"}
                                    </span>
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {visibleEvents.map((event) => (
                                        <div
                                            key={event.id}
                                            className="flex items-center justify-between p-4 rounded-xl bg-slate-700 hover:bg-slate-600 transition-all"
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                                                    <Calendar className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-white">{event.title}</h4>
                                                    <div className="flex items-center space-x-4 text-sm text-slate-400">
                                                        <span className="flex items-center space-x-1">
                                                            <Clock className="w-3 h-3" />
                                                            <span>
                                                                {new Date(event.startTime).toLocaleDateString("en-GB")} at{" "}
                                                                {new Date(event.startTime).toLocaleTimeString([], {
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                })}
                                                            </span>
                                                        </span>

                                                        <span className="flex items-center space-x-1">
                                                            <Users className="w-3 h-3" />
                                                            <span>{event._count.participants}</span>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <Badge className={
                                                    event.completedEvent
                                                        ? "bg-green-600/30 text-green-400 border-green-600/30"
                                                        : event.isLive
                                                            ? "bg-red-600/20 text-red-400 border-red-600/30 animate-pulse"
                                                            : "bg-blue-600/30 text-blue-400 border-blue-600/30"
                                                }>
                                                    {event.completedEvent
                                                        ? "Completed"
                                                        : event.isLive
                                                            ? "🔴 Live"
                                                            : "Scheduled"}
                                                </Badge>
                                                {event.isLive ? (
                                                    <Link href={`/live/${event.id}`}>
                                                        <Button
                                                            size="sm"
                                                            className="bg-red-500 hover:bg-red-600 text-white">
                                                            <Play className="w-4 h-4 mr-2" />
                                                            Join
                                                        </Button>
                                                    </Link>
                                                ) : (
                                                    <Link href={`/events/${event.id}`}>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="border-slate-600 text-slate-300 hover:bg-slate-700"
                                                        >
                                                            View
                                                        </Button>
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {/* Show More Button */}
                                    {visibleCount < filteredEvents.length && (
                                        <div className="flex justify-center">
                                            <span
                                                onClick={() => setVisibleCount((prev) => prev + 5)}
                                                className="pt-4 text-blue-400 hover:underline cursor-pointer text-sm"
                                            >
                                                Show more
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                </div>
            </div>
        </div>
    )
}
