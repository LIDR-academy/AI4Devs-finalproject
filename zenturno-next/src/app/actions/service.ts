"use server";

import { createClient } from "@/lib/supabase/server";
import { Service } from "@/domain/service/Service";
import { UserRole } from "@/domain/user/UserRole";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/**
 * Create a new service
 * @param formData Form data containing service details
 * @returns Result object with success or error
 */
export async function createService(formData: FormData) {
  try {
    // Create Supabase client
    const supabase = await createClient();
    
    // Check if user is logged in and is an admin
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return { error: "You must be logged in to create a service" };
    }
    
    // Get user profile from database
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('email', session.user.email)
      .single();
    
    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return { error: "Error fetching user profile" };
    }
    
    // Check if user is an admin
    const role = profile?.role || session.user.user_metadata?.role || UserRole.CLIENT;
    
    if (role !== UserRole.ADMIN) {
      return { error: "Only administrators can create services" };
    }
    
    // Extract form data
    const name = formData.get('name') as string;
    const price = parseFloat(formData.get('price') as string);
    const durationMinutes = parseInt(formData.get('durationMinutes') as string, 10);
    
    // Validate form data
    if (!name) {
      return { error: "Service name is required" };
    }
    
    if (isNaN(price) || price < 0) {
      return { error: "Service price must be a non-negative number" };
    }
    
    if (isNaN(durationMinutes) || durationMinutes <= 0) {
      return { error: "Service duration must be a positive number" };
    }
    
    // Create service entity
    const service = Service.create({
      name,
      price,
      durationMinutes
    });
    
    // Insert service into database
    const { data: insertedService, error: insertError } = await supabase
      .from('services')
      .insert(service.toDatabaseInsertDto())
      .select()
      .single();
    
    if (insertError) {
      console.error('Error creating service:', insertError);
      return { error: 'Failed to create service' };
    }

    if (!insertedService) {
      return { error: 'Failed to create service - no data returned' };
    }
    
    // Revalidate services page
    revalidatePath('/services');
    
    // Redirect to services page
    redirect('/services');
  } catch (error) {
    console.error('Error creating service:', error);
    return { error: "An unexpected error occurred" };
  }
}

/**
 * Update an existing service
 * @param serviceId ID of the service to update
 * @param formData Form data containing updated service details
 * @returns Result object with success or error
 */
export async function updateService(serviceId: string, formData: FormData) {
  try {
    // Create Supabase client
    const supabase = await createClient();
    
    // Check if user is logged in and is an admin
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return { error: "You must be logged in to update a service" };
    }
    
    // Get user profile from database
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('email', session.user.email)
      .single();
    
    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return { error: "Error fetching user profile" };
    }
    
    // Check if user is an admin
    const role = profile?.role || session.user.user_metadata?.role || UserRole.CLIENT;
    
    if (role !== UserRole.ADMIN) {
      return { error: "Only administrators can update services" };
    }
    
    // Get service from database
    const { data: serviceData, error: serviceError } = await supabase
      .from('services')
      .select('*')
      .eq('id', serviceId)
      .single();
    
    if (serviceError) {
      console.error('Error fetching service:', serviceError);
      return { error: "Service not found" };
    }
    
    // Create service entity from database row
    const service = Service.fromDatabaseRow(serviceData);
    
    // Extract form data
    const name = formData.get('name') as string;
    const price = parseFloat(formData.get('price') as string);
    const durationMinutes = parseInt(formData.get('durationMinutes') as string, 10);
    
    // Validate form data
    if (!name) {
      return { error: "Service name is required" };
    }
    
    if (isNaN(price) || price < 0) {
      return { error: "Service price must be a non-negative number" };
    }
    
    if (isNaN(durationMinutes) || durationMinutes <= 0) {
      return { error: "Service duration must be a positive number" };
    }
    
    // Update service entity
    service.setName(name);
    service.setPrice(price);
    service.setDurationMinutes(durationMinutes);
    
    // Update service in database
    const { error: updateError } = await supabase
      .from('services')
      .update(service.toDatabaseUpdateDto())
      .eq('id', serviceId);
    
    if (updateError) {
      console.error('Error updating service:', updateError);
      return { error: "Error updating service" };
    }
    
    // Revalidate services page and service detail page
    revalidatePath('/services');
    revalidatePath(`/services/${serviceId}`);
    
    // Redirect to service detail page
    redirect(`/services/${serviceId}`);
  } catch (error) {
    console.error('Error updating service:', error);
    return { error: "An unexpected error occurred" };
  }
}

/**
 * Delete a service
 * @param serviceId ID of the service to delete
 * @returns Result object with success or error
 */
export async function deleteService(serviceId: string) {
  try {
    // Create Supabase client
    const supabase = await createClient();
    
    // Check if user is logged in and is an admin
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return { error: "You must be logged in to delete a service" };
    }
    
    // Get user profile from database
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('email', session.user.email)
      .single();
    
    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return { error: "Error fetching user profile" };
    }
    
    // Check if user is an admin
    const role = profile?.role || session.user.user_metadata?.role || UserRole.CLIENT;
    
    if (role !== UserRole.ADMIN) {
      return { error: "Only administrators can delete services" };
    }
    
    // Check if service is being used in any appointments
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('id')
      .eq('service_id', serviceId)
      .limit(1);
    
    if (appointmentsError) {
      console.error('Error checking appointments:', appointmentsError);
      return { error: "Error checking if service is in use" };
    }
    
    if (appointments && appointments.length > 0) {
      return { error: "Cannot delete a service that is being used in appointments" };
    }
    
    // Delete service from database
    const { error: deleteError } = await supabase
      .from('services')
      .delete()
      .eq('id', serviceId);
    
    if (deleteError) {
      console.error('Error deleting service:', deleteError);
      return { error: "Error deleting service" };
    }
    
    // Revalidate services page
    revalidatePath('/services');
    
    // Redirect to services page
    redirect('/services');
  } catch (error) {
    console.error('Error deleting service:', error);
    return { error: "An unexpected error occurred" };
  }
}

/**
 * Get all services
 * @returns Array of services
 */
export async function getServices() {
  try {
    // Create Supabase client
    const supabase = await createClient();
    
    // Get services from database
    const { data: services, error } = await supabase
      .from('services')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching services:', error);
      return [];
    }
    
    // Convert database rows to service entities
    return services.map(service => Service.fromDatabaseRow(service));
  } catch (error) {
    console.error('Error fetching services:', error);
    return [];
  }
}

/**
 * Get a service by ID
 * @param serviceId ID of the service to get
 * @returns Service entity or null if not found
 */
export async function getServiceById(serviceId: string) {
  try {
    // Create Supabase client
    const supabase = await createClient();
    
    // Get service from database
    const { data: service, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', serviceId)
      .single();
    
    if (error) {
      console.error('Error fetching service:', error);
      return null;
    }
    
    // Convert database row to service entity
    return Service.fromDatabaseRow(service);
  } catch (error) {
    console.error('Error fetching service:', error);
    return null;
  }
}
