import { NextRequest, NextResponse } from 'next/server'
import { store } from '@/lib/data'

export async function GET(request: NextRequest) {
  try {
    const role = request.nextUrl.searchParams.get('role')
    const search = request.nextUrl.searchParams.get('search')

    let users = store.getAllUsers().map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      verified: u.verified,
      bio: u.bio,
      avatar: u.avatar,
    }))

    if (role) {
      users = users.filter(u => u.role === role)
    }

    if (search) {
      const lower = search.toLowerCase()
      users = users.filter(u =>
        u.name.toLowerCase().includes(lower) ||
        u.email.toLowerCase().includes(lower)
      )
    }

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
