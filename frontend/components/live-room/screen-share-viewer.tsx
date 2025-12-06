"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useScreenViewer } from "@/hooks/use-screen-viewer"
import { AlertCircle, Play } from "lucide-react"

interface ScreenShareViewerProps {
  eventId: string
}

export function ScreenShareViewer({ eventId }: ScreenShareViewerProps) {
  const { isReceiving, stream, error, videoRef } = useScreenViewer(eventId)
  const [showPlayButton, setShowPlayButton] = useState(false)

  // Check if video is paused (autoplay blocked)
  useEffect(() => {
    const video = videoRef.current
    if (!video || !isReceiving) return
    
    const checkPlayback = () => {
      if (video.paused && video.readyState >= 2) {
        setShowPlayButton(true)
      } else {
        setShowPlayButton(false)
      }
    }

    const handlePlay = () => {
      setShowPlayButton(false)
    }

    const handlePause = () => {
      if (video.readyState >= 2) {
        setShowPlayButton(true)
      }
    }

    const handleLoadedMetadata = () => {
      // Check after metadata loads
      setTimeout(checkPlayback, 100)
    }

    video.addEventListener("play", handlePlay)
    video.addEventListener("pause", handlePause)
    video.addEventListener("loadedmetadata", handleLoadedMetadata)
    
    // Initial check
    checkPlayback()

    return () => {
      video.removeEventListener("play", handlePlay)
      video.removeEventListener("pause", handlePause)
      video.removeEventListener("loadedmetadata", handleLoadedMetadata)
    }
  }, [isReceiving, stream])

  const handlePlayClick = () => {
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.error("[ScreenShareViewer] Manual play failed:", error)
      })
    }
  }

  return (
    <Card className="rounded-2xl shadow-lg overflow-hidden">
      <CardContent className="p-0">
        <div className="relative aspect-video bg-black">
          {/* Always render video element so ref is available when stream arrives */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={false}
            className={`w-full h-full object-contain ${isReceiving && stream ? 'block' : 'hidden'}`}
            onClick={handlePlayClick}
          />
          
          {/* Play button overlay if autoplay blocked */}
          {showPlayButton && isReceiving && stream && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Button
                onClick={handlePlayClick}
                size="lg"
                className="rounded-full w-20 h-20 p-0"
                variant="default"
              >
                <Play className="h-10 w-10 ml-1" />
              </Button>
            </div>
          )}
          
          {isReceiving && stream ? (
            <div className="absolute top-4 left-4">
              <Badge variant="destructive" className="animate-pulse">
                🔴 LIVE
              </Badge>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              {error ? (
                <div className="flex items-center gap-2 text-red-500">
                  <AlertCircle className="h-5 w-5" />
                  <span>{error}</span>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <div className="w-8 h-8 bg-white rounded-full"></div>
                  </div>
                  <p className="text-sm text-white mb-2">Event is Live</p>
                  <p className="text-xs text-gray-400">Waiting for host to share screen...</p>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

