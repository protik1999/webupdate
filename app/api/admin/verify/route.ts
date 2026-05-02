import { NextRequest, NextResponse } from 'next/server'
import { store } from '@/lib/data'
import { getSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const currentUser = store.getUser(session.id)
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { userId, action } = await req.json()

    if (!userId || !action) {
      return NextResponse.json({ error: 'Missing userId or action' }, { status: 400 })
    }

    const targetUser = store.getUser(userId)
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (action === 'approve') {
      store.updateUser(userId, { verified: true })
      return NextResponse.json({
        message: `${targetUser.name} has been verified as a producer`,
        user: { ...targetUser, verified: true },
      })
    } else if (action === 'reject') {
      // Reject by changing role to viewer and marking as verified (as viewer)
      store.updateUser(userId, { role: 'viewer', verified: true })
      return NextResponse.json({
        message: `${targetUser.name}'s producer application has been rejected. They have been set as a viewer.`,
        user: { ...targetUser, role: 'viewer', verified: true },
      })
    } else if (action === 'delete') {
      store.deleteUser(userId)
      return NextResponse.json({
        message: `${targetUser.name} has been deleted`,
      })
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('[admin/verify] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
