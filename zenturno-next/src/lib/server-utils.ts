import { createClient } from '@/lib/supabase/server'
import { UserRole } from '@/domain/user/UserRole'

type UserProfile = {
  id: string;
  first_name: string;
  last_name: string | null;
  email: string;
  role: string;
  phone: string | null;
  created_at: string;
  updated_at: string;
};

/**
 * Get or create user profile with robust error handling
 * This function handles cases where user might not exist in custom tables
 */
export async function getOrCreateUserProfile() {
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
      // Ensure role is never empty and is a valid value
      let role = user.user_metadata?.role || ''
      // Validate role - must be either 'client' or 'professional', default to 'client' if invalid
      role = (role === 'client' || role === 'professional') ? role : UserRole.CLIENT
      console.log(`Using role: ${role} for user: ${user.email}`)
      const name = user.user_metadata?.first_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User'
      const phone = user.user_metadata?.phone || null
      const specialty = user.user_metadata?.specialty || null
      
      // Try to create user record with flexible schema
      const userInsertData: {
        email: string;
        role: string;
        first_name: string;
        last_name: string | null;
        phone: string | null;
        created_at: string;
        updated_at: string;
      } = {
        email: user.email || '',
        role: role,
        first_name: name,
        last_name: user.user_metadata?.last_name || null,
        phone: phone,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert(userInsertData)
        .select()
        .single()

      if (createError) {
        console.error('Error creating user profile:', createError)
        // Fallback to session data
        const fallbackProfile = {
          id: user.id,
          first_name: name,
          last_name: user.user_metadata?.last_name || null,
          email: user.email || '',
          role: role,
          phone: phone,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        return {
          userProfile: fallbackProfile,
          role: role
        }
      }
      
      // Create role-specific record
      await createRoleSpecificRecord(supabase, newUser, role, name, phone, specialty)

      return {
        userProfile: newUser,
        role: newUser.role
      }
    } catch (error) {
      console.error('Unexpected error creating user profile:', error)
      // Fallback to session data
      const fallbackRole = user.user_metadata?.role || UserRole.CLIENT
      const fallbackProfile = {
        id: user.id,
        first_name: user.user_metadata?.first_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        last_name: user.user_metadata?.last_name || null,
        email: user.email || '',
        role: fallbackRole,
        phone: user.user_metadata?.phone || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      return {
        userProfile: fallbackProfile,
        role: fallbackRole
      }
    }
  } else if (profileError) {
    console.error('Error fetching user profile:', profileError)
    // Fallback to session data
    const fallbackRole = user.user_metadata?.role || UserRole.CLIENT
    const fallbackProfile = {
      id: user.id,
      first_name: user.user_metadata?.first_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
      last_name: user.user_metadata?.last_name || null,
      email: user.email || '',
      role: fallbackRole,
      phone: user.user_metadata?.phone || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    return {
      userProfile: fallbackProfile,
      role: fallbackRole
    }
  }

  // User profile found - check if role-specific record exists
  await ensureRoleSpecificRecordExists(supabase, profile, profile.role)

  // User profile found
  return {
    userProfile: profile,
    role: profile.role
  }
}

/**
 * Create role-specific record (client or professional) based on user role
 */
async function createRoleSpecificRecord(
  supabase: any,
  user: UserProfile,
  role: string,
  name: string,
  phone?: string | null,
  specialty?: string | null
) {
  try {
    // Validate and normalize role - default to client if empty or invalid
    const normalizedRole = (!role || (role !== 'client' && role !== 'professional')) 
      ? 'client' 
      : role;
    
    console.log(`Creating ${normalizedRole} record for user: ${user.id}, email: ${user.email}`);
    
    if (normalizedRole === 'client' && user.id) {
      await createClientRecord(supabase, user, name, phone);
    } else if (normalizedRole === 'professional' && user.id) {
      await createProfessionalRecord(supabase, user, name, specialty);
    } else {
      console.error(`Failed to create role-specific record: Invalid user ID or role. User ID: ${user?.id}, Role: ${normalizedRole}`);
    }
  } catch (error) {
    console.error('Error creating role-specific record:', error);
  }
}

/**
 * Create client record in the clients table
 */
async function createClientRecord(
  supabase: any,
  user: UserProfile,
  name: string,
  phone?: string | null
) {
  try {
    // Check if client record already exists
    const { data: existingClient } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingClient) {
      console.log('Client record already exists for user:', user.id);
      return;
    }

    // Create client record
    const clientData = {
      name: name,
      phone: phone || null,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { error: clientError } = await supabase
      .from('clients')
      .insert(clientData);

    if (clientError) {
      console.error('Error creating client record:', clientError);
      
      // Try alternative schema without name field
      if (clientError.code === 'PGRST204') {
        const alternativeClientData = {
          user_id: user.id,
          phone: phone || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        const { error: altClientError } = await supabase
          .from('clients')
          .insert(alternativeClientData);
          
        if (altClientError) {
          console.error('Error creating client record with alternative schema:', altClientError);
        } else {
          console.log('Successfully created client record with alternative schema for user:', user.id);
        }
      }
    } else {
      console.log('Successfully created client record for user:', user.id);
    }
  } catch (error) {
    console.error('Error in createClientRecord:', error);
  }
}

/**
 * Create professional record in the professionals table
 */
async function createProfessionalRecord(
  supabase: any,
  user: UserProfile,
  name: string,
  specialty?: string | null
) {
  try {
    // Check if professional record already exists
    const { data: existingProfessional } = await supabase
      .from('professionals')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingProfessional) {
      console.log('Professional record already exists for user:', user.id);
      return;
    }

    // Create professional record
    const professionalData = {
      name: name,
      specialty: specialty || null,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { error: professionalError } = await supabase
      .from('professionals')
      .insert(professionalData);

    if (professionalError) {
      console.error('Error creating professional record:', professionalError);
      
      // Try alternative schema without name field
      if (professionalError.code === 'PGRST204') {
        const alternativeProfessionalData = {
          user_id: user.id,
          specialty: specialty || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        const { error: altProfessionalError } = await supabase
          .from('professionals')
          .insert(alternativeProfessionalData);
          
        if (altProfessionalError) {
          console.error('Error creating professional record with alternative schema:', altProfessionalError);
        } else {
          console.log('Successfully created professional record with alternative schema for user:', user.id);
        }
      }
    } else {
      console.log('Successfully created professional record for user:', user.id);
    }
  } catch (error) {
    console.error('Error in createProfessionalRecord:', error);
  }
}

/**
 * Ensure role-specific record exists for an existing user
 */
async function ensureRoleSpecificRecordExists(
  supabase: any,
  user: UserProfile,
  role: string
) {
  try {
    // Validate and normalize role - default to client if empty or invalid
    const normalizedRole = (!role || (role !== 'client' && role !== 'professional')) 
      ? 'client' 
      : role;
      
    console.log(`Ensuring ${normalizedRole} record exists for user: ${user.id}, email: ${user.email}`);
    
    if (normalizedRole === 'client') {
      // Check if client record exists
      const { data: existingClient } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!existingClient) {
        // Create client record if it doesn't exist
        await createClientRecord(
          supabase,
          user,
          user.first_name,
          user.phone
        );
      }
    } else if (normalizedRole === 'professional') {
      // Check if professional record exists
      const { data: existingProfessional } = await supabase
        .from('professionals')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!existingProfessional) {
        // Create professional record if it doesn't exist
        await createProfessionalRecord(
          supabase,
          user,
          user.first_name,
          null // We don't have specialty info here, so set to null
        );
      }
    }
  } catch (error) {
    console.error('Error in ensureRoleSpecificRecordExists:', error);
  }
}