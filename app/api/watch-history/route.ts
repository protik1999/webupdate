import { NextRequest, NextResponse } from 'next/server'
import { store, WatchHistory } from '@/lib/data'
import { getSession } from '@/lib/auth'
import { randomUUID } from 'crypto'

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const history = store.getWatchHistory(session.id)
    return NextResponse.json({
      history: history.map((h) => {
        const movie = store.getMovie(h.movieId)
        return {
          id: h.id,
          movieId: h.movieId,
          movieTitle: movie?.title,
          thumbnail: movie?.thumbnail,
          watchedAt: h.watchedAt,
          progress: h.progress,
          duration: h.duration,
        }
      }),
    })
  } catch (error) {
    console.error('[watch-history] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch watch history' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { movieId, progress, duration } = await req.json()

    if (!movieId) {
      return NextResponse.json(
        { error: 'Missing movieId' },
        { status: 400 }
      )
    }

    const movie = store.getMovie(movieId)
    if (!movie) {
      return NextResponse.json(
        { error: 'Movie not found' },
        { status: 404 }
      )
    }

    const history: WatchHistory = {
      id: randomUUID(),
      userId: session.id,
      movieId,
      watchedAt: new Date(),
      progress: progress || 0,
      duration: duration || 0,
    }

    store.addWatchHistory(history)

    return NextResponse.json({
      message: 'Watch history updated',
      history,
    })
  } catch (error) {
    console.error('[watch-history POST] Error:', error)
    return NextResponse.json(
      { error: 'Failed to update watch history' },
      { status: 500 }
    )
  }
}
