'use client'

import { useState } from 'react'
import { registerUser } from '@/app/actions/auth'

export default function SignupForm() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setError(null)
    setLoading(true)

    try {
      // Call the server action to register the user
      const result = await registerUser(formData)
      
      // If there's an error, display it
      if (result && !result.success) {
        setError(result.error)
      }
      
      // If successful, the server action will redirect to login page
    } catch (error: any) {
      setError(error.message || 'Failed to register')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form action={handleSubmit as unknown as string} className="space-y-4 w-full max-w-md">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
      </div>
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
      </div>
      
      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
          minLength={8}
        />
        <p className="text-xs text-gray-500 mt-1">
          Must be at least 8 characters with uppercase, lowercase, and numbers
        </p>
      </div>
      
      <div>
        <label htmlFor="role" className="block text-sm font-medium mb-1">
          Role
        </label>
        <select
          id="role"
          name="role"
          required
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
          defaultValue="client"
        >
          <option value="client">Client</option>
          <option value="professional">Professional</option>
        </select>
      </div>
      
      {error && (
        <div className="p-3 bg-red-100 border border-red-300 rounded-md text-red-800 text-sm">
          {error}
        </div>
      )}
      
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Creating Account...' : 'Create Account'}
      </button>
    </form>
  )
}
