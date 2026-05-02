'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../context/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AlertCircle, Mail, Lock } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function LoginPage() {
  const router = useRouter()
  const { login, isAuthenticated, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetch('/api/init', { method: 'POST' }).catch(() => {})
  }, [])

  useEffect(() => {
    if (isAuthenticated && !loading) {
      router.push('/movies')
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    )
  }

  if (isAuthenticated) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await login(email, password)
      router.push('/movies')
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = (provider: string) => {
    // Placeholder for social login
    setError(`${provider} login not yet implemented`)
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center p-4">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-green-950/10 to-black opacity-80" />
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-12">
          <h2 className="text-green-500 text-sm font-bold tracking-widest mb-4">STREAMVERSE</h2>
          <h1 className="text-4xl font-bold text-white mb-8">Access the Archive.</h1>
        </div>

        <div className="bg-black/60 backdrop-blur-md border border-green-500/20 rounded-lg p-8 space-y-6">
          {error && (
            <Alert variant="destructive" className="bg-red-900/20 border-red-500/50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-400">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-green-500 text-xs font-bold tracking-wider">
                EMAIL ADDRESS
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500/50" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pl-10 bg-black/40 border-green-500/30 text-white placeholder:text-gray-600 focus:border-green-500/70 focus:ring-green-500/20"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-green-500 text-xs font-bold tracking-wider">
                  PASSWORD
                </label>
                <Link href="#" className="text-green-500 hover:text-green-400 text-xs font-semibold transition">
                  FORGOT?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500/50" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pl-10 bg-black/40 border-green-500/30 text-white placeholder:text-gray-600 focus:border-green-500/70 focus:ring-green-500/20"
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-500 hover:bg-green-600 text-black font-bold text-sm tracking-wider py-6 rounded transition-all mt-8"
            >
              {isLoading ? 'ENTERING...' : 'ENTER THE VERSE'}
            </Button>
          </form>

          {/* Social Access */}
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-green-500/20" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-black/60 text-gray-500 font-semibold tracking-wider">SOCIAL ACCESS</span>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                type="button"
                onClick={() => handleSocialLogin('Google')}
                variant="outline"
                className="w-full bg-white hover:bg-gray-100 text-black font-semibold py-6 border-0 rounded transition-all"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>

              <Button
                type="button"
                onClick={() => handleSocialLogin('Apple')}
                variant="outline"
                className="w-full bg-black hover:bg-gray-900 text-white font-semibold py-6 border border-gray-700 rounded transition-all"
              >
                <svg className="w-5 h-5 mr-2 fill-current" viewBox="0 0 24 24">
                  <path d="M17.05 13.5c-.91 2.84.37 5.51 2.54 6.56 1.84 1 3.99.72 5.02-1.14.92-1.78.35-4.25-1.75-5.16-1.57-.65-3.25-.13-4.13 1.27-.38.63-.55 1.37-.68 2.47zM6.16 9.08C3.27 9.22 1 11.21 1 14c0 3.35 2.57 6 6 6 1.63 0 3.06-.58 4.21-1.52 1.17-1.01 1.62-2.45 1.28-3.96-.2-.88-.72-1.66-1.38-2.24-.67-.59-1.56-.92-2.51-.92h-.44c-.47 0-.91-.16-1.23-.46-.32-.3-.5-.73-.5-1.17 0-.9.73-1.63 1.63-1.63h.44c.47 0 .91.16 1.23.46.32.3.5.73.5 1.17 0 .57.19 1.09.54 1.53.35.44.84.78 1.4.95.57.18 1.18.18 1.75.01 1.38-.38 2.35-1.66 2.35-3.11 0-1.77-1.44-3.22-3.22-3.22h-2.66zM12 0C5.38 0 0 5.38 0 12s5.38 12 12 12 12-5.38 12-12S18.62 0 12 0z"/>
                </svg>
                Continue with Apple
              </Button>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center pt-4">
            <p className="text-gray-400 text-sm">
              New to the Verse?{' '}
              <Link href="/signup" className="text-green-500 hover:text-green-400 font-bold transition">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
