import { NextRequest, NextResponse } from 'next/server'
import { store, Rating } from '@/lib/data'
import { getSession } from '@/lib/auth'
import { randomUUID } from 'crypto'

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const movieId = searchParams.get('movieId')

    if (!movieId) {
      return NextResponse.json(
        { error: 'Missing movieId' },
        { status: 400 }
      )
    }

    const ratings = store.getRatings(movieId)
    return NextResponse.json({
      ratings: ratings.map((r) => {
        const user = store.getUser(r.userId)
        return {
          id: r.id,
          rating: r.rating,
          review: r.review,
          userName: user?.name || 'Anonymous',
          createdAt: r.createdAt,
        }
      }),
      average: ratings.length > 0
        ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
        : 0,
      count: ratings.length,
    })
  } catch (error) {
    console.error('[ratings GET] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ratings' },
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

    const { movieId, rating, review } = await req.json()

    if (!movieId || rating === undefined) {
      return NextResponse.json(
        { error: 'Missing movieId or rating' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 10) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 10' },
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

    const ratingRecord: Rating = {
      id: randomUUID(),
      userId: session.id,
      movieId,
      rating,
      review,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    store.addRating(ratingRecord)

    return NextResponse.json(
      {
        message: 'Rating submitted successfully',
        rating: ratingRecord,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[ratings POST] Error:', error)
    return NextResponse.json(
      { error: 'Failed to submit rating' },
      { status: 500 }
    )
  }
}
