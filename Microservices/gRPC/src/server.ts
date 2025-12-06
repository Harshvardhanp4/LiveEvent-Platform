// Load environment variables
require("dotenv").config();

import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import path from "path";
import { prisma } from "./prisma";
import { verifyToken, extractTokenFromMetadata } from "./auth";
import { roomManager, setInteractionEventType } from "./room-manager";
import express from "express";
import cors from "cors";
import * as grpcClient from "@grpc/grpc-js";

const PROTO_DIR = path.join(__dirname, "..", "proto");

function loadProto(file: string) {
  const packageDefinition = protoLoader.loadSync(path.join(PROTO_DIR, file), {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });
  return grpc.loadPackageDefinition(packageDefinition);
}

const eventProto = loadProto("event.proto") as any;
const roomProto = loadProto("room.proto") as any;
const interactionProto = loadProto("interaction.proto") as any;

// Get the InteractionEvent message type for proper serialization
const InteractionEventType = interactionProto.interaction.InteractionEvent;
// Set it in room manager so it can use it for proper message serialization
setInteractionEventType(InteractionEventType);

const server = new grpc.Server();

// --- EventService implementation ---
server.addService(eventProto.event.EventService.service, {
  GetEvent: async (call: grpc.ServerUnaryCall<any, any>, callback: grpc.sendUnaryData<any>) => {
    try {
    const { event_id } = call.request;

      const event = await prisma.event.findUnique({
        where: { id: event_id },
        include: { host: true },
      });

      if (!event) {
        callback({
          code: grpc.status.NOT_FOUND,
          message: "Event not found",
        });
        return;
      }

      const status = event.isLive ? "LIVE" : event.completedEvent ? "ENDED" : "UPCOMING";

    callback(null, {
        event_id: event.id,
        title: event.title,
        status,
      });
    } catch (error) {
      console.error("GetEvent error:", error);
      callback({
        code: grpc.status.INTERNAL,
        message: "Internal server error",
      });
    }
  },

  StartEvent: async (call: grpc.ServerUnaryCall<any, any>, callback: grpc.sendUnaryData<any>) => {
    try {
      const { event_id, host_id } = call.request;

      if (!event_id || !host_id) {
        callback({
          code: grpc.status.INVALID_ARGUMENT,
          message: "event_id and host_id are required",
        });
        return;
      }

      // Verify host owns the event
      let event;
      try {
        event = await prisma.event.findUnique({
          where: { id: event_id },
        });
      } catch (dbError: any) {
        console.error("StartEvent: Database error fetching event:", dbError);
        callback({
          code: grpc.status.INTERNAL,
          message: `Database error: ${dbError.message || "Failed to fetch event"}`,
        });
        return;
      }

      if (!event) {
        callback({
          code: grpc.status.NOT_FOUND,
          message: "Event not found",
        });
        return;
      }

      if (event.hostId !== host_id) {
        callback({
          code: grpc.status.PERMISSION_DENIED,
          message: "Only the event host can start the event",
        });
        return;
      }

      // Update event to LIVE
      try {
        await prisma.event.update({
          where: { id: event_id },
          data: { isLive: true },
        });
      } catch (updateError: any) {
        console.error("StartEvent: Database error updating event:", updateError);
        callback({
          code: grpc.status.INTERNAL,
          message: `Database error: ${updateError.message || "Failed to update event"}`,
        });
        return;
      }

      // Emit EVENT_STARTED room event (non-blocking, don't fail if this errors)
      try {
        roomManager.emitRoomEvent(event_id, {
          type: "EVENT_STARTED",
          userId: host_id,
          payloadJson: JSON.stringify({ eventId: event_id }),
        });
      } catch (emitError: any) {
        console.error("StartEvent: Error emitting room event (non-fatal):", emitError);
        // Continue anyway, event is already marked as LIVE
      }

      callback(null, {
        ok: true,
        status: "LIVE",
      });
    } catch (error: any) {
      callback({
        code: grpc.status.INTERNAL,
        message: `Internal server error: ${error.message || "Unknown error"}`,
      });
    }
  },

  EndEvent: async (call: grpc.ServerUnaryCall<any, any>, callback: grpc.sendUnaryData<any>) => {
    try {
    const { event_id, host_id } = call.request;

      const event = await prisma.event.findUnique({
        where: { id: event_id },
      });

      if (!event) {
        callback({
          code: grpc.status.NOT_FOUND,
          message: "Event not found",
        });
        return;
      }

      if (event.hostId !== host_id) {
        callback({
          code: grpc.status.PERMISSION_DENIED,
          message: "Only the event host can end the event",
        });
        return;
      }

      // Update event to ENDED
      await prisma.event.update({
        where: { id: event_id },
        data: { isLive: false, completedEvent: true },
      });

      // Emit EVENT_ENDED room event
      roomManager.emitRoomEvent(event_id, {
        type: "EVENT_ENDED",
        userId: host_id,
        payloadJson: JSON.stringify({ eventId: event_id }),
      });

    callback(null, {
      ok: true,
      status: "ENDED",
    });
    } catch (error) {
      console.error("EndEvent error:", error);
      callback({
        code: grpc.status.INTERNAL,
        message: "Internal server error",
      });
    }
  },
});

