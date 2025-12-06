# Microservices Setup Guide

This directory contains the backend microservices for the EventFlow platform.

## Architecture

- **gRPC Service** (`gRPC/`): Core business logic with gRPC API + HTTP gateway
- **WebSocket Service** (`WebSockets/`): Real-time WebSocket gateway that calls gRPC

## Prerequisites

- Node.js 18+
- PostgreSQL database (Neon, Supabase, or local)
- Same `DATABASE_URL` and `JWT_SECRET` as frontend

## Environment Setup

**Important:** Before starting, set up environment variables. See the main [ENV_SETUP.md](../ENV_SETUP.md) guide for detailed instructions.

Quick setup:
1. Copy `.env.example` to `.env` in each service directory
2. Fill in your actual values (especially `DATABASE_URL` and `JWT_SECRET`)
3. Ensure `JWT_SECRET` is **identical** across all services

## Setup Instructions

### 1. gRPC Service Setup

```bash
cd Microservices/gRPC

# Install dependencies
npm install

# Generate Prisma client (if needed)
npx prisma generate

# Copy and edit environment file
cp .env.example .env
# Edit .env with your actual values

# Or set environment variables directly
export DATABASE_URL="your-postgres-url"
export JWT_SECRET="your-jwt-secret"
export GRPC_PORT=50051
export HTTP_PORT=4001

# Run in development
npm run dev

# Or build and run
npm run build
npm start
```

The gRPC service will:
- Start gRPC server on port 50051
- Start HTTP gateway on port 4001

### 2. WebSocket Service Setup

```bash
cd Microservices/WebSockets

# Install dependencies
npm install

# Copy and edit environment file
cp .env.example .env
# Edit .env with your actual values

# Or set environment variables directly
export GRPC_URL="localhost:50051"
export JWT_SECRET="your-jwt-secret"
export PORT=4000

# Run in development
npm run dev

# Or build and run
npm run build
npm start
```

The WebSocket service will:
- Start Socket.IO server on port 4000
- Connect to gRPC service at `GRPC_URL`

### 3. Frontend Configuration

Copy the `.env.example` to `.env.local` in the frontend directory:

```bash
cd frontend
cp .env.example .env.local
# Edit .env.local with your actual values
```

Required variables:
- `NEXT_PUBLIC_WS_URL=http://localhost:4000`
- `BACKEND_HTTP_URL=http://localhost:4001`
- `DATABASE_URL=your-postgres-url`
- `JWT_SECRET=your-jwt-secret` (must match other services)

## API Endpoints

### HTTP Gateway (gRPC Service)

- `POST /api/events/:id/start` - Start event (Go Live)
- `POST /api/events/:id/end` - End event

Both require `Authorization: Bearer <jwt-token>` header.

### WebSocket Events

Connect to `ws://localhost:4000` with Socket.IO client.

**Client → Server:**
- `join-room` - Join event room
- `join-webrtc-room` - Join WebRTC room
- `new-message` - Send chat message
- `host-media-state` - Update host media state
- `offer`, `answer`, `ice-candidate` - WebRTC signaling

**Server → Client:**
- `new-message` - New chat message
- `event-started` - Event went live
- `event-ended` - Event ended
- `user-joined` - User joined room
- `user-left` - User left room
- `host-media-state` - Host media state updated

## Development Workflow

1. Start PostgreSQL database
2. Start gRPC service: `cd Microservices/gRPC && npm run dev`
3. Start WebSocket service: `cd Microservices/WebSockets && npm run dev`
4. Start frontend: `cd frontend && npm run dev`

## Production Deployment

For production, deploy each service separately:

- **gRPC Service**: Deploy to Fly.io, Render, or similar
- **WebSocket Service**: Deploy to Fly.io, Render, or similar
- **Frontend**: Deploy to Vercel

Update environment variables in each service accordingly.

