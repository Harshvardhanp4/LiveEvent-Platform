import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import path from "path";

const PROTO_DIR = path.join(__dirname, "..", "..", "gRPC", "proto");
const GRPC_URL = process.env.GRPC_URL || "localhost:50051";

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

const roomProto = loadProto("room.proto") as any;
const interactionProto = loadProto("interaction.proto") as any;

const credentials = grpc.credentials.createInsecure();

export const roomClient = new roomProto.room.RoomService(GRPC_URL, credentials);
export const interactionClient = new interactionProto.interaction.InteractionService(GRPC_URL, credentials);

// Helper to call gRPC unary methods
export function callGrpc<T>(
  client: any,
  method: string,
  request: any,
): Promise<T> {
  return new Promise((resolve, reject) => {
    client[method](request, (error: any, response: any) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
}

// Track which stream types have already logged connection errors
const loggedConnectionErrors = new Set<string>();

// Helper to create streaming client
export function createStream(
  client: any,
  method: string,
  request: any,
  onData: (data: any) => void,
): grpc.ClientReadableStream<any> {
  const stream = client[method](request);
  
  stream.on("data", (data: any) => {
    onData(data);
  });
  
  stream.on("error", (err: any) => {
    // Suppress all stream errors - connection errors and cancellations are expected
    // No logging needed
    return;
  });
  
  stream.on("end", () => {
    // Stream ended normally
  });
  
  return stream;
}

