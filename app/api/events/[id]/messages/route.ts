import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const eventId = params.id

        // Fetch all messages for this event
        const messages = await prisma.message.findMany({
            where: {
                eventId: eventId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        role: true,
                    },
                },
            },
            orderBy: {
                timestamp: "asc",
            },
        })

        // Transform to match Message interface
        const formattedMessages = messages.map((msg) => ({
            id: msg.id,
            content: msg.content,
            user: {
                id: msg.user.id,
                name: msg.user.name,
                role: msg.user.role,
            },
            timestamp: msg.timestamp.toISOString(),
            reactions: {},
            isModerated: false,
        }))

        return NextResponse.json({ messages: formattedMessages })
    } catch (error) {
        console.error("Error fetching messages:", error)
        return NextResponse.json(
            { error: "Failed to fetch messages" },
            { status: 500 }
        )
    }
}
