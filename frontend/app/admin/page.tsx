"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
    Users,
    Calendar,
    BarChart3,
    Search,
    MoreHorizontal,
    Edit,
    Trash2,
    Eye,
    Plus,
    TrendingUp,
    Activity,
    Settings,
} from "lucide-react"
//import { useAuth } from "@/components/providers/auth-provider"
import { Navbar } from "@/components/layout/navbar"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { useSession } from "@/node_modules/next-auth/react"

export default function AdminDashboard() {
    const [searchTerm, setSearchTerm] = useState("")
    const { data: session } = useSession()
    const user = session?.user
    //const { user } = useAuth()
    const { toast } = useToast()

    const stats = [
        {
            title: "Total Users",
            value: "12,847",
            change: "+12%",
            trend: "up",
            icon: Users,
            color: "text-blue-600",
        },
        {
            title: "Active Events",
            value: "23",
            change: "+5%",
            trend: "up",
            icon: Calendar,
            color: "text-green-600",
        },
        {
            title: "Events This Month",
            value: "156",
            change: "+18%",
            trend: "up",
            icon: BarChart3,
            color: "text-purple-600",
        },
        {
            title: "Total Engagement",
            value: "94.2%",
            change: "+2.1%",
            trend: "up",
            icon: Activity,
            color: "text-orange-600",
        },
    ]

    const users = [
        {
            id: 1,
            name: "Alice Johnson",
            email: "alice@example.com",
            role: "HOST",
            status: "Active",
            events: 12,
            joined: "2024-01-15",
        },
        {
            id: 2,
            name: "Bob Smith",
            email: "bob@example.com",
            role: "PARTICIPANT",
            status: "Active",
            events: 0,
            joined: "2024-02-20",
        },
        {
            id: 3,
            name: "Carol Davis",
            email: "carol@example.com",
            role: "HOST",
            status: "Inactive",
            events: 8,
            joined: "2024-01-10",
        },
        {
            id: 4,
            name: "David Wilson",
            email: "david@example.com",
            role: "ADMIN",
            status: "Active",
            events: 25,
            joined: "2023-12-05",
        },
    ]

    const events = [
        {
            id: 1,
            title: "Tech Innovation Summit 2024",
            host: "Alice Johnson",
            participants: 1247,
            status: "Live",
            date: "2024-12-15",
            duration: "3h",
        },
        {
            id: 2,
            title: "Web Development Masterclass",
            host: "Bob Smith",
            participants: 856,
            status: "Scheduled",
            date: "2024-12-20",
            duration: "2h",
        },
        {
            id: 3,
            title: "AI & Machine Learning Workshop",
            host: "Carol Davis",
            participants: 432,
            status: "Completed",
            date: "2024-12-10",
            duration: "4h",
        },
        {
            id: 4,
            title: "Mobile App Development",
            host: "David Wilson",
            participants: 623,
            status: "Scheduled",
            date: "2024-12-25",
            duration: "3h",
        },
    ]

    if (user?.role !== "ADMIN") {
        return (
            <div className="min-h-screen bg-slate-900">
                <Navbar />
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
                        <p className="text-slate-400">You don't have permission to access this page.</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-900">
            <Navbar />

            <div className="container mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
                        <p className="text-slate-400">Manage users, events, and platform analytics</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/events/builder">
                            <Button className="bg-purple-600 hover:bg-purple-700">
                                <Plus className="w-4 h-4 mr-2" />
                                New Event
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, index) => (
                        <Card key={index} className="bg-slate-800 border-slate-700 rounded-2xl shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-400">{stat.title}</p>
                                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                                        <div className="flex items-center space-x-1 mt-1">
                                            <TrendingUp className="w-4 h-4 text-green-500" />
                                            <span className="text-sm text-green-400">{stat.change}</span>
                                        </div>
                                    </div>
                                    <div className={`p-3 rounded-xl bg-slate-700 ${stat.color}`}>
                                        <stat.icon className="w-6 h-6" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Main Content */}
                <Tabs defaultValue="users" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4 bg-slate-800">
                        <TabsTrigger value="users" className="data-[state=active]:bg-purple-600">
                            User Management
                        </TabsTrigger>
                        <TabsTrigger value="events" className="data-[state=active]:bg-purple-600">
                            Event Management
                        </TabsTrigger>
                        <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-600">
                            Analytics
                        </TabsTrigger>
                        <TabsTrigger value="settings" className="data-[state=active]:bg-purple-600">
                            Settings
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="users" className="space-y-6">
                        <Card className="bg-slate-800 border-slate-700 rounded-2xl shadow-lg">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-white">User Management</CardTitle>
                                        <CardDescription className="text-slate-400">Manage users, roles, and permissions</CardDescription>
                                    </div>
                                    {/* <Button className="bg-purple-600 hover:bg-purple-700">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add User
                                    </Button> */}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center space-x-2 mb-6">
                                    <div className="relative flex-1 max-w-sm">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                                        <Input
                                            placeholder="Search users..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10 bg-slate-700 border-slate-600 text-white"
                                        />
                                    </div>
                                </div>

                                <div className="rounded-lg border border-slate-700">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-slate-700">
                                                <TableHead className="text-slate-300">Name</TableHead>
                                                <TableHead className="text-slate-300">Email</TableHead>
                                                <TableHead className="text-slate-300">Role</TableHead>
                                                <TableHead className="text-slate-300">Status</TableHead>
                                                <TableHead className="text-slate-300">Events Hosted</TableHead>
                                                <TableHead className="text-slate-300">Joined</TableHead>
                                                <TableHead className="w-[50px]"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {users.map((user) => (
                                                <TableRow key={user.id} className="border-slate-700">
                                                    <TableCell className="font-medium text-white">{user.name}</TableCell>
                                                    <TableCell className="text-slate-300">{user.email}</TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={user.role === "ADMIN" ? "default" : "secondary"}
                                                            className={
                                                                user.role === "ADMIN"
                                                                    ? "bg-purple-600 text-white"
                                                                    : user.role === "HOST"
                                                                        ? "bg-blue-600 text-white"
                                                                        : "bg-slate-600 text-white"
                                                            }
                                                        >
                                                            {user.role}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={user.status === "Active" ? "default" : "secondary"}
                                                            className={
                                                                user.status === "Active" ? "bg-green-600 text-white" : "bg-slate-600 text-white"
                                                            }
                                                        >
                                                            {user.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-slate-300">{user.events}</TableCell>
                                                    <TableCell className="text-slate-300">{user.joined}</TableCell>
                                                    <TableCell>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                                                                    <MoreHorizontal className="w-4 h-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                                                                <DropdownMenuItem className="text-slate-300 hover:text-white">
                                                                    <Eye className="w-4 h-4 mr-2" />
                                                                    View Details
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem className="text-slate-300 hover:text-white">
                                                                    <Edit className="w-4 h-4 mr-2" />
                                                                    Edit User
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem className="text-red-400 hover:text-red-300">
                                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                                    Delete User
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="events" className="space-y-6">
                        <Card className="bg-slate-800 border-slate-700 rounded-2xl shadow-lg">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-white">Event Management</CardTitle>
                                        <CardDescription className="text-slate-400">
                                            Monitor and manage all events on the platform
                                        </CardDescription>
                                    </div>
                                    {/* <Button className="bg-purple-600 hover:bg-purple-700">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Create Event
                                    </Button> */}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center space-x-2 mb-6">
                                    <div className="relative flex-1 max-w-sm">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                                        <Input placeholder="Search events..." className="pl-10 bg-slate-700 border-slate-600 text-white" />
                                    </div>
                                </div>

                                <div className="rounded-lg border border-slate-700">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-slate-700">
                                                <TableHead className="text-slate-300">Event Title</TableHead>
                                                <TableHead className="text-slate-300">Host</TableHead>
                                                <TableHead className="text-slate-300">Participants</TableHead>
                                                <TableHead className="text-slate-300">Status</TableHead>
                                                <TableHead className="text-slate-300">Date</TableHead>
                                                <TableHead className="text-slate-300">Duration</TableHead>
                                                <TableHead className="w-[50px]"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {events.map((event) => (
                                                <TableRow key={event.id} className="border-slate-700">
                                                    <TableCell className="font-medium text-white">{event.title}</TableCell>
                                                    <TableCell className="text-slate-300">{event.host}</TableCell>
                                                    <TableCell className="text-slate-300">{event.participants.toLocaleString()}</TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={
                                                                event.status === "Live"
                                                                    ? "destructive"
                                                                    : event.status === "Scheduled"
                                                                        ? "default"
                                                                        : "secondary"
                                                            }
                                                            className={
                                                                event.status === "Live"
                                                                    ? "bg-red-600 text-white"
                                                                    : event.status === "Scheduled"
                                                                        ? "bg-blue-600 text-white"
                                                                        : "bg-slate-600 text-white"
                                                            }
                                                        >
                                                            {event.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-slate-300">{event.date}</TableCell>
                                                    <TableCell className="text-slate-300">{event.duration}</TableCell>
                                                    <TableCell>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                                                                    <MoreHorizontal className="w-4 h-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                                                                <DropdownMenuItem className="text-slate-300 hover:text-white">
                                                                    <Eye className="w-4 h-4 mr-2" />
                                                                    View Event
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem className="text-slate-300 hover:text-white">
                                                                    <Edit className="w-4 h-4 mr-2" />
                                                                    Edit Event
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem className="text-red-400 hover:text-red-300">
                                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                                    Delete Event
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="analytics" className="space-y-6">
                        <div className="grid lg:grid-cols-2 gap-6">
                            <Card className="bg-slate-800 border-slate-700 rounded-2xl shadow-lg">
                                <CardHeader>
                                    <CardTitle className="text-white">User Growth</CardTitle>
                                    <CardDescription className="text-slate-400">Monthly user registration trends</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                                        <BarChart3 className="w-16 h-16 mb-4" />
                                        <p>Chart visualization would go here</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-slate-800 border-slate-700 rounded-2xl shadow-lg">
                                <CardHeader>
                                    <CardTitle className="text-white">Event Engagement</CardTitle>
                                    <CardDescription className="text-slate-400">Average engagement rates by event type</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                                        <Activity className="w-16 h-16 mb-4" />
                                        <p>Chart visualization would go here</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="bg-slate-800 border-slate-700 rounded-2xl shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-white">Platform Metrics</CardTitle>
                                <CardDescription className="text-slate-400">Key performance indicators</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-3 gap-6">
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-indigo-400">98.5%</div>
                                        <div className="text-sm text-slate-400">Uptime</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-green-400">4.8/5</div>
                                        <div className="text-sm text-slate-400">User Rating</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-purple-400">2.3s</div>
                                        <div className="text-sm text-slate-400">Avg Load Time</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="settings" className="space-y-6">
                        <Card className="bg-slate-800 border-slate-700 rounded-2xl shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-white">Platform Settings</CardTitle>
                                <CardDescription className="text-slate-400">Configure platform-wide settings</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                                        <div>
                                            <h3 className="text-white font-medium">Event Registration</h3>
                                            <p className="text-slate-400 text-sm">Allow public event registration</p>
                                        </div>
                                        <Button variant="outline" className="border-slate-600 text-slate-300 bg-transparent">
                                            <Settings className="w-4 h-4 mr-2" />
                                            Configure
                                        </Button>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                                        <div>
                                            <h3 className="text-white font-medium">User Permissions</h3>
                                            <p className="text-slate-400 text-sm">Manage user roles and permissions</p>
                                        </div>
                                        <Button variant="outline" className="border-slate-600 text-slate-300 bg-transparent">
                                            <Settings className="w-4 h-4 mr-2" />
                                            Configure
                                        </Button>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                                        <div>
                                            <h3 className="text-white font-medium">Analytics</h3>
                                            <p className="text-slate-400 text-sm">Configure analytics and tracking</p>
                                        </div>
                                        <Button variant="outline" className="border-slate-600 text-slate-300 bg-transparent">
                                            <Settings className="w-4 h-4 mr-2" />
                                            Configure
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
