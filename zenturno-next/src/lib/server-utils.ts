import { createClient } from '@/lib/supabase/server'
import { UserRole } from '@/domain/user/UserRole'

/**
 * Get or create user profile with robust error handling
 * This function handles cases where user might not exist in custom tables
 */
export async function getOrCreateUserProfile(_session?: unknown) {
  const supabase = await createClient()
  
  // Use getUser() for better security instead of relying on session data
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    console.error('Error fetching authenticated user:', userError)
    return { userProfile: null, role: UserRole.CLIENT }
  }

  // Get user profile from database
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('email', user.email)
    .single()

  if (profileError?.code === 'PGRST116') {
    // User doesn't exist - create user record
    console.log('Creating missing user profile for:', user.email)
    
    try {
      const name = user.user_metadata?.name || user.email?.split('@')[0] || 'User'
      const role = user.user_metadata?.role || UserRole.CLIENT
      
      // Try to create user record with flexible schema
      let userInsertData: any = {
        email: user.email,
        role: role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // First attempt with name column
      userInsertData.name = name

      let { data: newUser, error: createError } = await supabase
        .from('users')
        .insert(userInsertData)
        .select()
        .single()

      // If name column doesn't exist, try without it
      if (createError?.code === 'PGRST204') {
        console.log('Name column not found, trying alternative schema...')
        
        userInsertData = {
          email: user.email,
          role: role,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        const result = await supabase
          .from('users')
          .insert(userInsertData)
          .select()
          .single()

        newUser = result.data
        createError = result.error
      }

      if (createError) {
        console.error('Error creating user profile:', createError)
        // Fallback to session data
        return {
          userProfile: {
            id: user.id,
            name: name,
            email: user.email,
            role: role,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          role: role
        }
      }

      return {
        userProfile: newUser,
        role: newUser.role
      }
    } catch (error) {
      console.error('Unexpected error creating user profile:', error)
      // Fallback to session data
      const fallbackRole = user.user_metadata?.role || UserRole.CLIENT
      return {
        userProfile: {
          id: user.id,
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          email: user.email,
          role: fallbackRole,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        role: fallbackRole
      }
    }
  } else if (profileError) {
    console.error('Error fetching user profile:', profileError)
    // Fallback to session data
    const fallbackRole = user.user_metadata?.role || UserRole.CLIENT
    return {
      userProfile: {
        id: user.id,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        email: user.email,
        role: fallbackRole,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      role: fallbackRole
    }
  }

  // User profile found
  return {
    userProfile: profile,
    role: profile.role
  }
} 