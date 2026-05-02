import { NextRequest, NextResponse } from 'next/server'
import { store, ForumPost } from '@/lib/data'
import { getSession } from '@/lib/auth'
import { randomUUID } from 'crypto'

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const threadId = searchParams.get('threadId')

    if (!threadId) {
      return NextResponse.json(
        { error: 'Missing threadId' },
        { status: 400 }
      )
    }

    const posts = store.getForumPosts(threadId)

    return NextResponse.json({
      posts: posts.map((p) => {
        const author = store.getUser(p.authorId)
        return {
          id: p.id,
          content: p.content,
          authorName: author?.name || 'Anonymous',
          parentId: p.parentId,
          createdAt: p.createdAt,
        }
      }),
    })
  } catch (error) {
    console.error('[forum posts GET] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
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

    const { threadId, content, parentId } = await req.json()

    if (!threadId || !content) {
      return NextResponse.json(
        { error: 'Missing threadId or content' },
        { status: 400 }
      )
    }

    const post: ForumPost = {
      id: randomUUID(),
      threadId,
      authorId: session.id,
      content,
      parentId: parentId || undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    store.addForumPost(post)

    return NextResponse.json(
      {
        message: 'Post created successfully',
        post,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[forum posts POST] Error:', error)
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
}
