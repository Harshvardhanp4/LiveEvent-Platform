"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { useSocket } from "@/components/providers/socket-provider"

interface ScreenShareState {
  isSharing: boolean
  stream: MediaStream | null
  error: string | null
}

export function useScreenShare(eventId: string, isHost: boolean) {
  const { socket } = useSocket()
  const [state, setState] = useState<ScreenShareState>({
    isSharing: false,
    stream: null,
    error: null,
  })
  
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map())
  const localStreamRef = useRef<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Initialize peer connections for viewers
  const createPeerConnection = useCallback((viewerId: string): RTCPeerConnection => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    })

    // Add local stream tracks to peer connection
    if (localStreamRef.current) {
      const tracks = localStreamRef.current.getTracks()
      tracks.forEach((track) => {
        pc.addTrack(track, localStreamRef.current!)
      })
    }

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit("ice-candidate", {
          eventId,
          targetUserId: viewerId,
          candidate: event.candidate,
        })
      }
    }

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "failed" || pc.connectionState === "disconnected") {
        peerConnectionsRef.current.delete(viewerId)
      }
    }

    return pc
  }, [eventId, socket])

  // Start screen sharing
  const startScreenShare = useCallback(async () => {
    try {
      setState({ isSharing: false, stream: null, error: null })

      // Request screen share with audio
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: "monitor",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } as any, // TypeScript workaround for audio in getDisplayMedia
      })

      localStreamRef.current = stream
      
      // Set stream to video element for preview
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      // Handle stream end (user stops sharing)
      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare()
      }

      setState({ isSharing: true, stream, error: null })

      // Join WebRTC room as host and then notify viewers
      if (socket) {
        // First join the WebRTC room
        socket.emit("join-webrtc-room", {
          eventId,
          isHost: true,
        })
        
        // Wait a bit for room join to complete, then notify viewers
        setTimeout(() => {
          // Notify viewers about screen share
          socket.emit("host-media-state", {
            eventId,
            hasVideo: true,
            hasAudio: true,
            hasScreen: true,
          })
          
          // Broadcast screen share started to all viewers
          socket.emit("screen-share-started", { eventId })
          
          // Request existing viewers to connect
          socket.emit("request-viewers", { eventId })
        }, 500) // Increased timeout to ensure room join completes
      }
    } catch (error: any) {
      const errorMessage = error.name === "NotAllowedError" 
        ? "Screen sharing permission denied. Please allow screen sharing."
        : error.name === "NotFoundError"
        ? "No screen or window found to share."
        : "Failed to start screen sharing."
      
      setState({ isSharing: false, stream: null, error: errorMessage })
      console.error("Screen share error:", error)
    }
  }, [eventId, socket])

  // Stop screen sharing
  const stopScreenShare = useCallback(() => {
    // Stop all tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop())
      localStreamRef.current = null
    }

    // Close all peer connections
    peerConnectionsRef.current.forEach((pc) => {
      pc.close()
    })
    peerConnectionsRef.current.clear()

    // Clear video element
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    setState({ isSharing: false, stream: null, error: null })

    // Notify viewers
    if (socket) {
      socket.emit("host-media-state", {
        eventId,
        hasVideo: false,
        hasAudio: false,
        hasScreen: false,
      })
      socket.emit("screen-share-stopped", { eventId })
    }
  }, [eventId, socket])

  // Handle WebRTC signaling for host
  useEffect(() => {
    if (!socket || !isHost) return

    const handleViewerJoined = async (data: { viewerId: string }) => {
      // Only process if we're the host and have a stream
      if (!localStreamRef.current) {
        // If stream not ready yet, wait a bit and retry
        setTimeout(() => {
          if (localStreamRef.current && !peerConnectionsRef.current.has(data.viewerId)) {
            handleViewerJoined(data)
          }
        }, 500)
        return
      }

      // Don't create connection for ourselves
      if (data.viewerId === socket.id) {
        return
      }

      // Check if peer connection already exists
      if (peerConnectionsRef.current.has(data.viewerId)) {
        return
      }

      const pc = createPeerConnection(data.viewerId)
      peerConnectionsRef.current.set(data.viewerId, pc)

      try {
        const offer = await pc.createOffer({
          offerToReceiveAudio: false,
          offerToReceiveVideo: false,
        })
        await pc.setLocalDescription(offer)

        socket.emit("offer", {
          eventId,
          targetUserId: data.viewerId,
          offer: pc.localDescription,
        })
      } catch (error) {
        console.error("[Host] Error creating offer:", error)
        peerConnectionsRef.current.delete(data.viewerId)
      }
    }

    const handleAnswer = async (data: { fromUserId: string; answer: RTCSessionDescriptionInit }) => {
      const pc = peerConnectionsRef.current.get(data.fromUserId)
      if (pc) {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(data.answer))
        } catch (error) {
          console.error("[Host] Error setting remote description:", error)
        }
      }
    }

    const handleIceCandidate = async (data: { fromUserId: string; candidate: RTCIceCandidateInit }) => {
      const pc = peerConnectionsRef.current.get(data.fromUserId)
      if (pc && data.candidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate))
        } catch (error) {
          console.error(`[Host] Error adding ICE candidate from ${data.fromUserId}:`, error)
        }
      }
    }

    socket.on("viewer-joined", handleViewerJoined)
    socket.on("answer", handleAnswer)
    socket.on("ice-candidate", handleIceCandidate)

    return () => {
      socket.off("viewer-joined", handleViewerJoined)
      socket.off("answer", handleAnswer)
      socket.off("ice-candidate", handleIceCandidate)
    }
  }, [socket, isHost, eventId, createPeerConnection])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScreenShare()
    }
  }, [stopScreenShare])

  return {
    ...state,
    videoRef,
    startScreenShare,
    stopScreenShare,
  }
}

