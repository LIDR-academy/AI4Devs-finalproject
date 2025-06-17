'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { RippleButton } from '@/components/magicui/ripple-button'
import { AuroraText } from '@/components/magicui/aurora-text'
import { BorderBeam } from '@/components/magicui/border-beam'

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

    try {
      console.log('Sending password reset email to:', email)
      
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (resetError) {
        throw resetError
      }

      // Show success message
      setSuccess(true)
      console.log('Password reset email sent successfully')
    } catch (error: any) {
      console.error('Password reset error:', error)
      console.error('Detailed error information:', {
        message: error.message,
        name: error.name,
        code: error.code,
        details: error.details,
        hint: error.hint,
        stack: error.stack
      })
      
      setError(error.message || 'Failed to send password reset email. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      {success ? (
        <div className="p-6 bg-blue-900/30 border border-blue-800 rounded-lg text-blue-200 text-center shadow-lg">
          <div className="mb-4">
            <svg className="h-16 w-16 text-blue-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-2">Check Your Email</h3>
          <p className="mb-4">
            We've sent a password reset link to <strong>{email}</strong>. Please check your inbox and follow the instructions to reset your password.
          </p>
          <p className="text-sm opacity-80 mb-4">
            If you don't see the email, please check your spam folder.
          </p>
          <div className="mt-6">
            <Link href="/login" className="text-blue-300 hover:text-blue-200 underline">
              Return to Login
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-900/30 border border-red-800 rounded-lg text-red-200 mb-4">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-red-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="font-medium">Error:</span>
                <span className="ml-2">{error}</span>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-200">
              Email Address
            </label>
            <div className="mt-1">
              <div className="relative">
                <BorderBeam className="rounded-md" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={cn(
                    "block w-full px-4 py-3 bg-gray-950/50 border border-gray-800 rounded-md",
                    "text-gray-100 placeholder-gray-400",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                    "relative z-10"
                  )}
                  placeholder="your.email@example.com"
                />
              </div>
            </div>
          </div>

          <div>
            <RippleButton
              type="submit"
              disabled={loading}
              className={cn(
                "w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm",
                "text-white bg-blue-600 hover:bg-blue-700",
                "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </>
              ) : (
                <AuroraText>Send Reset Link</AuroraText>
              )}
            </RippleButton>
          </div>

          <div className="flex items-center justify-center">
            <div className="text-sm">
              <Link href="/login" className="font-medium text-blue-400 hover:text-blue-300">
                Return to Login
              </Link>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}
