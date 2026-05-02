import { NextRequest, NextResponse } from 'next/server'
import { store } from '@/lib/data'
import { getSession } from '@/lib/auth'

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { name, bio, avatar } = body

    const user = store.getUser(session.id)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const updates: Record<string, any> = {}
    if (name !== undefined) updates.name = name
    if (bio !== undefined) updates.bio = bio
    if (avatar !== undefined) updates.avatar = avatar

    const updated = store.updateUser(session.id, updates)

    if (!updated) {
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      id: updated.id,
      email: updated.email,
      name: updated.name,
      role: updated.role,
      verified: updated.verified,
      avatar: updated.avatar,
      bio: updated.bio,
    })
  } catch (error) {
    console.error('[profile update] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