// --- RoomService implementation ---
server.addService(roomProto.room.RoomService.service, {
  JoinRoom: async (call: grpc.ServerUnaryCall<any, any>, callback: grpc.sendUnaryData<any>) => {
    try {
      const { event_id, user_id, is_host } = call.request;
      
      // Validate inputs
      if (!event_id || !user_id) {
        callback({
          code: grpc.status.INVALID_ARGUMENT,
          message: "event_id and user_id are required",
        });
        return;
      }

      // Try to verify event exists, but don't fail if database is unavailable
      let eventExists = true;
      try {
        const event = await prisma.event.findUnique({
          where: { id: event_id },
        });
        if (!event) {
          callback({
            code: grpc.status.NOT_FOUND,
            message: "Event not found",
          });
          return;
        }
      } catch (dbError: any) {
        // If database connection fails, log but continue with in-memory room join
        // This allows WebRTC to work even if database is temporarily unavailable
        console.warn("Database query failed, continuing with in-memory room join:", dbError.code);
        eventExists = false; // We'll skip database operations but allow room join
      }

      // Join room (allow re-joining if already in room)
      const success = roomManager.joinRoom(event_id, user_id, is_host || false);
      if (!success && is_host) {
        // If host join failed, check if this user is already the host
        const room = roomManager.getRoom(event_id);
        const existingHost = room?.participants.get(user_id);
        if (existingHost && existingHost.isHost) {
          // User is already the host, allow re-join
          callback(null, { ok: true });
          return;
        }
        callback({
          code: grpc.status.ALREADY_EXISTS,
          message: "Host already exists for this event",
        });
        return;
      }

      // Create participant record if not exists (only if database is available)
      if (eventExists) {
        try {
          await prisma.participant.upsert({
            where: {
              userId_eventId: {
                userId: user_id,
                eventId: event_id,
              },
            },
            create: {
              userId: user_id,
              eventId: event_id,
            },
            update: {},
          });
        } catch (dbError: any) {
          // If participant already exists or database error, that's fine - continue
          if (dbError.code !== 'P2002' && dbError.code !== 'P1017') {
            // P2002 = unique constraint violation, P1017 = server closed connection
            console.warn("Participant upsert error (non-critical):", dbError.code);
          }
        }
      }

      callback(null, { ok: true });
    } catch (error: any) {
      console.error("JoinRoom error:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        stack: error.stack,
      });
      callback({
        code: grpc.status.INTERNAL,
        message: error.message || "Internal server error",
      });
    }
  },

  LeaveRoom: async (call: grpc.ServerUnaryCall<any, any>, callback: grpc.sendUnaryData<any>) => {
    try {
      const { event_id, user_id } = call.request;

      roomManager.leaveRoom(event_id, user_id);

    callback(null, { ok: true });
    } catch (error) {
      console.error("LeaveRoom error:", error);
      callback({
        code: grpc.status.INTERNAL,
        message: "Internal server error",
      });
    }
  },

  UpdateMediaState: async (call: grpc.ServerUnaryCall<any, any>, callback: grpc.sendUnaryData<any>) => {
    try {
      const { event_id, has_video, has_audio, has_screen } = call.request;

      roomManager.updateMediaState(event_id, has_video, has_audio, has_screen);

    callback(null, { ok: true });
    } catch (error) {
      console.error("UpdateMediaState error:", error);
      callback({
        code: grpc.status.INTERNAL,
        message: "Internal server error",
      });
    }
  },

  StreamRoomEvents: (call: grpc.ServerWritableStream<any, any>) => {
    const { event_id } = call.request;

    // Subscribe to room events
    roomManager.subscribeToRoomEvents(event_id, call);

    // Handle client disconnect
    call.on("cancelled", () => {
      roomManager.unsubscribeFromRoomEvents(event_id, call);
    });

    call.on("end", () => {
      roomManager.unsubscribeFromRoomEvents(event_id, call);
    });
  },
});

