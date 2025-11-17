"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { io, type Socket } from "socket.io-client"

interface SocketContextType {
    socket: Socket | null
    isConnected: boolean
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
})

export function SocketProvider({ children }: { children: React.ReactNode }) {
    const [socket, setSocket] = useState<Socket | null>(null)
    const [isConnected, setIsConnected] = useState(false)

    useEffect(() => {
        const socketInstance = io(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000", {
            path: "/api/socket/io",
            addTrailingSlash: false,
        })

        socketInstance.on("connect", () => {
            setIsConnected(true)
        })

        socketInstance.on("disconnect", () => {
            setIsConnected(false)
        })

        setSocket(socketInstance)

        return () => {
            socketInstance.disconnect()
        }
    }, [])

    return <SocketContext.Provider value={{ socket, isConnected }}>{children}</SocketContext.Provider>
}

export function useSocket() {
    return useContext(SocketContext)
}
