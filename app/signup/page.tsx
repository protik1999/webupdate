'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../context/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AlertCircle, Mail, Lock, User } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'

export default function SignupPage() {
  const router = useRouter()
  const { signup, isAuthenticated, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

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
    if (!agreeToTerms) {
      setError('Please agree to the Terms of Service')
      return
    }
    setError('')
    setIsLoading(true)

    try {
      await signup(email, password, name, 'viewer')
      router.push('/movies')
    } catch (err: any) {
      setError(err.message || 'Signup failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center p-4">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-green-950/10 to-black opacity-80" />
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-12">
          <h2 className="text-green-500 text-xs font-bold tracking-widest mb-4">STEP INTO THE FUTURE</h2>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">STREAMVERSE</h1>
          <p className="text-gray-400 text-sm">Join the most advanced cinematic community</p>
        </div>

        <div className="bg-black/60 backdrop-blur-md border border-green-500/20 rounded-lg p-8 space-y-6">
          {error && (
            <Alert variant="destructive" className="bg-red-900/20 border-red-500/50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-400">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name Input */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-green-500 text-xs font-bold tracking-wider">
                FULL NAME
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500/50" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Wick"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pl-10 bg-black/40 border-green-500/30 text-white placeholder:text-gray-600 focus:border-green-500/70 focus:ring-green-500/20"
                />
              </div>
            </div>

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
                  placeholder="john@streamverse.com"
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
              <label htmlFor="password" className="text-green-500 text-xs font-bold tracking-wider">
                SECURE PASSWORD
              </label>
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

            {/* Terms Checkbox */}
            <div className="flex items-start gap-3 pt-2">
              <Checkbox
                id="terms"
                checked={agreeToTerms}
                onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                disabled={isLoading}
                className="mt-1 border-green-500/50 data-[state=checked]:bg-green-500"
              />
              <label htmlFor="terms" className="text-gray-400 text-xs cursor-pointer">
                I agree to the{' '}
                <Link href="#" className="text-green-500 hover:text-green-400 font-semibold transition">
                  Terms of Service
                </Link>
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || !agreeToTerms}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-black font-bold text-sm tracking-wider py-6 rounded transition-all mt-6"
            >
              {isLoading ? 'JOINING...' : 'JOIN THE VERSE'}
            </Button>
          </form>

          {/* Sign In Link */}
          <div className="text-center pt-4 border-t border-green-500/20">
            <p className="text-gray-400 text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-green-500 hover:text-green-400 font-bold transition">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Footer Links */}
        <div className="flex justify-center gap-6 mt-8 text-xs text-gray-500">
          <Link href="#" className="hover:text-green-500 transition">PRIVACY</Link>
          <span>•</span>
          <Link href="#" className="hover:text-green-500 transition">LEGAL</Link>
          <span>•</span>
          <Link href="#" className="hover:text-green-500 transition">API</Link>
        </div>
      </div>
    </div>
  )
}
