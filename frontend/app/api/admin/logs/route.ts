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

        const logs = await prisma.adminLog.findMany({
            include: {
                admin: {
                    select: { name: true },
                },
            },
            orderBy: { timestamp: "desc" },
            take: 50,
        })

        return NextResponse.json(logs)
    } catch (error) {
        console.error("Admin logs fetch error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
