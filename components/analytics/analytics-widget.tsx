"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity } from "lucide-react"

export function AnalyticsWidget() {
    return (
        <div className="min-h-screen bg-slate-900">
            <div className="fixed bottom-4 right-4 z-50">
                <Card className="w-64 bg-background/95 backdrop-blur-sm border shadow-lg">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                                <Activity className="w-4 h-4 text-green-500" />
                                <span className="text-sm font-medium">Live Analytics</span>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                                Real-time
                            </Badge>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Active Users:</span>
                                <span className="font-medium">1,247</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Engagement:</span>
                                <span className="font-medium text-green-600">94.2%</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
