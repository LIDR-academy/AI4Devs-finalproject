'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Appointment, AppointmentStatus } from '@/domain/appointment/Appointment';
import { UserRole } from '@/domain/user/UserRole';

/**
 * Creates a new appointment
 */
export async function createAppointment(formData: FormData) {
  // Create Supabase client
  const supabase = await createClient();
  
  // Check if user is logged in
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return { error: 'Not authenticated' };
  }
  
  try {
    // Get form data
    const dateTimeStr = formData.get('dateTime') as string;
    const professionalId = formData.get('professionalId') as string;
    const serviceId = formData.get('serviceId') as string;
    
    // Validate required fields
    if (!dateTimeStr || !professionalId || !serviceId) {
      return { 
        error: 'Missing required fields',
        fields: {
          dateTime: !dateTimeStr ? 'Date and time is required' : undefined,
          professionalId: !professionalId ? 'Professional is required' : undefined,
          serviceId: !serviceId ? 'Service is required' : undefined
        }
      };
    }
    
    // Parse date
    const dateTime = new Date(dateTimeStr);
    
    // Validate date is in the future
    if (dateTime < new Date()) {
      return { 
        error: 'Date and time must be in the future',
        fields: {
          dateTime: 'Date and time must be in the future'
        }
      };
    }
    
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('email', session.user.email)
      .single();
    
    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return { error: 'Failed to fetch user profile' };
    }
    
    // Check if user is a client
    if (profile.role !== UserRole.CLIENT) {
      return { error: 'Only clients can book appointments' };
    }
    
    // Get client ID
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', profile.id)
      .single();
    
    let clientId;
    
    if (clientError) {
      // If client record doesn't exist, create one
      if (clientError.code === 'PGRST116') { // PGRST116 is "no rows returned"
        const { data: newClient, error: createClientError } = await supabase
          .from('clients')
          .insert({
            name: profile.name,
            user_id: profile.id
          })
          .select('id')
          .single();
        
        if (createClientError) {
          console.error('Error creating client record:', createClientError);
          return { error: 'Failed to create client record' };
        }
        
        clientId = newClient.id;
      } else {
        console.error('Error fetching client record:', clientError);
        return { error: 'Failed to fetch client record' };
      }
    } else {
      clientId = clientData.id;
    }
    
    // Insert appointment directly into database with correct field names
    const { data: appointmentData, error: insertError } = await supabase
      .from('appointments')
      .insert({
        client_id: clientId,
        professional_id: professionalId,
        service_id: serviceId,
        date: dateTime.toISOString(),
        status: 'pending',
        notes: ''
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('Error creating appointment:', insertError);
      return { error: 'Failed to create appointment: ' + insertError.message };
    }
    
  } catch (error) {
    console.error('Error creating appointment:', error);
    return { error: 'An unexpected error occurred' };
  }
  
  // Redirect to appointments page (outside try/catch to avoid catching NEXT_REDIRECT)
  redirect('/appointments?status=pending');
}

/**
 * Updates an appointment's status
 */
export async function updateAppointmentStatus(
  appointmentId: number,
  status: AppointmentStatus
) {
  // Create Supabase client
  const supabase = await createClient();
  
  // Check if user is logged in
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return { error: 'Not authenticated' };
  }
  
  try {
    // Get appointment
    const { data: appointmentData, error: appointmentError } = await supabase
      .from('appointments')
      .select(`
        *,
        clients:client_id(*),
        professionals:professional_id(*)
      `)
      .eq('id', appointmentId)
      .single();
    
    if (appointmentError) {
      console.error('Error fetching appointment:', appointmentError);
      return { error: 'Failed to fetch appointment' };
    }
    
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('email', session.user.email)
      .single();
    
    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return { error: 'Failed to fetch user profile' };
    }
    
    // Check permissions based on role
    const role = profile.role;
    
    if (role === UserRole.CLIENT) {
      // Get client ID
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', profile.id)
        .single();
      
      if (clientError) {
        console.error('Error fetching client record:', clientError);
        return { error: 'Failed to fetch client record' };
      }
      
      // Clients can only cancel their own appointments
      if (appointmentData.client_id !== clientData.id) {
        return { error: 'You can only manage your own appointments' };
      }
      
      // Clients can only cancel appointments
      if (status !== 'cancelled') {
        return { error: 'Clients can only cancel appointments' };
      }
    } else if (role === UserRole.PROFESSIONAL) {
      // Get professional ID
      const { data: professionalData, error: professionalError } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', profile.id)
        .single();
      
      if (professionalError) {
        console.error('Error fetching professional record:', professionalError);
        return { error: 'Failed to fetch professional record' };
      }
      
      // Professionals can only manage their own appointments
      if (appointmentData.professional_id !== professionalData.id) {
        return { error: 'You can only manage your own appointments' };
      }
      
      // Professionals can confirm, cancel, or complete appointments
      if (!['confirmed', 'cancelled', 'completed'].includes(status)) {
        return { error: 'Invalid status update' };
      }
    } else if (role !== UserRole.ADMIN) {
      return { error: 'You do not have permission to manage appointments' };
    }
    
    // Create appointment entity
    const appointment = Appointment.fromDatabaseRow(appointmentData);
    
    // Update status based on requested action
    if (status === 'confirmed') {
      appointment.confirm();
    } else if (status === 'cancelled') {
      appointment.cancel();
    } else if (status === 'completed') {
      appointment.complete();
    } else {
      appointment.setStatus(status);
    }
    
    // Update appointment in database
    const { error: updateError } = await supabase
      .from('appointments')
      .update({
        status: appointment.getStatus(),
        updated_at: new Date().toISOString()
      })
      .eq('id', appointmentId);
    
    if (updateError) {
      console.error('Error updating appointment:', updateError);
      return { error: 'Failed to update appointment' };
    }
    
    // Redirect to appointments page
    redirect(`/appointments?status=${status}`);
  } catch (error) {
    console.error('Error updating appointment:', error);
    return { error: 'An unexpected error occurred' };
  }
  
  return { success: true };
}

