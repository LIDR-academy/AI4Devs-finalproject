'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { User } from '@/domain/user/User';
import { UserRole } from '@/domain/user/UserRole';

/**
 * Updates the user profile
 */
export async function updateProfile(formData: FormData) {
  // Create Supabase client
  const supabase = await createClient();
  
  // Check if user is logged in
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return { error: 'Not authenticated' };
  }
  
  try {
    // Get form data
    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    const specialty = formData.get('specialty') as string;
    
    // Validate name
    if (!name || name.trim() === '') {
      return { error: 'Name is required' };
    }
    
    // Get user from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', session.user.email)
      .single();
    
    if (userError) {
      console.error('Error fetching user:', userError);
      return { error: 'Failed to fetch user data' };
    }
    
    // Create user entity for business logic
    const user = User.fromDatabaseRow(userData);
    
    // Update user name directly in database (since User class is immutable)
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        name: name.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', user.getId());
    
    if (updateError) {
      console.error('Error updating user:', updateError);
      return { error: 'Failed to update user data' };
    }
    
    // Handle role-specific updates
    const role = user.getRole().getValue();
    
    if (role === UserRole.CLIENT && phone) {
      // Get client data
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.getId())
        .single();
      
      if (clientError && clientError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error fetching client:', clientError);
        return { error: 'Failed to fetch client data' };
      }
      
      if (clientData) {
        // Update existing client directly
        const { error: updateClientError } = await supabase
          .from('clients')
          .update({
            name: name.trim(),
            phone: phone.trim(),
            updated_at: new Date().toISOString()
          })
          .eq('id', clientData.id);
        
        if (updateClientError) {
          console.error('Error updating client:', updateClientError);
          return { error: 'Failed to update client data' };
        }
      } else {
        // Create new client
        const { error: insertClientError } = await supabase
          .from('clients')
          .insert({
            name: name.trim(),
            phone: phone.trim(),
            user_id: user.getId()
          });
        
        if (insertClientError) {
          console.error('Error creating client:', insertClientError);
          return { error: 'Failed to create client data' };
        }
      }
    } else if (role === UserRole.PROFESSIONAL && specialty) {
      // Get professional data
      const { data: professionalData, error: professionalError } = await supabase
        .from('professionals')
        .select('*')
        .eq('user_id', user.getId())
        .single();
      
      if (professionalError && professionalError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error fetching professional:', professionalError);
        return { error: 'Failed to fetch professional data' };
      }
      
      if (professionalData) {
        // Update existing professional directly
        const { error: updateProfessionalError } = await supabase
          .from('professionals')
          .update({
            name: name.trim(),
            specialty: specialty.trim(),
            updated_at: new Date().toISOString()
          })
          .eq('id', professionalData.id);
        
        if (updateProfessionalError) {
          console.error('Error updating professional:', updateProfessionalError);
          return { error: 'Failed to update professional data' };
        }
      } else {
        // Create new professional
        const { error: insertProfessionalError } = await supabase
          .from('professionals')
          .insert({
            name: name.trim(),
            specialty: specialty.trim(),
            user_id: user.getId()
          });
        
        if (insertProfessionalError) {
          console.error('Error creating professional:', insertProfessionalError);
          return { error: 'Failed to create professional data' };
        }
      }
    }
    
    // Redirect to profile page
    redirect('/profile?updated=true');
  } catch (error) {
    console.error('Error updating profile:', error);
    return { error: 'An unexpected error occurred' };
  }
}
