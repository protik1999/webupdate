'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../context/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Send } from 'lucide-react'

interface Post {
  id: string
  content: string
  authorName: string
  parentId?: string
  createdAt: string
}

interface Thread {
  id: string
  title: string
  description: string
  authorName: string
}

export default function ForumThreadPage() {
  const params = useParams()
  const threadId = params.id as string
  const { isAuthenticated } = useAuth()
  const [thread, setThread] = useState<Thread | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newPostContent, setNewPostContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchThread = async () => {
      try {
        // Mock thread fetch - in real app, would fetch from API
        setThread({
          id: threadId,
          title: 'Great movie, worth watching!',
          description: 'Just finished watching the latest release and absolutely loved it. The cinematography and storytelling are outstanding.',
          authorName: 'Community Member',
        })

        // Fetch posts
        const res = await fetch(`/api/forum/posts?threadId=${threadId}`)
        if (res.ok) {
          const data = await res.json()
          setPosts(data.posts)
        }
      } catch (err) {
        setError('Failed to load thread')
        console.error('Failed to fetch thread:', err)
      } finally {
        setIsLoading(false)
      }
    }

    if (threadId) fetchThread()
  }, [threadId])

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPostContent.trim()) return

    if (!isAuthenticated) {
      window.location.href = '/login'
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/forum/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId,
          content: newPostContent,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        // Add new post to the list (would need to get the author name properly)
        const newPost: Post = {
          id: data.post.id,
          content: data.post.content,
          authorName: 'You',
          createdAt: new Date().toISOString(),
        }
        setPosts([...posts, newPost])
        setNewPostContent('')
      }
    } catch (err) {
      console.error('Failed to submit post:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Link href="/forum">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to forum
          </Button>
        </Link>
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-muted rounded w-3/4" />
          <div className="h-24 bg-muted rounded" />
        </div>
      </div>
    )
  }

  if (error || !thread) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Link href="/forum">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to forum
          </Button>
        </Link>
        <Alert variant="destructive">
          <AlertDescription>{error || 'Thread not found'}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Link href="/forum">
        <Button variant="ghost" size="sm" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to forum
        </Button>
      </Link>

      {/* Thread Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">{thread.title}</h1>
        <Card>
          <CardContent className="p-6 space-y-4">
            <p className="text-muted-foreground">{thread.description}</p>
            <div className="flex items-center justify-between pt-4 border-t border-border text-sm text-muted-foreground">
              <span>Posted by {thread.authorName}</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Posts */}
      <div className="space-y-4 mb-8">
        <h2 className="text-xl font-bold">{posts.length} Replies</h2>
        {posts.length > 0 ? (
          posts.map((post) => (
            <Card key={post.id}>
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{post.authorName}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-foreground">{post.content}</p>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              No replies yet. Be the first to respond!
            </CardContent>
          </Card>
        )}
      </div>

      {/* Reply Form */}
      {isAuthenticated ? (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Share Your Thoughts</h3>
            <form onSubmit={handleSubmitPost} className="space-y-4">
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="Write your reply..."
                className="w-full min-h-24 p-3 bg-background border border-border rounded-lg text-foreground"
                maxLength={500}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {newPostContent.length}/500
                </span>
                <Button
                  type="submit"
                  disabled={isSubmitting || !newPostContent.trim()}
                  className="gap-2"
                >
                  <Send className="w-4 h-4" />
                  Post Reply
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-muted/50 border-border">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">
              Sign in to share your thoughts
            </p>
            <Link href="/login">
              <Button>Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
