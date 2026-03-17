import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Appointment } from '@/domain/appointment/Appointment';
import { Professional } from '@/domain/professional/Professional';
import { Client } from '@/domain/client/Client';
import { Service } from '@/domain/service/Service';
import { UserRole } from '@/domain/user/UserRole';

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AppointmentDetailPage({ params }: PageProps) {
  const { id } = await params;
  const appointmentId = parseInt(id, 10);
  
  if (isNaN(appointmentId)) {
    redirect('/appointments');
  }
  
  // Create Supabase client
  const supabase = await createClient();
  
  // Check if user is logged in
  const { data: { session } } = await supabase.auth.getSession();
  
  // If user is not logged in, redirect to login
  if (!session) {
    redirect(`/login?redirect=/appointments/${id}`);
  }
  
  // Get user profile from database
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('email', session.user.email)
    .single();
  
  if (profileError) {
    console.error('Error fetching user profile:', profileError);
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Appointment Details</h1>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Error loading profile. Please try again later.
          </div>
        </div>
      </div>
    );
  }
  
  // Get user role
  const role = profile?.role || UserRole.CLIENT;
  
  // Variables to store user-specific IDs
  let clientId = null;
  let professionalId = null;
  
  // Get client or professional ID based on role
  if (role === UserRole.CLIENT) {
    const { data: clientData } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', profile.id)
      .single();
    
    clientId = clientData?.id;
  } else if (role === UserRole.PROFESSIONAL) {
    const { data: professionalData } = await supabase
      .from('professionals')
      .select('id')
      .eq('user_id', profile.id)
      .single();
    
    professionalId = professionalData?.id;
  }
  
  // Fetch appointment with related data
  const { data: appointmentData, error: appointmentError } = await supabase
    .from('appointments')
    .select(`
      *,
      clients:client_id(*),
      professionals:professional_id(*),
      services:service_id(*)
    `)
    .eq('id', appointmentId)
    .single();
  
  if (appointmentError) {
    console.error('Error fetching appointment:', appointmentError);
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Appointment Details</h1>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Error loading appointment. Please try again later.
          </div>
        </div>
      </div>
    );
  }
  
  // Check if user has permission to view this appointment
  if (role === UserRole.CLIENT && appointmentData.client_id !== clientId) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Appointment Details</h1>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            You do not have permission to view this appointment.
          </div>
        </div>
      </div>
    );
  }
  
  if (role === UserRole.PROFESSIONAL && appointmentData.professional_id !== professionalId) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Appointment Details</h1>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            You do not have permission to view this appointment.
          </div>
        </div>
      </div>
    );
  }
  
  // Convert database rows to domain entities
  const appointment = Appointment.fromDatabaseRow(appointmentData);
  
  // Add related entities if available
  if (appointmentData.professionals) {
    const professional = Professional.fromDatabaseRow(appointmentData.professionals);
    // @ts-ignore - TypeScript doesn't know about our custom methods
    appointment.setProfessionalEntity(professional);
  }
  
  if (appointmentData.clients) {
    const client = Client.fromDatabaseRow(appointmentData.clients);
    // @ts-ignore - TypeScript doesn't know about our custom methods
    appointment.setClientEntity(client);
  }
  
  if (appointmentData.services) {
    const service = Service.fromDatabaseRow(appointmentData.services);
    // @ts-ignore - TypeScript doesn't know about our custom methods
    appointment.setServiceEntity(service);
  }
  
  // Format date and time
  const formattedDateTime = appointment.formatDateTime();
  
  // Format price
  const formattedPrice = appointment.getService()?.formatPrice() || 'N/A';
  
  // Format duration
  const formattedDuration = appointment.getService()?.formatDuration() || 'N/A';
  
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Appointment Details</h1>
          <div className="flex space-x-4">
            <a 
              href="/appointments" 
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Back to Appointments
            </a>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Appointment header with status */}
          <div className="p-6 border-b">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center">
              <div>
                <h2 className="text-2xl font-semibold">
                  {appointment.getService()?.getName() || 'Unknown Service'}
                </h2>
                <p className="text-gray-600 mt-1">
                  {formattedDateTime}
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <span className={`px-4 py-2 rounded-full text-sm font-medium capitalize
                  ${appointment.getStatus() === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                  ${appointment.getStatus() === 'confirmed' ? 'bg-green-100 text-green-800' : ''}
                  ${appointment.getStatus() === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                  ${appointment.getStatus() === 'completed' ? 'bg-blue-100 text-blue-800' : ''}
                `}>
                  {appointment.getStatus()}
                </span>
              </div>
            </div>
          </div>
          
          {/* Appointment details */}
          <div className="p-6 space-y-6">
            {/* Service details */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Service Details</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600">Service Name</p>
                    <p className="font-medium">{appointment.getService()?.getName() || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Price</p>
                    <p className="font-medium">{formattedPrice}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Duration</p>
                    <p className="font-medium">{formattedDuration}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Professional details */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Professional Details</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600">Name</p>
                    <p className="font-medium">{appointment.getProfessional()?.getName() || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Specialty</p>
                    <p className="font-medium">{appointment.getProfessional()?.getSpecialty() || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Client details - only visible to professionals and admins */}
            {(role === UserRole.PROFESSIONAL || role === UserRole.ADMIN) && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Client Details</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-600">Name</p>
                      <p className="font-medium">{appointment.getClient()?.getName() || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Phone</p>
                      <p className="font-medium">{appointment.getClient()?.getPhone() || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Appointment actions */}
            <div className="pt-4 border-t">
              <h3 className="text-lg font-semibold mb-3">Actions</h3>
              <div className="flex flex-wrap gap-3">
                {/* Show different actions based on role and appointment status */}
                {appointment.getStatus() === 'pending' && (
                  <>
                    <a 
                      href={`/appointments/${appointment.getId()}/reschedule`}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                    >
                      Reschedule
                    </a>
                    
                    {role === UserRole.PROFESSIONAL && (
                      <form action={`/api/appointments/${appointment.getId()}/confirm`} method="POST">
                        <button 
                          type="submit"
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                          Confirm
                        </button>
                      </form>
                    )}
                    
                    <form action={`/api/appointments/${appointment.getId()}/cancel`} method="POST">
                      <button 
                        type="submit"
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                      >
                        Cancel
                      </button>
                    </form>
                  </>
                )}
                
                {appointment.getStatus() === 'confirmed' && (
                  <>
                    {appointment.canReschedule() && (
                      <a 
                        href={`/appointments/${appointment.getId()}/reschedule`}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                      >
                        Reschedule
                      </a>
                    )}
                    
                    {role === UserRole.PROFESSIONAL && (
                      <form action={`/api/appointments/${appointment.getId()}/complete`} method="POST">
                        <button 
                          type="submit"
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          Mark Completed
                        </button>
                      </form>
                    )}
                    
                    <form action={`/api/appointments/${appointment.getId()}/cancel`} method="POST">
                      <button 
                        type="submit"
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                      >
                        Cancel
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
