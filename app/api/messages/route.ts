import { NextRequest, NextResponse } from 'next/server'
import { store, Message } from '@/lib/data'
import { getSession } from '@/lib/auth'
import { randomUUID } from 'crypto'

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
    const recipientId = searchParams.get('recipientId')

    if (recipientId) {
      const messages = store.getConversation(session.id, recipientId)
      return NextResponse.json({
        messages: messages.map((m) => ({
          id: m.id,
          senderId: m.senderId,
          recipientId: m.recipientId,
          content: m.content,
          read: m.read,
          createdAt: m.createdAt,
        })),
      })
    }

    const allMessages = store.getMessages(session.id)
    const conversations: { [key: string]: Message[] } = {}

    allMessages.forEach((m) => {
      const otherId = m.senderId === session.id ? m.recipientId : m.senderId
      if (!conversations[otherId]) conversations[otherId] = []
      conversations[otherId].push(m)
    })

    return NextResponse.json({
      conversations: Object.entries(conversations).map(([userId, msgs]) => {
        const user = store.getUser(userId)
        const lastMessage = msgs[msgs.length - 1]
        return {
          userId,
          userName: user?.name || 'Unknown',
          lastMessage: lastMessage.content,
          lastMessageTime: lastMessage.createdAt,
          unread: msgs.filter((m) => m.recipientId === session.id && !m.read).length,
        }
      }),
    })
  } catch (error) {
    console.error('[messages GET] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
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

    const { recipientId, content } = await req.json()

    if (!recipientId || !content) {
      return NextResponse.json(
        { error: 'Missing recipientId or content' },
        { status: 400 }
      )
    }

    if (recipientId === session.id) {
      return NextResponse.json(
        { error: 'Cannot message yourself' },
        { status: 400 }
      )
    }

    const recipient = store.getUser(recipientId)
    if (!recipient) {
      return NextResponse.json(
        { error: 'Recipient not found' },
        { status: 404 }
      )
    }

    const message: Message = {
      id: randomUUID(),
      senderId: session.id,
      recipientId,
      content,
      read: false,
      createdAt: new Date(),
    }

    store.addMessage(message)

    return NextResponse.json(
      {
        message: 'Message sent successfully',
        data: message,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[messages POST] Error:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
