'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../context/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Star, PlayCircle, Share2, Eye, ArrowLeft } from 'lucide-react'

interface MovieDetail {
  id: string
  title: string
  description: string
  thumbnail: string
  duration: number
  genre: string[]
  releaseDate: string
  rating: number
  ratingCount: number
  producerId: string
  userRating: number | null
  userReview: string | null
  isWatching: boolean
}

export default function MovieDetailPage() {
  const params = useParams()
  const movieId = params.id as string
  const { isAuthenticated } = useAuth()
  const [movie, setMovie] = useState<MovieDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState('')
  const [showRatingForm, setShowRatingForm] = useState(false)
  const [userRating, setUserRating] = useState(0)
  const [userReview, setUserReview] = useState('')
  const [allRatings, setAllRatings] = useState<any[]>([])
  const [isSubmittingRating, setIsSubmittingRating] = useState(false)

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setIsLoading(true)
        const res = await fetch(`/api/movies/${movieId}`)
        if (res.ok) {
          const data = await res.json()
          setMovie(data)
          setUserRating(data.userRating || 0)
          setUserReview(data.userReview || '')
          
          // Fetch all ratings
          const ratingsRes = await fetch(`/api/ratings?movieId=${movieId}`)
          if (ratingsRes.ok) {
            const ratingsData = await ratingsRes.json()
            setAllRatings(ratingsData.ratings)
          }
        } else {
          setError('Movie not found')
        }
      } catch (err) {
        setError('Failed to load movie')
        console.error('Failed to fetch movie:', err)
      } finally {
        setIsLoading(false)
      }
    }

    if (movieId) fetchMovie()
  }, [movieId])

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      window.location.href = '/login'
      return
    }

    setIsSubmittingRating(true)
    try {
      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          movieId,
          rating: userRating,
          review: userReview,
        }),
      })

      if (res.ok) {
        // Refresh ratings
        const ratingsRes = await fetch(`/api/ratings?movieId=${movieId}`)
        if (ratingsRes.ok) {
          const ratingsData = await ratingsRes.json()
          setAllRatings(ratingsData.ratings)
        }
        setShowRatingForm(false)
      }
    } catch (err) {
      console.error('Failed to submit rating:', err)
    } finally {
      setIsSubmittingRating(false)
    }
  }

  const handlePlay = async () => {
    if (!isAuthenticated) {
      // Redirect to login
      window.location.href = '/login'
      return
    }

    setIsPlaying(true)

    // Update watch history
    if (movie) {
      await fetch('/api/watch-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          movieId: movie.id,
          progress: 0,
          duration: movie.duration,
        }),
      })
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-96 bg-muted rounded-lg" />
          <div className="h-40 bg-muted rounded-lg" />
        </div>
      </div>
    )
  }

  if (error || !movie) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Link href="/movies">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to movies
          </Button>
        </Link>
        <Alert variant="destructive">
          <AlertDescription>{error || 'Movie not found'}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <Link href="/movies">
        <Button variant="ghost" size="sm" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to movies
        </Button>
      </Link>

      {/* Player or Thumbnail */}
      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden mb-8 group">
        {isPlaying ? (
          <div className="w-full h-full bg-black flex items-center justify-center">
            <div className="text-center space-y-4">
              <PlayCircle className="w-20 h-20 mx-auto text-primary opacity-40" />
              <p className="text-lg text-muted-foreground">
                Video player would stream the movie here
              </p>
              <p className="text-sm text-muted-foreground">
                Demo: {movie.duration} minutes
              </p>
            </div>
          </div>
        ) : (
          <>
            <img
              src={movie.thumbnail}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                size="lg"
                className="gap-2"
                onClick={handlePlay}
              >
                <PlayCircle className="w-6 h-6" />
                {isAuthenticated ? 'Play Now' : 'Sign In to Watch'}
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Content */}
      <div className="grid md:grid-cols-3 gap-8 mb-8">
        {/* Main Info */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">{movie.title}</h1>
            <div className="flex flex-wrap gap-4 items-center text-sm text-muted-foreground">
              <span>{new Date(movie.releaseDate).getFullYear()}</span>
              <span>{movie.duration} minutes</span>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-accent text-accent" />
                <span className="font-medium text-foreground">
                  {movie.rating.toFixed(1)}
                </span>
                <span>({movie.ratingCount} ratings)</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-semibold">About</h2>
            <p className="text-muted-foreground leading-relaxed">
              {movie.description}
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Genres</h2>
            <div className="flex flex-wrap gap-2">
              {movie.genre.map((g) => (
                <span
                  key={g}
                  className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm"
                >
                  {g}
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handlePlay}
            >
              <PlayCircle className="w-4 h-4" />
              {isPlaying ? 'Continue Watching' : 'Play'}
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Rating</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{movie.rating.toFixed(1)}</span>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.round(movie.rating / 2)
                            ? 'fill-accent text-accent'
                            : 'text-muted'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Based on {movie.ratingCount} ratings
                </p>
              </div>

              {isAuthenticated && !isPlaying && (
                <Button className="w-full" onClick={handlePlay}>
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Watch Now
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Eye className="w-4 h-4" />
                <span>
                  {movie.isWatching ? 'You are watching this' : 'Not started'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Ratings Section */}
      <div className="border-t border-border pt-8 mt-8">
        <h2 className="text-2xl font-bold mb-6">Reviews & Ratings</h2>

        {isAuthenticated && (
          <div className="mb-8">
            {!showRatingForm ? (
              <Button
                variant="outline"
                onClick={() => setShowRatingForm(true)}
              >
                Leave a Rating
              </Button>
            ) : (
              <Card className="p-6 space-y-4">
                <form onSubmit={handleSubmitRating} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Your Rating
                    </label>
                    <div className="flex gap-2 mb-4">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setUserRating(num)}
                          className={`w-10 h-10 rounded border-2 transition ${
                            userRating === num
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-border'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="review" className="text-sm font-medium mb-2 block">
                      Your Review (Optional)
                    </label>
                    <textarea
                      id="review"
                      value={userReview}
                      onChange={(e) => setUserReview(e.target.value)}
                      placeholder="Share your thoughts about this movie..."
                      className="w-full min-h-24 p-3 bg-background border border-border rounded-lg text-foreground"
                      maxLength={500}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {userReview.length}/500
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={isSubmittingRating || userRating === 0}
                    >
                      Submit Rating
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowRatingForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Card>
            )}
          </div>
        )}

        {/* All Ratings */}
        <div className="space-y-4">
          {allRatings.length > 0 ? (
            allRatings.map((rating) => (
              <Card key={rating.id} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold">{rating.userName}</p>
                    <div className="flex gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.round(rating.rating / 2)
                              ? 'fill-accent text-accent'
                              : 'text-muted'
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-sm font-medium">
                        {rating.rating}/10
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(rating.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {rating.review && (
                  <p className="text-muted-foreground text-sm mt-3">
                    {rating.review}
                  </p>
                )}
              </Card>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No ratings yet. Be the first to review!
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
