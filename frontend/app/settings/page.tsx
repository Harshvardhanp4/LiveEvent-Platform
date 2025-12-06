"use client"

import type React from "react"

import { useState } from "react"
//import { useAuth } from "@/components/providers/auth-provider"
import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { User, Lock, Save } from "lucide-react"
import { useSession } from "@/node_modules/next-auth/react"

export default function SettingsPage() {
    const { data: session } = useSession()
    const user = session?.user
    //const { user } = useAuth()
    const [name, setName] = useState(user?.name || "")
    const [email, setEmail] = useState(user?.email || "")
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const token = localStorage.getItem("token")
            const response = await fetch("/api/user/profile", {
                method: "PATCH",
                // headers: {
                //     "Content-Type": "application/json",
                //     Authorization: `Bearer ${token}`,
                // },
                body: JSON.stringify({ name, email }),
            })

            if (response.ok) {
                toast({
                    title: "Profile updated",
                    description: "Your profile has been successfully updated.",
                })
            } else {
                toast({
                    title: "Update failed",
                    description: "Failed to update profile. Please try again.",
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

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault()

        if (newPassword !== confirmPassword) {
            toast({
                title: "Password mismatch",
                description: "New passwords do not match.",
                variant: "destructive",
            })
            return
        }

        setLoading(true)

        try {
            const token = localStorage.getItem("token")
            const response = await fetch("/api/user/password", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                }),
            })

            if (response.ok) {
                toast({
                    title: "Password changed",
                    description: "Your password has been successfully updated.",
                })
                setCurrentPassword("")
                setNewPassword("")
                setConfirmPassword("")
            } else {
                toast({
                    title: "Password change failed",
                    description: "Current password is incorrect.",
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

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="container mx-auto px-4 py-8 text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Please log in</h1>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
            <Navbar />

            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
                        <p className="text-gray-600">Manage your account settings and preferences</p>
                    </div>

                    <div className="space-y-6">
                        {/* Profile Settings */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Profile Information
                                </CardTitle>
                                <CardDescription>Update your personal information</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleUpdateProfile} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                    </div>
                                    <Button type="submit" disabled={loading}>
                                        <Save className="mr-2 h-4 w-4" />
                                        {loading ? "Saving..." : "Save Changes"}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Password Settings */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Lock className="h-5 w-5" />
                                    Change Password
                                </CardTitle>
                                <CardDescription>Update your account password</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleChangePassword} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="currentPassword">Current Password</Label>
                                        <Input
                                            id="currentPassword"
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="newPassword">New Password</Label>
                                        <Input
                                            id="newPassword"
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <Button type="submit" disabled={loading}>
                                        <Lock className="mr-2 h-4 w-4" />
                                        {loading ? "Changing..." : "Change Password"}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
