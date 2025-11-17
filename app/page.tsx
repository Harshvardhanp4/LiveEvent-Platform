import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Navbar } from "@/components/layout/navbar"
import { Calendar, Users, Zap, BarChart3, Play, ArrowRight } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-6xl font-bold text-white mb-6">
              Create Interactive{" "}
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Live Events
              </span>
            </h1>
            <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed">
              Engage your audience with real-time polls, quizzes, Q&A sessions, and live chat. Perfect for webinars,
              conferences, and educational events.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/auth">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700 px-8 py-4 text-lg">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/events">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-800 px-8 py-4 text-lg"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Everything You Need for Engaging Events</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Powerful features designed to create memorable and interactive experiences
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="bg-slate-800 border-slate-700 hover:bg-slate-750 transition-all group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-purple-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Calendar className="h-8 w-8 text-purple-400" />
                </div>
                <h3 className="text-white font-semibold text-xl mb-3">Easy Event Creation</h3>
                <p className="text-slate-400 leading-relaxed">
                  Create and manage events with our intuitive interface. Schedule, customize, and launch in minutes.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700 hover:bg-slate-750 transition-all group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-purple-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Users className="h-8 w-8 text-purple-400" />
                </div>
                <h3 className="text-white font-semibold text-xl mb-3">Real-time Interaction</h3>
                <p className="text-slate-400 leading-relaxed">
                  Engage participants with live polls, quizzes, Q&A sessions, and chat functionality.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700 hover:bg-slate-750 transition-all group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-purple-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Zap className="h-8 w-8 text-purple-400" />
                </div>
                <h3 className="text-white font-semibold text-xl mb-3">Live Streaming</h3>
                <p className="text-slate-400 leading-relaxed">
                  Integrated video streaming with WebRTC technology for seamless live broadcasting.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700 hover:bg-slate-750 transition-all group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-purple-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <BarChart3 className="h-8 w-8 text-purple-400" />
                </div>
                <h3 className="text-white font-semibold text-xl mb-3">Analytics & Insights</h3>
                <p className="text-slate-400 leading-relaxed">
                  Track engagement, participation rates, and get detailed analytics for your events.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <Card className="bg-gradient-to-r from-purple-600 to-blue-600 border-0">
            <CardContent className="p-12 text-center">
              <h2 className="text-4xl font-bold text-white mb-4">Ready to Create Your First Event?</h2>
              <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
                Join thousands of event organizers who trust EventFlow Platform
              </p>
              <Link href="/auth">
                <Button
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-slate-100 px-8 py-4 text-lg font-semibold"
                >
                  Start Creating Events
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
