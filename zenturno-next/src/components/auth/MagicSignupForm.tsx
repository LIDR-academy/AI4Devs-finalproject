'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { RippleButton } from '@/components/magicui/ripple-button'
import { AuroraText } from '@/components/magicui/aurora-text'
import { BorderBeam } from '@/components/magicui/border-beam'
import { UserRole } from '@/domain/user/UserRole'

interface Specialty {
  id: string
  name: string
  description?: string
}

export default function MagicSignupForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<'client' | 'professional'>('client')
  const [specialty, setSpecialty] = useState('')
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [loadingSpecialties, setLoadingSpecialties] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  
  // Fetch specialties when the component mounts or when role changes to professional
  useEffect(() => {
    if (role === 'professional') {
      fetchSpecialties()
    }
  }, [role])

  // Function to fetch specialties from the API
  const fetchSpecialties = async () => {
    try {
      setLoadingSpecialties(true)
      const response = await fetch('/api/specialties')
      
      if (!response.ok) {
        throw new Error('Failed to fetch specialties')
      }
      
      const data = await response.json()
      setSpecialties(data)
    } catch (error) {
      console.error('Error fetching specialties:', error)
      setError('Failed to load specialties. Please try again.')
    } finally {
      setLoadingSpecialties(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // Validate required fields
    if (!name.trim()) {
      setError('Name is required')
      setLoading(false)
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

    // Validate password strength
    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      setLoading(false)
      return
    }

    // Validate password match
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    // Validate phone number for clients
    if (role === 'client' && !phone.trim()) {
      setError('Phone number is required for clients')
      setLoading(false)
      return
    }

    // Validate specialty for professionals
    if (role === 'professional' && !specialty.trim()) {
      setError('Specialty is required for professionals')
      setLoading(false)
      return
    }

    try {
      console.log('Starting signup process...');
      
      // Sign up with Supabase Auth - user must confirm email before login
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
            phone: role === 'client' ? phone : null,
            specialty: role === 'professional' ? specialty : null,
          },
          // Email confirmation is required - user must confirm before login
          emailRedirectTo: `${window.location.origin}/auth/callback?redirect_to=/dashboard`,
        },
      })

      console.log('Signup response:', { authData, authError });

      if (authError) {
        throw authError
      }

      // Check if the user was created successfully
      if (authData.user) {
        console.log('User created successfully:', authData.user);
        
        // Show success message - user needs to confirm email before logging in
        setSuccess(true);
      } else {
        // This shouldn't happen if authError is null, but just in case
        setError('User account was not created. Please try again.');
      }
    } catch (error: any) {
      console.error('Signup error:', error)
      console.error('Detailed error information:', {
        message: error.message,
        name: error.name,
        code: error.code,
        details: error.details,
        hint: error.hint,
        stack: error.stack
      })
      
      // Provide more user-friendly error messages
      if (error.message?.includes('email')) {
        setError('This email address is already in use. Please try another one.')
      } else if (error.message?.includes('password')) {
        setError('Password is too weak. Please choose a stronger password.')
      } else {
        setError(error.message || 'Failed to sign up. Please try again later.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Function to resend confirmation email
  const handleResendConfirmation = async () => {
    if (!email) {
      setError('Please enter your email address first')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?redirect_to=/dashboard`,
        },
      })

      if (error) throw error

      // Show success message
      setSuccess(true)
    } catch (error: any) {
      console.error('Resend confirmation error:', error)
      setError(error.message || 'Failed to resend confirmation email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      {success ? (
        <div className="p-6 bg-blue-900/30 border border-blue-800 rounded-lg text-blue-200 text-center shadow-lg">
          <div className="mb-4">
            <svg className="h-16 w-16 text-blue-400 mx-auto animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold mb-3">Check your email</h3>
          <p className="mb-6 text-lg">
            We've sent you a confirmation link to <span className="font-semibold text-blue-300">{email}</span>. Please check your inbox (and spam folder) and follow the instructions to complete your registration.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/login">
              <RippleButton
                className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors border-0 font-medium"
                rippleColor="rgba(59, 130, 246, 0.4)"
              >
                Go to Login
              </RippleButton>
            </Link>
            <RippleButton
              onClick={handleResendConfirmation}
              disabled={loading}
              className="py-2.5 px-5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors border-0 font-medium disabled:opacity-50"
              rippleColor="rgba(156, 163, 175, 0.4)"
            >
              {loading ? 'Sending...' : 'Resend Email'}
            </RippleButton>
          </div>
        </div>
      ) : (
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
              {/* Name Field */}
              <div className="group">
                <label htmlFor="name" className="block text-sm font-medium mb-1 text-gray-300">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className={cn(
                      "w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg",
                      "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                      "text-white placeholder-gray-500",
                      "transition-all duration-200"
                    )}
                    placeholder="Enter your full name"
                    disabled={loading}
                  />
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Email Field */}
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

              {/* Role Selection */}
              <div className="group">
                <label className="block text-sm font-medium mb-1 text-gray-300">
                  I am a
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('client')}
                    className={cn(
                      "flex items-center justify-center py-3 px-4 rounded-lg border",
                      "transition-all duration-200",
                      role === 'client'
                        ? "bg-blue-600/20 border-blue-500 text-blue-400"
                        : "bg-gray-800/50 border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-gray-300"
                    )}
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Client
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('professional')}
                    className={cn(
                      "flex items-center justify-center py-3 px-4 rounded-lg border",
                      "transition-all duration-200",
                      role === 'professional'
                        ? "bg-purple-600/20 border-purple-500 text-purple-400"
                        : "bg-gray-800/50 border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-gray-300"
                    )}
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Professional
                  </button>
                </div>
              </div>

              {/* Phone Field - Only for clients */}
              {role === 'client' && (
                <div className="group">
                  <label htmlFor="phone" className="block text-sm font-medium mb-1 text-gray-300">
                    Phone Number
                  </label>
                  <div className="relative">
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className={cn(
                        "w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg",
                        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                        "text-white placeholder-gray-500",
                        "transition-all duration-200"
                      )}
                      placeholder="Enter your phone number"
                      disabled={loading}
                    />
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {/* Specialty Field - Only for professionals */}
              {role === 'professional' && (
                <div className="group">
                  <label htmlFor="specialty" className="block text-sm font-medium mb-1 text-gray-300">
                    Specialty
                  </label>
                  <div className="relative">
                    <select
                      id="specialty"
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      required
                      className={cn(
                        "w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg",
                        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                        "text-white placeholder-gray-500",
                        "transition-all duration-200",
                        "appearance-none" // Remove default select styling
                      )}
                      disabled={loading || loadingSpecialties}
                    >
                      <option value="" className="bg-gray-800 text-gray-300">Select your specialty</option>
                      {specialties.map((specialtyOption) => (
                        <option 
                          key={specialtyOption.id} 
                          value={specialtyOption.name}
                          className="bg-gray-800 text-gray-300"
                        >
                          {specialtyOption.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                    </div>
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    {loadingSpecialties && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-800/70 rounded-lg">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Password Field */}
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
                    placeholder="Create a password"
                    disabled={loading}
                  />
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="group">
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1 text-gray-300">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className={cn(
                      "w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg",
                      "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                      "text-white placeholder-gray-500",
                      "transition-all duration-200"
                    )}
                    placeholder="Confirm your password"
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
            <div className="p-4 bg-red-900/30 border border-red-800 rounded-lg text-red-200 mb-4 shadow-md">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-300">There was a problem with your submission</h3>
                  <div className="mt-2 text-sm text-red-200">
                    {error}
                  </div>
                </div>
              </div>
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
            {loading ? 'Creating Account...' : 'Create Account'}
          </RippleButton>

          <div className="text-center text-gray-400 text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
              Sign in
            </Link>
          </div>
        </form>
      )}
    </div>
  )
}
