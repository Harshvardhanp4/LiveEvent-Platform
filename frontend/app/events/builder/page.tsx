"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
//import { useAuth } from "@/components/providers/auth-provider"
import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
    Calendar,
    ArrowLeft,
    ArrowRight,
    Check,
    Upload,
    MessageSquare,
    HelpCircle,
    BarChart3,
    Trophy,
    Video,
    Users,
    Clock,
} from "lucide-react"
import { useSession } from "@/node_modules/next-auth/react"

interface EventFeature {
    id: string
    name: string
    description: string
    icon: React.ReactNode
    enabled: boolean
}

export default function EventBuilderPage() {
    const { data: session } = useSession()
    const user = session?.user
    //const { user } = useAuth()
    const router = useRouter()
    const { toast } = useToast()

    const [currentStep, setCurrentStep] = useState(1)
    const [eventData, setEventData] = useState({
        title: "",
        description: "",
        startTime: "",
        duration: 60,
        bannerUrl: "",
        maxParticipants: 1000,
        isPrivate: false,
        requiresApproval: false,
    })

    const [features, setFeatures] = useState<EventFeature[]>([
        {
            id: "live-chat",
            name: "Live Chat",
            description: "Real-time messaging with moderation tools",
            icon: <MessageSquare className="h-5 w-5" />,
            enabled: true,
        },
        {
            id: "polls",
            name: "Interactive Polls",
            description: "Create polls and see results in real-time",
            icon: <BarChart3 className="h-5 w-5" />,
            enabled: true,
        },
        {
            id: "quizzes",
            name: "Live Quizzes",
            description: "Timed quizzes with scoring and leaderboards",
            icon: <HelpCircle className="h-5 w-5" />,
            enabled: true,
        },
        {
            id: "qna",
            name: "Q&A Sessions",
            description: "Participant questions with host moderation",
            icon: <Users className="h-5 w-5" />,
            enabled: true,
        },
        {
            id: "leaderboard",
            name: "Leaderboard",
            description: "Real-time scoring and participant rankings",
            icon: <Trophy className="h-5 w-5" />,
            enabled: true,
        },
        {
            id: "video-streaming",
            name: "Video Streaming",
            description: "Live video broadcast to participants",
            icon: <Video className="h-5 w-5" />,
            enabled: true,
        },
    ])

    const [loading, setLoading] = useState(false)

    const steps = [
        { number: 1, title: "Basic Info", description: "Event details and scheduling" },
        { number: 2, title: "Features", description: "Select interactive features" },
        { number: 3, title: "Customization", description: "Branding and appearance" },
        { number: 4, title: "Review", description: "Review and create event" },
    ]

    const handleNext = () => {
        if (currentStep < 4) {
            setCurrentStep(currentStep + 1)
        }
    }

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
        }
    }

    const toggleFeature = (featureId: string) => {
        setFeatures((prev) =>
            prev.map((feature) => (feature.id === featureId ? { ...feature, enabled: !feature.enabled } : feature)),
        )
    }

    const handleCreateEvent = async () => {
        setLoading(true)
        try {
            const token = localStorage.getItem("token")
            const response = await fetch("/api/events", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...eventData,
                    features: features.filter((f) => f.enabled).map((f) => f.id),
                }),
            })

            if (response.ok) {
                const event = await response.json()
                toast({
                    title: "Event created!",
                    description: "Your event has been successfully created.",
                })
                router.push(`/events/${event.id}`)
            } else {
                toast({
                    title: "Failed to create event",
                    description: "Please check your information and try again.",
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
            setLoading(false)
        }
    }

    // if (!user || user.role !== "HOST") {
    //     return (
    //         <div className="min-h-screen bg-gray-50">
    //             <Navbar />
    //             <div className="container mx-auto px-4 py-8 text-center">
    //                 <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
    //                 <p className="text-gray-600">You need to be a host to create events.</p>
    //             </div>
    //         </div>
    //     )
    // }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
            <Navbar />

            <div className="container mx-auto px-4 py-8">
                {/* <div className="mb-6">
                    <Link href="/dashboard" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Link>
                </div> */}

                <div className="max-w-4xl mx-auto">
                    {/* Progress Steps */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            {steps.map((step, index) => (
                                <div key={step.number} className="flex items-center">
                                    <div
                                        className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${currentStep >= step.number
                                            ? "bg-primary border-primary text-white"
                                            : "border-gray-300 text-gray-500"
                                            }`}
                                    >
                                        {currentStep > step.number ? <Check className="h-5 w-5" /> : <span>{step.number}</span>}
                                    </div>
                                    {index < steps.length - 1 && (
                                        <div className={`w-20 h-0.5 mx-4 ${currentStep > step.number ? "bg-primary" : "bg-gray-300"}`} />
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="mt-4">
                            <h2 className="text-xl font-semibold">{steps[currentStep - 1].title}</h2>
                            <p className="text-gray-600">{steps[currentStep - 1].description}</p>
                        </div>
                    </div>

                    {/* Step Content */}
                    <Card className="glass-card hover-lift rounded-2xl">
                        <CardContent className="p-6">
                            {currentStep === 1 && (
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-white font-medium" htmlFor="title">
                                            Event Title
                                        </Label>
                                        <Input
                                            id="title"
                                            placeholder="Enter event title"
                                            value={eventData.title}
                                            className="mt-2 bg-slate-700/50 border-slate-600 text-white rounded-xl h-12"
                                            onChange={(e) => setEventData((prev) => ({ ...prev, title: e.target.value }))}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-white font-medium" htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            placeholder="Describe your event..."
                                            value={eventData.description}
                                            className="mt-2 bg-slate-700/50 border-slate-600 text-white rounded-xl h-12"
                                            onChange={(e) => setEventData((prev) => ({ ...prev, description: e.target.value }))}
                                            rows={4}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-white font-medium" htmlFor="startTime">
                                                Start Date & Time
                                            </Label>
                                            <div className="relative">
                                                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400"></Clock>
                                                <Input
                                                    id="startTime"
                                                    type="datetime-local"
                                                    value={eventData.startTime}
                                                    className="mt-2 bg-slate-700/50 border-slate-600 text-white rounded-xl h-12 pl-10"
                                                    onChange={(e) => setEventData((prev) => ({ ...prev, startTime: e.target.value }))}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-white font-medium" htmlFor="maxParticipants">
                                                Maximum Participants
                                            </Label>
                                            <Input
                                                id="maxParticipants"
                                                type="number"
                                                min="10"
                                                max="10000"
                                                value={eventData.maxParticipants}
                                                className="mt-2 bg-slate-700/50 border-slate-600 text-white rounded-xl h-12"
                                                onChange={(e) => setEventData((prev) => ({ ...prev, maxParticipants: Number(e.target.value) }))}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentStep === 2 && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-white text-lg font-semibold mb-4">Select Interactive Features</h3>
                                        <p className="text-gray-400 mb-6">Choose which features you want to enable for your event</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {features.map((feature) => (
                                            <div
                                                key={feature.id}
                                                className={`p-4 border rounded-lg cursor-pointer transition-colors ${feature.enabled ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"
                                                    }`}
                                                onClick={() => toggleFeature(feature.id)}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div
                                                        className={`p-2 rounded-lg ${feature.enabled ? "bg-primary text-white" : "bg-gray-100 text-gray-600"
                                                            }`}
                                                    >
                                                        {feature.icon}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="font-semibold">{feature.name}</h4>
                                                            {feature.enabled && (
                                                                <Badge variant="default" className="ml-2">
                                                                    Enabled
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {currentStep === 3 && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-white text-lg font-semibold mb-4">Customize Your Event</h3>
                                        <p className="text-gray-400 mb-6">Add branding and customize the appearance</p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-white font-medium" htmlFor="bannerUrl">Banner Image URL</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="bannerUrl"
                                                type="url"
                                                className="mt-2 bg-slate-700/50 border-slate-600 text-white rounded-xl h-12"
                                                placeholder="https://example.com/banner.jpg"
                                                value={eventData.bannerUrl}
                                                onChange={(e) => setEventData((prev) => ({ ...prev, bannerUrl: e.target.value }))}
                                            />
                                        </div>
                                    </div>

                                    {eventData.bannerUrl && (
                                        <div className="space-y-2">
                                            <Label className="text-white font-medium">Banner Preview</Label>
                                            <div className="aspect-video border rounded-lg overflow-hidden">
                                                <img
                                                    src={eventData.bannerUrl || "/placeholder.svg"}
                                                    alt="Event banner preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id="isPrivate"
                                                checked={eventData.isPrivate}
                                                onChange={(e) => setEventData((prev) => ({ ...prev, isPrivate: e.target.checked }))}
                                                className="rounded"
                                            />
                                            <Label htmlFor="isPrivate">Private Event</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id="requiresApproval"
                                                checked={eventData.requiresApproval}
                                                onChange={(e) => setEventData((prev) => ({ ...prev, requiresApproval: e.target.checked }))}
                                                className="rounded"
                                            />
                                            <Label htmlFor="requiresApproval">Require Approval</Label>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentStep === 4 && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-white text-lg font-semibold mb-4">Review Your Event</h3>
                                        <p className="text-white text-sm mb-6">Please review all details before creating your event</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-lg font-medium text-white">Event Title</Label>
                                                <p className="text-sm">{eventData.title}</p>
                                            </div>
                                            <div>
                                                <Label className="text-lg font-medium text-white">Start Time</Label>
                                                <p className="text-sm">
                                                    {eventData.startTime ? new Date(eventData.startTime).toLocaleString() : "Not set"}
                                                </p>
                                            </div>
                                            <div>
                                                <Label className="text-lg font-medium text-white">Duration</Label>
                                                <p className="text-sm">{eventData.duration} minutes</p>
                                            </div>
                                            <div>
                                                <Label className="text-lg font-medium text-white">Max Participants</Label>
                                                <p className="text-sm">{eventData.maxParticipants}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <Label className="text-lg font-medium text-white">Description</Label>
                                            <p className="mt-2">{eventData.description}</p>
                                        </div>

                                        <div>
                                            <Label className="text-lg font-medium text-white">Enabled Features</Label>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {features
                                                    .filter((f) => f.enabled)
                                                    .map((feature) => (
                                                        <Badge key={feature.id} variant="default">
                                                            {feature.name}
                                                        </Badge>
                                                    ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Navigation */}
                    <div className="flex justify-between mt-8">
                        <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Previous
                        </Button>

                        {currentStep < 4 ? (
                            <Button onClick={handleNext}>
                                Next
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        ) : (
                            <Button onClick={handleCreateEvent} disabled={loading}>
                                {loading ? "Creating..." : "Create Event"}
                                <Calendar className="ml-2 h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
