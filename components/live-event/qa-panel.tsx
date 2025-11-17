"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { ThumbsUp } from "lucide-react"

interface QAPanelProps {
    eventId: string
}

export function QAPanel({ eventId }: QAPanelProps) {
    const [question, setQuestion] = useState("")

    const questions = [
        {
            id: 1,
            question: "How will AI impact healthcare accessibility?",
            author: "Alice",
            votes: 12,
            answered: false,
        },
        {
            id: 2,
            question: "What are the ethical considerations?",
            author: "Bob",
            votes: 8,
            answered: true,
        },
    ]

    return (
        <div className="bg-muted/50 rounded-lg p-6 space-y-4">
            <h3 className="font-semibold mb-4">Q&A Session</h3>

            <div className="space-y-4">
                <div className="flex space-x-2">
                    <Input
                        placeholder="Ask your question here..."
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        className="flex-1"
                    />
                    <Button onClick={() => setQuestion("")}>Submit</Button>
                </div>

                <ScrollArea className="h-48">
                    <div className="space-y-3">
                        {questions.map((q) => (
                            <div key={q.id} className="p-3 bg-background rounded-lg">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{q.question}</p>
                                        <p className="text-xs text-muted-foreground">by {q.author}</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Button variant="ghost" size="sm">
                                            <ThumbsUp className="w-3 h-3 mr-1" />
                                            {q.votes}
                                        </Button>
                                        {q.answered && <Badge variant="secondary">Answered</Badge>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>
        </div>
    )
}
