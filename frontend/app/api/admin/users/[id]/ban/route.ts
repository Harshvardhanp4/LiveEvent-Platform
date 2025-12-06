import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { banned } = body

        const updatedUser = await prisma.user.update({
            where: { id: params.id },
            data: { banned },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                banned: true,
            },
        })

        // Log admin action
        await prisma.adminLog.create({
            data: {
                action: `${banned ? "Banned" : "Unbanned"} user ${updatedUser.name}`,
                adminId: session.user.id,
            },
        })

        return NextResponse.json(updatedUser)
    } catch (error) {
        console.error("User ban error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
