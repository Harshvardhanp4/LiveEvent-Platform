"use client"
import { Progress } from "@/components/ui/progress"

interface LivePollsProps {
    eventId: string
}

export function LivePolls({ eventId }: LivePollsProps) {
    const poll = {
        question: "What's your primary interest in technology?",
        options: [
            { text: "AI & Machine Learning", votes: 45 },
            { text: "Web Development", votes: 32 },
            { text: "Mobile Development", votes: 28 },
            { text: "Data Science", votes: 38 },
        ],
        totalVotes: 143,
    }

    return (
        <div className="bg-muted/50 rounded-lg p-6 space-y-4">
            <h3 className="font-semibold mb-4">{poll.question}</h3>
            <div className="space-y-3">
                {poll.options.map((option, index) => {
                    const percentage = (option.votes / poll.totalVotes) * 100
                    return (
                        <div key={index} className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>{option.text}</span>
                                <span>{percentage.toFixed(1)}%</span>
                            </div>
                            <Progress value={percentage} className="h-2" />
                        </div>
                    )
                })}
            </div>
            <div className="text-sm text-muted-foreground text-center">{poll.totalVotes} total votes</div>
        </div>
    )
}
