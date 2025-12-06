import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    if (!JWT_SECRET || JWT_SECRET === "your-secret-key") {
      console.error("JWT_SECRET is not set or using default value!");
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error: any) {
    console.error("Token verification failed:", error.message);
    return null;
  }
}

export function extractTokenFromMetadata(metadata: any): string | null {
  const authHeader = metadata.get("authorization")?.[0];
  if (!authHeader) return null;
  
  // Handle "Bearer <token>" format
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }
  return authHeader;
}

