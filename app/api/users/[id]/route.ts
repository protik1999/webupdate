import { NextRequest, NextResponse } from 'next/server'
import { store } from '@/lib/data'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const user = store.getUser(id)

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get user's public info
    const userMovies = store.getMoviesByProducer(id).filter(m => m.status === 'published')
    const subscribers = store.getProducerSubscribers(id).length

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      bio: user.bio,
      avatar: user.avatar,
      createdAt: user.createdAt,
      stats: {
        movieCount: user.role === 'producer' ? userMovies.length : 0,
        subscribers: user.role === 'producer' ? subscribers : 0,
      },
    })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    )
  }
}
