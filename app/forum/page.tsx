'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '../context/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { MessageCircle, Plus, Search } from 'lucide-react'

interface Thread {
  id: string
  title: string
  description: string
  authorName: string
  movieId?: string
  postCount: number
  createdAt: string
  updatedAt: string
}

export default function ForumPage() {
  const { isAuthenticated, loading } = useAuth()
  const [threads, setThreads] = useState<Thread[]>([])
  const [filteredThreads, setFilteredThreads] = useState<Thread[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newThreadTitle, setNewThreadTitle] = useState('')
  const [newThreadDesc, setNewThreadDesc] = useState('')

  useEffect(() => {
    const fetchThreads = async () => {
      try {
        setIsLoading(true)
        const res = await fetch('/api/forum/threads')
        if (res.ok) {
          const data = await res.json()
          setThreads(data.threads)
          setFilteredThreads(data.threads)
        }
      } catch (error) {
        console.error('Failed to fetch threads:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchThreads()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const filtered = threads.filter(
        (t) =>
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredThreads(filtered)
    } else {
      setFilteredThreads(threads)
    }
  }, [searchQuery, threads])

  const handleCreateThread = async () => {
    if (!newThreadTitle || !newThreadDesc) return

    try {
      const res = await fetch('/api/forum/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newThreadTitle,
          description: newThreadDesc,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setThreads([data.thread, ...threads])
        setNewThreadTitle('')
        setNewThreadDesc('')
        setShowCreateDialog(false)
      }
    } catch (error) {
      console.error('Failed to create thread:', error)
    }
  }

  if (loading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold">Community Forum</h1>
            <p className="text-muted-foreground mt-2">
              Discuss movies, share recommendations, and connect with other viewers
            </p>
          </div>
          {isAuthenticated && (
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  New Discussion
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Start a New Discussion</DialogTitle>
                  <DialogDescription>
                    Share your thoughts and start a conversation with the community
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="title" className="text-sm font-medium mb-2 block">
                      Title
                    </label>
                    <Input
                      id="title"
                      placeholder="What's on your mind?"
                      value={newThreadTitle}
                      onChange={(e) => setNewThreadTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="desc" className="text-sm font-medium mb-2 block">
                      Description
                    </label>
                    <textarea
                      id="desc"
                      placeholder="Share more details..."
                      value={newThreadDesc}
                      onChange={(e) => setNewThreadDesc(e.target.value)}
                      className="w-full min-h-24 p-3 bg-background border border-border rounded-lg text-foreground"
                      maxLength={500}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {newThreadDesc.length}/500
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleCreateThread}>Create Discussion</Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowCreateDialog(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search discussions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Threads */}
        {filteredThreads.length > 0 ? (
          <div className="space-y-4">
            {filteredThreads.map((thread) => (
              <Link key={thread.id} href={`/forum/${thread.id}`}>
                <Card className="hover:border-primary transition-colors cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold hover:text-primary transition mb-2">
                          {thread.title}
                        </h3>
                        <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                          {thread.description}
                        </p>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>By {thread.authorName}</span>
                          <span>
                            {new Date(thread.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground ml-4">
                        <MessageCircle className="w-4 h-4" />
                        <span className="font-medium">{thread.postCount}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-muted mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No discussions found</h2>
            <p className="text-muted-foreground mb-4">
              {threads.length === 0
                ? 'Be the first to start a discussion!'
                : 'Try adjusting your search'}
            </p>
            {isAuthenticated && threads.length === 0 && (
              <Button onClick={() => setShowCreateDialog(true)}>
                Start a Discussion
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
