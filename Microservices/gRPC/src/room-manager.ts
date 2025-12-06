// In-memory room state manager
// In production, use Redis for distributed state

interface RoomParticipant {
  userId: string;
  isHost: boolean;
  joinedAt: Date;
}

interface RoomState {
  eventId: string;
  participants: Map<string, RoomParticipant>;
  mediaState: {
    hasVideo: boolean;
    hasAudio: boolean;
    hasScreen: boolean;
  };
}

// Store reference to InteractionEvent message type for proper serialization
let InteractionEventType: any = null;

export function setInteractionEventType(type: any) {
  InteractionEventType = type;
}

class RoomManager {
  private rooms = new Map<string, RoomState>();
  private eventStreams = new Map<string, Set<any>>(); // gRPC streams per room
  private interactionStreams = new Map<string, Set<any>>(); // Interaction event streams per room

  getOrCreateRoom(eventId: string): RoomState {
    if (!this.rooms.has(eventId)) {
      this.rooms.set(eventId, {
        eventId,
        participants: new Map(),
        mediaState: {
          hasVideo: false,
          hasAudio: false,
          hasScreen: false,
        },
      });
    }
    return this.rooms.get(eventId)!;
  }

  getRoom(eventId: string): RoomState | undefined {
    return this.rooms.get(eventId);
  }

  joinRoom(eventId: string, userId: string, isHost: boolean): boolean {
    const room = this.getOrCreateRoom(eventId);
    
    // Only one host allowed
    if (isHost) {
      const existingHost = Array.from(room.participants.values()).find(p => p.isHost);
      if (existingHost && existingHost.userId !== userId) {
        return false; // Host already exists
      }
    }

    room.participants.set(userId, {
      userId,
      isHost,
      joinedAt: new Date(),
    });

    // Emit USER_JOINED event
    this.emitRoomEvent(eventId, {
      type: "USER_JOINED",
      userId,
      payloadJson: JSON.stringify({ isHost }),
    });

    return true;
  }

  leaveRoom(eventId: string, userId: string): void {
    const room = this.rooms.get(eventId);
    if (!room) return;

    const wasHost = room.participants.get(userId)?.isHost || false;
    room.participants.delete(userId);

    // Emit USER_LEFT event
    this.emitRoomEvent(eventId, {
      type: "USER_LEFT",
      userId,
      payloadJson: JSON.stringify({ wasHost }),
    });

    // Clean up empty rooms
    if (room.participants.size === 0) {
      this.rooms.delete(eventId);
      this.eventStreams.delete(eventId);
    }
  }

  updateMediaState(eventId: string, hasVideo: boolean, hasAudio: boolean, hasScreen: boolean): void {
    const room = this.getOrCreateRoom(eventId);
    room.mediaState = { hasVideo, hasAudio, hasScreen };

    // Emit HOST_MEDIA_UPDATED event
    this.emitRoomEvent(eventId, {
      type: "HOST_MEDIA_UPDATED",
      userId: "",
      payloadJson: JSON.stringify({ hasVideo, hasAudio, hasScreen }),
    });
  }

  subscribeToRoomEvents(eventId: string, stream: any): void {
    if (!this.eventStreams.has(eventId)) {
      this.eventStreams.set(eventId, new Set());
    }
    this.eventStreams.get(eventId)!.add(stream);
  }

  unsubscribeFromRoomEvents(eventId: string, stream: any): void {
    const streams = this.eventStreams.get(eventId);
    if (streams) {
      streams.delete(stream);
    }
  }


  getRoomParticipants(eventId: string): RoomParticipant[] {
    const room = this.rooms.get(eventId);
    if (!room) return [];
    return Array.from(room.participants.values());
  }

  subscribeToInteractionEvents(eventId: string, stream: any): void {
    if (!this.interactionStreams.has(eventId)) {
      this.interactionStreams.set(eventId, new Set());
    }
    this.interactionStreams.get(eventId)!.add(stream);
  }

  unsubscribeFromInteractionEvents(eventId: string, stream: any): void {
    const streams = this.interactionStreams.get(eventId);
    if (streams) {
      streams.delete(stream);
    }
  }

  emitInteractionEvent(eventId: string, event: { type: string; userId: string; payloadJson: string }): void {
    const streams = this.interactionStreams.get(eventId);
    if (!streams) {
      return;
    }

    // Validate payloadJson is a non-empty string
    if (!event.payloadJson || typeof event.payloadJson !== "string" || event.payloadJson.trim() === "") {
      console.error("Invalid payloadJson in emitInteractionEvent");
      return;
    }
    
    // Convert to proto format (snake_case) for gRPC
    const protoEvent = {
      type: String(event.type || ""),
      user_id: String(event.userId || ""),
      payload_json: String(event.payloadJson || ""),
    };
    
    streams.forEach((stream) => {
      try {
        // Use the proto message type if available, otherwise use plain object
        let eventToWrite: any;
        if (InteractionEventType && typeof InteractionEventType === 'function') {
          try {
            eventToWrite = new InteractionEventType(protoEvent);
          } catch (error) {
            // Fallback to plain object
            eventToWrite = protoEvent;
          }
        } else {
          eventToWrite = protoEvent;
        }
        
        stream.write(eventToWrite);
      } catch (error) {
        console.error("Error writing to interaction stream:", error);
        streams.delete(stream);
      }
    });
  }

  emitRoomEvent(eventId: string, event: { type: string; userId: string; payloadJson: string }): void {
    const streams = this.eventStreams.get(eventId);
    if (!streams) return;

    // Convert to proto format (snake_case) for gRPC
    const protoEvent = {
      type: event.type,
      user_id: event.userId,
      payload_json: event.payloadJson,
    };

    streams.forEach((stream) => {
      try {
        stream.write(protoEvent);
      } catch (error) {
        console.error("Error writing to stream:", error);
        streams.delete(stream);
      }
    });
  }
}

export const roomManager = new RoomManager();

