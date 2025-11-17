"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useSocket } from "@/components/providers/socket-provider"
//import { useAuth } from "@/components/providers/auth-provider"
import { Send, Smile, Shield, Ban, Heart } from "lucide-react"
import { useSession } from "next-auth/react"

interface Message {
    id: string
    content: string
    user: {
        name: string
        role: string
        id: string
    }
    timestamp: string
    reactions?: Record<string, number>
    isModerated?: boolean
}

interface EnhancedChatProps {
    eventId: string
    isHost?: boolean
}

export function EnhancedChat({ eventId, isHost = false }: EnhancedChatProps) {
    const { socket } = useSocket()
    const { data: session } = useSession()
    const user = session?.user
    //const { user } = useAuth()
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState("")
    const [showEmojis, setShowEmojis] = useState(false)
    const [chatFilter, setChatFilter] = useState<"all" | "questions" | "reactions">("all")
    const scrollAreaRef = useRef<HTMLDivElement>(null)

    const emojis = ["😀", "😂", "❤️", "👍", "👏", "🔥", "💯", "🎉", "🤔", "👋"]
    const quickReactions = ["👍", "❤️", "😂", "🔥"]

    // Fetch chat history when component mounts
    useEffect(() => {
        const fetchChatHistory = async () => {
            try {
                const response = await fetch(`/api/events/${eventId}/messages`)
                if (response.ok) {
                    const data = await response.json()
                    setMessages(data.messages || [])
                    console.log("Loaded chat history:", data.messages?.length || 0, "messages")
                }
            } catch (error) {
                console.error("Error fetching chat history:", error)
            }
        }

        if (eventId) {
            fetchChatHistory()
        }
    }, [eventId])

    useEffect(() => {
        if (socket && user) {
            console.log("Setting up socket listeners for eventId:", eventId)

            socket.on("new-message", (message: Message) => {
                console.log("Received new message:", message)
                setMessages((prev) => [...prev, message])
            })

            socket.on("message-reaction", ({ messageId, reaction, count }) => {
                console.log("Received reaction:", { messageId, reaction, count })
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.id === messageId ? { ...msg, reactions: { ...msg.reactions, [reaction]: count } } : msg,
                    ),
                )
            })

            return () => {
                console.log("Cleaning up socket listeners")
                socket.off("new-message")
                socket.off("message-reaction")
            }
        }
    }, [socket, user, eventId])

    useEffect(() => {
        // Auto-scroll to bottom when new messages arrive
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
        }
    }, [messages])

    const sendMessage = () => {
        if (newMessage.trim() && socket && user?.id) {
            const messageData = {
                eventId,
                content: newMessage,
                user: {
                    name: user?.name || "Anonymous",
                    role: user?.role || "PARTICIPANT",
                    id: user?.id,
                },
            }

            console.log("Sending message:", messageData)
            console.log("Socket connected:", socket.connected)
            console.log("User data:", user)
            socket.emit("new-message", messageData)

            setNewMessage("")
        } else {
            console.log("Cannot send message:", {
                hasMessage: !!newMessage.trim(),
                hasSocket: !!socket,
                hasUser: !!user,
                userId: user?.id
            })
        }
    }

    const addEmoji = (emoji: string) => {
        setNewMessage((prev) => prev + emoji)
        setShowEmojis(false)
    }

    const addReaction = (messageId: string, reaction: string) => {
        socket?.emit("message-reaction", {
            eventId,
            messageId,
            reaction,
            userId: user?.id,
        })
    }

    const moderateMessage = (messageId: string) => {
        setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, isModerated: true } : msg)))
    }

    const banUser = (userId: string) => {
        socket?.emit("ban-user", { eventId, userId })
    }

    const filteredMessages = messages.filter((msg) => {
        if (chatFilter === "questions") return msg.content.includes("?")
        if (chatFilter === "reactions") return Object.keys(msg.reactions || {}).length > 0
        return true
    })

    const getRoleColor = (role: string) => {
        switch (role) {
            case "HOST":
                return "text-red-600"
            case "ADMIN":
                return "text-purple-600"
            default:
                return "text-gray-600"
        }
    }

    const getRoleBadge = (role: string) => {
        switch (role) {
            case "HOST":
                return (
                    <Badge variant="destructive" className="text-xs">
                        HOST
                    </Badge>
                )
            case "ADMIN":
                return (
                    <Badge variant="default" className="text-xs">
                        ADMIN
                    </Badge>
                )
            default:
                return null
        }
    }

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Live Chat</CardTitle>
                    <div className="flex items-center gap-2">
                        <Button
                            variant={chatFilter === "all" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setChatFilter("all")}
                        >
                            All
                        </Button>
                        <Button
                            variant={chatFilter === "questions" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setChatFilter("questions")}
                        >
                            Q&A
                        </Button>
                        <Button
                            variant={chatFilter === "reactions" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setChatFilter("reactions")}
                        >
                            <Heart className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                <ScrollArea className="flex-1 px-4 w-full" ref={scrollAreaRef}>
                    <div className="space-y-3 pb-4 pr-2 w-full">
                        {filteredMessages.map((message) => (
                            <div key={message.id} className="group w-full">
                                <div className="flex items-start gap-2 w-full">
                                    <div className="flex-1 min-w-0 w-full overflow-hidden">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`font-semibold text-sm ${getRoleColor(message.user.role)}`}>
                                                {message.user.name}
                                            </span>
                                            {getRoleBadge(message.user.role)}
                                            <span className="text-xs text-gray-500">{new Date(message.timestamp).toLocaleTimeString()}</span>
                                        </div>
                                        <div className={`text-sm break-all whitespace-pre-wrap ${message.isModerated ? "text-gray-400 italic" : "text-white dark:text-white"}`} style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                                            {message.isModerated ? "[Message removed by moderator]" : message.content}
                                        </div>                                        {/* Reactions */}
                                        {message.reactions && Object.keys(message.reactions).length > 0 && (
                                            <div className="flex items-center gap-1 mt-1">
                                                {Object.entries(message.reactions).map(([reaction, count]) => (
                                                    <Button
                                                        key={reaction}
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-6 px-2 text-xs"
                                                        onClick={() => addReaction(message.id, reaction)}
                                                    >
                                                        {reaction} {count}
                                                    </Button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Message Actions */}
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                        {quickReactions.map((reaction) => (
                                            <Button
                                                key={reaction}
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 w-6 p-0"
                                                onClick={() => addReaction(message.id, reaction)}
                                            >
                                                {reaction}
                                            </Button>
                                        ))}

                                        {isHost && message.user.id !== user?.id && (
                                            <>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 w-6 p-0"
                                                    onClick={() => moderateMessage(message.id)}
                                                >
                                                    <Shield className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 w-6 p-0"
                                                    onClick={() => banUser(message.user.id)}
                                                >
                                                    <Ban className="h-3 w-3" />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                {/* Chat Input */}
                <div className="p-4 border-t">
                    {showEmojis && (
                        <div className="mb-2 p-2 border rounded-lg bg-gray-50">
                            <div className="grid grid-cols-10 gap-1">
                                {emojis.map((emoji) => (
                                    <Button key={emoji} variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => addEmoji(emoji)}>
                                        {emoji}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setShowEmojis(!showEmojis)}>
                            <Smile className="h-4 w-4" />
                        </Button>
                        <Input
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                            className="flex-1"
                        />
                        <Button onClick={sendMessage} size="sm">
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
