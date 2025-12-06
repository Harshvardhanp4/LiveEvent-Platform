import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { eventSchema } from "@/lib/validations"

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        const user = session?.user

        let events
        let completedEventsUpdate
        let isLiveEventUpdate

        const now = new Date()

        if (user?.role === "HOST") {
            isLiveEventUpdate = await prisma.event.updateMany({
                where: {
                    isLive: true,
                    startTime: { lt: now },
                },
                data: {
                    isLive: false,
                    completedEvent: true
                }
            })
            completedEventsUpdate = await prisma.event.updateMany({
                where: {
                    completedEvent: false,
                    startTime: { lt: now },
                },
                data: {
                    isLive: false,
                    completedEvent: true,
                },
            })

            // Hosts see their own events
            events = await prisma.event.findMany({
                where: { hostId: user.id },
                include: {
                    host: {
                        select: { id: true, name: true, email: true, image: true },
                    },
                    _count: {
                        select: { participants: true },
                    },
                },
                orderBy: { createdAt: "desc" },
            })
        } else {
            isLiveEventUpdate = await prisma.event.updateMany({
                where: {
                    isLive: true,
                    startTime: { lt: now },
                    completedEvent: false,
                },
                data: {
                    isLive: false,
                    completedEvent: true
                }
            })
            completedEventsUpdate = await prisma.event.updateMany({
                where: {
                    completedEvent: false,
                    startTime: { lt: now },
                },
                data: {
                    isLive: false,
                    completedEvent: true,
                },
            })

            // Participants see all events
            events = await prisma.event.findMany({
                include: {
                    host: {
                        select: { id: true, name: true, email: true, image: true },
                    },
                    _count: {
                        select: { participants: true },
                    },
                },
                orderBy: { createdAt: "desc" },
            })
        }

        return NextResponse.json({ events, completedEventsUpdate, isLiveEventUpdate })
    } catch (error) {
        console.error("Events fetch error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        const user = session?.user

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        if (user.role === "PARTICIPANT") {
            await prisma.user.update({
                where: {
                    id: user.id,
                    role: "PARTICIPANT"
                },
                data: {
                    role: "HOST"
                }
            })
        }

        const body = await request.json()
        const validatedData = eventSchema.parse(body)

        const event = await prisma.event.create({
            data: {
                title: validatedData.title,
                description: validatedData.description,
                startTime: new Date(validatedData.startTime),
                bannerUrl: validatedData.bannerUrl,
                hostId: user.id,
            },
            include: {
                host: {
                    select: { name: true },
                },
                _count: {
                    select: { participants: true },
                },
            },
        })

        return NextResponse.json(event)
    } catch (error) {
        console.error("Event creation error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
