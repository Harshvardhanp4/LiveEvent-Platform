import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser, generateToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getToken } from "next-auth/jwt"

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET!

export async function GET(request: NextRequest) {
    try {
        // 1. Check for custom Bearer token
        const rawToken = request.headers.get("authorization")?.replace("Bearer ", "")

        if (rawToken) {
            const user = await getCurrentUser(rawToken)
            if (user) {
                const jwtToken = generateToken({
                    userId: user.id,
                    email: user.email,
                    role: user.role,
                })
                return NextResponse.json({ ...user, token: jwtToken })
            }
        }

        // 2. Fallback to NextAuth (Google OAuth) token
        const token = await getToken({ req: request, secret: NEXTAUTH_SECRET })

        if (token?.email) {
            const user = await prisma.user.findUnique({
                where: { email: token.email },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    banned: true,
                },
            })

            if (user) {
                const jwtToken = generateToken({
                    userId: user.id,
                    email: user.email,
                    role: user.role,
                })
                return NextResponse.json({ ...user, token: jwtToken })
            }
        }

        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    } catch (error) {
        console.error("Auth check error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
