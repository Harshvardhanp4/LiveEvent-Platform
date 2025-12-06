"use client"

import { useEffect, useState } from "react"
//import { useAuth } from "@/components/providers/auth-provider"
import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { HostControlButton } from "@/components/events/host-control-button"
import Link from "next/link"
import { Calendar, Users, Search, Filter, Play, MapPin, Heart, Share2 } from "lucide-react"
import { useSession } from "@/node_modules/next-auth/react"
import { useToast } from "@/hooks/use-toast"
import { AvatarImage } from "@radix-ui/react-avatar"

interface Event {
    id: string
    title: string
    description: string
    startTime: string
    duration: number
    isLive: boolean
    completedEvent: boolean
    category: string
    visibility: string
    capacity: number
    rating: number
    bannerUrl: string
    host: {
        id: string
        name: string
        image: string
    }
    _count: {
        participants: number
    }
}

export default function EventsPage() {
    const { data: session } = useSession()
    const user = session?.user
    //const { user } = useAuth()
    const [events, setEvents] = useState<Event[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [categoryFilter, setCategoryFilter] = useState("all")
    const { toast } = useToast()

    useEffect(() => {
        fetchEvents()
    }, [])

    const fetchEvents = async () => {
        try {
            setLoading(true);

            const response = await fetch("/api/events");

            if (response.ok) {
                const data = await response.json();
                setEvents(data.events);

                toast({
                    title: "Events loaded",
                    description: "Events fetched successfully.",

                });
            } else {
                toast({
                    title: "Failed to load events",
                    description: "Could not fetch events.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Failed to fetch events:", error)

            toast({
                title: "Error",
                description: "Something went wrong while fetching the events.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    // Mock data for demonstration
    // const mockEvents: Event[] = [
    //     {
    //         id: "1",
    //         title: "Tech Innovation Summit 2024",
    //         description: "Join us for an exciting journey through the latest technological innovations.",
    //         startTime: "2024-12-15T14:00:00Z",
    //         duration: 3,
    //         isLive: true,
    //         category: "Technology",
    //         visibility: "Public",
    //         capacity: 2000,
    //         rating: 4.8,
    //         host: {
    //             id: "host1",
    //             name: "rohitpithani13",
    //         },
    //         _count: { participants: 1247 },
    //     },
    //     {
    //         id: "2",
    //         title: "Web Development Masterclass",
    //         description: "Learn modern web development techniques from industry experts.",
    //         startTime: "2024-12-20T10:00:00Z",
    //         duration: 2,
    //         isLive: false,
    //         category: "Education",
    //         visibility: "Public",
    //         capacity: 500,
    //         rating: 4.6,
    //         host: {
    //             id: "host2",
    //             name: "webdev_expert",
    //         },
    //         _count: { participants: 342 },
    //     },
    //     {
    //         id: "3",
    //         title: "AI & Machine Learning Workshop",
    //         description: "Dive deep into artificial intelligence and machine learning concepts.",
    //         startTime: "2024-12-25T16:00:00Z",
    //         duration: 4,
    //         isLive: false,
    //         category: "Technology",
    //         visibility: "Public",
    //         capacity: 1000,
    //         rating: 4.9,
    //         host: {
    //             id: "host3",
    //             name: "ai_researcher",
    //         },
    //         _count: { participants: 756 },
    //     },
    // ]
    // setEvents(mockEvents)

    const now = new Date()
    const today = new Date(now)
    today.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)

    const dayAfterTomorrow = new Date(tomorrow)
    dayAfterTomorrow.setDate(tomorrow.getDate() + 1)

    const next7 = new Date(today)
    next7.setDate(today.getDate() + 7)

    let filteredEvents = events.filter((event) => {
        const eventDate = new Date(event.startTime)
        const eventDateOnly = new Date(eventDate)
        eventDateOnly.setHours(0, 0, 0, 0)

        const matchesSearch =
            event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.description.toLowerCase().includes(searchTerm.toLowerCase())

        if (!matchesSearch) return false

        let matchesFilter = false

        switch (categoryFilter) {
            case "today":
                matchesFilter = eventDateOnly.getTime() === today.getTime()
                break
            case "tomorrow":
                matchesFilter = eventDateOnly.getTime() === tomorrow.getTime()
                break
            case "next7":
                // Events from tomorrow up to 7 days from today
                matchesFilter = eventDateOnly > today && eventDateOnly <= next7
                break
            case "completed":
                // Show only completed events
                matchesFilter = event.completedEvent === true
                break
            case "all":
            default:
                matchesFilter = true // Show all events
        }

        return matchesFilter
    })

    // Sort events: Live first, then by start time
    filteredEvents = filteredEvents.sort((a, b) => {
        // Live events first
        if (a.isLive && !b.isLive) return -1
        if (!a.isLive && b.isLive) return 1
        // Then sort by start time
        return new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    })

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900">
                <Navbar />
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
                        <p className="mt-4 text-slate-400">Loading events...</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-900">
            <Navbar />

            <div className="container mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">Discover Events</h1>
                    <p className="text-slate-400">Find and join live events that interest you</p>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                        <Input
                            placeholder="Search events..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 bg-slate-800 border-slate-700 text-white placeholder-slate-400"
                        />
                    </div>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-full md:w-48 bg-slate-800 border-slate-700 text-white">
                            <Filter className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Filter by time" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700 text-white">
                            <SelectItem value="all" className="focus:bg-slate-700">All Events</SelectItem>
                            <SelectItem value="today" className="focus:bg-slate-700">Today</SelectItem>
                            <SelectItem value="tomorrow" className="focus:bg-slate-700">Tomorrow</SelectItem>
                            <SelectItem value="next7" className="focus:bg-slate-700">Next 7 Days</SelectItem>
                            <SelectItem value="completed" className="focus:bg-slate-700">Completed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Events Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredEvents.map((event) => (
                        <Card
                            key={event.id}
                            className="bg-slate-800 border-slate-700 hover:border-purple-500 transition-all group flex flex-col h-full"
                        >
                            <div className="relative">
                                <img
                                    src={event.bannerUrl || "/placeholder.svg"}
                                    alt={event.title}
                                    className="w-full h-48 object-cover rounded-t-lg brightness-[0.6] contrast-[1.1]"
                                />
                                <div className="absolute top-4 left-4">
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
                                </div>

                                <div className="absolute top-4 right-4 flex space-x-2">
                                    <Button size="sm" variant="ghost" className="bg-black/20 hover:bg-black/40">
                                        <Heart className="w-4 h-4" />
                                    </Button>
                                    <Button size="sm" variant="ghost" className="bg-black/20 hover:bg-black/40">
                                        <Share2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            <CardHeader className="flex flex-col justify-between flex-1">
                                {/* <div className="flex items-center justify-between mb-2">
                                    <Badge variant="outline" className="border-purple-500/30 text-purple-400">
                                        {event.category}
                                    </Badge>
                                    <span className="text-lg font-bold text-green-400">{event.price}</span>
                                </div> */}
                                <CardTitle className="text-white group-hover:text-purple-400 transition-colors">
                                    {event.title}
                                </CardTitle>
                                <CardDescription className="text-white/70">{event.description}</CardDescription>
                            </CardHeader>

                            <CardContent className="flex flex-col justify-between flex-1">
                                <div className="mt-auto pt-4 border-t border-slate-700">
                                    <div className="space-y-3 mb-4 ">
                                        <div className="flex items-center text-sm text-white/60 ">
                                            <Calendar className="w-4 h-4 mr-2" />
                                            {new Date(event.startTime).toLocaleDateString("en-GB")} at{" "}
                                            {new Date(event.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                        </div>
                                        <div className="flex items-center text-sm text-white/60">
                                            <Users className="w-4 h-4 mr-2" />
                                            {event._count.participants} participants
                                        </div>
                                        <div className="flex items-center text-sm text-white/60">
                                            <MapPin className="w-4 h-4 mr-2" />
                                            Hosted by {event.host.name}
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom section: Avatar, Buttons, Control Panel */}
                                <div className="mt-auto pt-4 border-t border-slate-700">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Avatar className="w-6 h-6">
                                                <AvatarImage src={event.host.image || "/placeholder.svg"} />
                                                <AvatarFallback className="bg-purple-600 text-white text-xs">
                                                    {event.host.name.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-white text-sm font-medium">{event.host.name}</p>
                                                <p className="text-slate-400 text-xs">Event Host</p>
                                            </div>
                                        </div>
                                        {/* Action Buttons */}
                                        <div className="flex gap-2">
                                            <Link href={`/events/${event.id}`} className="flex-1">
                                                <Button className="w-full" variant="outline">
                                                    View Details
                                                </Button>
                                            </Link>
                                            {event.isLive && (
                                                <Link href={`/live/${event.id}`}>
                                                    <Button className="bg-red-500 hover:bg-red-600">
                                                        <Play className="h-4 w-4 mr-2" />
                                                        Join Live
                                                    </Button>
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                    <div className="pt-2">
                                        <HostControlButton eventId={event.id} className="w-full" size="sm" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {filteredEvents.length === 0 && (
                    <div className="text-center py-12">
                        <h3 className="text-xl font-semibold text-white mb-2">No events found</h3>
                        <p className="text-slate-400">Try adjusting your search or filter criteria</p>
                    </div>
                )}
            </div>
        </div>
    )
}
