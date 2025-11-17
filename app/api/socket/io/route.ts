import type { NextApiRequest } from "next"
import type { NextApiResponseServerIO } from "@/lib/socket"
import { Server as ServerIO } from "socket.io"
import type { Server as NetServer } from "http"
import { prisma } from "@/lib/prisma"

export default function ioHandler(req: NextApiRequest, res: NextApiResponseServerIO) {
    if (!res.socket.server.io) {
        const path = "/api/socket/io"
        const httpServer: NetServer = res.socket.server as any
        const io = new ServerIO(httpServer, {
            path: path,
            addTrailingSlash: false,
        })

        io.on("connection", (socket) => {
            console.log("User connected:", socket.id)

            socket.on("join-room", (eventId: string) => {
                socket.join(eventId)
                console.log(`User ${socket.id} joined room ${eventId}`)
            })

            socket.on("new-message", async (data) => {
                try {
                    console.log("Received message data:", data)

                    // Save message to database
                    const message = await prisma.message.create({
                        data: {
                            content: data.content,
                            userId: data.user.id,
                            eventId: data.eventId,
                        },
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    image: true,
                                    role: true,
                                },
                            },
                        },
                    })

                    console.log("Message saved, broadcasting to room:", data.eventId)

                    // Broadcast message to all users in the event room (including sender)
                    io.to(data.eventId).emit("new-message", {
                        id: message.id,
                        content: message.content,
                        user: {
                            id: message.user.id,
                            name: message.user.name,
                            role: message.user.role,
                        },
                        timestamp: message.timestamp.toISOString(),
                        reactions: {},
                    })
                } catch (error) {
                    console.error("Error saving message:", error)
                }
            })

            socket.on("message-reaction", async (data) => {
                try {
                    // Broadcast reaction to all users in the room
                    io.to(data.eventId).emit("message-reaction", {
                        messageId: data.messageId,
                        reaction: data.reaction,
                        count: 1,
                    })
                } catch (error) {
                    console.error("Error handling reaction:", error)
                }
            })

            socket.on("ban-user", async (data) => {
                try {
                    io.to(data.eventId).emit("user-banned", {
                        userId: data.userId,
                    })
                } catch (error) {
                    console.error("Error banning user:", error)
                }
            })

            socket.on("new-quiz", (data) => {
                socket.to(data.eventId).emit("new-quiz", data.quiz)
            })

            socket.on("quiz-response", (data) => {
                console.log("Quiz response:", data)
            })

            socket.on("new-poll", (data) => {
                socket.to(data.eventId).emit("new-poll", data.poll)
            })

            socket.on("poll-response", (data) => {
                console.log("Poll response:", data)
            })

            socket.on("question-submitted", (data) => {
                socket.to(data.eventId).emit("question-submitted", {
                    id: Date.now().toString(),
                    question: data.question,
                    approved: false,
                    user: { name: "User" },
                })
            })

            socket.on("disconnect", () => {
                console.log("User disconnected:", socket.id)
            })
        })

        res.socket.server.io = io
    }
    res.end()
}

