import { NextRequest, NextResponse } from 'next/server'

const API_KEY = '426219b5d571fbf9b84a911a1c0978db'
const API_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0MjYyMTliNWQ1NzFmYmY5Yjg0YTkxMWExYzA5NzhkYiIsIm5iZiI6MTc3NzQ4ODg4MC4xNTIsInN1YiI6IjY5ZjI1M2YwZjJiOTM1YmFhNWJkOGQzNCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.s7qdGecegvwf99CAd47AT42ps9sxSB6Kx4Vvjz3G0r4'
const BASE_URL = 'https://api.themoviedb.org/3'
const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500'
const BACKDROP_BASE = 'https://image.tmdb.org/t/p/original'

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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const movie = await fetchTmdb(
      `/movie/${id}?api_key=${API_KEY}&language=en-US&append_to_response=videos`
    )

    const genreNames = (movie.genres || []).map((genre: any) => genre.name)

    return NextResponse.json({
      id: movie.id.toString(),
      title: movie.title,
      description: movie.overview,
      thumbnail: movie.poster_path
        ? `${IMAGE_BASE}${movie.poster_path}`
        : null,
      backdrop: movie.backdrop_path
        ? `${BACKDROP_BASE}${movie.backdrop_path}`
        : null,
      duration: movie.runtime || 0,
      genre: genreNames,
      releaseDate: movie.release_date || '',
      rating: movie.vote_average || 0,
      ratingCount: movie.vote_count || 0,
      producerId: '',
      userRating: null,
      userReview: null,
      isWatching: false,
    })
  } catch (error) {
    console.error('[movie detail] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch movie' },
      { status: 500 }
    )
  }
}
