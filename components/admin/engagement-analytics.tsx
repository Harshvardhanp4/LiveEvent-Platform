"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Users, Activity, Target, Calendar } from "lucide-react"

export function EngagementAnalytics() {
    const engagementMetrics = [
        {
            title: "Active Users",
            value: "0",
            change: "+12%",
            icon: Users,
            color: "text-blue-400",
        },
        {
            title: "Events/Min",
            value: "0",
            change: "+8%",
            icon: Activity,
            color: "text-green-400",
        },
        {
            title: "Avg Engagement",
            value: "3",
            change: "-2%",
            icon: Target,
            color: "text-purple-400",
        },
        {
            title: "Total Events",
            value: "2",
            change: "+15%",
            icon: Calendar,
            color: "text-orange-400",
        },
    ]

    const engagementScores = [
        {
            id: "1",
            name: "anonymous",
            interactions: "1 interactions",
            score: 10,
            level: "Low",
        },
    ]

    const activityBreakdown = [
        { type: "Chat Messages", count: 0, progress: 0 },
        { type: "Poll Responses", count: 0, progress: 0 },
        { type: "Quiz Responses", count: 0, progress: 0 },
        { type: "Avg Session Time", count: "24m 32s", progress: 75 },
    ]

    return (
        <div className="space-y-6">
            {/* Engagement Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {engagementMetrics.map((metric, index) => {
                    const Icon = metric.icon
                    return (
                        <Card key={index} className="bg-slate-800 border-slate-700">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-slate-300">{metric.title}</CardTitle>
                                <Icon className={`h-4 w-4 ${metric.color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-white mb-1">{metric.value}</div>
                                <p className="text-xs text-green-400">{metric.change}</p>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Engagement Scores */}
                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white">Engagement Scores</CardTitle>
                        <CardDescription className="text-slate-400">Individual user engagement levels</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {engagementScores.map((user) => (
                                <div key={user.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="text-white font-medium">{user.name}</div>
                                            <div className="text-slate-400 text-sm">{user.interactions}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="destructive" className="bg-red-600">
                                            {user.level}
                                        </Badge>
                                        <span className="text-white font-medium">{user.score}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Activity Breakdown */}
                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white">Activity Breakdown</CardTitle>
                        <CardDescription className="text-slate-400">Types of user interactions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {activityBreakdown.map((activity, index) => (
                                <div key={index} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-300 text-sm">{activity.type}</span>
                                        <span className="text-white font-medium">
                                            {typeof activity.count === "number" ? activity.count : activity.count}
                                        </span>
                                    </div>
                                    <Progress value={activity.progress} className="h-2 bg-slate-700" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
