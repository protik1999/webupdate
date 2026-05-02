import { NextRequest, NextResponse } from 'next/server'
import { store } from '@/lib/data'
import { getSession, verifyPassword, hashPassword } from '@/lib/auth'

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { currentPassword, newPassword } = await req.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters' },
        { status: 400 }
      )
    }

    const user = store.getUser(session.id)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const passwordValid = await verifyPassword(currentPassword, user.password)
    if (!passwordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      )
    }

    const hashedNewPassword = await hashPassword(newPassword)
    store.updateUser(session.id, { password: hashedNewPassword })

    return NextResponse.json({ message: 'Password updated successfully' })
  } catch (error) {
    console.error('[password change] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
