'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../context/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Send, ArrowLeft } from 'lucide-react'

interface User {
  id: string
  email: string
  name: string
}

interface Message {
  id: string
  senderId: string
  recipientId: string
  senderName: string
  senderEmail: string
  content: string
  createdAt: string
}

interface Conversation {
  userId: string
  userName: string
  userEmail: string
  lastMessage: string
  timestamp: string
}

export default function MessagesPage() {
  const router = useRouter()
  const { user, isAuthenticated, loading } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    const fetchConversations = async () => {
      try {
        const res = await fetch('/api/messages')
        if (res.ok) {
          const data = await res.json()
          setConversations(data.conversations || [])
        }
      } catch (err) {
        console.error('Failed to fetch conversations:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchConversations()
  }, [isAuthenticated, router])

  const handleSelectUser = async (userId: string) => {
    setSelectedUserId(userId)
    setIsLoading(true)

    try {
      const res = await fetch(`/api/messages?recipientId=${userId}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedUserId) return

    setIsSending(true)
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: selectedUserId,
          content: newMessage,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setMessages([...messages, data.message])
        setNewMessage('')

        // Update conversations list
        const conversationsRes = await fetch('/api/messages')
        if (conversationsRes.ok) {
          const conversationsData = await conversationsRes.json()
          setConversations(conversationsData.conversations || [])
        }
      }
    } catch (err) {
      console.error('Failed to send message:', err)
    } finally {
      setIsSending(false)
    }
  }

  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">Loading...</div>
        </div>
      </div>
    )
  }

  if (!selectedUserId) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <h1 className="text-3xl font-bold mb-8">Messages</h1>

          {isLoading ? (
            <div className="text-center text-muted-foreground">Loading conversations...</div>
          ) : conversations.length > 0 ? (
            <div className="space-y-2">
              {conversations.map((conv) => (
                <button
                  key={conv.userId}
                  onClick={() => handleSelectUser(conv.userId)}
                  className="w-full text-left"
                >
                  <Card className="hover:border-primary transition cursor-pointer">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarFallback>
                            {conv.userName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold">{conv.userName}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {conv.lastMessage}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                          {new Date(conv.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </button>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No conversations yet. Connect with creators and viewers in the community!
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    )
  }

  const recipient = conversations.find((c) => c.userId === selectedUserId)

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setSelectedUserId(null)}
            className="p-2 hover:bg-card rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">{recipient?.userName}</h1>
            <p className="text-sm text-muted-foreground">{recipient?.userEmail}</p>
          </div>
        </div>

        {/* Messages */}
        <Card className="mb-6 h-96 overflow-y-auto">
          <CardContent className="pt-4 space-y-4">
            {isLoading ? (
              <div className="text-center text-muted-foreground py-8">Loading messages...</div>
            ) : messages.length > 0 ? (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.senderId === user?.id ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.senderId === user?.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card border border-border'
                    }`}
                  >
                    <p className="text-sm break-words">{msg.content}</p>
                    <span className="text-xs opacity-75 mt-1 block">
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No messages yet. Start a conversation!
              </div>
            )}
          </CardContent>
        </Card>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={isSending}
          />
          <Button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
