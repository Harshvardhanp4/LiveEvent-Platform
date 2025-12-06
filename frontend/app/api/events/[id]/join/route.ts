import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(
    request: NextRequest, 
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;

    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const userId = session.user.id

        // Check if user already joined
        const existingParticipant = await prisma.participant.findUnique({
            where: {
                userId_eventId: {
                    userId,
                    eventId: id,
                },
            },
        })

        if (existingParticipant) {
            return NextResponse.json({ error: "Already joined this event" }, { status: 400 })
        }

        // Add user as participant
        await prisma.participant.create({
            data: {
                userId,
                eventId: id,
            },
        })

        return NextResponse.json({ success: true, existingParticipant: true })
    } catch (error) {
        console.error("Join event error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
