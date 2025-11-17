"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Volume2, VolumeX, Maximize, Minimize, Settings, Users, Wifi, WifiOff } from "lucide-react"

interface WebRTCVideoProps {
    isHost?: boolean
    eventId: string
    eventTitle: string
    onViewerCountChange?: (count: number) => void
}

export function WebRTCVideo({ eventTitle, eventId, onViewerCountChange }: WebRTCVideoProps) {
    const [isConnected, setIsConnected] = useState(false)
    const [isMuted, setIsMuted] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [viewerCount, setViewerCount] = useState(1247)
    const [connectionQuality, setConnectionQuality] = useState<"excellent" | "good" | "poor">("excellent")
    const videoRef = useRef<HTMLVideoElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        // Simulate WebRTC connection
        const connectToStream = async () => {
            try {
                setIsConnected(true)

                // Simulate viewer count updates
                const interval = setInterval(() => {
                    const newCount = viewerCount + Math.floor(Math.random() * 10) - 5
                    setViewerCount(Math.max(0, newCount))
                    onViewerCountChange?.(newCount)
                }, 5000)

                return () => clearInterval(interval)
            } catch (error) {
                console.error("Failed to connect to stream:", error)
                setIsConnected(false)
            }
        }

        connectToStream()
    }, [eventId, viewerCount, onViewerCountChange])

    const toggleFullscreen = () => {
        if (!containerRef.current) return

        if (!isFullscreen) {
            containerRef.current.requestFullscreen()
        } else {
            document.exitFullscreen()
        }
        setIsFullscreen(!isFullscreen)
    }

    const getQualityColor = () => {
        switch (connectionQuality) {
            case "excellent":
                return "text-green-500"
            case "good":
                return "text-yellow-500"
            case "poor":
                return "text-red-500"
            default:
                return "text-gray-500"
        }
    }

    return (
        <Card className="rounded-2xl shadow-lg overflow-hidden" ref={containerRef}>
            <div
                className={`relative bg-gradient-to-br from-indigo-900 to-purple-900 ${isFullscreen ? 'w-full h-full' : 'h-[500px]'
                    }`}
            >
                {/* Video Element */}
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted={isMuted} />

                {/* Stream Status Overlay */}
                <div className="absolute top-4 left-4 flex items-center space-x-2">
                    <Badge variant="destructive" className="bg-red-500/90 text-white">
                        🔴 LIVE
                    </Badge>
                    <Badge variant="secondary" className="bg-black/50 text-white">
                        <Users className="w-3 h-3 mr-1" />
                        {viewerCount.toLocaleString()}
                    </Badge>
                    <Badge variant="secondary" className="bg-black/50 text-white">
                        {isConnected ? (
                            <Wifi className={`w-3 h-3 mr-1 ${getQualityColor()}`} />
                        ) : (
                            <WifiOff className="w-3 h-3 mr-1 text-red-500" />
                        )}
                        {connectionQuality}
                    </Badge>
                </div>

                {/* Stream Info */}
                {!isConnected && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-white">
                            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <div className="w-8 h-8 bg-white rounded-full animate-pulse"></div>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Connecting to Stream...</h3>
                            <p className="text-white/80">Please wait while we establish the connection</p>
                        </div>
                    </div>
                )}

                {isConnected && (
                    <div className="absolute bottom-6 left-6 text-white">
                        <h3 className="text-xl font-semibold mb-1">Dr. Sarah Johnson</h3>
                        <p className="text-white/80">"{eventTitle}"</p>
                    </div>
                )}

                {/* Video Controls */}
                <div className="absolute bottom-4 right-4 flex items-center space-x-2">
                    <Button
                        size="sm"
                        variant="secondary"
                        className="bg-black/50 text-white hover:bg-black/70"
                        onClick={() => setIsMuted(!isMuted)}
                    >
                        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </Button>

                    <Button
                        size="sm"
                        variant="secondary"
                        className="bg-black/50 text-white hover:bg-black/70"
                        onClick={toggleFullscreen}
                    >
                        {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                    </Button>
                </div>

                {/* Host Controls
                {isHost && (
                    <div className="absolute top-4 right-4 flex items-center space-x-2">
                        <Button size="sm" variant="secondary" className="bg-black/50 text-white hover:bg-black/70">
                            Share Screen
                        </Button>
                        <Button size="sm" variant="secondary" className="bg-black/50 text-white hover:bg-black/70">
                            Record
                        </Button>
                    </div>
                )} */}
            </div>
        </Card>
    )
}
