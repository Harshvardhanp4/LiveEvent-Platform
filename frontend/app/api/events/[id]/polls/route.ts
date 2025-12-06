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

        // Fetch active poll for this event
        const poll = await prisma.poll.findFirst({
            where: {
                eventId: eventId,
                isActive: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        if (!poll) {
            return NextResponse.json({ poll: null });
        }

        // Convert responses from JSON to proper format
        const responses = poll.responses as Record<string, number> || {};

        return NextResponse.json({
            poll: {
                id: poll.id,
                question: poll.question,
                options: poll.options,
                responses: responses,
                isActive: poll.isActive,
            },
        });
    } catch (error) {
        console.error("Failed to fetch poll:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

