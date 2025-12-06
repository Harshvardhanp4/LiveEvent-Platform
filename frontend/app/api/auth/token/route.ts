import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { generateToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET!

export async function GET(request: NextRequest) {
    try {
        // Get NextAuth session token
        const token = await getToken({ req: request, secret: NEXTAUTH_SECRET })

        if (!token?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Get user from database
        const user = await prisma.user.findUnique({
            where: { email: token.email },
            select: {
                id: true,
                email: true,
                role: true,
            },
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // Generate JWT token for socket authentication
        const jwtToken = generateToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        })

        return NextResponse.json({ token: jwtToken })
    } catch (error) {
        console.error("Token generation error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}






