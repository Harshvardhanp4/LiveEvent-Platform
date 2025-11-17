"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Trophy, Clock } from "lucide-react"

interface QuizEngineProps {
    eventId: string
    onScoreUpdate: (score: number) => void
}

export function QuizEngine({ eventId, onScoreUpdate }: QuizEngineProps) {
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
    const [timeLeft, setTimeLeft] = useState(30)

    const currentQuestion = {
        question: "Which technology is most likely to revolutionize healthcare?",
        options: ["AI & Machine Learning", "Blockchain", "IoT Devices", "Quantum Computing"],
        correctAnswer: 0,
    }

    const submitAnswer = () => {
        if (selectedAnswer !== null) {
            const isCorrect = selectedAnswer === currentQuestion.correctAnswer
            const points = isCorrect ? 100 : 0
            onScoreUpdate(540 + points)
            setSelectedAnswer(null)
        }
    }

    return (
        <div className="bg-muted/50 rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Interactive Quiz
                </h3>
                <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span className="font-mono">{timeLeft}s</span>
                </div>
            </div>

            <h4 className="text-lg mb-4">{currentQuestion.question}</h4>

            <div className="space-y-3 mb-4">
                {currentQuestion.options.map((option, index) => (
                    <Button
                        key={index}
                        variant={selectedAnswer === index ? "default" : "outline"}
                        className="w-full justify-start text-left"
                        onClick={() => setSelectedAnswer(index)}
                    >
                        {String.fromCharCode(65 + index)}. {option}
                    </Button>
                ))}
            </div>

            <div className="space-y-3">
                <Progress value={75} className="h-2" />
                <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Question 3 of 5</span>
                    <span>450 max points</span>
                </div>
                <Button onClick={submitAnswer} disabled={selectedAnswer === null} className="w-full">
                    Submit Answer
                </Button>
            </div>
        </div>
    )
}
