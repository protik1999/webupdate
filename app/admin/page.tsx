'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../context/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  AlertCircle,
  Users,
  Eye,
  Film,
  Shield,
  CheckCircle2,
  XCircle,
  Trash2,
  Search,
  Clock,
  UserCheck,
  Filter,
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface UserData {
  id: string
  name: string
  email: string
  role: 'admin' | 'producer' | 'viewer'
  verified: boolean
  bio?: string
  avatar?: string
  createdAt: string
  updatedAt: string
}

interface UserStats {
  total: number
  viewers: number
  producers: number
  admins: number
  pendingVerification: number
}

type TabType = 'all' | 'pending' | 'viewers' | 'producers' | 'admins'

export default function AdminPage() {
  const router = useRouter()
  const { user, isAuthenticated, loading } = useAuth()
  const [users, setUsers] = useState<UserData[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState('')

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users')
      if (!res.ok) throw new Error('Failed to fetch users')
      const data = await res.json()
      setUsers(data.users)
      setStats(data.stats)
    } catch (err) {
      setError('Failed to load user data')
      console.error('Failed to fetch admin data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
      return
    }

    if (!loading && user?.role !== 'admin') {
      router.push('/')
      return
    }

    if (isAuthenticated && user?.role === 'admin') {
      fetchUsers()
    }
  }, [isAuthenticated, user?.role, loading, router])

  const handleAction = async (userId: string, action: 'approve' | 'reject' | 'delete') => {
    setActionLoading(userId)
    setError('')
    setSuccessMessage('')

    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action }),
      })

      if (!res.ok) throw new Error('Action failed')

      const data = await res.json()
      setSuccessMessage(data.message)

      // Refresh the user list
      await fetchUsers()

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setError('Failed to perform action')
    } finally {
      setActionLoading(null)
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

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-background">
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You do not have permission to access this page.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  // Filter users based on active tab and search
  const filteredUsers = users.filter(u => {
    // Tab filter
    if (activeTab === 'pending') return u.role === 'producer' && !u.verified
    if (activeTab === 'viewers') return u.role === 'viewer'
    if (activeTab === 'producers') return u.role === 'producer'
    if (activeTab === 'admins') return u.role === 'admin'
    return true
  }).filter(u => {
    // Search filter
    if (!searchQuery) return true
    const lower = searchQuery.toLowerCase()
    return u.name.toLowerCase().includes(lower) || u.email.toLowerCase().includes(lower)
  })

  const getRoleBadge = (role: string, verified: boolean) => {
    if (role === 'admin') return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Admin</Badge>
    if (role === 'producer' && verified) return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Producer</Badge>
    if (role === 'producer' && !verified) return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 animate-pulse">Pending</Badge>
    return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Viewer</Badge>
  }

  const getRoleIcon = (role: string) => {
    if (role === 'admin') return <Shield className="w-4 h-4 text-purple-400" />
    if (role === 'producer') return <Film className="w-4 h-4 text-amber-400" />
    return <Eye className="w-4 h-4 text-blue-400" />
  }

  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: 'all', label: 'All Users', count: stats?.total || 0 },
    { key: 'pending', label: 'Pending Verification', count: stats?.pendingVerification || 0 },
    { key: 'viewers', label: 'Viewers', count: stats?.viewers || 0 },
    { key: 'producers', label: 'Producers', count: stats?.producers || 0 },
    { key: 'admins', label: 'Admins', count: stats?.admins || 0 },
  ]

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage users, verify producers, and oversee the platform
          </p>
        </div>

        {/* Success / Error Messages */}
        {successMessage && (
          <Alert className="mb-6 border-green-500/30 bg-green-500/10">
            <CheckCircle2 className="h-4 w-4 text-green-400" />
            <AlertDescription className="text-green-400">{successMessage}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="border-border/50">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-foreground/10 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.total || 0}</p>
                  <p className="text-xs text-muted-foreground">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.viewers || 0}</p>
                  <p className="text-xs text-muted-foreground">Viewers</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Film className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.producers || 0}</p>
                  <p className="text-xs text-muted-foreground">Producers</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.admins || 0}</p>
                  <p className="text-xs text-muted-foreground">Admins</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={`border-border/50 ${(stats?.pendingVerification || 0) > 0 ? 'border-orange-500/40' : ''}`}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-400">{stats?.pendingVerification || 0}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs + Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card text-muted-foreground hover:text-foreground hover:bg-card/80'
                }`}
              >
                {tab.label}
                <span className={`ml-1.5 text-xs ${
                  activeTab === tab.key ? 'opacity-80' : 'opacity-50'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              {tabs.find(t => t.key === activeTab)?.label}
            </CardTitle>
            <CardDescription>
              {activeTab === 'pending'
                ? 'Producer accounts waiting for verification approval'
                : `Showing ${filteredUsers.length} user${filteredUsers.length !== 1 ? 's' : ''}`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center text-muted-foreground py-12">
                Loading users...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                <UserCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No users found</p>
                <p className="text-sm mt-1">
                  {activeTab === 'pending'
                    ? 'No producers waiting for verification'
                    : 'No users match your filters'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredUsers.map((u) => (
                  <div
                    key={u.id}
                    className={`flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border transition-all hover:bg-card/50 ${
                      u.role === 'producer' && !u.verified
                        ? 'border-orange-500/30 bg-orange-500/5'
                        : 'border-border/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3 md:mb-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${
                        u.role === 'admin'
                          ? 'bg-purple-500/20 text-purple-400'
                          : u.role === 'producer'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {u.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium truncate">{u.name}</p>
                          {getRoleBadge(u.role, u.verified)}
                          {u.verified && u.role === 'producer' && (
                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{u.email}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Joined {new Date(u.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-auto">
                      {/* Show approve/reject for pending producers */}
                      {u.role === 'producer' && !u.verified && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleAction(u.id, 'approve')}
                            disabled={actionLoading === u.id}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAction(u.id, 'reject')}
                            disabled={actionLoading === u.id}
                            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}

                      {/* Don't allow deleting yourself */}
                      {u.id !== user?.id && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleAction(u.id, 'delete')}
                          disabled={actionLoading === u.id}
                          className="text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
