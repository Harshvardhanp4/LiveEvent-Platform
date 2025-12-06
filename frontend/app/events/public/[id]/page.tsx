"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Clock, Users, MapPin, Sparkles, Trophy, Heart, Share2, Star } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { useSession } from "@/node_modules/next-auth/react"

export default function PublicEventPage() {
    const [isLiked, setIsLiked] = useState(false)
    const { data: session } = useSession()
    const user = session?.user

    return (
        <div className="min-h-screen">
            {/* Clean Header */}
            <header className="glass-header sticky top-0 z-50">
                <div className="container mx-auto container-padding py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-gradient">EventFlow</span>
                    </div>

                    <div className="flex items-center space-x-4">
                        <Link href="/auth">
                            <Button className="btn-primary px-6 py-2 rounded-lg">Sign In</Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="py-24 container-padding">
                <div className="container mx-auto text-center">
                    <Badge className="badge-primary mb-6 px-4 py-2 rounded-full">Featured Event</Badge>
                    <h1 className="text-5xl md:text-6xl heading-primary mb-6">
                        <span className="text-gradient">Tech Innovation</span>
                        <br />
                        <span className="text-white">Summit 2024</span>
                    </h1>
                    <p className="text-xl text-subtle mb-12 max-w-3xl mx-auto leading-relaxed">
                        Join industry leaders and innovators for an exclusive experience that will shape the future of technology
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                        <Button className="btn-primary text-lg px-8 py-4 rounded-xl">
                            <Calendar className="w-5 h-5 mr-2" />
                            Register Free
                        </Button>
                        <Button className="btn-secondary text-lg px-8 py-4 rounded-xl">
                            <Users className="w-5 h-5 mr-2" />
                            1,247 Registered
                        </Button>
                    </div>

                    {/* Event Info Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                        {[
                            { label: "Dec 15", sublabel: "2024", icon: Calendar },
                            { label: "2:00 PM", sublabel: "PST", icon: Clock },
                            { label: "3 Hours", sublabel: "Duration", icon: Trophy },
                            { label: "Virtual", sublabel: "Online", icon: MapPin },
                        ].map((item, index) => (
                            <Card key={index} className="glass-card hover-lift rounded-2xl">
                                <CardContent className="p-6 text-center">
                                    <item.icon className="w-8 h-8 mx-auto mb-3 text-primary" />
                                    <div className="text-2xl font-bold text-white mb-1">{item.label}</div>
                                    <div className="text-subtle">{item.sublabel}</div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-16 container-padding">
                <div className="container mx-auto">
                    <div className="grid lg:grid-cols-3 gap-12">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* About Event */}
                            <Card className="glass-card hover-lift rounded-2xl">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-3xl heading-primary text-white mb-2">About This Event</CardTitle>
                                            <CardDescription className="text-lg text-subtle">
                                                Discover the future of technology and innovation
                                            </CardDescription>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setIsLiked(!isLiked)}
                                                className={`${isLiked ? "text-red-400" : "text-muted"} hover:text-red-400 rounded-lg`}
                                            >
                                                <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
                                            </Button>
                                            <Button variant="ghost" size="sm" className="text-muted hover:text-white rounded-lg">
                                                <Share2 className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-8">
                                    {/* Event Details */}
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {[
                                            { icon: Calendar, title: "December 15, 2024", subtitle: "Sunday" },
                                            { icon: Clock, title: "2:00 PM - 5:00 PM", subtitle: "Pacific Time" },
                                            { icon: Users, title: "1,247 Participants", subtitle: "Global Community" },
                                            { icon: MapPin, title: "Virtual Event", subtitle: "Join Anywhere" },
                                        ].map((item, index) => (
                                            <div key={index} className="flex items-center space-x-4 p-4 rounded-xl card-hover">
                                                <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center">
                                                    <item.icon className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-white">{item.title}</p>
                                                    <p className="text-subtle">{item.subtitle}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <p className="text-subtle leading-relaxed text-lg">
                                            Join us for an extraordinary journey through technological innovations that are reshaping our
                                            world. This interactive summit features world-class speakers, live demonstrations, and networking
                                            opportunities with industry leaders.
                                        </p>
                                    </div>

                                    {/* Features */}
                                    <div>
                                        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                                            <Trophy className="w-5 h-5 mr-2 text-primary" />
                                            What's Included
                                        </h3>
                                        <div className="grid md:grid-cols-2 gap-3">
                                            {[
                                                "Interactive presentations",
                                                "Live Q&A sessions",
                                                "Global networking",
                                                "Exclusive resources",
                                                "Participation certificate",
                                                "Session recordings",
                                            ].map((item, index) => (
                                                <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/5">
                                                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                                                    <span className="text-subtle">{item}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Speakers */}
                            <Card className="glass-card hover-lift rounded-2xl">
                                <CardHeader>
                                    <CardTitle className="text-3xl heading-primary text-white mb-2">Featured Speakers</CardTitle>
                                    <CardDescription className="text-lg text-subtle">
                                        Learn from industry leaders and innovators
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid md:grid-cols-3 gap-6">
                                        {[
                                            { name: "Sarah Chen", role: "CEO, TechVision", avatar: "SC" },
                                            { name: "Marcus Rodriguez", role: "CTO, InnovateLab", avatar: "MR" },
                                            { name: "Dr. Aisha Patel", role: "AI Research Director", avatar: "AP" },
                                        ].map((speaker, index) => (
                                            <div key={index} className="text-center p-6 rounded-xl card-hover">
                                                <Avatar className="w-16 h-16 mx-auto mb-4">
                                                    <AvatarImage src={`/placeholder.svg?height=64&width=64`} />
                                                    <AvatarFallback className="gradient-primary text-white font-semibold">
                                                        {speaker.avatar}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <h4 className="font-semibold text-white mb-1">{speaker.name}</h4>
                                                <p className="text-subtle text-sm">{speaker.role}</p>
                                                <div className="flex justify-center mt-3">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-8">
                            {/* Registration Card */}
                            <Card className="glass-card hover-lift rounded-2xl sticky top-24">
                                <CardHeader className="text-center">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-xl gradient-primary flex items-center justify-center">
                                        <Sparkles className="w-8 h-8 text-white" />
                                    </div>
                                    <CardTitle className="text-2xl text-white mb-2">Join the Summit</CardTitle>
                                    <CardDescription className="text-subtle">Secure your spot today</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="text-center">
                                        <div className="text-4xl font-bold text-gradient mb-2">FREE</div>
                                        <p className="text-muted">Limited seats available</p>
                                    </div>

                                    <Button className="w-full btn-primary py-4 rounded-xl text-lg font-semibold">
                                        <Calendar className="w-5 h-5 mr-2" />
                                        Register Now
                                    </Button>

                                    <p className="text-xs text-muted text-center">By registering, you agree to our Terms of Service</p>
                                </CardContent>
                            </Card>

                            {/* Progress */}
                            <Card className="glass-card rounded-2xl">
                                <CardHeader>
                                    <CardTitle className="text-lg text-white">Registration Progress</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-subtle">Registered</span>
                                        <span className="text-white font-semibold">1,247 / 2,000</span>
                                    </div>
                                    <div className="w-full bg-white/10 rounded-full h-2">
                                        <div className="progress-bar h-2 rounded-full" style={{ width: "62%" }}></div>
                                    </div>
                                    <p className="text-sm text-muted text-center">62% capacity</p>
                                </CardContent>
                            </Card>

                            {/* Quick Links */}
                            <Card className="glass-card rounded-2xl">
                                <CardHeader>
                                    <CardTitle className="text-lg text-white">Explore More</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {[
                                        { href: "/events", label: "Browse Events" },
                                        { href: "/create-event", label: "Host Event" },
                                        { href: "/about", label: "About Platform" },
                                    ].map((link, index) => (
                                        <Link key={index} href={link.href}>
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start btn-secondary rounded-lg bg-transparent"
                                            >
                                                {link.label}
                                            </Button>
                                        </Link>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
