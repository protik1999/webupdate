'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '../context/auth-context'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Mail, Settings } from 'lucide-react'

export default function Header() {
  const { user, logout, isAuthenticated, loading } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">S</span>
          </div>
          <span className="font-bold text-lg hidden sm:inline">StreamVerse</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {isAuthenticated && (
            <>
              <Link
                href="/movies"
                className="text-sm text-muted-foreground hover:text-foreground transition"
              >
                Browse
              </Link>
              <Link
                href="/forum"
                className="text-sm text-muted-foreground hover:text-foreground transition"
              >
                Forum
              </Link>
              <Link
                href="/messages"
                className="text-sm text-muted-foreground hover:text-foreground transition"
              >
                Messages
              </Link>
              <Link
                href="/discover"
                className="text-sm text-muted-foreground hover:text-foreground transition"
              >
                Discover
              </Link>
              {user?.role === 'producer' && (
                <Link
                  href="/producer/dashboard"
                  className="text-sm text-muted-foreground hover:text-foreground transition"
                >
                  Dashboard
                </Link>
              )}
              {user?.role === 'admin' && (
                <Link
                  href="/admin"
                  className="text-sm text-muted-foreground hover:text-foreground transition"
                >
                  Admin
                </Link>
              )}
            </>
          )}
        </nav>

        {/* Auth Section */}
        <div className="flex items-center gap-4">
          {loading ? (
            <div className="w-10 h-10 bg-muted rounded-full animate-pulse" />
          ) : isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col gap-1">
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.role}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
                {user.role === 'producer' && (
                  <DropdownMenuItem asChild>
                    <Link href="/producer/dashboard">My Dashboard</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/login')}
              >
                Login
              </Button>
              <Button
                size="sm"
                onClick={() => router.push('/signup')}
              >
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
