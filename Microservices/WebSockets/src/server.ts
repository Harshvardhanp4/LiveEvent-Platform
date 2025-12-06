// Load environment variables
require("dotenv").config();

import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import cors from "cors";
import jwt from "jsonwebtoken";
import { roomClient, interactionClient, callGrpc, createStream } from "./grpc-client";

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "websocket-gateway" });
});

// Test endpoint to broadcast a message to a room
app.post("/test-broadcast", (req, res) => {
  const { eventId, message } = req.body;
  if (!eventId || !message) {
    return res.status(400).json({ error: "eventId and message required" });
  }
  
  io.to(eventId).emit("new-message", {
    id: `test-${Date.now()}`,
    content: message,
    user: {
      name: "Test User",
      role: "PARTICIPANT",
      id: "test-user",
    },
    timestamp: new Date().toISOString(),
  });
  
  res.json({ success: true, eventId });
});

const httpServer = http.createServer(app);

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
  path: "/socket.io",
  transports: ["polling", "websocket"],
  allowEIO3: true,
});

// Store active streams per socket
const socketStreams = new Map<string, Map<string, any>>();

// Helper to verify JWT from socket handshake
function verifySocketToken(socket: any): { userId: string; email: string; role: string } | null {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) return null;

    const decoded = jwt.verify(token as string, JWT_SECRET) as any;
    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };
  } catch (error) {
    return null;
  }
}

