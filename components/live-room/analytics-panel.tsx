"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, Users, MessageSquare, TrendingUp, Target, Activity } from "lucide-react"

interface AnalyticsPanelProps {
    eventId: string
}

export function AnalyticsPanel({ eventId }: AnalyticsPanelProps) {
    const [analytics, setAnalytics] = useState({
        totalParticipants: 0,
        activeParticipants: 0,
        messagesCount: 0,
        quizzesCompleted: 0,
        pollsCompleted: 0,
        averageScore: 0,
        engagementRate: 0,
        retentionRate: 0,
    })

    const [realtimeData, setRealtimeData] = useState({
        currentViewers: 0,
        messagesPerMinute: 0,
        activeUsers: 0,
    })

    const [pollResults, setPollResults] = useState([
        { question: "What's your experience level?", responses: { Beginner: 45, Intermediate: 32, Advanced: 23 } },
        { question: "Preferred learning format?", responses: { Video: 67, Text: 18, Interactive: 15 } },
    ])

    const [quizResults, setQuizResults] = useState([
        { question: "What is React?", correctRate: 78, totalResponses: 156 },
        { question: "Explain useState", correctRate: 65, totalResponses: 142 },
        { question: "What is JSX?", correctRate: 89, totalResponses: 134 },
    ])

    useEffect(() => {
        // Simulate real-time analytics updates
        const interval = setInterval(() => {
            setAnalytics((prev) => ({
                ...prev,
                totalParticipants: Math.floor(Math.random() * 500) + 200,
                activeParticipants: Math.floor(Math.random() * 300) + 150,
                messagesCount: Math.floor(Math.random() * 1000) + 500,
                quizzesCompleted: Math.floor(Math.random() * 200) + 100,
                pollsCompleted: Math.floor(Math.random() * 150) + 80,
                averageScore: Math.floor(Math.random() * 40) + 60,
                engagementRate: Math.floor(Math.random() * 30) + 70,
                retentionRate: Math.floor(Math.random() * 20) + 80,
            }))

            setRealtimeData({
                currentViewers: Math.floor(Math.random() * 200) + 100,
                messagesPerMinute: Math.floor(Math.random() * 50) + 20,
                activeUsers: Math.floor(Math.random() * 150) + 80,
            })
        }, 3000)

        return () => clearInterval(interval)
    }, [])

    return (
        <div className="space-y-6">
            {/* Real-time Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Live Viewers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{realtimeData.currentViewers}</div>
                        <p className="text-xs text-muted-foreground">
                            <TrendingUp className="inline h-3 w-3 mr-1" />
                            +12% from last hour
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Messages/Min</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{realtimeData.messagesPerMinute}</div>
                        <p className="text-xs text-muted-foreground">
                            <Activity className="inline h-3 w-3 mr-1" />
                            High engagement
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{realtimeData.activeUsers}</div>
                        <p className="text-xs text-muted-foreground">
                            <Target className="inline h-3 w-3 mr-1" />
                            {Math.round((realtimeData.activeUsers / realtimeData.currentViewers) * 100)}% engagement
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Analytics */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Event Analytics
                    </CardTitle>
                    <CardDescription>Detailed insights into participant engagement and performance</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="engagement">Engagement</TabsTrigger>
                            <TabsTrigger value="polls">Polls</TabsTrigger>
                            <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center p-4 border rounded-lg">
                                    <div className="text-2xl font-bold text-primary">{analytics.totalParticipants}</div>
                                    <div className="text-sm text-gray-600">Total Participants</div>
                                </div>
                                <div className="text-center p-4 border rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">{analytics.activeParticipants}</div>
                                    <div className="text-sm text-gray-600">Active Now</div>
                                </div>
                                <div className="text-center p-4 border rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600">{analytics.averageScore}%</div>
                                    <div className="text-sm text-gray-600">Avg Quiz Score</div>
                                </div>
                                <div className="text-center p-4 border rounded-lg">
                                    <div className="text-2xl font-bold text-purple-600">{analytics.retentionRate}%</div>
                                    <div className="text-sm text-gray-600">Retention Rate</div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="engagement" className="space-y-4">
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-sm font-medium">Chat Engagement</span>
                                        <span className="text-sm text-gray-600">{analytics.engagementRate}%</span>
                                    </div>
                                    <Progress value={analytics.engagementRate} className="h-2" />
                                </div>
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-sm font-medium">Quiz Participation</span>
                                        <span className="text-sm text-gray-600">
                                            {Math.round((analytics.quizzesCompleted / analytics.totalParticipants) * 100)}%
                                        </span>
                                    </div>
                                    <Progress value={(analytics.quizzesCompleted / analytics.totalParticipants) * 100} className="h-2" />
                                </div>
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-sm font-medium">Poll Participation</span>
                                        <span className="text-sm text-gray-600">
                                            {Math.round((analytics.pollsCompleted / analytics.totalParticipants) * 100)}%
                                        </span>
                                    </div>
                                    <Progress value={(analytics.pollsCompleted / analytics.totalParticipants) * 100} className="h-2" />
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="polls" className="space-y-4">
                            {pollResults.map((poll, index) => (
                                <div key={index} className="border rounded-lg p-4">
                                    <h4 className="font-semibold mb-3">{poll.question}</h4>
                                    <div className="space-y-2">
                                        {Object.entries(poll.responses).map(([option, count]) => {
                                            const total = Object.values(poll.responses).reduce((a, b) => a + b, 0)
                                            const percentage = Math.round((count / total) * 100)
                                            return (
                                                <div key={option} className="flex items-center justify-between">
                                                    <span className="text-sm">{option}</span>
                                                    <div className="flex items-center gap-2">
                                                        <Progress value={percentage} className="w-20 h-2" />
                                                        <span className="text-sm font-medium w-12">{percentage}%</span>
                                                        <Badge variant="outline">{count}</Badge>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}
                        </TabsContent>

                        <TabsContent value="quizzes" className="space-y-4">
                            {quizResults.map((quiz, index) => (
                                <div key={index} className="border rounded-lg p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-semibold">{quiz.question}</h4>
                                        <Badge variant={quiz.correctRate >= 70 ? "default" : "destructive"}>
                                            {quiz.correctRate}% correct
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Progress value={quiz.correctRate} className="flex-1 h-2" />
                                        <span className="text-sm text-gray-600">{quiz.totalResponses} responses</span>
                                    </div>
                                </div>
                            ))}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    )
}
