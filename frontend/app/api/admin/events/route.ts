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

        const events = await prisma.event.findMany({
            include: {
                host: {
                    select: { name: true },
                },
                _count: {
                    select: { participants: true },
                },
            },
            orderBy: { createdAt: "desc" },
        })

        return NextResponse.json(events)
    } catch (error) {
        console.error("Admin events fetch error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
