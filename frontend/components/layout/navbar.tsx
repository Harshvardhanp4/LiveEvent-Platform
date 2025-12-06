"use client"

//import { useAuth } from "@/components/providers/auth-provider"
import { useSession, signOut } from "@/node_modules/next-auth/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Settings, LogOut, User, Shield, Mic } from "lucide-react"
import { AvatarImage } from "@radix-ui/react-avatar"

export function Navbar() {
    const { data: session } = useSession()
    const user = session?.user
    //const { user, logout } = useAuth()
    const router = useRouter()

    const handleLogout = () => {
        signOut({ callbackUrl: "/auth" })
    }

    const getRoleColor = (role: string) => {
        switch (role) {
            case "ADMIN":
                return "bg-red-500"
            case "HOST":
                return "bg-purple-500"
            case "PARTICIPANT":
                return "bg-blue-500"
            default:
                return "bg-gray-500"
        }
    }

    const getRoleIcon = (role: string) => {
        switch (role) {
            case "ADMIN":
                return <Shield className="h-3 w-3" />
            case "HOST":
                return <Mic className="h-3 w-3" />
            case "PARTICIPANT":
                return <User className="h-3 w-3" />
            default:
                return <User className="h-3 w-3" />
        }
    }

    const getNavLinks = (role: string) => {
        switch (role) {
            case "ADMIN":
                return [
                    { href: "/admin", label: "Admin Dashboard" },
                    { href: "/events", label: "All Events" },
                ]
            case "HOST":
                return [
                    { href: "/dashboard", label: "Dashboard" },
                    { href: "/events/builder", label: "Create Event" },
                    { href: "/events", label: "Browse Events" },
                ]
            case "PARTICIPANT":
                return [
                    { href: "/dashboard", label: "Dashboard" },
                    { href: "/events/builder", label: "Create Event" },
                    { href: "/events", label: "Browse Events" },    
                ]
            default:
                return [{ href: "/dashboard", label: "Dashboard" }]
        }
    }

    if (!user) {
        return (
            <nav className="bg-slate-800 border-b border-slate-700 px-6 py-4">
                <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">EF</span>
                        </div>
                        <span className="text-white font-semibold">EventFlow</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link href="/auth">
                            <Button variant="outline" className="border-slate-600 text-slate-300 bg-transparent">
                                Login
                            </Button>
                        </Link>
                        <Link href="/auth">
                            <Button className="bg-purple-600 hover:bg-purple-700">Sign Up</Button>
                        </Link>
                    </div>
                </div>
            </nav>
        )
    }

    const navLinks = getNavLinks(user.role)

    return (
        <nav className="bg-slate-800 border-b border-slate-700 px-6 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">EF</span>
                        </div>
                        <span className="text-white font-semibold">EventFlow</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-6">
                        {navLinks.map((link) => (
                            <Link key={link.href} href={link.href} className="text-slate-300 hover:text-white transition-colors">
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="flex items-center gap-2 text-slate-300 hover:text-white">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={session?.user.image || "/placeholder.svg"} />
                                    <AvatarFallback className={`${getRoleColor(user.role)} text-white text-xs`}>
                                        {user.name?.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="hidden md:flex flex-col items-center">
                                    <span className="text-sm font-medium">{user.name}</span>
                                        <Badge variant="secondary" className="text-xs">
                                            {getRoleIcon(user.role)}
                                            <span className="ml-1">{user.role}</span>
                                        </Badge>
                                </div>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                <User className="mr-2 h-4 w-4" />
                                <span>Profile</span>
                            </DropdownMenuItem>
                            <Link href='/settings'>
                                <DropdownMenuItem>
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Settings</span>
                                </DropdownMenuItem>
                            </Link>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout}>
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </nav>
    )
}
