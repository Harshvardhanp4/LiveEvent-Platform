"use client"

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Share2, Square, AlertCircle } from "lucide-react"
import { useScreenShare } from "@/hooks/use-screen-share"

interface ScreenSharePreviewProps {
  eventId: string
  isHost: boolean
  onSharingChange?: (isSharing: boolean) => void
  autoStart?: boolean
}

export function ScreenSharePreview({ eventId, isHost, onSharingChange, autoStart = false }: ScreenSharePreviewProps) {
  const { isSharing, stream, error, videoRef, startScreenShare, stopScreenShare } = useScreenShare(eventId, isHost)

  // Expose start/stop functions via ref or callback
  useEffect(() => {
    if (onSharingChange) {
      onSharingChange(isSharing)
    }
  }, [isSharing, onSharingChange])

  // Auto-start if requested
  useEffect(() => {
    if (autoStart && !isSharing) {
      startScreenShare().catch((error) => {
        console.error("[ScreenSharePreview] Auto-start failed:", error)
      })
    }
  }, [autoStart, isSharing, startScreenShare, eventId])

  // Expose functions to parent via window (for goLive integration)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any)[`screenShare_${eventId}`] = {
        start: startScreenShare,
        stop: stopScreenShare,
        isSharing,
      }
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any)[`screenShare_${eventId}`]
      }
    }
  }, [eventId, startScreenShare, stopScreenShare, isSharing])

  return (
    <Card className="rounded-2xl shadow-lg overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Screen Share
          </CardTitle>
          {isSharing && (
            <Badge variant="destructive" className="animate-pulse">
              🔴 LIVE
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Video Preview */}
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          {isSharing ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <Share2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No screen share active</p>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-2">
          {!isSharing ? (
            <Button
              onClick={startScreenShare}
              className="flex-1"
              variant="default"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Start Screen Share
            </Button>
          ) : (
            <Button
              onClick={stopScreenShare}
              className="flex-1"
              variant="destructive"
            >
              <Square className="h-4 w-4 mr-2" />
              Stop Sharing
            </Button>
          )}
        </div>

        {/* Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Screen share includes audio and video</p>
          <p>• Select the screen/window you want to share</p>
          <p>• Viewers will see your shared content in real-time</p>
        </div>
      </CardContent>
    </Card>
  )
}

