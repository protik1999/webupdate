'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../context/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  History,
  Star,
  LogOut,
  Settings,
  Camera,
  Edit3,
  Check,
  X,
  Save,
  User,
  Mail,
  Shield,
  Calendar,
  Film,
  TrendingUp,
  Award,
} from 'lucide-react'

interface WatchHistoryItem {
  movieId: string
  movieTitle: string
  thumbnail: string
  progress: number
  watchedAt: string
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, logout, updateUser, isAuthenticated, loading } = useAuth()
  const [watchHistory, setWatchHistory] = useState<WatchHistoryItem[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)

  // Inline edit state
  const [isEditingName, setIsEditingName] = useState(false)
  const [isEditingBio, setIsEditingBio] = useState(false)
  const [editName, setEditName] = useState('')
  const [editBio, setEditBio] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Photo upload
  const [showPhotoDialog, setShowPhotoDialog] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, loading, router])

  useEffect(() => {
    if (user) {
      setEditName(user.name || '')
      setEditBio(user.bio || '')
    }
  }, [user])

  useEffect(() => {
    if (isAuthenticated) {
      const fetchWatchHistory = async () => {
        try {
          setIsLoadingHistory(true)
          const res = await fetch('/api/watch-history')
          if (res.ok) {
            const data = await res.json()
            setWatchHistory(data.history)
          }
        } catch (error) {
          console.error('Failed to fetch watch history:', error)
        } finally {
          setIsLoadingHistory(false)
        }
      }

      fetchWatchHistory()
    }
  }, [isAuthenticated])

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  const handleSaveName = async () => {
    if (!editName.trim()) return
    setIsSaving(true)
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim() }),
      })
      if (res.ok) {
        const data = await res.json()
        updateUser({ name: data.name })
        setIsEditingName(false)
        showMessage('success', 'Name updated successfully!')
      } else {
        const err = await res.json()
        showMessage('error', err.error || 'Failed to update name')
      }
    } catch {
      showMessage('error', 'Failed to update name')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveBio = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio: editBio.trim() }),
      })
      if (res.ok) {
        const data = await res.json()
        updateUser({ bio: data.bio })
        setIsEditingBio(false)
        showMessage('success', 'Bio updated successfully!')
      } else {
        const err = await res.json()
        showMessage('error', err.error || 'Failed to update bio')
      }
    } catch {
      showMessage('error', 'Failed to update bio')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelName = () => {
    setEditName(user?.name || '')
    setIsEditingName(false)
  }

  const handleCancelBio = () => {
    setEditBio(user?.bio || '')
    setIsEditingBio(false)
  }

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      showMessage('error', 'Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      showMessage('error', 'Image must be smaller than 5MB')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string)
      setShowPhotoDialog(true)
    }
    reader.readAsDataURL(file)
  }

  const handlePhotoUpload = async () => {
    if (!photoPreview) return
    setIsUploadingPhoto(true)
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: photoPreview }),
      })
      if (res.ok) {
        const data = await res.json()
        updateUser({ avatar: data.avatar })
        showMessage('success', 'Profile photo updated!')
        setShowPhotoDialog(false)
        setPhotoPreview(null)
      } else {
        showMessage('error', 'Failed to upload photo')
      }
    } catch {
      showMessage('error', 'Failed to upload photo')
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  const handleRemovePhoto = async () => {
    setIsUploadingPhoto(true)
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: '' }),
      })
      if (res.ok) {
        updateUser({ avatar: undefined })
        showMessage('success', 'Profile photo removed!')
        setShowPhotoDialog(false)
        setPhotoPreview(null)
      } else {
        showMessage('error', 'Failed to remove photo')
      }
    } catch {
      showMessage('error', 'Failed to remove photo')
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-40 bg-muted rounded" />
          <div className="h-80 bg-muted rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Toast Message */}
      {message && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
          <Alert
            variant={message.type === 'error' ? 'destructive' : 'default'}
            className={`shadow-lg border ${
              message.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : ''
            }`}
          >
            <AlertDescription className="font-medium">{message.text}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Profile Header with Cover & Avatar */}
      <Card className="overflow-hidden">
        {/* Cover gradient */}
        <div className="h-32 bg-gradient-to-r from-primary/30 via-accent/20 to-primary/10 relative" />

        <CardContent className="relative px-6 pb-6">
          {/* Avatar overlapping the cover */}
          <div className="flex flex-col sm:flex-row items-start gap-5 -mt-12">
            <div className="relative group">
              <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                {user?.avatar ? (
                  <AvatarImage src={user.avatar} alt={user.name} />
                ) : null}
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                  {user?.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Camera overlay button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                id="profile-photo-upload-btn"
              >
                <Camera className="w-6 h-6 text-white" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoSelect}
                id="profile-photo-input"
              />
            </div>

            <div className="flex-1 pt-2 sm:pt-14 w-full">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 w-full">
                <div className="space-y-1 flex-1">
                  {/* Editable Name */}
                  {isEditingName ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="text-xl font-bold h-9 max-w-xs"
                        autoFocus
                        id="edit-name-input"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveName()
                          if (e.key === 'Escape') handleCancelName()
                        }}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleSaveName}
                        disabled={isSaving}
                        id="save-name-btn"
                        className="h-8 w-8 p-0 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCancelName}
                        id="cancel-name-btn"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 group/name">
                      <h2 className="text-2xl font-bold">{user?.name}</h2>
                      <button
                        onClick={() => setIsEditingName(true)}
                        className="opacity-0 group-hover/name:opacity-100 transition-opacity p-1 rounded hover:bg-muted"
                        id="edit-name-trigger"
                      >
                        <Edit3 className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-3.5 h-3.5" />
                    <span className="text-sm">{user?.email}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-accent" />
                    <span className="text-sm text-accent capitalize font-medium">
                      {user?.role}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 flex-wrap">
                  <Link href="/settings">
                    <Button variant="outline" className="gap-2" id="edit-profile-btn">
                      <Settings className="w-4 h-4" />
                      Settings
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    onClick={handleLogout}
                    className="gap-2"
                    id="logout-btn"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Bio Section */}
          <div className="mt-6 pt-5 border-t border-border">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                  About Me
                </label>
                {isEditingBio ? (
                  <div className="space-y-2">
                    <textarea
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      placeholder="Tell us about yourself..."
                      className="w-full min-h-20 p-3 bg-background border border-border rounded-lg text-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                      maxLength={200}
                      autoFocus
                      id="edit-bio-textarea"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {editBio.length}/200
                      </span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleCancelBio}
                          id="cancel-bio-btn"
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSaveBio}
                          disabled={isSaving}
                          className="gap-1"
                          id="save-bio-btn"
                        >
                          <Save className="w-3.5 h-3.5" />
                          Save
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="group/bio flex items-start gap-2">
                    <p className="text-sm text-foreground/80 leading-relaxed flex-1">
                      {user?.bio || (
                        <span className="text-muted-foreground italic">
                          No bio added yet. Click the edit button to add one.
                        </span>
                      )}
                    </p>
                    <button
                      onClick={() => setIsEditingBio(true)}
                      className="opacity-0 group-hover/bio:opacity-100 transition-opacity p-1.5 rounded hover:bg-muted shrink-0"
                      id="edit-bio-trigger"
                    >
                      <Edit3 className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="group hover:border-primary/50 transition-colors">
          <CardContent className="p-5 text-center">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <Film className="w-5 h-5 text-primary" />
            </div>
            <div className="text-2xl font-bold text-primary mb-1">
              {watchHistory.length}
            </div>
            <p className="text-xs text-muted-foreground">Movies Watched</p>
          </CardContent>
        </Card>

        <Card className="group hover:border-accent/50 transition-colors">
          <CardContent className="p-5 text-center">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5 text-accent" />
            </div>
            <div className="text-2xl font-bold text-accent mb-1">
              {watchHistory.length > 0
                ? Math.round(
                    watchHistory.reduce((sum, item) => sum + item.progress, 0) /
                      watchHistory.length
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">Avg Progress</p>
          </CardContent>
        </Card>

        <Card className="group hover:border-primary/50 transition-colors">
          <CardContent className="p-5 text-center">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <Award className="w-5 h-5 text-primary" />
            </div>
            <div className="text-2xl font-bold text-primary mb-1">Member</div>
            <p className="text-xs text-muted-foreground">Account Status</p>
          </CardContent>
        </Card>

        <Card className="group hover:border-emerald-500/50 transition-colors">
          <CardContent className="p-5 text-center">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-emerald-500 mb-1">Active</div>
            <p className="text-xs text-muted-foreground">Since Joined</p>
          </CardContent>
        </Card>
      </div>

      {/* Watch History */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <History className="w-6 h-6" />
          Continue Watching
        </h2>

        {isLoadingHistory ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-40 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : watchHistory.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {watchHistory.slice(0, 8).map((item) => (
              <Link key={item.movieId} href={`/movies/${item.movieId}`}>
                <Card className="overflow-hidden hover:border-primary transition-colors cursor-pointer h-full group">
                  <div className="relative aspect-video bg-muted overflow-hidden">
                    <img
                      src={item.thumbnail}
                      alt={item.movieTitle}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    {item.progress > 0 && (
                      <div className="absolute bottom-0 h-1 bg-primary/50 w-full">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <p className="font-medium line-clamp-1 text-sm">
                      {item.movieTitle}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.progress}% watched
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <div className="space-y-4">
              <Star className="w-12 h-12 mx-auto text-muted" />
              <p className="text-muted-foreground">
                Start watching movies to see your history here
              </p>
              <Link href="/movies">
                <Button>Browse Movies</Button>
              </Link>
            </div>
          </Card>
        )}
      </div>

      {/* Photo Upload Dialog */}
      <Dialog open={showPhotoDialog} onOpenChange={setShowPhotoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Profile Photo</DialogTitle>
            <DialogDescription>
              Preview your new profile photo before saving
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4 py-4">
            {photoPreview ? (
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-border shadow-lg">
                  <AvatarImage src={photoPreview} alt="Preview" />
                  <AvatarFallback>
                    {user?.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
            ) : (
              <Avatar className="h-32 w-32 border-4 border-border">
                {user?.avatar ? (
                  <AvatarImage src={user.avatar} alt={user.name} />
                ) : null}
                <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                  {user?.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {user?.avatar && (
              <Button
                variant="outline"
                onClick={handleRemovePhoto}
                disabled={isUploadingPhoto}
                className="text-destructive hover:text-destructive"
                id="remove-photo-btn"
              >
                Remove Photo
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPhotoDialog(false)
                  setPhotoPreview(null)
                }}
                id="cancel-photo-btn"
              >
                Cancel
              </Button>
              {photoPreview && (
                <Button
                  onClick={handlePhotoUpload}
                  disabled={isUploadingPhoto}
                  className="gap-2"
                  id="confirm-photo-btn"
                >
                  <Check className="w-4 h-4" />
                  {isUploadingPhoto ? 'Uploading...' : 'Save Photo'}
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
