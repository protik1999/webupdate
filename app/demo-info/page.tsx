'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Copy,
  Check,
  Users,
  Film,
  MessageCircle,
  Settings,
  Shield,
  Home,
} from 'lucide-react'
import { useState } from 'react'

const DEMO_ACCOUNTS = [
  {
    role: 'Viewer',
    email: 'viewer@demo.com',
    password: 'demo123',
    description: 'Watch movies, rate content, and join discussions',
    features: ['Browse Movies', 'Rate & Review', 'Forum', 'Messages'],
  },
  {
    role: 'Producer',
    email: 'producer@demo.com',
    password: 'demo123',
    description: 'Upload content, manage subscriptions, track earnings',
    features: ['Upload Movies', 'Dashboard', 'Earnings', 'Analytics'],
  },
  {
    role: 'Admin',
    email: 'admin@demo.com',
    password: 'demo123',
    description: 'Moderate content, manage users, view platform stats',
    features: ['Moderation', 'User Management', 'Analytics', 'Settings'],
  },
]

const FEATURES = [
  {
    icon: Film,
    title: 'Movie Streaming',
    description: 'Browse and watch unlimited movies with advanced search and filtering',
    path: '/movies',
  },
  {
    icon: Users,
    title: 'Community Forum',
    description: 'Discuss movies, share reviews, and connect with other users',
    path: '/forum',
  },
  {
    icon: MessageCircle,
    title: 'Messaging',
    description: 'Direct messaging with creators and community members',
    path: '/messages',
  },
  {
    icon: Home,
    title: 'User Discovery',
    description: 'Find and connect with creators and other viewers',
    path: '/discover',
  },
  {
    icon: Shield,
    title: 'Producer Dashboard',
    description: 'Upload content, manage earnings, and track analytics',
    path: '/producer/dashboard',
  },
  {
    icon: Settings,
    title: 'Admin Panel',
    description: 'Content moderation and platform management tools',
    path: '/admin',
  },
]

export default function DemoInfoPage() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">StreamVerse Demo</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A complete movie streaming platform with community features, producer tools, and
            admin capabilities
          </p>
        </div>

        {/* Demo Accounts */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Demo Accounts</h2>
          <p className="text-muted-foreground mb-6">
            Use these credentials to explore different user roles:
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {DEMO_ACCOUNTS.map((account, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Badge>{account.role}</Badge>
                  </CardTitle>
                  <CardDescription>{account.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <div className="flex gap-2 mt-1">
                        <code className="flex-1 bg-card px-3 py-2 rounded border border-border text-sm">
                          {account.email}
                        </code>
                        <button
                          onClick={() => copyToClipboard(account.email, idx * 2)}
                          className="px-3 py-2 rounded border border-border hover:bg-card transition"
                        >
                          {copiedIndex === idx * 2 ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Password
                      </label>
                      <div className="flex gap-2 mt-1">
                        <code className="flex-1 bg-card px-3 py-2 rounded border border-border text-sm">
                          {account.password}
                        </code>
                        <button
                          onClick={() => copyToClipboard(account.password, idx * 2 + 1)}
                          className="px-3 py-2 rounded border border-border hover:bg-card transition"
                        >
                          {copiedIndex === idx * 2 + 1 ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Features:</p>
                    <div className="flex flex-wrap gap-1">
                      {account.features.map((feature) => (
                        <Badge key={feature} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button className="w-full" asChild>
                    <Link href="/login">Sign In as {account.role}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Platform Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature) => {
              const Icon = feature.icon
              return (
                <Card key={feature.title} className="hover:border-primary transition">
                  <CardHeader>
                    <Icon className="w-8 h-8 text-primary mb-2" />
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      className="w-full"
                      asChild
                    >
                      <Link href={feature.path}>Explore</Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Technology Stack</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Frontend</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>Next.js 16</li>
                    <li>React 19</li>
                    <li>TypeScript</li>
                    <li>Tailwind CSS</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Backend</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>API Routes</li>
                    <li>JWT Auth</li>
                    <li>In-Memory Store</li>
                    <li>Server-Side Rendering</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Features</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>User Authentication</li>
                    <li>Video Streaming</li>
                    <li>Community Forum</li>
                    <li>Direct Messaging</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Business Logic</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>Subscriptions</li>
                    <li>Payments</li>
                    <li>Ratings & Reviews</li>
                    <li>Producer Earnings</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Getting Started */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Getting Started</h2>
          <Card>
            <CardContent className="pt-6">
              <ol className="space-y-3 text-muted-foreground">
                <li className="flex gap-3">
                  <span className="font-semibold text-foreground min-w-6">1.</span>
                  Choose a demo account above or create your own
                </li>
                <li className="flex gap-3">
                  <span className="font-semibold text-foreground min-w-6">2.</span>
                  Sign in and explore the platform
                </li>
                <li className="flex gap-3">
                  <span className="font-semibold text-foreground min-w-6">3.</span>
                  Try different features based on your user role
                </li>
                <li className="flex gap-3">
                  <span className="font-semibold text-foreground min-w-6">4.</span>
                  Check the README.md for detailed documentation
                </li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
