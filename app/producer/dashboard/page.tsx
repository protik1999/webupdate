'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../context/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  BarChart,
  Film,
  Users,
  DollarSign,
  TrendingUp,
  AlertCircle,
} from 'lucide-react'

interface Stats {
  moviesPublished: number
  totalMovies: number
  totalViews: number
  subscribersCount: number
  totalEarnings: string
  averageRating: string
}

interface Movie {
  id: string
  title: string
  status: string
  rating: number
  ratingCount: number
  releaseDate: string
}

export default function ProducerDashboard() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [stats, setStats] = useState<Stats | null>(null)
  const [movies, setMovies] = useState<Movie[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!loading && (!user || user.role !== 'producer')) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true)
        const res = await fetch('/api/producer/stats')
        if (res.ok) {
          const data = await res.json()
          setStats(data.stats)
          setMovies(data.movies)
        } else if (res.status === 403) {
          setError('Access denied: Only producers can access this page')
        } else {
          setError('Failed to load dashboard')
        }
      } catch (err) {
        setError('Failed to load dashboard')
        console.error('Failed to fetch stats:', err)
      } finally {
        setIsLoading(false)
      }
    }

    if (user?.role === 'producer') {
      fetchStats()
    }
  }, [user])

  if (loading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-12 bg-muted rounded w-1/4" />
          <div className="grid md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold">Producer Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage your content and track your earnings
          </p>
        </div>
        <Button>Upload New Movie</Button>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Published Movies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-3xl font-bold">{stats.moviesPublished}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalMovies} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Total Views
                </span>
                <TrendingUp className="w-4 h-4 text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-3xl font-bold">
                {stats.totalViews.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Subscribers
                </span>
                <Users className="w-4 h-4 text-accent" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-3xl font-bold">
                {stats.subscribersCount}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Total Earnings
                </span>
                <DollarSign className="w-4 h-4 text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-3xl font-bold">
                ${stats.totalEarnings}
              </div>
              <p className="text-xs text-muted-foreground">
                Avg. Rating: {stats.averageRating}/10
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Movies Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Your Movies</h2>
        {movies.length > 0 ? (
          <div className="grid gap-4">
            {movies.map((movie) => (
              <Card key={movie.id}>
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                      <Film className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{movie.title}</h3>
                      <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                        <span>Status: {movie.status}</span>
                        <span>Rating: {movie.rating.toFixed(1)}/10</span>
                        <span>{movie.ratingCount} ratings</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center space-y-4">
              <Film className="w-12 h-12 mx-auto text-muted" />
              <h3 className="text-lg font-semibold">No movies yet</h3>
              <p className="text-muted-foreground">
                Upload your first movie to start earning
              </p>
              <Button>Upload Movie</Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Earnings Info */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            How You Earn
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p>
            You earn <span className="font-semibold">$4.99 per month</span> for each active subscription to your content.
          </p>
          <p>
            Viewers can subscribe to your content to access all your published movies and exclusive content.
          </p>
          <p className="text-muted-foreground">
            Earnings are calculated monthly and you can withdraw them to your connected bank account.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
