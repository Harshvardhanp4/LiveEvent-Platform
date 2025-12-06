"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Trophy, Clock, CheckCircle2, XCircle } from "lucide-react"
import { useSocket } from "@/components/providers/socket-provider"
import { useToast } from "@/hooks/use-toast"

interface QuizEngineProps {
    eventId: string
    onScoreUpdate: (score: number) => void
}

interface Quiz {
    id: string
    question: string
    options: string[]
    correctAnswer: number
    timeLimit: number
    isActive: boolean
}

export function QuizEngine({ eventId, onScoreUpdate }: QuizEngineProps) {
    const { socket } = useSocket()
    const { toast } = useToast()
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
    const [timeLeft, setTimeLeft] = useState(0)
    const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null)
    const [hasSubmitted, setHasSubmitted] = useState(false)
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
    const [currentScore, setCurrentScore] = useState(540)
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    // Fetch active quiz from database on mount
    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const response = await fetch(`/api/events/${eventId}/quizzes`)
                if (response.ok) {
                    const data = await response.json()
                    if (data.quiz) {
                        setCurrentQuiz(data.quiz)
                        setTimeLeft(data.quiz.timeLimit)
                        
                        // Start countdown timer
                        if (timerRef.current) {
                            clearInterval(timerRef.current)
                        }
                        
                        timerRef.current = setInterval(() => {
                            setTimeLeft((prev) => {
                                if (prev <= 1) {
                                    if (timerRef.current) {
                                        clearInterval(timerRef.current)
                                    }
                                    return 0
                                }
                                return prev - 1
                            })
                        }, 1000)
                    }
                }
            } catch (error) {
                console.error("Failed to fetch quiz:", error)
            }
        }

        fetchQuiz()
    }, [eventId])

    useEffect(() => {
        if (!socket) return

        const handleNewQuiz = (quiz: Quiz) => {
            setCurrentQuiz(quiz)
            setTimeLeft(quiz.timeLimit)
            setSelectedAnswer(null)
            setHasSubmitted(false)
            setIsCorrect(null)
            
            // Start countdown timer
            if (timerRef.current) {
                clearInterval(timerRef.current)
            }
            
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        if (timerRef.current) {
                            clearInterval(timerRef.current)
                        }
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
        }

        socket.on("new-quiz", handleNewQuiz)

        return () => {
            socket.off("new-quiz", handleNewQuiz)
            if (timerRef.current) {
                clearInterval(timerRef.current)
            }
        }
    }, [socket])

    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current)
            }
        }
    }, [])

    const submitAnswer = () => {
        if (selectedAnswer === null || !currentQuiz || hasSubmitted) return

        // Stop the timer when user submits
        if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
        }

        const correct = selectedAnswer === currentQuiz.correctAnswer
        const points = correct ? 100 : 0
        const newScore = currentScore + points
        setCurrentScore(newScore)
        onScoreUpdate(newScore)
        setHasSubmitted(true)
        setIsCorrect(correct)

        // Send quiz response to server
        if (socket) {
            socket.emit("quiz-response", {
                eventId,
                quizId: currentQuiz.id,
                optionId: selectedAnswer.toString(),
            })
        }

        toast({
            title: correct ? "Correct!" : "Incorrect",
            description: correct ? `You earned ${points} points!` : "Better luck next time!",
        })
    }

    if (!currentQuiz) {
        return (
            <div className="bg-muted/50 rounded-lg p-6 space-y-4 text-center">
                <Trophy className="h-12 w-12 text-yellow-500 mx-auto opacity-50" />
                <p className="text-muted-foreground">Waiting for quiz to start...</p>
            </div>
        )
    }

    const progress = currentQuiz.timeLimit > 0 ? ((currentQuiz.timeLimit - timeLeft) / currentQuiz.timeLimit) * 100 : 0

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

            <h4 className="text-lg mb-4">{currentQuiz.question}</h4>

            <div className="space-y-3 mb-4">
                {currentQuiz.options.map((option, index) => {
                    const isSelected = selectedAnswer === index
                    const isCorrectAnswer = index === currentQuiz.correctAnswer
                    const showResult = hasSubmitted
                    
                    // Determine button styling based on state
                    let buttonVariant: "default" | "outline" | "destructive" | "secondary" = "outline"
                    let buttonClassName = "w-full justify-start text-left"
                    
                    if (showResult) {
                        if (isCorrectAnswer) {
                            buttonVariant = "default"
                            buttonClassName += " bg-green-600 hover:bg-green-700 text-white border-green-600"
                        } else if (isSelected && !isCorrectAnswer) {
                            buttonVariant = "destructive"
                            buttonClassName += " bg-red-600 hover:bg-red-700 text-white border-red-600"
                        } else {
                            buttonVariant = "secondary"
                            buttonClassName += " opacity-50"
                        }
                    } else if (isSelected) {
                        buttonVariant = "default"
                    }

                    return (
                        <Button
                            key={index}
                            variant={buttonVariant}
                            className={buttonClassName}
                            onClick={() => !hasSubmitted && setSelectedAnswer(index)}
                            disabled={hasSubmitted || timeLeft === 0}
                        >
                            <div className="flex items-center justify-between w-full">
                                <span>{String.fromCharCode(65 + index)}. {option}</span>
                                {showResult && (
                                    <span className="ml-2">
                                        {isCorrectAnswer && (
                                            <CheckCircle2 className="h-5 w-5 text-white" />
                                        )}
                                        {isSelected && !isCorrectAnswer && (
                                            <XCircle className="h-5 w-5 text-white" />
                                        )}
                                    </span>
                                )}
                            </div>
                        </Button>
                    )
                })}
            </div>

            {hasSubmitted && (
                <div className={`p-3 rounded-lg mb-4 ${isCorrect ? 'bg-green-500/20 border border-green-500' : 'bg-red-500/20 border border-red-500'}`}>
                    <div className="flex items-center gap-2">
                        {isCorrect ? (
                            <>
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                                <span className="text-green-600 font-medium">Correct Answer! You earned 100 points.</span>
                            </>
                        ) : (
                            <>
                                <XCircle className="h-5 w-5 text-red-600" />
                                <span className="text-red-600 font-medium">Incorrect Answer. The correct answer was option {String.fromCharCode(65 + currentQuiz.correctAnswer)}.</span>
                            </>
                        )}
                    </div>
                </div>
            )}

            <div className="space-y-3">
                <Progress value={progress} className="h-2" />
                <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Time Remaining: {timeLeft}s</span>
                    <span>Your Score: {currentScore} points</span>
                </div>
                <Button 
                    onClick={submitAnswer} 
                    disabled={selectedAnswer === null || hasSubmitted || timeLeft === 0} 
                    className="w-full"
                >
                    {hasSubmitted ? "Answer Submitted" : "Submit Answer"}
                </Button>
            </div>
        </div>
    )
}
