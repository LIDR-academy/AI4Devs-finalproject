'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { RippleButton } from '@/components/magicui/ripple-button'
import { AuroraText } from '@/components/magicui/aurora-text'
import { BorderBeam } from '@/components/magicui/border-beam'
import Link from 'next/link'

interface LoginFormProps {
  redirectTo?: string
}

export default function MagicLoginForm({ redirectTo = '/dashboard' }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      // Refresh the page to update the session
      router.refresh()
      
      // Redirect to the specified page or dashboard
      router.push(redirectTo)
    } catch (error: any) {
      setError(error.message || 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative mb-6 overflow-hidden rounded-lg">
          <BorderBeam
            className="absolute inset-0 z-0"
            size={100}
            duration={12}
            colorFrom="#40a9ff"
            colorTo="#9c40ff"
          />
          <div className="relative z-10 bg-gray-800/50 backdrop-blur-sm p-5 rounded-lg border border-gray-700 space-y-5">
            <div className="group">
              <label htmlFor="email" className="block text-sm font-medium mb-1 text-gray-300">
                Email
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={cn(
                    "w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                    "text-white placeholder-gray-500",
                    "transition-all duration-200"
                  )}
                  placeholder="Enter your email"
                  disabled={loading}
                />
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="group">
              <label htmlFor="password" className="block text-sm font-medium mb-1 text-gray-300">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={cn(
                    "w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                    "text-white placeholder-gray-500",
                    "transition-all duration-200"
                  )}
                  placeholder="Enter your password"
                  disabled={loading}
                />
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-300 text-sm animate-pulse">
            {error}
          </div>
        )}
        
        <RippleButton
          type="submit"
          disabled={loading}
          rippleColor="rgba(59, 130, 246, 0.4)"
          className={cn(
            "w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500",
            "text-white rounded-lg font-medium",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "transition-all duration-200 transform hover:-translate-y-0.5",
            "border-0 relative overflow-hidden"
          )}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </RippleButton>
        
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-4">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
              Sign up
            </Link>
          </p>
          
          <p className="text-gray-400 text-sm">
            Having trouble with email confirmation?{' '}
            <Link href="/signup" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
              Resend confirmation email
            </Link>
          </p>
        </div>
      </form>
    </div>
  )
}
