'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '../context/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Star, Search, Film, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Movie {
  id: string
  title: string
  description: string
  thumbnail: string
  backdrop?: string
  duration: number
  genre: string[]
  rating: number
  ratingCount: number
  releaseDate: string
}

const genres = [
  'All Genres',
  'Action',
  'Adventure',
  'Animation',
  'Comedy',
  'Crime',
  'Documentary',
  'Drama',
  'Fantasy',
  'Horror',
  'Mystery',
  'Romance',
  'Science Fiction',
  'Thriller',
]

export default function MoviesPage() {
  const { isAuthenticated, loading } = useAuth()
  const [movies, setMovies] = useState<Movie[]>([])
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('All Genres')
  const [featuredIndex, setFeaturedIndex] = useState(0)

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setIsLoading(true)
        const params = new URLSearchParams()
        if (searchQuery) {
          params.set('q', searchQuery)
        }
        const res = await fetch(`/api/movies?${params.toString()}`)
        if (res.ok) {
          const data = await res.json()
          setMovies(data.movies)
          setFilteredMovies(data.movies)
        }
      } catch (error) {
        console.error('Failed to fetch movies:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMovies()
  }, [searchQuery])

  useEffect(() => {
    let filtered = movies

    if (selectedGenre !== 'All Genres') {
      filtered = filtered.filter((movie) =>
        movie.genre.some((g) => g.toLowerCase() === selectedGenre.toLowerCase())
      )
    }

    setFilteredMovies(filtered)
  }, [selectedGenre, movies])

  useEffect(() => {
    if (filteredMovies.length === 0) {
      setFeaturedIndex(0)
      return
    }

    if (featuredIndex >= filteredMovies.length) {
      setFeaturedIndex(0)
      return
    }
  }, [filteredMovies, featuredIndex])

  useEffect(() => {
    if (filteredMovies.length === 0) return

    const interval = window.setInterval(() => {
      setFeaturedIndex((prevIndex) =>
        filteredMovies.length === 0
          ? 0
          : (prevIndex + 1) % filteredMovies.length
      )
    }, 15000)

    return () => window.clearInterval(interval)
  }, [filteredMovies])

  const featuredMovie = useMemo(
    () => filteredMovies[featuredIndex] || movies[0] || null,
    [filteredMovies, movies, featuredIndex]
  )

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="space-y-6">
            <div className="h-[460px] rounded-[2rem] bg-slate-900 animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-80 rounded-3xl bg-slate-900 animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="relative overflow-hidden">
        {featuredMovie?.backdrop ? (
          <img
            src={featuredMovie.backdrop}
            alt={featuredMovie.title}
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950 to-black opacity-90" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/80 to-slate-950" />

        <div className="relative container mx-auto px-4 py-28">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] items-start">
            <div className="max-w-3xl space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-emerald-300">
                Featured
              </div>
              <h1 className="text-5xl md:text-6xl font-black tracking-tight">
                {featuredMovie?.title || 'Discover the Next Story'}
              </h1>
              <p className="max-w-2xl text-slate-300 text-lg leading-relaxed">
                {featuredMovie?.description || 'Browse the top new releases and search for your next cinematic adventure.'}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href={`/movies/${featuredMovie?.id || ''}`}>
                  <Button className="bg-emerald-500 text-black hover:bg-emerald-400 py-4 px-8 rounded-full shadow-2xl shadow-emerald-500/20">
                    Watch Now
                  </Button>
                </Link>
                <Button variant="outline" className="border border-white/10 text-white py-4 px-8 rounded-full hover:border-emerald-500/40 hover:text-emerald-300">
                  More Info
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() =>
                  setFeaturedIndex((prev) =>
                    filteredMovies.length === 0
                      ? 0
                      : (prev - 1 + filteredMovies.length) % filteredMovies.length
                  )
                }
                className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black/50 text-white transition hover:border-emerald-500/60 hover:bg-emerald-500/10"
                aria-label="Previous featured movie"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setFeaturedIndex((prev) =>
                    filteredMovies.length === 0
                      ? 0
                      : (prev + 1) % filteredMovies.length
                  )
                }
                className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black/50 text-white transition hover:border-emerald-500/60 hover:bg-emerald-500/10"
                aria-label="Next featured movie"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2">
            {filteredMovies.slice(0, 5).map((movie, index) => (
              <button
                key={movie.id}
                type="button"
                onClick={() => setFeaturedIndex(index)}
                className={`h-2.5 w-2.5 rounded-full transition ${
                  index === featuredIndex ? 'bg-emerald-400' : 'bg-white/30'
                }`}
                aria-label={`Go to featured movie ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-20 pt-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-emerald-400 font-semibold">Browse</p>
            <h2 className="text-3xl font-bold mt-2">Popular Now</h2>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
            <div className="relative w-full sm:w-[420px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 bg-slate-900 border-slate-800 text-white placeholder:text-slate-500"
              />
            </div>

            <Select value={selectedGenre} onValueChange={setSelectedGenre}>
              <SelectTrigger className="w-full sm:w-72 bg-slate-900 border-slate-800 text-white">
                <SelectValue placeholder="All genres" />
              </SelectTrigger>
              <SelectContent>
                {genres.map((genre) => (
                  <SelectItem key={genre} value={genre}>
                    {genre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-10">
          {filteredMovies.map((movie) => (
            <Link key={movie.id} href={`/movies/${movie.id}`}>
              <Card className="overflow-hidden rounded-[2rem] bg-slate-900 border border-white/5 shadow-xl shadow-black/20 group hover:-translate-y-1 transition-transform duration-300">
                <div className="relative h-72 overflow-hidden bg-slate-800">
                  <img
                    src={movie.thumbnail}
                    alt={movie.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                </div>
                <CardContent className="p-5 space-y-4">
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.3em] text-emerald-400">
                      {movie.releaseDate.slice(0, 4)} · {movie.genre[0] || 'Movie'}
                    </p>
                    <h3 className="text-xl font-semibold line-clamp-2">
                      {movie.title}
                    </h3>
                    <p className="text-sm text-slate-400 line-clamp-2">
                      {movie.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-400 pt-3 border-t border-white/5">
                    <span>{movie.duration || '—'} min</span>
                    <span className="flex items-center gap-2 text-emerald-300">
                      <Star className="w-4 h-4 fill-emerald-400" />
                      {movie.rating.toFixed(1)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
