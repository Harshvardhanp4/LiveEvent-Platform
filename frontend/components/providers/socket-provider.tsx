"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState, useRef } from "react"
import { io, type Socket } from "socket.io-client"
import { useSession } from "next-auth/react"

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
    const { data: session } = useSession()
    const socketRef = useRef<Socket | null>(null)

    useEffect(() => {
        if (!session?.user) return;

        // Fetch JWT token from API (server-side)
        const initSocket = async () => {
            try {
                const response = await fetch("/api/auth/token");
                if (!response.ok) {
                    console.error("Failed to get token");
                    return;
                }

                const data = await response.json();
                const token = data.token;

                if (!token) {
                    console.error("No token received");
                    return;
                }

                const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:4000";
                
                const socketInstance = io(wsUrl, {
                    path: "/socket.io",
                    transports: ["polling", "websocket"],
                    upgrade: true,
                    rememberUpgrade: true,
                    auth: {
                        token: token,
                    },
                    query: {
                        token: token,
                    },
                });

                socketInstance.on("connect", () => {
                    setIsConnected(true)
                })

                socketInstance.on("disconnect", (reason) => {
                    setIsConnected(false)
                })

                socketInstance.on("connect_error", (error) => {
                    console.error("Socket.IO connection error:", error);
                })

                socketRef.current = socketInstance
                setSocket(socketInstance)
            } catch (error) {
                console.error("Failed to initialize socket:", error);
            }
        };

        initSocket();

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [session])

    return <SocketContext.Provider value={{ socket, isConnected }}>{children}</SocketContext.Provider>
}

export function useSocket() {
    return useContext(SocketContext)
}
