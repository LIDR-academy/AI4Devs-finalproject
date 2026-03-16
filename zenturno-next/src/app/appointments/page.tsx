import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Appointment } from '@/domain/appointment/Appointment';
import { UserRole } from '@/domain/user/UserRole';
import { Professional } from '@/domain/professional/Professional';
import { Client } from '@/domain/client/Client';
import { Service } from '@/domain/service/Service';
import { getOrCreateUserProfile } from '@/lib/server-utils';
import Link from 'next/link';
import AppointmentListActions from './AppointmentListActions';

interface PageProps {
  searchParams: Promise<{ status?: string }>
}

export default async function AppointmentsPage({ searchParams }: PageProps) {
  // Await searchParams for Next.js 15 compatibility
  const { status } = await searchParams;
  
  // Create Supabase client
  const supabase = await createClient();
  
  // Check if user is logged in
  const { data: { session } } = await supabase.auth.getSession();
  
  // If user is not logged in, redirect to login
  if (!session) {
    redirect('/login?redirect=/appointments');
  }
  
  // Get or create user profile with robust error handling
  const { userProfile, role } = await getOrCreateUserProfile(session);

  if (!userProfile) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Appointments</h1>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Error loading profile. Please try again later.
          </div>
        </div>
      </div>
    );
  }
  
  // Filter by status if provided
  const statusFilter = status || 'all';
  
  // Variables to store appointments and related data
  let appointments = [];
  let clientId = null;
  let professionalId = null;
  
  // Get client or professional ID based on role
  if (role === UserRole.CLIENT) {
    const { data: clientData } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', userProfile.id)
      .single();
    
    clientId = clientData?.id;
    
    // If client doesn't exist, create one
    if (!clientData) {
      const { data: newClient, error: createClientError } = await supabase
        .from('clients')
        .insert({
          name: userProfile.name,
          user_id: userProfile.id
        })
        .select('id')
        .single();
      
      if (!createClientError) {
        clientId = newClient.id;
      }
    }
  } else if (role === UserRole.PROFESSIONAL) {
    const { data: professionalData } = await supabase
      .from('professionals')
      .select('id')
      .eq('user_id', userProfile.id)
      .single();
    
    professionalId = professionalData?.id;
    
    // If professional doesn't exist, create one
    if (!professionalData) {
      const { data: newProfessional, error: createProfessionalError } = await supabase
        .from('professionals')
        .insert({
          name: userProfile.name,
          user_id: userProfile.id
        })
        .select('id')
        .single();
      
      if (!createProfessionalError) {
        professionalId = newProfessional.id;
      }
    }
  }
  
  // Fetch appointments based on role
  if (role === UserRole.CLIENT && clientId) {
    let query = supabase
      .from('appointments')
      .select(`
        *,
        professionals:professional_id(*),
        services:service_id(*)
      `)
      .eq('client_id', clientId)
      .order('date', { ascending: true });
    
    // Apply status filter if not 'all'
    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching appointments:', error);
    } else {
      appointments = data || [];
    }
  } else if (role === UserRole.PROFESSIONAL && professionalId) {
    let query = supabase
      .from('appointments')
      .select(`
        *,
        clients:client_id(*),
        services:service_id(*)
      `)
      .eq('professional_id', professionalId)
      .order('date', { ascending: true });
    
    // Apply status filter if not 'all'
    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching appointments:', error);
    } else {
      appointments = data || [];
    }
  } else if (role === UserRole.ADMIN) {
    // Admins can see all appointments
    let query = supabase
      .from('appointments')
      .select(`
        *,
        clients:client_id(*),
        professionals:professional_id(*),
        services:service_id(*)
      `)
      .order('date', { ascending: true });
    
    // Apply status filter if not 'all'
    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching appointments:', error);
    } else {
      appointments = data || [];
    }
  }
  
  // Convert database rows to domain entities
  const appointmentEntities = appointments.map((appointmentData) => {
    const appointment = Appointment.fromDatabaseRow(appointmentData);
    
    // Add related entities if available
    if (appointmentData.professionals) {
      const professional = Professional.fromDatabaseRow(appointmentData.professionals);
      appointment.setProfessionalEntity(professional);
    }
    
    if (appointmentData.clients) {
      const client = Client.fromDatabaseRow(appointmentData.clients);
      appointment.setClientEntity(client);
    }
    
    if (appointmentData.services) {
      const service = Service.fromDatabaseRow(appointmentData.services);
      appointment.setServiceEntity(service);
    }
    
    return appointment;
  });
  
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Appointments</h1>
          <div className="flex space-x-4">
            <Link 
              href="/dashboard" 
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Dashboard
            </Link>
            {role === UserRole.CLIENT && (
              <Link 
                href="/appointments/book" 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Book New Appointment
              </Link>
            )}
          </div>
        </div>
        
        {/* Status filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <Link 
              href="/appointments"
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                statusFilter === 'all' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              All
            </Link>
            <Link 
              href="/appointments?status=pending"
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                statusFilter === 'pending' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Pending
            </Link>
            <Link 
              href="/appointments?status=confirmed"
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                statusFilter === 'confirmed' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Confirmed
            </Link>
            <Link 
              href="/appointments?status=cancelled"
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                statusFilter === 'cancelled' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Cancelled
            </Link>
            <Link 
              href="/appointments?status=completed"
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                statusFilter === 'completed' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Completed
            </Link>
          </div>
        </div>
        
        {/* Appointments list */}
        {appointmentEntities.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-gray-600 text-center py-8">
              No appointments found. 
              {role === UserRole.CLIENT && (
                <Link href="/appointments/book" className="text-blue-600 ml-1 hover:underline font-medium">
                  Book an appointment
                </Link>
              )}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointmentEntities.map((appointment) => (
              <div 
                key={appointment.getId()} 
                className="bg-white shadow rounded-lg p-6"
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                  <div>
                    <h3 className="text-xl font-semibold">
                      {appointment.getService()?.getName() || 'Unknown Service'}
                    </h3>
                    <p className="text-gray-600">
                      {appointment.formatDateTime()}
                    </p>
                    
                    {role === UserRole.CLIENT && appointment.getProfessional() && (
                      <p className="mt-2">
                        <span className="text-gray-600">Professional:</span>{' '}
                        <span className="font-medium">{appointment.getProfessional()?.getName()}</span>
                      </p>
                    )}
                    
                    {(role === UserRole.PROFESSIONAL || role === UserRole.ADMIN) && appointment.getClient() && (
                      <p className="mt-2">
                        <span className="text-gray-600">Client:</span>{' '}
                        <span className="font-medium">{appointment.getClient()?.getName()}</span>
                        {appointment.getClient()?.getPhone() && (
                          <span className="text-gray-600 ml-1">
                            ({appointment.getClient()?.getPhone()})
                          </span>
                        )}
                      </p>
                    )}
                    
                    {appointment.getService() && (
                      <p className="mt-2">
                        <span className="text-gray-600">Service:</span>{' '}
                        <span className="font-medium">{appointment.getService()?.getName()}</span>
                        <span className="text-gray-600 ml-1">
                          ({appointment.getService()?.formatDuration()}, 
                          {appointment.getService()?.formatPrice()})
                        </span>
                      </p>
                    )}
                  </div>
                  
                  <div className="mt-4 md:mt-0 flex flex-col items-start md:items-end">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize
                      ${appointment.getStatus() === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${appointment.getStatus() === 'confirmed' ? 'bg-green-100 text-green-800' : ''}
                      ${appointment.getStatus() === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                      ${appointment.getStatus() === 'completed' ? 'bg-blue-100 text-blue-800' : ''}
                    `}>
                      {appointment.getStatus()}
                    </span>
                    
                    <div className="mt-4 flex flex-wrap gap-2">
                      <AppointmentListActions
                        appointmentId={appointment.getId()}
                        status={appointment.getStatus()}
                        canReschedule={appointment.canReschedule()}
                        userRole={role}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
