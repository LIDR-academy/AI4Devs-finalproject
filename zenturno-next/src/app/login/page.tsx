import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import MagicLoginForm from '@/components/auth/MagicLoginForm'
import MagicAuthLayout from '@/components/auth/MagicAuthLayout'

interface PageProps {
  searchParams: Promise<{ redirect?: string; registered?: string; error?: string }>
}

export default async function LoginPage({ searchParams }: PageProps) {
  // Await searchParams for Next.js 15 compatibility
  const { redirect: redirectParam, registered, error } = await searchParams;
  
  // Create Supabase client
  const supabase = await createClient()
  
  // Check if user is already logged in
  const { data: { session } } = await supabase.auth.getSession()
  
  // If user is logged in, redirect to dashboard
  if (session) {
    redirect('/dashboard')
  }
  
  // Get redirect path from query parameter
  const redirectPath = redirectParam || '/dashboard'
  
  // Check if user just registered
  const justRegistered = registered === 'true'
  
  // Decode error message if present
  const errorMessage = error ? decodeURIComponent(error) : null
  
  // Check if it's an expired email link
  const isExpiredLink = errorMessage?.includes('expired') || errorMessage?.includes('invalid')
  
  let subtitle = "Enter your credentials to access your account"
  
  if (errorMessage) {
    subtitle = `Error: ${errorMessage}`
    if (isExpiredLink) {
      subtitle += ". Please try signing up again to receive a new confirmation email."
    }
  } else if (justRegistered) {
    subtitle = "Account created successfully! Please check your email and confirm your account, then sign in."
  }
  
  return (
    <MagicAuthLayout 
      title="Sign In to ZenTurno"
      subtitle={subtitle}
      showLogo={true}
    >
      <MagicLoginForm redirectTo={redirectPath} />
    </MagicAuthLayout>
  )
}
