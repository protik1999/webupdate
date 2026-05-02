import { NextRequest, NextResponse } from 'next/server'
import { store, Subscription, Transaction } from '@/lib/data'
import { getSession } from '@/lib/auth'
import { randomUUID } from 'crypto'

const SUBSCRIPTION_PRICE = 4.99 // Monthly subscription price

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const searchParams = req.nextUrl.searchParams
    const producerId = searchParams.get('producerId')

    if (producerId) {
      const subscription = store.getSubscription(session.id, producerId)
      return NextResponse.json({
        subscription: subscription ? {
          id: subscription.id,
          status: subscription.status,
          amount: subscription.amount,
          renewsAt: subscription.renewsAt,
        } : null,
      })
    }

    return NextResponse.json({ error: 'Missing producerId' }, { status: 400 })
  } catch (error) {
    console.error('[subscriptions GET] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
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

    const { producerId } = await req.json()

    if (!producerId) {
      return NextResponse.json(
        { error: 'Missing producerId' },
        { status: 400 }
      )
    }

    // Check if already subscribed
    const existing = store.getSubscription(session.id, producerId)
    if (existing && existing.status === 'active') {
      return NextResponse.json(
        { error: 'Already subscribed' },
        { status: 409 }
      )
    }

    // Create transaction
    const transaction: Transaction = {
      id: randomUUID(),
      userId: session.id,
      amount: SUBSCRIPTION_PRICE,
      type: 'subscription',
      status: 'completed',
      description: `Subscription to producer`,
      createdAt: new Date(),
    }

    store.addTransaction(transaction)

    // Create subscription (automatically renews monthly in real system)
    const renewsAt = new Date()
    renewsAt.setMonth(renewsAt.getMonth() + 1)

    const subscription: Subscription = {
      id: randomUUID(),
      userId: session.id,
      producerId,
      amount: SUBSCRIPTION_PRICE,
      status: 'active',
      createdAt: new Date(),
      renewsAt,
    }

    store.addSubscription(subscription)

    return NextResponse.json(
      {
        message: 'Subscribed successfully',
        subscription: {
          id: subscription.id,
          status: subscription.status,
          amount: subscription.amount,
          renewsAt: subscription.renewsAt,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[subscriptions POST] Error:', error)
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    )
  }
}
