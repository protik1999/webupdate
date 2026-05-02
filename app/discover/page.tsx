'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../context/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Search, Users } from 'lucide-react'

interface DiscoverUser {
  id: string
  name: string
  email: string
  role: string
  bio?: string
}

export default function DiscoverPage() {
  const router = useRouter()
  const { isAuthenticated, loading } = useAuth()
  const [users, setUsers] = useState<DiscoverUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<DiscoverUser[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/users')
        if (res.ok) {
          const data = await res.json()
          setUsers(data.users)
        }
      } catch (err) {
        console.error('Failed to fetch users:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [isAuthenticated, router])

  useEffect(() => {
    let filtered = users

    if (selectedRole) {
      filtered = filtered.filter((u) => u.role === selectedRole)
    }

    if (searchQuery) {
      filtered = filtered.filter((u) =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredUsers(filtered)
  }, [users, searchQuery, selectedRole])

  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Discover Community</h1>
          <p className="text-muted-foreground">
            Find and connect with creators, producers, and other viewers
          </p>
        </div>

        {/* Filters */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Role Filter */}
          <div className="flex gap-2">
            <Button
              variant={selectedRole === null ? 'default' : 'outline'}
              onClick={() => setSelectedRole(null)}
              size="sm"
            >
              All Users
            </Button>
            <Button
              variant={selectedRole === 'producer' ? 'default' : 'outline'}
              onClick={() => setSelectedRole('producer')}
              size="sm"
            >
              Producers
            </Button>
            <Button
              variant={selectedRole === 'viewer' ? 'default' : 'outline'}
              onClick={() => setSelectedRole('viewer')}
              size="sm"
            >
              Viewers
            </Button>
          </div>
        </div>

        {/* User Grid */}
        {isLoading ? (
          <div className="text-center text-muted-foreground py-12">
            Loading community members...
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((u) => (
              <Card key={u.id} className="hover:border-primary transition">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {u.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <Badge variant={u.role === 'producer' ? 'default' : 'secondary'}>
                      {u.role}
                    </Badge>
                  </div>
                  <CardTitle className="mt-3">{u.name}</CardTitle>
                  <CardDescription>{u.email}</CardDescription>
                </CardHeader>
                <CardContent>
                  {u.bio && <p className="text-sm text-muted-foreground mb-4">{u.bio}</p>}
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => router.push(`/profile/${u.id}`)}
                  >
                    View Profile
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>
                {searchQuery || selectedRole
                  ? 'No users found matching your filters'
                  : 'No community members yet'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
