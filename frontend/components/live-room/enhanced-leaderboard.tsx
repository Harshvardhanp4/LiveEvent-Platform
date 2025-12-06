"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Trophy, Medal, Award, Star, TrendingUp, Crown } from "lucide-react"

interface Player {
    id: string
    name: string
    points: number
    badges: string[]
    streak: number
    rank: number
    change: number
    avatar?: string
}

interface EnhancedLeaderboardProps {
    eventId: string
}

export function EnhancedLeaderboard({ eventId }: EnhancedLeaderboardProps) {
    const [players, setPlayers] = useState<Player[]>([])
    const [timeframe, setTimeframe] = useState<"current" | "alltime">("current")

    useEffect(() => {
        // Simulate leaderboard data
        const mockPlayers: Player[] = [
            {
                id: "1",
                name: "Alex Chen",
                points: 2450,
                badges: ["quiz-master", "early-bird"],
                streak: 5,
                rank: 1,
                change: 0,
            },
            { id: "2", name: "Sarah Johnson", points: 2380, badges: ["social-butterfly"], streak: 3, rank: 2, change: 1 },
            { id: "3", name: "Mike Rodriguez", points: 2290, badges: ["quiz-master"], streak: 2, rank: 3, change: -1 },
            {
                id: "4",
                name: "Emily Davis",
                points: 2150,
                badges: ["early-bird", "social-butterfly"],
                streak: 4,
                rank: 4,
                change: 2,
            },
            { id: "5", name: "David Kim", points: 2080, badges: ["quiz-master"], streak: 1, rank: 5, change: -1 },
            { id: "6", name: "Lisa Wang", points: 1950, badges: ["social-butterfly"], streak: 3, rank: 6, change: 0 },
            { id: "7", name: "Tom Wilson", points: 1890, badges: ["early-bird"], streak: 2, rank: 7, change: 1 },
            { id: "8", name: "Anna Brown", points: 1820, badges: [], streak: 1, rank: 8, change: -2 },
        ]

        setPlayers(mockPlayers)

        // Simulate real-time updates
        const interval = setInterval(() => {
            setPlayers((prev) =>
                prev
                    .map((player) => ({
                        ...player,
                        points: player.points + Math.floor(Math.random() * 50),
                    }))
                    .sort((a, b) => b.points - a.points)
                    .map((player, index) => ({
                        ...player,
                        rank: index + 1,
                    })),
            )
        }, 10000)

        return () => clearInterval(interval)
    }, [])

    const getBadgeIcon = (badge: string) => {
        switch (badge) {
            case "quiz-master":
                return <Trophy className="h-3 w-3" />
            case "early-bird":
                return <Star className="h-3 w-3" />
            case "social-butterfly":
                return <Award className="h-3 w-3" />
            default:
                return <Medal className="h-3 w-3" />
        }
    }

    const getBadgeColor = (badge: string) => {
        switch (badge) {
            case "quiz-master":
                return "bg-yellow-500"
            case "early-bird":
                return "bg-blue-500"
            case "social-butterfly":
                return "bg-pink-500"
            default:
                return "bg-gray-500"
        }
    }

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <Crown className="h-5 w-5 text-yellow-500" />
            case 2:
                return <Trophy className="h-5 w-5 text-gray-400" />
            case 3:
                return <Medal className="h-5 w-5 text-amber-600" />
            default:
                return <span className="text-lg font-bold text-gray-600">#{rank}</span>
        }
    }

    const getChangeIndicator = (change: number) => {
        if (change > 0) return <TrendingUp className="h-3 w-3 text-green-500" />
        if (change < 0) return <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />
        return <div className="h-3 w-3" />
    }

    const topPlayer = players[0]
    const maxPoints = topPlayer?.points || 1

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5" />
                        Leaderboard
                    </CardTitle>
                    <div className="flex gap-1">
                        <button
                            className={`px-3 py-1 text-xs rounded ${timeframe === "current" ? "bg-primary text-white" : "bg-gray-100"}`}
                            onClick={() => setTimeframe("current")}
                        >
                            Current
                        </button>
                        <button
                            className={`px-3 py-1 text-xs rounded ${timeframe === "alltime" ? "bg-primary text-white" : "bg-gray-100"}`}
                            onClick={() => setTimeframe("alltime")}
                        >
                            All Time
                        </button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {/* Top 3 Podium */}
                {players.length >= 3 && (
                    <div className="grid grid-cols-3 gap-2 mb-6">
                        {players.slice(0, 3).map((player, index) => (
                            <div key={player.id} className="text-center">
                                <div className="relative mb-2">
                                    <Avatar className="h-12 w-12 mx-auto">
                                        <AvatarFallback
                                            className={index === 0 ? "bg-yellow-100" : index === 1 ? "bg-gray-100" : "bg-amber-100"}
                                        >
                                            {player.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="absolute -top-1 -right-1">{getRankIcon(player.rank)}</div>
                                </div>
                                <div className="text-xs font-medium truncate">{player.name}</div>
                                <div className="text-xs text-gray-600">{player.points} pts</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Full Leaderboard */}
                <div className="space-y-2">
                    {players.map((player) => (
                        <div key={player.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                            <div className="flex items-center justify-center w-8">{getRankIcon(player.rank)}</div>

                            <Avatar className="h-8 w-8">
                                <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm truncate">{player.name}</span>
                                    {getChangeIndicator(player.change)}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Progress value={(player.points / maxPoints) * 100} className="h-1 flex-1" />
                                    <span className="text-xs text-gray-600 ml-2">{player.points}</span>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-1">
                                {player.streak > 1 && (
                                    <Badge variant="outline" className="text-xs">
                                        🔥 {player.streak}
                                    </Badge>
                                )}
                                <div className="flex gap-1">
                                    {player.badges.slice(0, 2).map((badge, index) => (
                                        <div
                                            key={index}
                                            className={`w-4 h-4 rounded-full flex items-center justify-center ${getBadgeColor(badge)}`}
                                            title={badge}
                                        >
                                            <div className="text-white text-xs">{getBadgeIcon(badge)}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Badge Legend */}
                <div className="mt-4 pt-4 border-t">
                    <div className="text-xs font-medium mb-2">Badges</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full flex items-center justify-center">
                                <Trophy className="h-2 w-2 text-white" />
                            </div>
                            <span>Quiz Master</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                                <Star className="h-2 w-2 text-white" />
                            </div>
                            <span>Early Bird</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-pink-500 rounded-full flex items-center justify-center">
                                <Award className="h-2 w-2 text-white" />
                            </div>
                            <span>Social Butterfly</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
