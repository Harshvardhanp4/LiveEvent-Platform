"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, Video, VideoOff, Settings, Maximize2, Volume2, VolumeX } from "lucide-react"

interface VideoStreamProps {
    eventId: string
    isHost?: boolean
}

export function VideoStream({ eventId, isHost = false }: VideoStreamProps) {
    const [isMuted, setIsMuted] = useState(false)
    const [isVideoOff, setIsVideoOff] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [volume, setVolume] = useState(100)
    const [viewerCount, setViewerCount] = useState(0)

    useEffect(() => {
        // Simulate viewer count updates
        const interval = setInterval(() => {
            setViewerCount(Math.floor(Math.random() * 500) + 100)
        }, 5000)

        return () => clearInterval(interval)
    }, [])

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen()
            setIsFullscreen(true)
        } else {
            document.exitFullscreen()
            setIsFullscreen(false)
        }
    }

    return (
        <Card className="overflow-hidden">
            <CardContent className="p-0">
                <div className="relative aspect-video bg-black">
                    {/* Video Stream Placeholder */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-white">
                            <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <div className="w-10 h-10 bg-white rounded-full animate-pulse"></div>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Live Stream</h3>
                            <p className="text-gray-300 mb-4">WebRTC video streaming would be integrated here</p>
                            <Badge variant="destructive" className="animate-pulse">
                                LIVE
                            </Badge>
                        </div>
                    </div>

                    {/* Stream Overlay */}
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                        <Badge variant="destructive" className="animate-pulse">
                            LIVE
                        </Badge>
                        <Badge variant="secondary" className="bg-black/50 text-white">
                            {viewerCount} viewers
                        </Badge>
                    </div>

                    {/* Controls Overlay */}
                    <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {isHost && (
                                    <>
                                        <Button
                                            size="sm"
                                            variant={isMuted ? "destructive" : "secondary"}
                                            onClick={() => setIsMuted(!isMuted)}
                                        >
                                            {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant={isVideoOff ? "destructive" : "secondary"}
                                            onClick={() => setIsVideoOff(!isVideoOff)}
                                        >
                                            {isVideoOff ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                                        </Button>
                                    </>
                                )}
                                <Button size="sm" variant="secondary">
                                    {volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                                </Button>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button size="sm" variant="secondary">
                                    <Settings className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="secondary" onClick={toggleFullscreen}>
                                    <Maximize2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
