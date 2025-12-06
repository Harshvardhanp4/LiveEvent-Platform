"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
//import { useAuth } from "@/components/providers/auth-provider"
import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
    ArrowLeft,
    Save,
    Trash2,
    Upload,
    Calendar,
    Clock,
    Users,
    ImageIcon,
    AlertTriangle,
    Sparkles,
} from "lucide-react"
import Link from "next/link"
import { useSession } from "@/node_modules/next-auth/react"

interface Event {
    id: string
    title: string
    description: string
    startTime: string
    bannerUrl?: string
    hostId: string
    isLive: boolean
    host: {
        name: string
    }
    _count: {
        participants: number
    }
}

export default function EditEventPage() {
    const params = useParams()
    const router = useRouter()
    const { data: session } = useSession()
    const user = session?.user
    //const { user } = useAuth()
    const { toast } = useToast()

    const [event, setEvent] = useState<Event | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        startTime: "",
        bannerUrl: "",
    })

    const [errors, setErrors] = useState<Record<string, string>>({})

    useEffect(() => {
        if (params.id) {
            fetchEvent(params.id as string)
        }
    }, [params?.id]);


    const fetchEvent = async (id: string) => {
        try {
            const response = await fetch(`/api/events/${id}`)

            if (response.ok) {
                const eventData = await response.json()
                setEvent(eventData.event)
                setFormData({
                    title: eventData.title,
                    description: eventData.description,
                    startTime: new Date(eventData.startTime).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    }),
                    bannerUrl: eventData.bannerUrl || "",
                })
            } else if (response.status === 404) {
                toast({
                    title: "Event not found",
                    description: "The event you're trying to edit doesn't exist.",
                    variant: "destructive",
                })
                router.push("/dashboard")
            } else if (response.status === 403) {
                toast({
                    title: "Access denied",
                    description: "You don't have permission to edit this event.",
                    variant: "destructive",
                })
                router.push("/dashboard")
            }
        } catch (error) {
            console.error("Failed to fetch event:", error)
            toast({
                title: "Error",
                description: "Failed to load event details.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.title.trim()) {
            newErrors.title = "Title is required"
        } else if (formData.title.length < 3) {
            newErrors.title = "Title must be at least 3 characters"
        }

        if (!formData.description.trim()) {
            newErrors.description = "Description is required"
        } else if (formData.description.length < 10) {
            newErrors.description = "Description must be at least 10 characters"
        }

        if (!formData.startTime) {
            newErrors.startTime = "Start time is required"
        } else {
            const startDate = new Date(formData.startTime)
            const now = new Date()
            if (startDate <= now) {
                newErrors.startTime = "Start time must be in the future"
            }
        }

        if (formData.bannerUrl && !isValidUrl(formData.bannerUrl)) {
            newErrors.bannerUrl = "Please enter a valid URL"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const isValidUrl = (string: string) => {
        try {
            new URL(string)
            return true
        } catch (_) {
            return false
        }
    }

    const handleSave = async () => {
        if (!validateForm()) {
            toast({
                title: "Validation Error",
                description: "Please fix the errors before saving.",
                variant: "destructive",
            })
            return
        }

        setSaving(true)
        try {
            const response = await fetch(`/api/events/${params.id}`, {
                method: "PUT",
                body: JSON.stringify(formData),
            })

            if (response.ok) {
                const updatedEvent = await response.json()
                setEvent(updatedEvent)
                toast({
                    title: "Event updated!",
                    description: "Your event has been successfully updated.",
                })
                router.push(`/events/${params.id}`)
            } else {
                const errorData = await response.json()
                toast({
                    title: "Failed to update event",
                    description: errorData.error || "Please try again.",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error("Save error:", error)
            toast({
                title: "Error",
                description: "Something went wrong. Please try again.",
                variant: "destructive",
            })
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        setDeleting(true)
        try {
            const response = await fetch(`/api/events/${params.id}`, {
                method: "DELETE",
            })

            if (response.ok) {
                toast({
                    title: "Event deleted",
                    description: "Your event has been successfully deleted.",
                })
                router.push("/dashboard")
            } else {
                const errorData = await response.json()
                toast({
                    title: "Failed to delete event",
                    description: errorData.error || "Please try again.",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error("Delete error:", error)
            toast({
                title: "Error",
                description: "Something went wrong. Please try again.",
                variant: "destructive",
            })
        } finally {
            setDeleting(false)
            setShowDeleteConfirm(false)
        }
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-slate-900">
                <Navbar />
                <div className="container mx-auto px-4 py-8 text-center">
                    <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
                    <p className="text-slate-400">Please log in to edit events.</p>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900">
                <Navbar />
                <div className="container mx-auto px-4 py-8 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-slate-400">Loading event details...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (!event) {
        return (
            <div className="min-h-screen bg-slate-900">
                <Navbar />
                <div className="container mx-auto px-4 py-8 text-center">
                    <h1 className="text-2xl font-bold text-white mb-4">Event Not Found</h1>
                    <p className="text-slate-400 mb-6">The event you're looking for doesn't exist.</p>
                    <Link href="/dashboard">
                        <Button className="bg-purple-600 hover:bg-purple-700">Back to Dashboard</Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-900">
            <Navbar />

            <div className="container mx-auto">
                <div className="container mx-auto px-6 py-8">
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Main Form */}
                        <div className="lg:col-span-2">
                            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 rounded-2xl">
                                <CardHeader>
                                    <CardTitle className="text-2xl text-white flex items-center">
                                        <Calendar className="w-6 h-6 mr-2 text-purple-500" />
                                        Event Details
                                    </CardTitle>
                                    <CardDescription className="text-slate-400">
                                        Update your event information and settings
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Title */}
                                    <div className="space-y-2">
                                        <Label htmlFor="title" className="text-white font-medium">
                                            Event Title *
                                        </Label>
                                        <div className="pt-2">
                                            <Input
                                                id="title"
                                                placeholder="Enter event title"
                                                value={formData.title}
                                                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                                                className={`bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 rounded-xl ${errors.title ? "border-red-500" : ""
                                                    }`}
                                            />
                                            {errors.title && <p className="text-red-400 text-sm">{errors.title}</p>}
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-2">
                                        <Label htmlFor="description" className="text-white font-medium">
                                            Description *
                                        </Label>
                                        <div className="pt-2">
                                            <Textarea
                                                id="description"
                                                placeholder="Describe your event..."
                                                value={formData.description}
                                                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                                                rows={4}
                                                className={`bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 rounded-xl ${errors.description ? "border-red-500" : ""
                                                    }`}
                                            />
                                            {errors.description && <p className="text-red-400 text-sm">{errors.description}</p>}
                                        </div>
                                    </div>

                                    {/* Start Time */}
                                    <div className="space-y-2">
                                        <Label htmlFor="startTime" className="text-white font-medium">
                                            Start Date & Time *
                                        </Label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <Input
                                                id="startTime"
                                                type="datetime-local"
                                                value={formData.startTime}
                                                onChange={(e) => setFormData((prev) => ({ ...prev, startTime: e.target.value }))}
                                                className={`bg-slate-700/50 border-slate-600 text-white rounded-xl pl-10 ${errors.startTime ? "border-red-500" : ""
                                                    }`}
                                            />
                                        </div>
                                        {errors.startTime && <p className="text-red-400 text-sm">{errors.startTime}</p>}
                                    </div>

                                    {/* Banner URL */}
                                    <div className="space-y-2">
                                        <Label htmlFor="bannerUrl" className="text-white font-medium">
                                            Banner Image URL
                                        </Label>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <ImageIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                <div className="pt-2">
                                                    <Input
                                                        id="bannerUrl"
                                                        type="url"
                                                        placeholder="https://example.com/banner.jpg"
                                                        value={formData.bannerUrl}
                                                        onChange={(e) => setFormData((prev) => ({ ...prev, bannerUrl: e.target.value }))}
                                                        className={`bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 rounded-xl pl-10 ${errors.bannerUrl ? "border-red-500" : ""
                                                            }`}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        {errors.bannerUrl && <p className="text-red-400 text-sm">{errors.bannerUrl}</p>}
                                    </div>

                                    {/* Banner Preview */}
                                    {formData.bannerUrl && (
                                        <div className="space-y-2">
                                            <Label className="text-white font-medium">Banner Preview</Label>
                                            <div className="aspect-video border border-slate-600 rounded-xl overflow-hidden bg-slate-700/50">
                                                <img
                                                    src={formData.bannerUrl || "/placeholder.svg"}
                                                    alt="Event banner preview"
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement
                                                        target.style.display = "none"
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex gap-2 pt-2">
                                        <Button
                                            onClick={handleSave}
                                            disabled={saving}
                                            className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-6 py-3 flex-1"
                                        >
                                            {saving ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="w-4 h-4 mr-2" />
                                                    Save Changes
                                                </>
                                            )}
                                        </Button>

                                        <Button
                                            variant="outline"
                                            onClick={() => router.push(`/events/${params.id}`)}
                                            className="border-slate-600 text-slate-300 hover:bg-slate-700 rounded-xl px-6 py-3"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Event Info */}
                            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 rounded-2xl">
                                <CardHeader>
                                    <CardTitle className="text-lg text-white">Event Info</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-400">Status</span>
                                        <Badge className={`${event.isLive
                                            ? "bg-red-600/20 text-red-400 border-red-600/30 animate-pulse"
                                            : "bg-blue-600/20 text-blue-400 border-blue-600/30"
                                            }`}>
                                            {event.isLive ? "🔴 Live" : "Scheduled"}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-400">Participants</span>
                                        <span className="text-white font-semibold">{event._count.participants.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-400">Host</span>
                                        <span className="text-white font-semibold">{event.host.name}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Quick Actions */}
                            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 rounded-2xl">
                                <CardHeader>
                                    <CardTitle className="text-lg text-white">Quick Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <Link href={`/events/${params.id}`}>
                                            <Button
                                                variant="outline"
                                                className="w-full"
                                            >
                                                View Event Page
                                            </Button>
                                        </Link>
                                        {/* <Link href={`/host/${params.id}`}>
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start border-slate-600 text-slate-300 hover:bg-slate-700 rounded-xl bg-transparent"
                                            >
                                                <Users className="w-4 h-4 mr-2" />
                                                Host Control Panel
                                            </Button>
                                        </Link> */}
                                    </div>
                                    <Link href="/dashboard">
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                        >
                                            Back to Dashboard
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>

                            {/* Danger Zone */}
                            <Card className="bg-red-900/20 backdrop-blur-sm border-red-700/50 rounded-2xl">
                                <CardHeader>
                                    <CardTitle className="text-lg text-red-400 flex items-center">
                                        <AlertTriangle className="w-5 h-5 mr-2" />
                                        Danger Zone
                                    </CardTitle>
                                    <CardDescription className="text-red-300/70">Irreversible and destructive actions</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {!showDeleteConfirm ? (
                                        <Button
                                            variant="outline"
                                            onClick={() => setShowDeleteConfirm(true)}
                                            className="w-full border-red-600 text-red-400 hover:bg-red-600/20 rounded-xl"
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete Event
                                        </Button>
                                    ) : (
                                        <div className="space-y-3">
                                            <p className="text-red-300 text-sm">
                                                Are you sure? This action cannot be undone. All event data and participant registrations will be
                                                permanently deleted.
                                            </p>
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={handleDelete}
                                                    disabled={deleting}
                                                    className="bg-red-600 hover:bg-red-700 text-white rounded-xl flex-1"
                                                >
                                                    {deleting ? (
                                                        <>
                                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                                            Deleting...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Trash2 className="w-4 h-4 mr-2" />
                                                            Yes, Delete
                                                        </>
                                                    )}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => setShowDeleteConfirm(false)}
                                                    className="border-slate-600 text-slate-300 hover:bg-slate-700 rounded-xl"
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
