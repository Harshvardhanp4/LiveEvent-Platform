import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { prisma } from "./prisma"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import type { NextAuthOptions } from "next-auth"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export interface JWTPayload {
    userId: string
    email: string
    role: string
}

// JWT Functions
export function generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: "7d",
        algorithm: "HS256",
    })
}

export function verifyToken(token: string): JWTPayload | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
        return decoded
    } catch (error) {
        console.error("Token verification failed:", error)
        return null
    }
}

// Password Hashing Utilities
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
}

// Fetch current user from token
export async function getCurrentUser(token?: string) {
    if (!token) return null

    const payload = verifyToken(token)
    if (!payload) return null

    const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            banned: true,
        },
    })

    return user
}

// NextAuth Configuration with Google OAuth
export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code",
                },
            },
            async profile(profile) {
                // Upsert user in DB
                const user = await prisma.user.upsert({
                    where: { email: profile.email },
                    update: {
                        name: profile.name || profile.login || "Unknown",
                        image: profile.picture,
                        provider: "GOOGLE" as const,
                    },
                    create: {
                        name: profile.name || profile.login || "Unknown",
                        email: profile.email,
                        image: profile.picture,
                        provider: "GOOGLE" as const,
                        role: "PARTICIPANT", // default role
                        banned: false,
                        passwordHash: "", // not used for Google users, still required
                    },
                })

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    image: user.image,
                    provider: user.provider ?? "GOOGLE",
                    role: user.role
                }
            },
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                })

                if (!user || !user.passwordHash) return null

                const isValid = await comparePassword(credentials.password, user.passwordHash)

                if (!isValid) return null

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    image: user.image,
                    provider: user.provider ?? "CREDENTIALS",
                    role: user.role
                }
            },
        }),
    ],

    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },

    secret: process.env.NEXTAUTH_SECRET,

    callbacks: {
        async jwt({ token, user, account }) {
            if (user && user.id) {
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
                token.image = user.image;
                token.provider = user.provider;
                token.role = user.role;
            }

            if (account) {
                token.accessToken = account.access_token;
            }

            return token;
        },
        async session({ session, token }) {
        if (session.user) {
            session.user.id = token.id as string;
            session.user.email = token.email as string;
            session.user.name = token.name as string;
            session.user.image = token.image as string;
            session.user.provider = token.provider as "GOOGLE" | "CREDENTIALS";
            session.user.role = token.role as string;
        }

        session.accessToken = token.accessToken as string;
        return session;
    },
    },
}
