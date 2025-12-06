"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { useSocket } from "@/components/providers/socket-provider"

interface ScreenViewerState {
  isReceiving: boolean
  stream: MediaStream | null
  error: string | null
}

export function useScreenViewer(eventId: string) {
  const { socket } = useSocket()
  const [state, setState] = useState<ScreenViewerState>({
    isReceiving: false,
    stream: null,
    error: null,
  })
  
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const pendingStreamRef = useRef<MediaStream | null>(null) // Store stream if video element not ready

  // Create peer connection for receiving stream
  const createPeerConnection = useCallback((): RTCPeerConnection => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    })

    // Handle incoming stream
    pc.ontrack = (event) => {
      if (event.streams[0]) {
        const stream = event.streams[0]
        
        // Store stream for later if video element not ready
        pendingStreamRef.current = stream
        
        // Try to set video element if available
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          // Let autoPlay attribute handle playback - don't call play() explicitly
          // This avoids autoplay policy issues
        }
        
        setState({
          isReceiving: true,
          stream: stream,
          error: null,
        })
      }
    }

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit("ice-candidate", {
          eventId,
          targetUserId: "host", // Send to host
          candidate: event.candidate,
        })
      }
    }

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "failed" || pc.connectionState === "disconnected") {
        setState({
          isReceiving: false,
          stream: null,
          error: "Connection lost",
        })
      }
    }

    return pc
  }, [eventId, socket])

  // Handle WebRTC signaling for viewer
  useEffect(() => {
    if (!socket) return

    // Join WebRTC room immediately (this is a Socket.IO room, independent of gRPC)
    socket.emit("join-webrtc-room", {
      eventId,
      isHost: false,
    })

    // Small delay to ensure room join is processed
    const joinTimeout = setTimeout(() => {
      // If screen share is already active, notify host immediately
      socket.emit("viewer-joined", { eventId, viewerId: socket.id })
    }, 500)

    const handleScreenShareStarted = async () => {
      // Notify host that viewer wants to connect
      clearTimeout(joinTimeout)
      socket.emit("viewer-joined", { eventId, viewerId: socket.id })
    }
    
    const handleRequestViewers = () => {
      // If screen share is already active, notify host to create connection
      clearTimeout(joinTimeout)
      if (peerConnectionRef.current === null) {
        socket.emit("viewer-joined", { eventId, viewerId: socket.id })
      }
    }

    const handleOffer = async (data: { fromUserId: string; offer: RTCSessionDescriptionInit }) => {
      try {
        // Close existing connection if any
        if (peerConnectionRef.current) {
          peerConnectionRef.current.close()
        }
        
        const pc = createPeerConnection()
        peerConnectionRef.current = pc

        await pc.setRemoteDescription(new RTCSessionDescription(data.offer))
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)

        socket.emit("answer", {
          eventId,
          targetUserId: data.fromUserId,
          answer: pc.localDescription,
        })
      } catch (error) {
        console.error("[Viewer] Error handling offer:", error)
        setState((prev) => ({
          ...prev,
          error: "Failed to connect to stream",
        }))
      }
    }

    const handleIceCandidate = async (data: { fromUserId: string; candidate: RTCIceCandidateInit }) => {
      const pc = peerConnectionRef.current
      if (pc && data.candidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate))
        } catch (error) {
          console.error("[Viewer] Error adding ICE candidate:", error)
        }
      }
    }

    const handleScreenShareStopped = () => {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close()
        peerConnectionRef.current = null
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
      setState({
        isReceiving: false,
        stream: null,
        error: null,
      })
    }

    socket.on("screen-share-started", handleScreenShareStarted)
    socket.on("request-viewers", handleRequestViewers)
    socket.on("offer", handleOffer)
    socket.on("ice-candidate", handleIceCandidate)
    socket.on("screen-share-stopped", handleScreenShareStopped)

    return () => {
      clearTimeout(joinTimeout)
      socket.off("screen-share-started", handleScreenShareStarted)
      socket.off("request-viewers", handleRequestViewers)
      socket.off("offer", handleOffer)
      socket.off("ice-candidate", handleIceCandidate)
      socket.off("screen-share-stopped", handleScreenShareStopped)
      
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close()
      }
    }
  }, [socket, eventId, createPeerConnection])

  // Effect to set stream when video element becomes available
  useEffect(() => {
    if (videoRef.current && pendingStreamRef.current && !videoRef.current.srcObject) {
      videoRef.current.srcObject = pendingStreamRef.current
      // Let autoPlay attribute handle playback
    }
  }, [state.isReceiving, state.stream])

  return {
    ...state,
    videoRef,
  }
}

