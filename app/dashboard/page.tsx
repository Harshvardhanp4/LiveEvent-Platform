"use client"

import { useEffect, useState } from "react"
//import { useAuth } from "@/components/providers/auth-provider"
import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { Calendar, Users, Play, Plus, Clock, TrendingUp, BarChart3, Video, Star, Trophy } from "lucide-react"
import { useSession } from "next-auth/react"
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
            const isUpcoming = new Date(event.startTime) >= new Date();
            return isUpcoming;
        })
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    const visibleEvents = filteredEvents.slice(0, visibleCount);

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

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Quick Actions */}
                        <Card className="bg-slate-800 border-slate-700 rounded-2xl shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-2xl text-white">Quick Actions</CardTitle>
                                <CardDescription className="text-slate-400">Get started with common tasks</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-2 gap-4">

                                    <Link href="/events">
                                        <Button
                                            variant="outline"
                                            // onClick={() => setShowCompletedOnly(false)}
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

                        {/* Upcoming Events */}
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

                    {/* Sidebar */}
                    <div className="space-y-8">
                        {/* Recent Activity */}
                        <Card className="bg-slate-800 border-slate-700 rounded-2xl shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-xl text-white flex items-center space-x-2">
                                    <BarChart3 className="w-5 h-5 text-purple-400" />
                                    <span>Recent Activity</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {[
                                        {
                                            action: "Joined Tech Innovation Summit",
                                            time: "2 hours ago",
                                            icon: Users,
                                            color: "text-blue-400",
                                        },
                                        {
                                            action: "Created Web Development Masterclass",
                                            time: "1 day ago",
                                            icon: Plus,
                                            color: "text-green-400",
                                        },
                                        { action: "Completed AI Basics Quiz", time: "2 days ago", icon: Trophy, color: "text-yellow-400" },
                                    ].map((activity, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-700 transition-colors"
                                        >
                                            <div className={`w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center`}>
                                                <activity.icon className={`w-5 h-5 ${activity.color}`} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-white">{activity.action}</p>
                                                <p className="text-xs text-slate-400">{activity.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Live Events */}
                        <Card className="bg-slate-800 border-slate-700 rounded-2xl shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-xl flex items-center space-x-2 text-white">
                                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                    <span>Live Now</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                                    <h4 className="font-semibold text-white mb-2">Tech Innovation Summit</h4>
                                    <p className="text-sm text-slate-300 mb-3">1,247 participants</p>
                                    <Progress value={75} className="mb-3 h-2" />
                                    <Link href="/live/1">
                                        <Button className="w-full bg-red-500 hover:bg-red-600 text-white">Join Live Event</Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Performance */}
                        <Card className="bg-slate-800 border-slate-700 rounded-2xl shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-xl text-white">Performance</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-slate-400">Event Completion Rate</span>
                                        <span className="text-white">92%</span>
                                    </div>
                                    <Progress value={92} className="h-2" />
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-slate-400">Participant Satisfaction</span>
                                        <span className="text-white">4.8/5</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={`h-4 w-4 ${star <= 4 ? "text-yellow-400 fill-current" : "text-slate-600"}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
