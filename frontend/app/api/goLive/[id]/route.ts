import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { generateToken } from "@/lib/auth"

const BACKEND_URL = process.env.BACKEND_HTTP_URL || "http://localhost:4001";

export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{id: string} > }
) {
    const { id } = await context.params;

    try {
        // Get user from token
        const authHeader = request.headers.get("authorization");
        const token = authHeader?.replace("Bearer ", "");
        
        if (!token) {
            return NextResponse.json({ error: "Unauthorized: No token provided" }, { status: 401 });
        }

        let user;
        try {
            user = await getCurrentUser(token);
        } catch (dbError: any) {
            return NextResponse.json({ 
                error: "Database error", 
                details: dbError.message || "Failed to fetch user from database"
            }, { status: 500 });
        }

        if (!user) {
            return NextResponse.json({ error: "Unauthorized: Invalid token or user not found" }, { status: 401 });
        }

        // Generate JWT for backend
        let backendToken;
        try {
            backendToken = generateToken({
                userId: user.id,
                email: user.email,
                role: user.role,
            });
        } catch (tokenError: any) {
            return NextResponse.json({ 
                error: "Token generation failed", 
                details: tokenError.message 
            }, { status: 500 });
        }

        // Call gRPC HTTP gateway
        let response;
        try {
            response = await fetch(`${BACKEND_URL}/api/events/${id}/start`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${backendToken}`,
                },
            });
        } catch (fetchError: any) {
            // Check if it's a connection error
            if (fetchError.code === "ECONNREFUSED" || fetchError.message?.includes("fetch failed")) {
                return NextResponse.json({ 
                    error: "Backend service is not running. Please start the gRPC service on port 4001.",
                    details: `Failed to connect to ${BACKEND_URL}`,
                    hint: "Run: cd Microservices/gRPC && npm run dev"
                }, { status: 503 });
            }
            
            throw fetchError;
        }

        if (!response.ok) {
            const errorText = await response.text();
            let errorData;
            try {
                errorData = JSON.parse(errorText);
            } catch {
                errorData = { error: errorText || "Unknown error" };
            }
            
            return NextResponse.json({ 
                error: errorData.error || "Failed to start event",
                details: errorData.details || errorData.message,
                status: response.status
            }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json({ success: true, ...data }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ 
            error: "Internal server error",
            details: error.message || "An unexpected error occurred"
        }, { status: 500 });
    }
}