import { NextRequest, NextResponse } from 'next/server'

const API_KEY = '426219b5d571fbf9b84a911a1c0978db'
const API_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0MjYyMTliNWQ1NzFmYmY5Yjg0YTkxMWExYzA5NzhkYiIsIm5iZiI6MTc3NzQ4ODg4MC4xNTIsInN1YiI6IjY5ZjI1M2YwZjJiOTM1YmFhNWJkOGQzNCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.s7qdGecegvwf99CAd47AT42ps9sxSB6Kx4Vvjz3G0r4'
const BASE_URL = 'https://api.themoviedb.org/3'
const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500'
const BACKDROP_BASE = 'https://image.tmdb.org/t/p/original'

const GENRE_MAP: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Science Fiction',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
}

interface TmdbMovie {
  id: number
  title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  vote_average: number
  vote_count: number
  genre_ids: number[]
  release_date: string
  runtime?: number
}

async function fetchTmdb(path: string) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json',
    },
  })

  if (!res.ok) {
    throw new Error(`TMDB request failed: ${res.status}`)
  }

  return res.json()
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const query = searchParams.get('q')
    const genre = searchParams.get('genre')

    const path = query
      ? `/search/movie?api_key=${API_KEY}&language=en-US&page=1&include_adult=false&query=${encodeURIComponent(
          query
        )}`
      : `/movie/popular?api_key=${API_KEY}&language=en-US&page=1`

    const data = await fetchTmdb(path)
    const results: TmdbMovie[] = data.results || []

    let movies = results.map((m) => ({
      id: m.id.toString(),
      title: m.title,
      description: m.overview || 'No description available.',
      thumbnail: m.poster_path
        ? `${IMAGE_BASE}${m.poster_path}`
        : `${BACKDROP_BASE}${m.backdrop_path}`,
      backdrop: m.backdrop_path
        ? `${BACKDROP_BASE}${m.backdrop_path}`
        : `${IMAGE_BASE}${m.poster_path}`,
      duration: m.runtime || 0,
      releaseDate: m.release_date || '',
      rating: m.vote_average || 0,
      ratingCount: m.vote_count || 0,
      genre: (m.genre_ids || []).map((id) => GENRE_MAP[id] || 'Other'),
    }))

    if (genre && genre !== 'all') {
      movies = movies.filter((movie) =>
        movie.genre.some((g) => g.toLowerCase() === genre.toLowerCase())
      )
    }

    return NextResponse.json({ movies })
  } catch (error) {
    console.error('[movies] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch movies' },
      { status: 500 }
    )
  }
}
