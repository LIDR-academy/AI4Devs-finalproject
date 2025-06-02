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

export default async function RescheduleAppointmentPage({ params }: PageProps) {
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
    redirect(`/login?redirect=/appointments/${id}/reschedule`);
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
          <h1 className="text-3xl font-bold mb-8">Reschedule Appointment</h1>
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
          <h1 className="text-3xl font-bold mb-8">Reschedule Appointment</h1>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Error loading appointment. Please try again later.
          </div>
        </div>
      </div>
    );
  }
  
  // Check if user has permission to reschedule this appointment
  if (role === UserRole.CLIENT && appointmentData.client_id !== clientId) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Reschedule Appointment</h1>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            You do not have permission to reschedule this appointment.
          </div>
        </div>
      </div>
    );
  }
  
  if (role === UserRole.PROFESSIONAL && appointmentData.professional_id !== professionalId) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Reschedule Appointment</h1>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            You do not have permission to reschedule this appointment.
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
  
  // Check if appointment can be rescheduled
  if (!appointment.canReschedule()) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Reschedule Appointment</h1>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            This appointment cannot be rescheduled. Only pending or confirmed appointments can be rescheduled.
          </div>
        </div>
      </div>
    );
  }
  
  // Format current date and time
  const formattedDateTime = appointment.formatDateTime();
  
  // Get current date and time for the date input
  const currentDateTime = new Date(appointmentData.date_time);
  const currentDate = currentDateTime.toISOString().split('T')[0];
  const currentTime = currentDateTime.toTimeString().slice(0, 5);
  
  // Generate available time slots
  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 9; // 9 AM
    const endHour = 17; // 5 PM
    const interval = 30; // 30 minutes
    
    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        if (hour === endHour && minute > 0) continue;
        
        const formattedHour = hour.toString().padStart(2, '0');
        const formattedMinute = minute.toString().padStart(2, '0');
        const time = `${formattedHour}:${formattedMinute}`;
        
        slots.push(time);
      }
    }
    
    return slots;
  };
  
  // No need for a server action wrapper here, we'll use an API route instead
  
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Reschedule Appointment</h1>
          <div className="flex space-x-4">
            <a 
              href={`/appointments/${appointmentId}`} 
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Back to Appointment
            </a>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Current appointment details */}
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold mb-4">Current Appointment</h2>
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600">Service</p>
                  <p className="font-medium">{appointment.getService()?.getName() || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Professional</p>
                  <p className="font-medium">{appointment.getProfessional()?.getName() || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Current Date & Time</p>
                  <p className="font-medium">{formattedDateTime}</p>
                </div>
                <div>
                  <p className="text-gray-600">Status</p>
                  <p className="font-medium capitalize">{appointment.getStatus()}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Reschedule form */}
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Select New Date & Time</h2>
            <form action={`/api/appointments/${appointmentId}/reschedule`} method="POST" className="space-y-6">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  defaultValue={currentDate}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                  Time
                </label>
                <select
                  id="time"
                  name="time"
                  defaultValue={currentTime}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  {generateTimeSlots().map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <button
                  type="submit"
                  className="w-full py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  Reschedule Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
