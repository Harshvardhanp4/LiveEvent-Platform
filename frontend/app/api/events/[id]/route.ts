import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { eventSchema } from "@/lib/validations";

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;

    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;

        const event = await prisma.event.findUnique({
            where: { id },
            include: {
                host: {
                    select: { id: true, name: true, email: true, image: true },
                },
                _count: {
                    select: { participants: true },
                },
            },
        });

        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        const existingParticipant = await prisma.participant.findUnique({
            where: {
                userId_eventId: {
                    userId,
                    eventId: id,
                },
            },
        });

        return NextResponse.json({
            event,
            hasJoined: !!existingParticipant,
        });
    } catch (error) {
        console.error("Event fetch error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;

    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const validatedData = eventSchema.parse(body);

        const existingEvent = await prisma.event.findUnique({
            where: {
                id
            },
            select: {
                hostId: true
            }
        })

        if (!existingEvent) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 })
        }

        if (existingEvent.hostId !== session.user.id && session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const updatedEvent = await prisma.event.update({
            where: { id },
            data: {
                title: validatedData.title,
                description: validatedData.description,
                startTime: new Date(validatedData.startTime),
                bannerUrl: validatedData.bannerUrl
            },
            include: {
                host: {
                    select: { id: true, name: true, email: true, image: true },
                },
                _count: {
                    select: {
                        participants: true
                    },
                },
            },
        })

        return NextResponse.json(updatedEvent);
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;

    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const existingEvent = await prisma.event.findUnique({
            where: { id }, 
            select: { 
                hostId: true 
            }
        })

        if (!existingEvent) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        if (existingEvent.hostId !== session.user.id && session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        await prisma.event.delete({
            where: { id }, 
        })

        return NextResponse.json({ message: "Event delete successfully" });
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}