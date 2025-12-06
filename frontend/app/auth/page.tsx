"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from "lucide-react"
//import { ThemeToggle } from "@/components/theme-toggle"
//import { useAuth } from "@/components/providers/auth-provider"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { signIn } from "@/node_modules/next-auth/react"

export default function AuthPage() {
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    //const { login, register } = useAuth()
    const router = useRouter()
    const { toast } = useToast()

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        const formData = new FormData(e.target as HTMLFormElement)
        const email = formData.get("email") as string
        const password = formData.get("password") as string

        try {
            const result = await signIn("credentials", {
                redirect: false,
                email,
                password,
            })
            if (result?.ok) {
                toast({
                    title: "Welcome back!",
                    description: "You have successfully signed in.",
                })
                router.push("/dashboard")
            } else {
                toast({
                    title: "Sign in failed",
                    description: result?.error || "Invalid email or password.",
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
            setIsLoading(false)
        }
    }

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        const formData = new FormData(e.target as HTMLFormElement)
        const name = formData.get("name") as string
        const email = formData.get("email") as string
        const password = formData.get("password") as string
        const confirmPassword = formData.get("confirmPassword") as string

        if (password !== confirmPassword) {
            toast({
                title: "Password mismatch",
                description: "Passwords do not match.",
                variant: "destructive",
            })
            setIsLoading(false)
            return
        }

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password, role: "PARTICIPANT" }),
            })

            if (!res.ok) {
                const { error } = await res.json()
                throw new Error(error || "Registration failed")
            }

            // Auto login user after successful registration
            const signInRes = await signIn("credentials", {
                email,
                password,
                redirect: false,
            })

            if (signInRes?.ok) {
                toast({
                    title: "Welcome!",
                    description: "Your account has been created and you're now logged in.",
                })
                router.push("/dashboard")
            } else {
                toast({
                    title: "Account created",
                    description: "Please login to continue.",
                })
                router.push("/auth")
            }
        } catch (err) {
            toast({
                title: "Registration failed",
                description: (err as Error).message,
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }


    const handleGoogleAuth = async (provider: string) => {
        setIsLoading(true)
        try {
            await signIn(provider, {
                callbackUrl: "/dashboard", // or any page after login
            })
        } catch (error) {
            toast({
                title: "Authentication failed",
                description: "Could not sign in with Google.",
                variant: "destructive",
            })
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center space-x-2 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl"></div>
                        <span className="text-2xl font-bold">EventFlow</span>
                    </div>
                    <p className="text-muted-foreground">Join thousands of users hosting interactive events</p>
                </div>

                <Card className="rounded-2xl shadow-2xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                    <CardContent className="p-8">
                        <Tabs defaultValue="signin" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-8">
                                <TabsTrigger value="signin">Sign In</TabsTrigger>
                                <TabsTrigger value="signup">Sign Up</TabsTrigger>
                            </TabsList>

                            <TabsContent value="signin" className="space-y-6">
                                <div className="text-center mb-6">
                                    <h2 className="text-2xl font-bold">Welcome back</h2>
                                    <p className="text-muted-foreground">Sign in to your account</p>
                                </div>

                                <form onSubmit={handleSignIn} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="signin-email">Email</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                            <Input
                                                id="signin-email"
                                                name="email"
                                                type="email"
                                                placeholder="Enter your email"
                                                className="pl-10 h-12"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="signin-password">Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                            <Input
                                                id="signin-password"
                                                name="password"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Enter your password"
                                                className="pl-10 pr-10 h-12"
                                                required
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="remember" />
                                            <Label htmlFor="remember" className="text-sm">
                                                Remember me
                                            </Label>
                                        </div>
                                        <Button variant="link" className="px-0 text-sm">
                                            Forgot password?
                                        </Button>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full h-12 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "Signing In..." : "Sign In"}
                                        {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
                                    </Button>
                                </form>

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <Separator className="w-full" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                                    </div>
                                </div>

                                <Button variant="outline" className="w-full h-12" onClick={() => handleGoogleAuth("google")}>
                                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                                        <path
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            fill="#4285F4"
                                        />
                                        <path
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            fill="#34A853"
                                        />
                                        <path
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                            fill="#FBBC05"
                                        />
                                        <path
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            fill="#EA4335"
                                        />
                                        <path d="M1 1h22v22H1z" fill="none" />
                                    </svg>
                                    Continue with Google
                                </Button>
                            </TabsContent>

                            <TabsContent value="signup" className="space-y-6">
                                <div className="text-center mb-6">
                                    <h2 className="text-2xl font-bold">Create account</h2>
                                    <p className="text-muted-foreground">Get started with EventFlow today</p>
                                </div>

                                <form onSubmit={handleSignUp} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="signup-name">Full Name</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                            <Input
                                                id="signup-name"
                                                name="name"
                                                type="text"
                                                placeholder="Enter your full name"
                                                className="pl-10 h-12"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="signup-email">Email</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                            <Input
                                                id="signup-email"
                                                name="email"
                                                type="email"
                                                placeholder="Enter your email"
                                                className="pl-10 h-12"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="signup-password">Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                            <Input
                                                id="signup-password"
                                                name="password"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Create a password"
                                                className="pl-10 pr-10 h-12"
                                                required
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirm-password">Confirm Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                            <Input
                                                id="confirm-password"
                                                name="confirmPassword"
                                                type={showConfirmPassword ? "text" : "password"}
                                                placeholder="Confirm your password"
                                                className="pl-10 pr-10 h-12"
                                                required
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            >
                                                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* <div className="flex items-center space-x-2">
                                        <Checkbox id="terms" required />
                                        <Label htmlFor="terms" className="text-sm">
                                            I agree to the{" "}
                                            <Button variant="link" className="px-0 h-auto text-sm">
                                                Terms of Service
                                            </Button>{" "}
                                            and{" "}
                                            <Button variant="link" className="px-0 h-auto text-sm">
                                                Privacy Policy
                                            </Button>
                                        </Label>
                                    </div> */}

                                    <Button
                                        type="submit"
                                        className="w-full h-12 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "Creating Account..." : "Create Account"}
                                        {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
                                    </Button>
                                </form>

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <Separator className="w-full" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                                    </div>
                                </div>

                                <Button variant="outline" className="w-full h-12" onClick={() => handleGoogleAuth("google")}>
                                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                                        <path
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            fill="#4285F4"
                                        />
                                        <path
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            fill="#34A853"
                                        />
                                        <path
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                            fill="#FBBC05"
                                        />
                                        <path
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            fill="#EA4335"
                                        />
                                        <path d="M1 1h22v22H1z" fill="none" />
                                    </svg>
                                    Continue with Google
                                </Button>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                {/* <div className="text-center mt-6">
                    <ThemeToggle />
                </div> */}
            </div>
        </div>
    )
}
