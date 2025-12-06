import { z } from "zod"

export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
})

export const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["HOST", "PARTICIPANT"]).default("PARTICIPANT"),
})

export const eventSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    startTime: z.string().min(1, "Start time is required"),
    bannerUrl: z.string().url().optional(),
})

export const quizSchema = z.object({
    eventId: z.string(),
    question: z.string().min(1, "Question is required"),
    options: z.array(z.string()).min(2, "At least 2 options required"),
    correctAnswer: z.number().min(0),
    timeLimit: z.number().min(10).max(300),
})

export const pollSchema = z.object({
    eventId: z.string(),
    question: z.string().min(1, "Question is required"),
    options: z.array(z.string()).min(2, "At least 2 options required"),
})
