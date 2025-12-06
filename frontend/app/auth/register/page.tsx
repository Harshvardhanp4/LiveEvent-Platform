"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
//import { useAuth } from "@/components/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Calendar } from "lucide-react"
import { signIn } from "@/node_modules/next-auth/react"

export default function RegisterPage() {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [role, setRole] = useState("PARTICIPANT")
    const [loading, setLoading] = useState(false)
    //const { register } = useAuth()
    const router = useRouter()
    const { toast } = useToast()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, email, password, role }),
            })

            if (res.ok) {
                // Auto-login user
                const loginRes = await signIn("credentials", {
                    redirect: false,
                    email,
                    password,
                })

                if (loginRes?.ok) {
                    toast({
                        title: "Welcome!",
                        description: "Your account has been created and you're logged in.",
                    })
                    router.push("/dashboard")
                } else {
                    // Fallback redirect if login fails
                    toast({
                        title: "Account created",
                        description: "Please sign in to continue.",
                    })
                    router.push("/auth/login")
                }
            } else {
                const data = await res.json()
                toast({
                    title: "Registration failed",
                    description: data?.error || "Please check your information and try again.",
                    variant: "destructive",
                })
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Something went wrong. Please try again.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <Calendar className="h-12 w-12 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Create Account</CardTitle>
                    <CardDescription>Join LiveEvent Platform today</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="Enter your full name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Create a password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role">Account Type</Label>
                            <Select value={role} onValueChange={setRole}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select account type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PARTICIPANT">Participant</SelectItem>
                                    <SelectItem value="HOST">Event Host</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Creating account..." : "Create Account"}
                        </Button>
                    </form>
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{" "}
                            <Link href="/auth/login" className="text-primary hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
