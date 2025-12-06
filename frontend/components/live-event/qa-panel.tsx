"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { ThumbsUp } from "lucide-react"
import { useSocket } from "@/components/providers/socket-provider"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"

interface QAPanelProps {
    eventId: string
}

interface QAQuestion {
    id: string
    question: string
    user: {
        id: string
        name: string
    }
    approved: boolean
    votes?: number
    answered?: boolean
}

export function QAPanel({ eventId }: QAPanelProps) {
    const { socket } = useSocket()
    const { toast } = useToast()
    const { data: session } = useSession()
    const [question, setQuestion] = useState("")
    const [questions, setQuestions] = useState<QAQuestion[]>([])

    // Fetch approved questions from database on mount
    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await fetch(`/api/events/${eventId}/questions`)
                if (response.ok) {
                    const data = await response.json()
                    // Filter to only show approved questions
                    const approvedQuestions = data.questions
                        .filter((q: any) => q.approved)
                        .map((q: any) => ({
                            id: q.id,
                            question: q.question,
                            user: {
                                id: q.user.id,
                                name: q.user.name,
                            },
                            approved: q.approved,
                        }))
                    setQuestions(approvedQuestions)
                }
            } catch (error) {
                console.error("Failed to fetch questions:", error)
            }
        }

        fetchQuestions()
    }, [eventId])

    useEffect(() => {
        if (!socket) return

        const handleQuestionSubmitted = (data: QAQuestion) => {
            setQuestions((prev) => {
                // Avoid duplicates
                if (prev.some(q => q.id === data.id)) {
                    return prev
                }
                return [data, ...prev]
            })
        }

        const handleQuestionApproved = (data: { id: string; approved: boolean }) => {
            setQuestions((prev) =>
                prev.map((q) => (q.id === data.id ? { ...q, approved: data.approved } : q))
            )
        }

        socket.on("question-submitted", handleQuestionSubmitted)
        socket.on("question-approved", handleQuestionApproved)

        return () => {
            socket.off("question-submitted", handleQuestionSubmitted)
            socket.off("question-approved", handleQuestionApproved)
        }
    }, [socket])

    const submitQuestion = () => {
        if (!question.trim()) {
            toast({
                title: "Invalid Question",
                description: "Please enter a question.",
                variant: "destructive",
            })
            return
        }

        if (!socket) {
            toast({
                title: "Connection Error",
                description: "Socket not connected. Please refresh the page.",
                variant: "destructive",
            })
            return
        }

        socket.emit("question-submitted", {
            eventId,
            question: question.trim(),
        })

        toast({
            title: "Question Submitted",
            description: "Your question has been submitted and is pending approval.",
        })

        setQuestion("")
    }

    const approvedQuestions = questions.filter((q) => q.approved)

    return (
        <div className="bg-muted/50 rounded-lg p-6 space-y-4">
            <h3 className="font-semibold mb-4">Q&A Session</h3>

            <div className="space-y-4">
                <div className="flex space-x-2">
                    <Input
                        placeholder="Ask your question here..."
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                submitQuestion()
                            }
                        }}
                        className="flex-1"
                    />
                    <Button onClick={submitQuestion} disabled={!question.trim()}>
                        Submit
                    </Button>
                </div>

                <ScrollArea className="h-48">
                    <div className="space-y-3">
                        {approvedQuestions.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <p>No questions yet. Be the first to ask!</p>
                            </div>
                        ) : (
                            approvedQuestions.map((q) => (
                            <div key={q.id} className="p-3 bg-background rounded-lg">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{q.question}</p>
                                            <p className="text-xs text-muted-foreground">
                                                by {q.user?.name || "Anonymous"}
                                            </p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                            {q.votes !== undefined && (
                                        <Button variant="ghost" size="sm">
                                            <ThumbsUp className="w-3 h-3 mr-1" />
                                            {q.votes}
                                        </Button>
                                            )}
                                        {q.answered && <Badge variant="secondary">Answered</Badge>}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </div>
        </div>
    )
}
