import { NextRequest, NextResponse } from 'next/server'
import { store } from '@/lib/data'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const currentUser = store.getUser(session.id)
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const role = req.nextUrl.searchParams.get('role')
    const search = req.nextUrl.searchParams.get('search')
    const verified = req.nextUrl.searchParams.get('verified')

    let users = store.getAllUsers().map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      verified: u.verified,
      bio: u.bio,
      avatar: u.avatar,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }))

    if (role) {
      users = users.filter(u => u.role === role)
    }

    if (verified !== null && verified !== undefined) {
      users = users.filter(u => u.verified === (verified === 'true'))
    }

    if (search) {
      const lower = search.toLowerCase()
      users = users.filter(u =>
        u.name.toLowerCase().includes(lower) ||
        u.email.toLowerCase().includes(lower)
      )
    }

    // Sort by creation date, newest first
    users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({
      users,
      stats: {
        total: store.getAllUsers().length,
        viewers: store.getUsersByRole('viewer').length,
        producers: store.getUsersByRole('producer').length,
        admins: store.getUsersByRole('admin').length,
        pendingVerification: store.getUsersByRole('producer').filter(u => !u.verified).length,
      }
    })
  } catch (error) {
    console.error('[admin/users] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