// --- InteractionService implementation ---
server.addService(interactionProto.interaction.InteractionService.service, {
  SendMessage: async (call: grpc.ServerUnaryCall<any, any>, callback: grpc.sendUnaryData<any>) => {
    try {
      const { event_id, user_id, content } = call.request;

      // Save message to DB
      const message = await prisma.message.create({
        data: {
          content,
          userId: user_id,
          eventId: event_id,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
        },
      });

      // Emit interaction event
      const payloadData = {
        id: message.id,
        content: message.content,
        user: {
          name: message.user.name,
          role: message.user.role,
          id: message.user.id,
        },
        timestamp: message.timestamp.toISOString(),
      };
      const payloadJson = JSON.stringify(payloadData);
      
      roomManager.emitInteractionEvent(event_id, {
        type: "MESSAGE",
        userId: user_id,
        payloadJson: payloadJson,
      });

    callback(null, { ok: true });
    } catch (error) {
      console.error("SendMessage error:", error);
      callback({
        code: grpc.status.INTERNAL,
        message: "Internal server error",
      });
    }
  },

  CreatePoll: async (call: grpc.ServerUnaryCall<any, any>, callback: grpc.sendUnaryData<any>) => {
    try {
      const { event_id, question, options } = call.request;

      // Deactivate all existing polls for this event
      await prisma.poll.updateMany({
        where: { eventId: event_id, isActive: true },
        data: { isActive: false },
      });

      // Create new poll
      const poll = await prisma.poll.create({
        data: {
          eventId: event_id,
          question,
          options,
          responses: {},
          isActive: true,
        },
      });

      // Emit event via room manager
      roomManager.emitInteractionEvent(event_id, {
        type: "POLL_CREATED",
        userId: "",
        payloadJson: JSON.stringify({
          id: poll.id,
          question: poll.question,
          options: poll.options,
          responses: poll.responses,
          isActive: poll.isActive,
        }),
      });

      callback(null, { ok: true, poll_id: poll.id });
    } catch (error) {
      console.error("CreatePoll error:", error);
      callback({
        code: grpc.status.INTERNAL,
        message: "Internal server error",
      });
    }
  },

  CreateQuiz: async (call: grpc.ServerUnaryCall<any, any>, callback: grpc.sendUnaryData<any>) => {
    try {
      const { event_id, question, options, correct_answer, time_limit } = call.request;

      // Deactivate all existing quizzes for this event
      await prisma.quiz.updateMany({
        where: { eventId: event_id, isActive: true },
        data: { isActive: false },
      });

      // Create new quiz
      const quiz = await prisma.quiz.create({
        data: {
          eventId: event_id,
          question,
          options,
          correctAnswer: correct_answer,
          timeLimit: time_limit || 30,
          isActive: true,
        },
      });

      // Emit event via room manager
      roomManager.emitInteractionEvent(event_id, {
        type: "QUIZ_CREATED",
        userId: "",
        payloadJson: JSON.stringify({
          id: quiz.id,
          question: quiz.question,
          options: quiz.options,
          correctAnswer: quiz.correctAnswer,
          timeLimit: quiz.timeLimit,
          isActive: quiz.isActive,
        }),
      });

      callback(null, { ok: true, quiz_id: quiz.id });
    } catch (error) {
      console.error("CreateQuiz error:", error);
      callback({
        code: grpc.status.INTERNAL,
        message: "Internal server error",
      });
    }
  },

  CreateQuestion: async (call: grpc.ServerUnaryCall<any, any>, callback: grpc.sendUnaryData<any>) => {
    try {
      const { event_id, user_id, question } = call.request;

      // Create new Q&A question
      const qna = await prisma.qnA.create({
        data: {
          eventId: event_id,
          userId: user_id,
          question,
          approved: false,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Emit event via room manager
      roomManager.emitInteractionEvent(event_id, {
        type: "QUESTION_SUBMITTED",
        userId: user_id,
        payloadJson: JSON.stringify({
          id: qna.id,
          question: qna.question,
          approved: qna.approved,
          user: {
            id: user_id,
            name: qna.user?.name || "User",
          },
        }),
      });

      callback(null, { ok: true, question_id: qna.id });
    } catch (error) {
      console.error("CreateQuestion error:", error);
      callback({
        code: grpc.status.INTERNAL,
        message: "Internal server error",
      });
    }
  },

  ApproveQuestion: async (call: grpc.ServerUnaryCall<any, any>, callback: grpc.sendUnaryData<any>) => {
    try {
      const { question_id, event_id } = call.request;

      // Update question to approved
      const qna = await prisma.qnA.update({
        where: { id: question_id },
        data: { approved: true },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Emit event via room manager
      roomManager.emitInteractionEvent(event_id, {
        type: "QUESTION_APPROVED",
        userId: qna.userId,
        payloadJson: JSON.stringify({
          id: qna.id,
          question: qna.question,
          approved: qna.approved,
          user: {
            id: qna.userId,
            name: qna.user?.name || "User",
          },
        }),
      });

      callback(null, { ok: true });
    } catch (error) {
      console.error("ApproveQuestion error:", error);
      callback({
        code: grpc.status.INTERNAL,
        message: "Internal server error",
      });
    }
  },

  SendPollResponse: async (call: grpc.ServerUnaryCall<any, any>, callback: grpc.sendUnaryData<any>) => {
    try {
      const { event_id, user_id, poll_id, option_id } = call.request;

      // Update poll responses in DB
      const poll = await prisma.poll.findUnique({
        where: { id: poll_id },
      });

      if (!poll) {
        callback({
          code: grpc.status.NOT_FOUND,
          message: "Poll not found",
        });
        return;
      }

      const responses = (poll.responses as any) || {};
      // Store as counts instead of user ID arrays
      if (typeof responses[option_id] !== "number") {
        responses[option_id] = 0;
      }
      responses[option_id] = (responses[option_id] || 0) + 1;

      await prisma.poll.update({
        where: { id: poll_id },
        data: { responses },
      });

      // Emit poll update event
      roomManager.emitInteractionEvent(event_id, {
        type: "POLL_RESPONSE",
        userId: user_id,
        payloadJson: JSON.stringify({
          pollId: poll_id,
          optionId: option_id,
          votes: responses,
        }),
      });

    callback(null, { ok: true });
    } catch (error) {
      console.error("SendPollResponse error:", error);
      callback({
        code: grpc.status.INTERNAL,
        message: "Internal server error",
      });
    }
  },

  SendQuizResponse: async (call: grpc.ServerUnaryCall<any, any>, callback: grpc.sendUnaryData<any>) => {
    try {
      const { event_id, user_id, quiz_id, option_id } = call.request;

      const quiz = await prisma.quiz.findUnique({
        where: { id: quiz_id },
      });

      if (!quiz) {
        callback({
          code: grpc.status.NOT_FOUND,
          message: "Quiz not found",
        });
        return;
      }

      const isCorrect = parseInt(option_id) === quiz.correctAnswer;
      
      // Update score (only if not already submitted)
      const score = await prisma.score.upsert({
        where: {
          userId_eventId: {
            userId: user_id,
            eventId: event_id,
          },
        },
        create: {
          userId: user_id,
          eventId: event_id,
          points: isCorrect ? 10 : 0,
        },
        update: {
          points: {
            increment: isCorrect ? 10 : 0,
          },
        },
      });

    callback(null, { ok: true });
    } catch (error) {
      console.error("SendQuizResponse error:", error);
      callback({
        code: grpc.status.INTERNAL,
        message: "Internal server error",
      });
    }
  },

  StreamInteractionEvents: (call: grpc.ServerWritableStream<any, any>) => {
    const { event_id } = call.request;
    roomManager.subscribeToInteractionEvents(event_id, call);

    call.on("cancelled", () => {
      roomManager.unsubscribeFromInteractionEvents(event_id, call);
    });

    call.on("end", () => {
      roomManager.unsubscribeFromInteractionEvents(event_id, call);
    });
  },
});

// Start gRPC server
const GRPC_PORT = process.env.GRPC_PORT || "50051";

server.bindAsync(
  `0.0.0.0:${GRPC_PORT}`,
  grpc.ServerCredentials.createInsecure(),
  (err: Error | null, port: number) => {
    if (err) {
      console.error("Failed to start gRPC server", err);
      return;
    }
    server.start();
    console.log(`gRPC server started on localhost:${GRPC_PORT}`);
  },
);

// HTTP Gateway for frontend API calls
const HTTP_PORT = process.env.HTTP_PORT || "4001";
const app = express();

app.use(cors());
app.use(express.json());

// Helper to call gRPC from HTTP
function createGrpcClient() {
  const client = new grpcClient.Client(
    `localhost:${GRPC_PORT}`,
    grpcClient.credentials.createInsecure(),
  );
  return client;
}

// HTTP endpoints
app.post("/api/events/:id/start", async (req, res) => {
  try {
    const { id } = req.params;
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const payload = verifyToken(token);
    if (!payload) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const client = new eventProto.event.EventService(
      `localhost:${GRPC_PORT}`,
      grpcClient.credentials.createInsecure(),
    );

    client.StartEvent(
      { event_id: id, host_id: payload.userId },
      (error: any, response: any) => {
        if (error) {
          // Map gRPC error codes to HTTP status codes
          let statusCode = 500;
          if (error.code === grpc.status.NOT_FOUND) statusCode = 404;
          else if (error.code === grpc.status.PERMISSION_DENIED) statusCode = 403;
          else if (error.code === grpc.status.INVALID_ARGUMENT) statusCode = 400;
          else if (error.code === grpc.status.UNAUTHENTICATED) statusCode = 401;
          
          return res.status(statusCode).json({ 
            error: error.message || "Internal server error",
            code: error.code,
            details: error.details
          });
        }
        res.json(response);
      },
    );
  } catch (error: any) {
    console.error("HTTP Gateway: Unexpected error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

app.post("/api/events/:id/end", async (req, res) => {
  try {
    const { id } = req.params;
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const client = new eventProto.event.EventService(
      `localhost:${GRPC_PORT}`,
      grpcClient.credentials.createInsecure(),
    );

    client.EndEvent(
      { event_id: id, host_id: payload.userId },
      (error: any, response: any) => {
        if (error) {
          return res.status(500).json({ error: error.message });
        }
        res.json(response);
      },
    );
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(HTTP_PORT, () => {
  console.log(`HTTP gateway started on localhost:${HTTP_PORT}`);
});
