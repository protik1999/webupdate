import { NextRequest, NextResponse } from 'next/server'
import { store, ForumThread } from '@/lib/data'
import { getSession } from '@/lib/auth'
import { randomUUID } from 'crypto'

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const movieId = searchParams.get('movieId')

    const threads = store.getForumThreads(movieId || undefined)

    return NextResponse.json({
      threads: threads.map((t) => {
        const author = store.getUser(t.authorId)
        const posts = store.getForumPosts(t.id)
        return {
          id: t.id,
          title: t.title,
          description: t.description,
          authorName: author?.name || 'Anonymous',
          movieId: t.movieId,
          postCount: posts.length,
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
        }
      }),
    })
  } catch (error) {
    console.error('[forum threads GET] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch threads' },
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

    const { title, description, movieId } = await req.json()

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Missing title or description' },
        { status: 400 }
      )
    }

    const thread: ForumThread = {
      id: randomUUID(),
      title,
      description,
      authorId: session.id,
      movieId: movieId || undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    store.addForumThread(thread)

    return NextResponse.json(
      {
        message: 'Thread created successfully',
        thread,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[forum threads POST] Error:', error)
    return NextResponse.json(
      { error: 'Failed to create thread' },
      { status: 500 }
    )
  }
}
