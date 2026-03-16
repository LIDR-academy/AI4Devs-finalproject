'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { User } from '@/domain/user/User'
import { redirect } from 'next/navigation'

/**
 * Register a new user
 * @param formData Form data containing user registration information
 * @returns Object with success status and message or error
 */
export async function registerUser(formData: FormData) {
  try {
    // Extract form data
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const role = formData.get('role') as string || 'client' // Default to client role

    // Create user domain entity (this will validate the data)
    const user = User.create(name, email, password, role)
    
    // Get DTO with hashed password for database operations
    const userDTO = await user.toDTO()
    
    // Create Supabase client
    const supabase = await createClient()
    
    // Create user in Supabase Auth
    const { error: authError } = await supabase.auth.signUp({
      email: userDTO.email,
      password: password, // Use original password for auth
      options: {
        data: {
          name: userDTO.name,
          role: userDTO.role,
        },
        // NO auto sign-in, require email confirmation
        emailRedirectTo: undefined // default behavior: require confirmation
      },
    })
    
    if (authError) {
      throw new Error(`Auth error: ${authError.message}`)
    }
    
    // Insert user into database
    const { error: dbError } = await supabase
      .from('users')
      .insert({
        first_name: userDTO.name, // Using name as first_name for now
        email: userDTO.email,
        role: userDTO.role,
        // No need to store password in our custom users table as Supabase handles auth
      })
    
    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`)
    }
    
    // Revalidate paths to update data
    revalidatePath('/')
    revalidatePath('/login')
    
    // No login, no session creation here
    // Redirige siempre a login con mensaje de confirmación
    redirect('/login?confirm=1')
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
