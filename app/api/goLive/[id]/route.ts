import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server"

export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{id: string} > }
) {
    const { id } = await context.params;

    try {
        const goLive = await prisma.event.update({
            where: {
                id
            }, 
            data: {
                isLive: true
            }
        });
        
        return NextResponse.json({ success: true, event: goLive }, { status: 200 });
    } catch (error) {
        console.error("Updated error: ", error)
        return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
    }
}