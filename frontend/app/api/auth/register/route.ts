import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/auth"
import { registerSchema } from "@/lib/validations"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const validatedData = registerSchema.parse(body)

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: validatedData.email },
        })

        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 })
        }

        // Hash password and create user
        const hashedPassword = await hashPassword(validatedData.password)

        const user = await prisma.user.create({
            data: {
                name: validatedData.name,
                email: validatedData.email,
                passwordHash: hashedPassword,
                role: validatedData.role,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                banned: true,
            },
        })

        // Return user without generating token
        return NextResponse.json({ user })
    } catch (error) {
        console.error("Registration error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
