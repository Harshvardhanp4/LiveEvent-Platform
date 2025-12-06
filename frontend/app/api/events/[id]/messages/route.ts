import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id: eventId } = await context.params;
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch past messages for this event (most recent 100 messages)
        const messages = await prisma.message.findMany({
            where: {
                eventId: eventId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        role: true,
                    },
                },
            },
            orderBy: {
                timestamp: "desc", // Get most recent first
            },
            take: 100, // Limit to last 100 messages
        });

        // Reverse to show oldest first (chronological order)
        messages.reverse();

        // Format messages to match the frontend Message interface
        const formattedMessages = messages.map((message) => ({
            id: message.id,
            content: message.content,
            user: {
                id: message.user.id,
                name: message.user.name,
                role: message.user.role,
            },
            timestamp: message.timestamp.toISOString(),
            reactions: {}, // Past messages don't have reactions stored
        }));

        return NextResponse.json({ messages: formattedMessages });
    } catch (error) {
        console.error("Failed to fetch messages:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

