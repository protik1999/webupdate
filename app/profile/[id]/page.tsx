'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../context/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { MessageCircle, ArrowLeft, Film, Users } from 'lucide-react'

interface UserProfile {
  id: string
  name: string
  email: string
  role: string
  bio?: string
  avatar?: string
  createdAt: string
  stats: {
    movieCount: number
    subscribers: number
  }
}

export default function PublicProfilePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user: currentUser, isAuthenticated } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true)
        const res = await fetch(`/api/users/${params.id}`)
        if (res.ok) {
          const data = await res.json()
          setProfile(data)
        } else {
          setError('User not found')
        }
      } catch (err) {
        setError('Failed to load user profile')
        console.error('Failed to fetch profile:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [params.id])

  const handleSendMessage = () => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    router.push('/messages')
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-40 bg-muted rounded" />
          <div className="h-80 bg-muted rounded" />
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>{error || 'User not found'}</AlertDescription>
        </Alert>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>
    )
  }

  const isOwnProfile = currentUser?.id === profile.id

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Back Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.back()}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      {/* Profile Card */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                  {profile.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{profile.name}</CardTitle>
                <div className="flex gap-2 mt-2">
                  <Badge variant={profile.role === 'producer' ? 'default' : 'secondary'}>
                    {profile.role}
                  </Badge>
                  {profile.role === 'producer' && (
                    <Badge variant="outline">
                      {profile.stats.movieCount} {profile.stats.movieCount === 1 ? 'Movie' : 'Movies'}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {!isOwnProfile && isAuthenticated && (
              <Button onClick={handleSendMessage} size="sm">
                <MessageCircle className="w-4 h-4 mr-2" />
                Message
              </Button>
            )}

            {!isOwnProfile && !isAuthenticated && (
              <Button
                onClick={() => router.push('/login')}
                size="sm"
              >
                Sign In to Message
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {profile.bio && (
            <div>
              <p className="text-sm text-muted-foreground font-semibold mb-2">Bio</p>
              <p className="text-foreground">{profile.bio}</p>
            </div>
          )}

          {profile.role === 'producer' && (
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-border">
                <CardContent className="pt-6 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Film className="w-5 h-5 text-primary" />
                    <p className="text-2xl font-bold">{profile.stats.movieCount}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Published {profile.stats.movieCount === 1 ? 'Movie' : 'Movies'}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardContent className="pt-6 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-primary" />
                    <p className="text-2xl font-bold">{profile.stats.subscribers}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {profile.stats.subscribers === 1 ? 'Subscriber' : 'Subscribers'}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Member since {new Date(profile.createdAt).toLocaleDateString()}
            </p>
          </div>
        </CardContent>
      </Card>

      {isOwnProfile && (
        <div className="space-y-4">
          <Button className="w-full" asChild>
            <Link href="/settings">Edit Profile</Link>
          </Button>
          {currentUser?.role === 'producer' && (
            <Button className="w-full" variant="outline" asChild>
              <Link href="/producer/dashboard">Producer Dashboard</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
