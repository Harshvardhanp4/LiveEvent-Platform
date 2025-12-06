import type { NextApiRequest } from "next"
import type { NextApiResponseServerIO } from "@/lib/socket"
import { Server as ServerIO } from "socket.io"
import type { Server as NetServer } from "http"

export default function ioHandler(req: NextApiRequest, res: NextApiResponseServerIO) {
    if (!res.socket.server.io) {
        const path = "/api/socket/io"
        const httpServer: NetServer = res.socket.server as any
        const io = new ServerIO(httpServer, {
            path: path,
            addTrailingSlash: false,
        })

        io.on("connection", (socket) => {
            socket.on("join-room", (eventId: string) => {
                socket.join(eventId)
            })

            socket.on("new-message", async (data) => {
                // Broadcast message to all users in the event room
                socket.to(data.eventId).emit("new-message", {
                    id: Date.now().toString(),
                    content: data.content,
                    user: { name: "User" }, // In real app, get from auth
                    timestamp: new Date().toISOString(),
                })
            })

            socket.on("new-quiz", (data) => {
                socket.to(data.eventId).emit("new-quiz", data.quiz)
            })

            socket.on("quiz-response", (data) => {
                // Handle quiz response and update leaderboard
            })

            socket.on("new-poll", (data) => {
                socket.to(data.eventId).emit("new-poll", data.poll)
            })

            socket.on("poll-response", (data) => {
                // Handle poll response
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
                // User disconnected
            })
        })

        res.socket.server.io = io
    }
    res.end()
}
