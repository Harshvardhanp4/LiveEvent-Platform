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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Calendar, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { RoleGuard } from "@/components/auth/role-guard"
import { useSession } from "@/node_modules/next-auth/react"

export default function CreateEventPage() {
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [startTime, setStartTime] = useState("")
    const [bannerUrl, setBannerUrl] = useState("")
    const [loading, setLoading] = useState(false)
    const { data: session } = useSession()
    const user = session?.user
    //const { user } = useAuth()
    const router = useRouter()
    const { toast } = useToast()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
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
                    title,
                    description,
                    startTime,
                    bannerUrl: bannerUrl || undefined,
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

    if (!user || user.role !== "HOST") {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="container mx-auto px-4 py-8 text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
                    <p className="text-gray-600">You need to be a host to create events.</p>
                </div>
            </div>
        )
    }

    return (
        <RoleGuard allowedRoles={["HOST", "ADMIN"]}>
            <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
                <Navbar />

                <div className="container mx-auto px-4 py-8">
                    <div className="mb-6">
                        <Link href="/dashboard" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Dashboard
                        </Link>
                    </div>

                    <Card className="max-w-2xl mx-auto">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-6 w-6" />
                                Create New Event
                            </CardTitle>
                            <CardDescription>Set up your live interactive event with polls, quizzes, and Q&A</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Event Title</Label>
                                    <Input
                                        id="title"
                                        placeholder="Enter event title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Describe your event..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={4}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="startTime">Start Date & Time</Label>
                                    <Input
                                        id="startTime"
                                        type="datetime-local"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="bannerUrl">Banner Image URL (Optional)</Label>
                                    <Input
                                        id="bannerUrl"
                                        type="url"
                                        placeholder="https://example.com/banner.jpg"
                                        value={bannerUrl}
                                        onChange={(e) => setBannerUrl(e.target.value)}
                                    />
                                </div>

                                <div className="flex gap-4">
                                    <Button type="submit" disabled={loading} className="flex-1">
                                        {loading ? "Creating..." : "Create Event"}
                                    </Button>
                                    <Link href="/dashboard">
                                        <Button type="button" variant="outline">
                                            Cancel
                                        </Button>
                                    </Link>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </RoleGuard>
    )
}
