"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy } from "lucide-react"

interface LeaderboardProps {
    eventId: string
    currentUserScore: number
}

export function Leaderboard({ eventId, currentUserScore }: LeaderboardProps) {
    const leaderboard = [
        { id: "1", name: "TechGuru", score: 850, rank: 1, badges: ["🏆", "⚡"] },
        { id: "2", name: "CodeMaster", score: 720, rank: 2, badges: ["🎯", "💎"] },
        { id: "3", name: "InnovatePro", score: 680, rank: 3, badges: ["🚀", "⭐"] },
        { id: "4", name: "You", score: currentUserScore, rank: 4, badges: ["🔥"] },
        { id: "5", name: "DevExpert", score: 490, rank: 5, badges: ["💻"] },
    ]

    return (
        <Card className="rounded-2xl shadow-lg">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center space-x-2">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        <span>Leaderboard</span>
                    </CardTitle>
                    <Badge variant="secondary">Live Rankings</Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {leaderboard.map((entry, index) => (
                        <div
                            key={entry.id}
                            className={`flex items-center justify-between p-3 rounded-lg ${entry.name === "You" ? "bg-primary/10 border border-primary/20" : "bg-muted/50"
                                }`}
                        >
                            <div className="flex items-center space-x-3">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${index === 0
                                            ? "bg-yellow-500 text-black"
                                            : index === 1
                                                ? "bg-gray-400 text-black"
                                                : index === 2
                                                    ? "bg-amber-600 text-black"
                                                    : "bg-muted text-foreground"
                                        }`}
                                >
                                    {entry.rank}
                                </div>
                                <div>
                                    <div className="font-medium">{entry.name}</div>
                                    <div className="flex space-x-1">
                                        {entry.badges.map((badge, i) => (
                                            <span key={i} className="text-xs">
                                                {badge}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-bold">{entry.score}</div>
                                <div className="text-xs text-muted-foreground">points</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Your Position */}
                <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-primary">#4</div>
                        <div className="text-sm">Your Position</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
