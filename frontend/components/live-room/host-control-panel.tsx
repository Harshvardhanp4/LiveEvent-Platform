"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSocket } from "@/components/providers/socket-provider"
import { useToast } from "@/hooks/use-toast"
import { Play, Pause, BarChart3, HelpCircle, MessageSquare, Settings, Eye, EyeOff } from "lucide-react"

interface HostControlPanelProps {
    eventId: string
}

export function HostControlPanel({ eventId }: HostControlPanelProps) {
    const { socket } = useSocket()
    const { toast } = useToast()
    const [isEventLive, setIsEventLive] = useState(true)

    // Quiz state
    const [quizQuestion, setQuizQuestion] = useState("")
    const [quizOptions, setQuizOptions] = useState(["", "", "", ""])
    const [correctAnswer, setCorrectAnswer] = useState(0)
    const [timeLimit, setTimeLimit] = useState(30)

    // Poll state
    const [pollQuestion, setPollQuestion] = useState("")
    const [pollOptions, setPollOptions] = useState(["", ""])

    // Q&A state
    const [pendingQuestions, setPendingQuestions] = useState([
        { id: "1", question: "What is the future of AI?", user: "John Doe", approved: false },
        { id: "2", question: "How do you handle scaling?", user: "Jane Smith", approved: false },
    ])

    const toggleEventStatus = () => {
        setIsEventLive(!isEventLive)
        toast({
            title: isEventLive ? "Event Paused" : "Event Started",
            description: `The event has been ${isEventLive ? "paused" : "started"}.`,
        })
    }

    const launchQuiz = () => {
        if (!quizQuestion.trim() || quizOptions.some((opt) => !opt.trim())) {
            toast({
                title: "Invalid Quiz",
                description: "Please fill in all quiz fields.",
                variant: "destructive",
            })
            return
        }

        const quiz = {
            id: Date.now().toString(),
            question: quizQuestion,
            options: quizOptions.filter((opt) => opt.trim()),
            correctAnswer,
            timeLimit,
            isActive: true,
        }

        socket?.emit("new-quiz", { eventId, quiz })

        toast({
            title: "Quiz Launched!",
            description: "Participants can now answer the quiz.",
        })

        // Reset form
        setQuizQuestion("")
        setQuizOptions(["", "", "", ""])
        setCorrectAnswer(0)
    }

    const launchPoll = () => {
        if (!pollQuestion.trim() || pollOptions.some((opt) => !opt.trim())) {
            toast({
                title: "Invalid Poll",
                description: "Please fill in all poll fields.",
                variant: "destructive",
            })
            return
        }

        const poll = {
            id: Date.now().toString(),
            question: pollQuestion,
            options: pollOptions.filter((opt) => opt.trim()),
            responses: {},
            isActive: true,
        }

        socket?.emit("new-poll", { eventId, poll })

        toast({
            title: "Poll Launched!",
            description: "Participants can now vote in the poll.",
        })

        // Reset form
        setPollQuestion("")
        setPollOptions(["", ""])
    }

    const approveQuestion = (questionId: string) => {
        setPendingQuestions((prev) => prev.map((q) => (q.id === questionId ? { ...q, approved: true } : q)))
        socket?.emit("question-approved", { eventId, questionId })
        toast({
            title: "Question Approved",
            description: "The question is now visible to all participants.",
        })
    }

    const addPollOption = () => {
        setPollOptions([...pollOptions, ""])
    }

    const updatePollOption = (index: number, value: string) => {
        const newOptions = [...pollOptions]
        newOptions[index] = value
        setPollOptions(newOptions)
    }

    const updateQuizOption = (index: number, value: string) => {
        const newOptions = [...quizOptions]
        newOptions[index] = value
        setQuizOptions(newOptions)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Host Control Panel
                </CardTitle>
                <CardDescription>Manage your live event and engage with participants</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {/* Event Controls */}
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                            <h3 className="font-semibold">Event Status</h3>
                            <p className="text-sm text-gray-600">{isEventLive ? "Event is currently live" : "Event is paused"}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant={isEventLive ? "destructive" : "secondary"}>{isEventLive ? "LIVE" : "PAUSED"}</Badge>
                            <Button onClick={toggleEventStatus} variant={isEventLive ? "outline" : "default"}>
                                {isEventLive ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                                {isEventLive ? "Pause Event" : "Start Event"}
                            </Button>
                        </div>
                    </div>

                    {/* Interactive Tools */}
                    <Tabs defaultValue="quiz" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="quiz">
                                <HelpCircle className="mr-2 h-4 w-4" />
                                Quiz
                            </TabsTrigger>
                            <TabsTrigger value="poll">
                                <BarChart3 className="mr-2 h-4 w-4" />
                                Poll
                            </TabsTrigger>
                            <TabsTrigger value="qna">
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Q&A
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="quiz" className="space-y-4">
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="quiz-question">Question</Label>
                                    <Textarea
                                        id="quiz-question"
                                        placeholder="Enter your quiz question..."
                                        value={quizQuestion}
                                        onChange={(e) => setQuizQuestion(e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    {quizOptions.map((option, index) => (
                                        <div key={index}>
                                            <Label htmlFor={`option-${index}`}>Option {index + 1}</Label>
                                            <Input
                                                id={`option-${index}`}
                                                placeholder={`Option ${index + 1}`}
                                                value={option}
                                                onChange={(e) => updateQuizOption(index, e.target.value)}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="correct-answer">Correct Answer</Label>
                                        <select
                                            id="correct-answer"
                                            className="w-full p-2 border rounded-md"
                                            value={correctAnswer}
                                            onChange={(e) => setCorrectAnswer(Number(e.target.value))}
                                        >
                                            {quizOptions.map((_, index) => (
                                                <option key={index} value={index}>
                                                    Option {index + 1}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <Label htmlFor="time-limit">Time Limit (seconds)</Label>
                                        <Input
                                            id="time-limit"
                                            type="number"
                                            min="10"
                                            max="300"
                                            value={timeLimit}
                                            onChange={(e) => setTimeLimit(Number(e.target.value))}
                                        />
                                    </div>
                                </div>
                                <Button onClick={launchQuiz} className="w-full">
                                    <HelpCircle className="mr-2 h-4 w-4" />
                                    Launch Quiz
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="poll" className="space-y-4">
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="poll-question">Poll Question</Label>
                                    <Input
                                        id="poll-question"
                                        placeholder="Enter your poll question..."
                                        value={pollQuestion}
                                        onChange={(e) => setPollQuestion(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Options</Label>
                                    {pollOptions.map((option, index) => (
                                        <Input
                                            key={index}
                                            placeholder={`Option ${index + 1}`}
                                            value={option}
                                            onChange={(e) => updatePollOption(index, e.target.value)}
                                        />
                                    ))}
                                    <Button variant="outline" onClick={addPollOption} size="sm">
                                        Add Option
                                    </Button>
                                </div>
                                <Button onClick={launchPoll} className="w-full">
                                    <BarChart3 className="mr-2 h-4 w-4" />
                                    Launch Poll
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="qna" className="space-y-4">
                            <div className="space-y-3">
                                <h3 className="font-semibold">Pending Questions</h3>
                                {pendingQuestions
                                    .filter((q) => !q.approved)
                                    .map((question) => (
                                        <div key={question.id} className="p-3 border rounded-lg">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <p className="font-medium">{question.question}</p>
                                                    <p className="text-sm text-gray-600">by {question.user}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button size="sm" onClick={() => approveQuestion(question.id)}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        Approve
                                                    </Button>
                                                    <Button size="sm" variant="outline">
                                                        <EyeOff className="mr-2 h-4 w-4" />
                                                        Reject
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                {pendingQuestions.filter((q) => !q.approved).length === 0 && (
                                    <p className="text-center text-gray-500 py-4">No pending questions</p>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </CardContent>
        </Card>
    )
}
