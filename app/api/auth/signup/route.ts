import { NextRequest, NextResponse } from 'next/server'
import { database } from '@/lib/db'
import { hashPassword, setSession } from '@/lib/auth'
import { randomUUID } from 'crypto'

const ADMIN_SECRET_KEY = 'streamverse-admin-2024'

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, role } = await req.json()

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate role
    const validRoles = ['viewer', 'producer', 'admin']
    const userRole = validRoles.includes(role) ? role : 'viewer'

    // Check if user already exists
    if (database.getUserByEmail(email)) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      )
    }

    // Determine verification status based on role
    let verified = true
    if (userRole === 'producer') {
      verified = false // Producers need admin verification
    }

    // Create new user
    const hashedPassword = await hashPassword(password)
    const now = new Date().toISOString()
    const user = {
      id: randomUUID(),
      email,
      password: hashedPassword,
      name,
      role: userRole as 'admin' | 'producer' | 'viewer',
      verified,
      createdAt: now,
      updatedAt: now,
    }

    database.addUser(user)
    await setSession(user)

    return NextResponse.json(
      {
        message: userRole === 'producer'
          ? 'Account created. Your producer account is pending admin verification.'
          : 'User created successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          verified: user.verified,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[signup] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