io.on("connection", (socket) => {
  const user = verifySocketToken(socket);
  if (!user) {
    socket.disconnect();
    return;
  }

  // Initialize streams map for this socket
  socketStreams.set(socket.id, new Map());

  // Join event room for chat
  socket.on("join-room", async (eventId: string) => {
    try {
      // Check if already joined to prevent duplicate streams
      const streams = socketStreams.get(socket.id);
      if (streams && (streams.has(`room-${eventId}`) || streams.has(`interaction-${eventId}`))) {
        return;
      }

      await socket.join(eventId);

      // Call gRPC JoinRoom (don't fail if gRPC is unavailable - WebRTC can still work)
      try {
        await callGrpc(roomClient, "JoinRoom", {
          event_id: eventId,
          user_id: user.userId,
          is_host: user.role === "HOST" || user.role === "ADMIN",
        });
      } catch (error: any) {
        // If gRPC fails, continue - Socket.IO room join above still works
      }

      // Subscribe to room events stream (only if gRPC is available)
      try {
      const roomStream = createStream(
        roomClient,
        "StreamRoomEvents",
        { event_id: eventId },
        (event: any) => {
          // Forward room events to Socket.IO clients
          // Use io.in() to ensure all sockets in the room receive the event
          const payload = JSON.parse(event.payload_json || "{}");
          io.in(eventId).emit(event.type.toLowerCase().replace(/_/g, "-"), {
            ...payload,
            userId: event.user_id,
          });
        },
      );

      // Store stream
      if (streams) {
        streams.set(`room-${eventId}`, roomStream);
        }
      } catch (error: any) {
        // gRPC stream creation failed - continue without it
        // Socket.IO room join above still works
      }

      // Subscribe to interaction events stream
      // Capture eventId in closure to ensure it's available in the callback
      const streamEventId = eventId;
      try {
      const interactionStream = createStream(
        interactionClient,
        "StreamInteractionEvents",
        { event_id: streamEventId },
        (event: any) => {
          // Handle both snake_case and camelCase field names (proto loader with keepCase: true)
          const payloadJson = event.payload_json || event.payloadJson || "{}";
          const userId = event.user_id || event.userId || "";
          
          let payload: any = {};
          try {
            if (payloadJson && payloadJson !== "{}") {
              payload = JSON.parse(payloadJson);
            }
          } catch (error) {
            payload = {};
          }
          
          // Ensure user object exists in payload
          if (!payload.user && userId) {
            payload.user = {
              id: userId,
              name: "User",
              role: "PARTICIPANT",
            };
          }
          
          // Map interaction event types to Socket.IO events
          // Use io.in() to ensure all sockets in the room receive the event
          if (event.type === "MESSAGE") {
            const messageToEmit = {
              id: payload.id || `msg-${Date.now()}`,
              content: payload.content || "",
              user: payload.user || {
                id: userId || "",
                name: "Unknown User",
                role: "PARTICIPANT",
              },
              timestamp: payload.timestamp || new Date().toISOString(),
              reactions: payload.reactions || {},
              userId: userId,
            };
            
            io.in(streamEventId).emit("new-message", messageToEmit);
          } else if (event.type === "POLL_CREATED") {
            io.in(streamEventId).emit("new-poll", payload);
          } else if (event.type === "QUIZ_CREATED") {
            io.in(streamEventId).emit("new-quiz", payload);
          } else if (event.type === "QUESTION_SUBMITTED") {
            io.in(streamEventId).emit("question-submitted", payload);
          } else if (event.type === "QUESTION_APPROVED") {
            io.in(streamEventId).emit("question-approved", payload);
          } else if (event.type === "POLL_RESPONSE") {
            io.in(streamEventId).emit("poll-update", payload);
          }
        },
      );

      if (streams) {
        streams.set(`interaction-${eventId}`, interactionStream);
        }
      } catch (error: any) {
        // gRPC stream creation failed - continue without it
        // Socket.IO room join above still works
      }
    } catch (error) {
      socket.emit("error", { message: "Failed to join room" });
    }
  });

  // WebRTC Room Management
  socket.on("join-webrtc-room", async (data: { eventId: string; isHost: boolean }) => {
    try {
      const { eventId, isHost } = data;
      if (!eventId) {
        socket.emit("error", { message: "eventId is required" });
        return;
      }
      
      socket.join(`webrtc-${eventId}`);

      // Call gRPC JoinRoom with is_host flag (don't fail if already joined)
      try {
        await callGrpc(roomClient, "JoinRoom", {
          event_id: eventId,
          user_id: user.userId,
          is_host: isHost,
        });
      } catch (error: any) {
        // If already exists or already joined, that's fine
        if (error.code !== 6 && error.code !== 13) { // 6 = ALREADY_EXISTS, 13 = INTERNAL (might be re-join)
          socket.emit("error", { message: "Failed to join WebRTC room" });
          return;
        }
      }

      // Notify existing participants about new user
      socket.to(`webrtc-${eventId}`).emit("user-joined", {
        userId: socket.id,
        isHost: isHost,
      });

    } catch (error: any) {
      // Even if gRPC JoinRoom fails, we can still proceed with WebRTC
      // The Socket.IO room join above should still work
      // Don't emit error to client - let WebRTC proceed anyway
    }
  });

  // WebRTC Signaling for screen share
  socket.on("offer", (data: { eventId: string; targetUserId: string; offer: any }) => {
    // If targetUserId is "host", broadcast to all viewers in the room
    if (data.targetUserId === "host") {
      socket.to(`webrtc-${data.eventId}`).emit("offer", {
        fromUserId: socket.id,
        offer: data.offer,
      });
    } else {
      // Send to specific viewer by socket ID
      io.to(data.targetUserId).emit("offer", {
        fromUserId: socket.id,
        offer: data.offer,
      });
    }
  });

  socket.on("answer", (data: { eventId: string; targetUserId: string; answer: any }) => {
    // Send answer to the host (targetUserId is the host's socket.id)
    io.to(data.targetUserId).emit("answer", {
      fromUserId: socket.id,
      answer: data.answer,
    });
  });

  socket.on("ice-candidate", (data: { eventId: string; targetUserId: string; candidate: any }) => {
    // If targetUserId is "host", broadcast to all viewers in the room
    if (data.targetUserId === "host") {
      socket.to(`webrtc-${data.eventId}`).emit("ice-candidate", {
        fromUserId: socket.id,
        candidate: data.candidate,
      });
    } else {
      // Send to specific socket
      io.to(data.targetUserId).emit("ice-candidate", {
        fromUserId: socket.id,
        candidate: data.candidate,
      });
    }
  });

  // Screen share events
  socket.on("screen-share-started", (data: { eventId: string }) => {
    // Broadcast to all viewers in the WebRTC room (use io.to to include all sockets)
    io.to(`webrtc-${data.eventId}`).emit("screen-share-started", data);
  });

  socket.on("screen-share-stopped", (data: { eventId: string }) => {
    io.to(`webrtc-${data.eventId}`).emit("screen-share-stopped", data);
  });

  socket.on("viewer-joined", (data: { eventId: string; viewerId: string }) => {
    // Notify host that a viewer joined (for creating peer connection)
    // Broadcast to all sockets in the room - host will handle it
    io.to(`webrtc-${data.eventId}`).emit("viewer-joined", {
      viewerId: data.viewerId,
    });
  });

  socket.on("request-viewers", (data: { eventId: string }) => {
    // Host requests existing viewers to connect
    // Broadcast to all viewers in the room
    io.to(`webrtc-${data.eventId}`).emit("request-viewers", data);
  });

  // Host media state updates
  socket.on(
    "host-media-state",
    async (data: { eventId: string; hasVideo?: boolean; hasAudio?: boolean; hasScreen?: boolean }) => {
      try {
        await callGrpc(roomClient, "UpdateMediaState", {
          event_id: data.eventId,
          has_video: data.hasVideo ?? false,
          has_audio: data.hasAudio ?? false,
          has_screen: data.hasScreen ?? false,
        });

        socket.to(`webrtc-${data.eventId}`).emit("host-media-state", {
          hasVideo: data.hasVideo,
          hasAudio: data.hasAudio,
          hasScreen: data.hasScreen,
        });
        } catch (error) {
          // Error updating media state
        }
    },
  );

  // Chat messages - call gRPC
  socket.on("new-message", async (data: { eventId: string; content: string }) => {
    try {
      await callGrpc(interactionClient, "SendMessage", {
        event_id: data.eventId,
        user_id: user.userId,
        content: data.content,
      });
      // The gRPC service will emit the message via interaction stream
    } catch (error) {
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  // Interactive features
  socket.on("new-quiz", async (data: { eventId: string; quiz: any }) => {
    try {
      // Ensure the sender is in the room
      await socket.join(data.eventId);
      
      // Save quiz to database via gRPC
      const result = await callGrpc<{ ok: boolean; quiz_id: string }>(interactionClient, "CreateQuiz", {
        event_id: data.eventId,
        question: data.quiz.question,
        options: data.quiz.options,
        correct_answer: data.quiz.correctAnswer,
        time_limit: data.quiz.timeLimit || 30,
      });

      // The gRPC service will emit the event via interaction stream
      // Also broadcast directly for immediate update to all users in the room
      const quizWithId = { ...data.quiz, id: result.quiz_id };
      // Use io.in() to broadcast to ALL sockets in the room (including sender)
      io.in(data.eventId).emit("new-quiz", quizWithId);
    } catch (error: any) {
      // If gRPC is unavailable, still broadcast the quiz (but it won't be saved)
      if (error.code === 14 || error.message?.includes("ECONNREFUSED")) {
        await socket.join(data.eventId);
        const quizWithId = { ...data.quiz, id: Date.now().toString() };
        io.in(data.eventId).emit("new-quiz", quizWithId);
      } else {
        socket.emit("error", { message: "Failed to create quiz" });
      }
    }
  });

  socket.on("quiz-response", async (data: { eventId: string; quizId: string; optionId: string }) => {
    try {
      await callGrpc(interactionClient, "SendQuizResponse", {
        event_id: data.eventId,
        user_id: user.userId,
        quiz_id: data.quizId,
        option_id: data.optionId,
      });
    } catch (error) {
      // Error sending quiz response
    }
  });

  socket.on("new-poll", async (data: { eventId: string; poll: any }) => {
    try {
      // Ensure the sender is in the room
      await socket.join(data.eventId);
      
      // Save poll to database via gRPC
      const result = await callGrpc<{ ok: boolean; poll_id: string }>(interactionClient, "CreatePoll", {
        event_id: data.eventId,
        question: data.poll.question,
        options: data.poll.options,
      });

      // The gRPC service will emit the event via interaction stream
      // Also broadcast directly for immediate update to all users in the room
      const pollWithId = { ...data.poll, id: result.poll_id };
      // Use io.in() to broadcast to ALL sockets in the room (including sender)
      io.in(data.eventId).emit("new-poll", pollWithId);
    } catch (error: any) {
      // If gRPC is unavailable, still broadcast the poll (but it won't be saved)
      if (error.code === 14 || error.message?.includes("ECONNREFUSED")) {
        await socket.join(data.eventId);
        const pollWithId = { ...data.poll, id: Date.now().toString() };
        io.in(data.eventId).emit("new-poll", pollWithId);
      } else {
        socket.emit("error", { message: "Failed to create poll" });
      }
    }
  });

  socket.on("poll-response", async (data: { eventId: string; pollId: string; optionId: string }) => {
    try {
      await callGrpc(interactionClient, "SendPollResponse", {
        event_id: data.eventId,
        user_id: user.userId,
        poll_id: data.pollId,
        option_id: data.optionId,
      });
    } catch (error) {
      // Error sending poll response
    }
  });

  socket.on("question-submitted", async (data: { eventId: string; question: string }) => {
    try {
      // Save question to database via gRPC
      const result = await callGrpc<{ ok: boolean; question_id: string }>(interactionClient, "CreateQuestion", {
        event_id: data.eventId,
        user_id: user.userId,
        question: data.question,
      });

      // The gRPC service will emit the event via interaction stream
      // Also broadcast directly for immediate update to all users in the room
      // Use io.in() to ensure all sockets in the room receive the event
      io.in(data.eventId).emit("question-submitted", {
        id: result.question_id,
        question: data.question,
        approved: false,
        user: { name: user.email, id: user.userId },
      });
    } catch (error: any) {
      // If gRPC is unavailable, still broadcast the question (but it won't be saved)
      if (error.code === 14 || error.message?.includes("ECONNREFUSED")) {
        io.in(data.eventId).emit("question-submitted", {
          id: Date.now().toString(),
          question: data.question,
          approved: false,
          user: { name: user.email, id: user.userId },
        });
      } else {
        socket.emit("error", { message: "Failed to submit question" });
      }
    }
  });

  socket.on("question-approved", async (data: { eventId: string; questionId: string }) => {
    try {
      // Approve question in database via gRPC
      await callGrpc<{ ok: boolean }>(interactionClient, "ApproveQuestion", {
        question_id: data.questionId,
        event_id: data.eventId,
      });

      // The gRPC service will emit the event via interaction stream
      // Also broadcast directly for immediate update to all users in the room
      // Use io.in() to ensure all sockets in the room receive the event
      io.in(data.eventId).emit("question-approved", {
        id: data.questionId,
        approved: true,
      });
    } catch (error: any) {
      // If gRPC is unavailable, still broadcast the approval (but it won't be saved)
      if (error.code === 14 || error.message?.includes("ECONNREFUSED")) {
        io.in(data.eventId).emit("question-approved", {
          id: data.questionId,
          approved: true,
        });
      } else {
        socket.emit("error", { message: "Failed to approve question" });
      }
    }
  });

  // Handle disconnection
  socket.on("disconnect", async () => {
    // Clean up streams
    const streams = socketStreams.get(socket.id);
    if (streams) {
      streams.forEach((stream) => {
        try {
          stream.cancel();
        } catch (error) {
          // Stream may already be cancelled
        }
      });
      socketStreams.delete(socket.id);
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`WebSocket server started on localhost:${PORT}`);
});
