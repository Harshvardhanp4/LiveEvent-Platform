import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> },
    // { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        const { id } = await context.params

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        if (session.user.role === "ADMIN" || session.user.role === "HOST") {
            return NextResponse.json({ hasAccess: true, role: "ADMIN" })
        }

        const event = await prisma.event.findUnique({
            where: { id },
            select: { hostId: true },
        })

        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 })
        }

        const hasAccess = event.hostId === session.user.id

        return NextResponse.json({
            hasAccess,
            role: hasAccess ? "HOST" : "PARTICIPANT",
        })
    } catch (error) {
        console.error("Host access check error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
