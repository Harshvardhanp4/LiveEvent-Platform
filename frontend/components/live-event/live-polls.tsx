"use client"
import { useState, useEffect } from "react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { useSocket } from "@/components/providers/socket-provider"
import { useToast } from "@/hooks/use-toast"

interface LivePollsProps {
    eventId: string
}

interface Poll {
    id: string
    question: string
    options: string[]
    responses: Record<string, number>
    isActive: boolean
}

export function LivePolls({ eventId }: LivePollsProps) {
    const { socket } = useSocket()
    const { toast } = useToast()
    const [currentPoll, setCurrentPoll] = useState<Poll | null>(null)
    const [selectedOption, setSelectedOption] = useState<number | null>(null)
    const [hasVoted, setHasVoted] = useState(false)

    // Fetch active poll from database on mount
    useEffect(() => {
        const fetchPoll = async () => {
            try {
                const response = await fetch(`/api/events/${eventId}/polls`)
                if (response.ok) {
                    const data = await response.json()
                    if (data.poll) {
                        setCurrentPoll(data.poll)
                    }
                }
            } catch (error) {
                console.error("Failed to fetch poll:", error)
            }
        }

        fetchPoll()
    }, [eventId])

    useEffect(() => {
        if (!socket) return

        const handleNewPoll = (poll: Poll) => {
            setCurrentPoll(poll)
            setSelectedOption(null)
            setHasVoted(false)
        }

        const handlePollUpdate = (data: { pollId: string; optionId: string; votes: Record<string, number> }) => {
            setCurrentPoll((prevPoll) => {
                if (prevPoll && data.pollId === prevPoll.id) {
                    return {
                        ...prevPoll,
                        responses: data.votes,
                    }
                }
                return prevPoll
            })
        }

        socket.on("new-poll", handleNewPoll)
        socket.on("poll-update", handlePollUpdate)

        return () => {
            socket.off("new-poll", handleNewPoll)
            socket.off("poll-update", handlePollUpdate)
        }
    }, [socket])

    // Convert responses from counts to proper format
    const getVoteCount = (optionIndex: number): number => {
        if (!currentPoll || !currentPoll.responses) return 0
        const responses = currentPoll.responses as any
        return responses[optionIndex.toString()] || 0
    }

    const vote = () => {
        if (selectedOption === null || !currentPoll || hasVoted) return

        setHasVoted(true)

        if (socket) {
            socket.emit("poll-response", {
                eventId,
                pollId: currentPoll.id,
                optionId: selectedOption.toString(),
            })
        }

        toast({
            title: "Vote Submitted",
            description: "Your vote has been recorded!",
        })
    }

    if (!currentPoll) {
        return (
            <div className="bg-muted/50 rounded-lg p-6 space-y-4 text-center">
                <p className="text-muted-foreground">Waiting for poll to start...</p>
            </div>
        )
    }

    const totalVotes = currentPoll.options.reduce((sum, _, index) => sum + getVoteCount(index), 0)

    return (
        <div className="bg-muted/50 rounded-lg p-6 space-y-4">
            <h3 className="font-semibold mb-4">{currentPoll.question}</h3>
            
            {!hasVoted ? (
                // Show selection interface before voting
                <div className="space-y-4">
                    <div className="text-sm font-medium mb-2">Select your answer:</div>
                    <div className="space-y-2">
                        {currentPoll.options.map((option, index) => (
                            <Button
                                key={index}
                                variant={selectedOption === index ? "default" : "outline"}
                                className="w-full justify-start"
                                onClick={() => setSelectedOption(index)}
                            >
                                {String.fromCharCode(65 + index)}. {option}
                            </Button>
                        ))}
                    </div>
                    <Button onClick={vote} disabled={selectedOption === null} className="w-full mt-2">
                        Submit Vote
                    </Button>
                </div>
            ) : (
                // Show results after voting
                <div className="space-y-3">
                    {currentPoll.options.map((option, index) => {
                        const votes = getVoteCount(index)
                        const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0
                        return (
                            <div key={index} className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>{option}</span>
                                    <span>{percentage.toFixed(1)}% ({votes} votes)</span>
                                </div>
                                <Progress value={percentage} className="h-2" />
                            </div>
                        )
                    })}
                    <div className="text-sm text-muted-foreground text-center pt-2">
                        {totalVotes} total votes • You have voted
                    </div>
                </div>
            )}
        </div>
    )
}
