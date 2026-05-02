'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from './context/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PlayCircle, Users, Film, TrendingUp } from 'lucide-react'

// Initialize demo data on first load
function initializeDemoData() {
  try {
    const stored = localStorage.getItem('streamverse_initialized')
    if (!stored) {
      // Initialize demo users and movies will happen via API on login
      localStorage.setItem('streamverse_initialized', 'true')
    }
  } catch (e) {
    // Silently fail if localStorage is not available
  }
}

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, loading } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    initializeDemoData()
  }, [])

  useEffect(() => {
    if (mounted && isAuthenticated) {
      router.push('/movies')
    }
  }, [mounted, isAuthenticated, router])

  if (!mounted || loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background to-card/50 animate-pulse" />
    )
  }

  if (isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background to-card/50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight text-pretty">
              Stream Your <span className="text-primary">Favorite Stories</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-md">
              Watch unlimited movies, discover creators, and join vibrant communities all in one place.
            </p>
            <div className="flex gap-4">
              <Button size="lg" onClick={() => router.push('/signup')}>
                Get Started Free
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => router.push('/login')}
              >
                Sign In
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => router.push('/demo-info')}
              >
                View Demo
              </Button>
            </div>
          </div>

          <div className="relative h-80 md:h-96 rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20 border border-border flex items-center justify-center">
            <PlayCircle className="w-20 h-20 text-primary opacity-40" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold mb-12 text-center">Why StreamVerse?</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-border hover:border-primary transition-colors">
            <CardContent className="p-6 space-y-4">
              <Film className="w-8 h-8 text-primary" />
              <h3 className="text-lg font-semibold">Unlimited Content</h3>
              <p className="text-muted-foreground">
                Access thousands of movies and shows from independent creators worldwide.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border hover:border-primary transition-colors">
            <CardContent className="p-6 space-y-4">
              <Users className="w-8 h-8 text-primary" />
              <h3 className="text-lg font-semibold">Community First</h3>
              <p className="text-muted-foreground">
                Discuss movies, share reviews, and connect with other passionate viewers.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border hover:border-primary transition-colors">
            <CardContent className="p-6 space-y-4">
              <TrendingUp className="w-8 h-8 text-primary" />
              <h3 className="text-lg font-semibold">Creator Rewards</h3>
              <p className="text-muted-foreground">
                Producers earn from their content and direct fan subscriptions.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-lg p-12 text-center space-y-6">
          <h2 className="text-3xl font-bold">Ready to Start Streaming?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of viewers and creators. First month free for new viewers.
          </p>
          <Button size="lg" onClick={() => router.push('/signup')}>
            Create Free Account
          </Button>
        </div>
      </section>
    </div>
  )
}

function AuthenticatedHome() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background to-card/50">
      <section className="container mx-auto px-4 py-20">
        <div className="space-y-4 mb-12">
          <h1 className="text-4xl font-bold">Welcome to StreamVerse</h1>
          <p className="text-lg text-muted-foreground">
            Your dashboard is ready. Start exploring content and connecting with creators.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <Button
            size="lg"
            variant="outline"
            className="h-auto flex-col items-start p-6"
            onClick={() => window.location.href = '/movies'}
          >
            <Film className="w-6 h-6 mb-2" />
            <span>Browse Movies</span>
            <span className="text-xs text-muted-foreground mt-1">Discover content</span>
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="h-auto flex-col items-start p-6"
            onClick={() => window.location.href = '/forum'}
          >
            <Users className="w-6 h-6 mb-2" />
            <span>Forum</span>
            <span className="text-xs text-muted-foreground mt-1">Join discussions</span>
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="h-auto flex-col items-start p-6"
            onClick={() => window.location.href = '/messages'}
          >
            <PlayCircle className="w-6 h-6 mb-2" />
            <span>Messages</span>
            <span className="text-xs text-muted-foreground mt-1">Chat with users</span>
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="h-auto flex-col items-start p-6"
            onClick={() => window.location.href = '/discover'}
          >
            <TrendingUp className="w-6 h-6 mb-2" />
            <span>Discover</span>
            <span className="text-xs text-muted-foreground mt-1">Find creators</span>
          </Button>
        </div>

        <Card className="border-border bg-card/50">
          <CardContent className="p-8 text-center space-y-4">
            <h2 className="text-2xl font-bold">Explore More Features</h2>
            <p className="text-muted-foreground">
              More content and features are coming soon. In the meantime, check out the available sections.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
