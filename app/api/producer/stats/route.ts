import { NextRequest, NextResponse } from 'next/server'
import { store } from '@/lib/data'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const user = store.getUser(session.id)
    if (!user || user.role !== 'producer') {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      )
    }

    // Get producer's movies
    const movies = store.getMoviesByProducer(user.id)

    // Calculate stats
    const totalViews = movies.reduce((sum, m) => sum + m.ratingCount, 0)
    const subscribers = store.getProducerSubscribers(user.id)
    const totalEarnings = subscribers.length * 4.99 // Simple calculation

    // Get recent watch activity
    const allWatchHistory = movies.flatMap((m) => {
      const history = store.getWatchHistory(user.id) // This would need to be filtered properly in real implementation
      return history.filter((h) => h.movieId === m.id)
    })

    return NextResponse.json({
      stats: {
        moviesPublished: movies.filter((m) => m.status === 'published').length,
        totalMovies: movies.length,
        totalViews,
        subscribersCount: subscribers.length,
        totalEarnings: totalEarnings.toFixed(2),
        averageRating: movies.length > 0
          ? (movies.reduce((sum, m) => sum + m.rating, 0) / movies.length).toFixed(1)
          : '0',
      },
      movies: movies.map((m) => ({
        id: m.id,
        title: m.title,
        status: m.status,
        rating: m.rating,
        ratingCount: m.ratingCount,
        releaseDate: m.releaseDate,
      })),
      recentActivity: {
        watchCount: allWatchHistory.length,
        lastUpdate: movies.length > 0 ? movies[0].updatedAt : null,
      },
    })
  } catch (error) {
    console.error('[producer stats] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