/**
 * Confirms an appointment
 */
export async function confirmAppointment(appointmentId: number) {
  return updateAppointmentStatus(appointmentId, 'confirmed');
}

/**
 * Cancels an appointment
 */
export async function cancelAppointment(appointmentId: number) {
  return updateAppointmentStatus(appointmentId, 'cancelled');
}

/**
 * Completes an appointment
 */
export async function completeAppointment(appointmentId: number) {
  return updateAppointmentStatus(appointmentId, 'completed');
}

/**
 * Reschedules an appointment
 */
export async function rescheduleAppointment(
  appointmentId: number,
  formData: FormData
) {
  // Create Supabase client
  const supabase = await createClient();
  
  // Check if user is logged in
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return { error: 'Not authenticated' };
  }
  
  try {
    // Get form data
    const dateTimeStr = formData.get('dateTime') as string;
    
    // Validate required fields
    if (!dateTimeStr) {
      return { 
        error: 'Missing required fields',
        fields: {
          dateTime: 'Date and time is required'
        }
      };
    }
    
    // Parse date
    const dateTime = new Date(dateTimeStr);
    
    // Validate date is in the future
    if (dateTime < new Date()) {
      return { 
        error: 'Date and time must be in the future',
        fields: {
          dateTime: 'Date and time must be in the future'
        }
      };
    }
    
    // Get appointment
    const { data: appointmentData, error: appointmentError } = await supabase
      .from('appointments')
      .select(`
        *,
        clients:client_id(*),
        professionals:professional_id(*)
      `)
      .eq('id', appointmentId)
      .single();
    
    if (appointmentError) {
      console.error('Error fetching appointment:', appointmentError);
      return { error: 'Failed to fetch appointment' };
    }
    
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('email', session.user.email)
      .single();
    
    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return { error: 'Failed to fetch user profile' };
    }
    
    // Check permissions based on role
    const role = profile.role;
    
    if (role === UserRole.CLIENT) {
      // Get client ID
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', profile.id)
        .single();
      
      if (clientError) {
        console.error('Error fetching client record:', clientError);
        return { error: 'Failed to fetch client record' };
      }
      
      // Clients can only reschedule their own appointments
      if (appointmentData.client_id !== clientData.id) {
        return { error: 'You can only manage your own appointments' };
      }
    } else if (role === UserRole.PROFESSIONAL) {
      // Get professional ID
      const { data: professionalData, error: professionalError } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', profile.id)
        .single();
      
      if (professionalError) {
        console.error('Error fetching professional record:', professionalError);
        return { error: 'Failed to fetch professional record' };
      }
      
      // Professionals can only reschedule their own appointments
      if (appointmentData.professional_id !== professionalData.id) {
        return { error: 'You can only manage your own appointments' };
      }
    } else if (role !== UserRole.ADMIN) {
      return { error: 'You do not have permission to manage appointments' };
    }
    
    // Create appointment entity
    const appointment = Appointment.fromDatabaseRow(appointmentData);
    
    // Check if appointment can be rescheduled
    if (!appointment.canReschedule()) {
      return { error: 'This appointment cannot be rescheduled' };
    }
    
    // Update appointment date and time
    appointment.setDateTime(dateTime);
    
    // Update appointment in database
    const { error: updateError } = await supabase
      .from('appointments')
      .update({
        date: dateTime.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', appointmentId);
    
    if (updateError) {
      console.error('Error rescheduling appointment:', updateError);
      return { error: 'Failed to reschedule appointment' };
    }
    
    // Redirect to appointments page
    redirect(`/appointments?status=${appointment.getStatus()}`);
  } catch (error) {
    console.error('Error rescheduling appointment:', error);
    return { error: 'An unexpected error occurred' };
  }
  
  return { success: true };
}
