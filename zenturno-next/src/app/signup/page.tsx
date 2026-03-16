import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import MagicSignupForm from '@/components/auth/MagicSignupForm'
import MagicAuthLayout from '@/components/auth/MagicAuthLayout'

export default async function SignupPage() {
  // Create Supabase client
  const supabase = await createClient()
  
  // Check if user is already logged in
  const { data: { session } } = await supabase.auth.getSession()
  
  // If user is logged in, redirect to dashboard
  if (session) {
    redirect('/dashboard')
  }
  
  return (
    <MagicAuthLayout 
      title="Create an Account"
      subtitle="Register to start managing your appointments"
      showLogo={true}
    >
      <MagicSignupForm />
    </MagicAuthLayout>
  )
}
