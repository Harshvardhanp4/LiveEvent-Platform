import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                banned: true,
                createdAt: true,
            },
            orderBy: { createdAt: "desc" },
        })

        return NextResponse.json(users)
    } catch (error) {
        console.error("Admin users fetch error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
