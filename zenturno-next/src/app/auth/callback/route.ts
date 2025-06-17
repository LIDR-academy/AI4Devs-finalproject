import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const error = requestUrl.searchParams.get('error')
    const errorCode = requestUrl.searchParams.get('error_code')
    const errorDescription = requestUrl.searchParams.get('error_description')
    const origin = requestUrl.origin
    const redirectTo = requestUrl.searchParams.get('redirect_to') ?? '/dashboard'

    // Handle Supabase auth errors
    if (error) {
      console.error('Supabase auth error:', { error, errorCode, errorDescription })
      
      let errorMessage = 'Authentication failed'
      
      if (errorCode === 'otp_expired') {
        errorMessage = 'Email confirmation link has expired. Please request a new one.'
      } else if (errorCode === 'signup_disabled') {
        errorMessage = 'Signup is currently disabled.'
      } else if (errorDescription) {
        errorMessage = decodeURIComponent(errorDescription)
      }
      
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(errorMessage)}`)
    }

    if (!code) {
      console.error('No authorization code provided')
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('No authorization code received')}`)
    }

    const supabase = await createClient()
    
    // Exchange the authorization code for a session
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (exchangeError) {
      console.error('Error exchanging code for session:', exchangeError)
      
      let errorMessage = 'Failed to confirm email'
      if (exchangeError.message) {
        errorMessage = exchangeError.message
      }
      
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(errorMessage)}`)
    }

    if (!data?.user) {
      console.error('No user data received after code exchange')
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('No user data received')}`)
    }

    console.log('Successfully authenticated user:', data.user.email)

    // Create user record in our custom tables if needed
    await createUserRecord(supabase, data.user)

    // Redirect to the intended destination with a success message
    return NextResponse.redirect(`${origin}${redirectTo}?message=${encodeURIComponent('Email confirmed successfully!')}`)

  } catch (error) {
    console.error('Unexpected error in auth callback:', error)
    const origin = new URL(request.url).origin
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('An unexpected error occurred')}`)
  }
}

async function createUserRecord(supabase: any, user: any) {
  try {
    // Check if user record exists
    const { data: existingUser, error: userCheckError } = await supabase
      .from('users')
      .select('*')
      .eq('email', user.email)
      .single()

    // If user doesn't exist, create user record
    if (userCheckError?.code === 'PGRST116' || !existingUser) {
      console.log('Creating user record for:', user.email)
      
      const userMetadata = user.user_metadata || {}
      const name = userMetadata.name || user.email?.split('@')[0] || 'User'
      
      // Ensure role is never empty and is a valid value
      let role = userMetadata.role || ''
      // Validate role - must be either 'client' or 'professional', default to 'client' if invalid
      role = (role === 'client' || role === 'professional') ? role : 'client'
      console.log(`Using role: ${role} for user: ${user.email}`)
      
      const phone = userMetadata.phone
      const specialty = userMetadata.specialty

      // First, let's check what columns are available in the users table
      const { data: tableInfo, error: tableError } = await supabase
        .from('users')
        .select('*')
        .limit(1)

      if (tableError && tableError.code !== 'PGRST116') {
        console.error('Error checking users table schema:', tableError)
        return
      }

      // Create user record with flexible schema
      const userInsertData: any = {
        email: user.email,
        role: role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Add name field if it exists in the schema, otherwise try common alternatives
      if (tableInfo && tableInfo.length === 0) {
        // Table is empty, we can try with name
        userInsertData.name = name
      } else {
        // Try to determine if name column exists by checking the first row
        // For now, let's try different possible column names
        userInsertData.name = name // We'll handle the error if this fails
      }

      const { data: newUser, error: createUserError } = await supabase
        .from('users')
        .insert(userInsertData)
        .select()
        .single()

      if (createUserError) {
        console.error('Error creating user record:', createUserError)
        
        // If it's a column not found error, try with alternative schema
        if (createUserError.code === 'PGRST204') {
          console.log('Trying alternative user schema without name column...')
          
          const alternativeUserData = {
            email: user.email,
            role: role,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }

          const { data: newUserAlt, error: createUserErrorAlt } = await supabase
            .from('users')
            .insert(alternativeUserData)
            .select()
            .single()

          if (createUserErrorAlt) {
            console.error('Error creating user record with alternative schema:', createUserErrorAlt)
            return
          }

          console.log('Successfully created user record with alternative schema:', newUserAlt.id)
          await createRoleSpecificRecord(supabase, newUserAlt, role, name, phone, specialty)
        }
        return
      }

      console.log('Successfully created user record:', newUser.id)
      await createRoleSpecificRecord(supabase, newUser, role, name, phone, specialty)
    } else {
      console.log('User record already exists')
    }
  } catch (error) {
    console.error('Error in createUserRecord:', error)
  }
}

async function createRoleSpecificRecord(supabase: any, newUser: any, role: string, name: string, phone?: string, specialty?: string) {
  try {
    // Validate and normalize role - default to client if empty or invalid
    const normalizedRole = (!role || (role !== 'client' && role !== 'professional')) 
      ? 'client' 
      : role;
    
    console.log(`Creating ${normalizedRole} record for user: ${newUser.id}, email: ${newUser.email}`);
    
    if (normalizedRole === 'client' && newUser.id) {
      await createClientRecord(supabase, newUser, name, phone || '');
    } else if (normalizedRole === 'professional' && newUser.id) {
      await createProfessionalRecord(supabase, newUser, name, specialty || '');
    } else {
      console.error(`Failed to create role-specific record: Invalid user ID or role. User ID: ${newUser?.id}, Role: ${normalizedRole}`);
    }
  } catch (error) {
    console.error('Error creating role-specific record:', error);
  }
}

async function createClientRecord(supabase: any, newUser: any, name: string, phone: string) {
  // Try different schema combinations for clients table
  const schemaCombinations = [
    // Full schema with name and phone
    {
      name: name,
      phone: phone,
      user_id: newUser.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    // Without name column
    {
      phone: phone,
      user_id: newUser.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    // Without phone column
    {
      name: name,
      user_id: newUser.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    // Minimal schema - just user_id
    {
      user_id: newUser.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]

  for (let i = 0; i < schemaCombinations.length; i++) {
    const clientInsertData = schemaCombinations[i]
    console.log(`Trying clients schema combination ${i + 1}:`, Object.keys(clientInsertData))
    
    const { error: clientError } = await supabase
      .from('clients')
      .insert(clientInsertData)

    if (!clientError) {
      console.log('Successfully created client record with schema combination', i + 1)
      return
    } else if (clientError.code === 'PGRST204') {
      console.log(`Schema combination ${i + 1} failed (column not found):`, clientError.message)
      // Try next combination
      continue
    } else {
      // Other error types - log and stop trying
      console.error('Error creating client record (non-schema error):', clientError)
      return
    }
  }

  console.log('Could not create client record with any schema combination - table may not exist or have different structure')
}

async function createProfessionalRecord(supabase: any, newUser: any, name: string, specialty: string) {
  // Try different schema combinations for professionals table
  const schemaCombinations = [
    // Full schema with name and specialty
    {
      name: name,
      specialty: specialty,
      user_id: newUser.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    // Without name column
    {
      specialty: specialty,
      user_id: newUser.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    // Without specialty column
    {
      name: name,
      user_id: newUser.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    // Minimal schema - just user_id
    {
      user_id: newUser.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]

  for (let i = 0; i < schemaCombinations.length; i++) {
    const profInsertData = schemaCombinations[i]
    console.log(`Trying professionals schema combination ${i + 1}:`, Object.keys(profInsertData))
    
    const { error: profError } = await supabase
      .from('professionals')
      .insert(profInsertData)

    if (!profError) {
      console.log('Successfully created professional record with schema combination', i + 1)
      return
    } else if (profError.code === 'PGRST204') {
      console.log(`Schema combination ${i + 1} failed (column not found):`, profError.message)
      // Try next combination
      continue
    } else {
      // Other error types - log and stop trying
      console.error('Error creating professional record (non-schema error):', profError)
      return
    }
  }

  console.log('Could not create professional record with any schema combination - table may not exist or have different structure')
} 