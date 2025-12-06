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

        // Fetch active quiz for this event
        const quiz = await prisma.quiz.findFirst({
            where: {
                eventId: eventId,
                isActive: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        if (!quiz) {
            return NextResponse.json({ quiz: null });
        }

        return NextResponse.json({
            quiz: {
                id: quiz.id,
                question: quiz.question,
                options: quiz.options,
                correctAnswer: quiz.correctAnswer,
                timeLimit: quiz.timeLimit,
                isActive: quiz.isActive,
            },
        });
    } catch (error) {
        console.error("Failed to fetch quiz:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

