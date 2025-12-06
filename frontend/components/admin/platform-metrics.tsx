"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function PlatformMetrics() {
    const metrics = [
        {
            label: "Uptime",
            value: "98.5%",
            color: "text-blue-400",
        },
        {
            label: "User Rating",
            value: "4.8/5",
            color: "text-green-400",
        },
        {
            label: "Avg Load Time",
            value: "2.3s",
            color: "text-purple-400",
        },
    ]

    return (
        <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
                <CardTitle className="text-white">Platform Metrics</CardTitle>
                <CardDescription className="text-slate-400">Key performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {metrics.map((metric, index) => (
                        <div key={index} className="text-center">
                            <div className={`text-4xl font-bold mb-2 ${metric.color}`}>{metric.value}</div>
                            <div className="text-slate-400 text-sm">{metric.label}</div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
