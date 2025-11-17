"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Users, MessageCircle, Heart } from "lucide-react"

export function EngagementDashboard() {
    const engagementMetrics = [
        {
            title: "Active Users",
            value: "1,247",
            change: "+12%",
            progress: 78,
            icon: Users,
            color: "text-blue-500",
        },
        {
            title: "Chat Messages",
            value: "8,432",
            change: "+24%",
            progress: 65,
            icon: MessageCircle,
            color: "text-green-500",
        },
        {
            title: "Reactions",
            value: "3,156",
            change: "+18%",
            progress: 82,
            icon: Heart,
            color: "text-red-500",
        },
    ]

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {engagementMetrics.map((metric, index) => (
                    <Card key={index}>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                                <metric.icon className={`w-5 h-5 ${metric.color}`} />
                                <Badge variant="secondary" className="text-xs">
                                    <TrendingUp className="w-3 h-3 mr-1" />
                                    {metric.change}
                                </Badge>
                            </div>
                            <div className="space-y-2">
                                <div className="text-2xl font-bold">{metric.value}</div>
                                <div className="text-sm text-muted-foreground">{metric.title}</div>
                                <Progress value={metric.progress} className="h-2" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Real-time Engagement</CardTitle>
                    <CardDescription>Live user interaction metrics</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm">User Participation Rate</span>
                            <span className="font-semibold">94.2%</span>
                        </div>
                        <Progress value={94} className="h-2" />

                        <div className="flex justify-between items-center">
                            <span className="text-sm">Average Session Duration</span>
                            <span className="font-semibold">45 min</span>
                        </div>
                        <Progress value={75} className="h-2" />

                        <div className="flex justify-between items-center">
                            <span className="text-sm">Interactive Feature Usage</span>
                            <span className="font-semibold">87%</span>
                        </div>
                        <Progress value={87} className="h-2" />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
