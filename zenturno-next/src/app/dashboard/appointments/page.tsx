"use client";

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';

// Define types for our data
interface UserInfo {
  first_name: string;
  last_name: string;
  email: string;
}

interface Professional {
  id: number;
  user_id: string;
  users?: UserInfo;
}

interface Client {
  id: number;
  user_id: string;
  users?: UserInfo;
}

interface Service {
  id: number;
  name: string;
  price: number;
  duration_minutes: number;
}

interface Appointment {
  id: number;
  date: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  client_id: number;
  professional_id: number;
  service_id: number;
  clients?: Client;
  professionals?: Professional;
  services?: Service;
}

// Component for appointment actions
interface AppointmentActionsProps {
  appointmentId: number;
  status: string;
  canReschedule: boolean;
  userRole: string;
}

const AppointmentActions = ({ appointmentId, status, canReschedule }: Omit<AppointmentActionsProps, 'userRole'>) => {
  // We'll implement the actual actions later
  return (
    <div className="flex flex-wrap gap-2">
      {status === 'pending' && (
        <>
          <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">
            Confirm
          </button>
          <button className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700">
            Cancel
          </button>
        </>
      )}
      {status === 'confirmed' && (
        <>
          <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
            Complete
          </button>
          <button className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700">
            Cancel
          </button>
        </>
      )}
      {canReschedule && (
        <Link href={`/dashboard/appointments/reschedule/${appointmentId}`} className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700">
          Reschedule
        </Link>
      )}
      <Link href={`/dashboard/appointments/${appointmentId}`} className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700">
        Details
      </Link>
    </div>
  );
};

// Appointment card component
interface AppointmentCardProps {
  appointment: Appointment;
  userRole: string;
}

const AppointmentCard = ({ appointment, userRole }: AppointmentCardProps) => {
  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(date);
  };

  const getUserName = (user?: UserInfo): string => {
    if (!user) return 'Unknown';
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user.first_name || user.last_name || user.email || 'Unknown';
  };

  const canReschedule = ['pending', 'confirmed'].includes(appointment.status);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center">
        <div>
          <h3 className="text-xl font-semibold">
            {appointment.services?.name || 'Unknown Service'}
          </h3>
          <p className="text-gray-600">
            {formatDateTime(appointment.date)}
          </p>
          
          {userRole === 'client' && appointment.professionals && (
            <p className="mt-2">
              <span className="text-gray-600">Professional:</span>{' '}
              <span className="font-medium">{getUserName(appointment.professionals.users)}</span>
            </p>
          )}
          
          {(userRole === 'professional' || userRole === 'admin') && appointment.clients && (
            <p className="mt-2">
              <span className="text-gray-600">Client:</span>{' '}
              <span className="font-medium">{getUserName(appointment.clients.users)}</span>
            </p>
          )}
          
          <p className="mt-2">
            <span className="text-gray-600">Status:</span>{' '}
            <span className={`font-medium ${
              appointment.status === 'confirmed' ? 'text-green-600' :
              appointment.status === 'pending' ? 'text-yellow-600' :
              appointment.status === 'cancelled' ? 'text-red-600' :
              appointment.status === 'completed' ? 'text-blue-600' : ''
            }`}>
              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
            </span>
          </p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <AppointmentActions 
            appointmentId={appointment.id} 
            status={appointment.status} 
            canReschedule={canReschedule}
          />
        </div>
      </div>
    </div>
  );
};

// Success message component
function SuccessMessage({ message }: { message: string }) {
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (!visible) return null;
  
  const messages: Record<string, string> = {
    'appointment-created': 'Appointment created successfully!',
    'appointment-updated': 'Appointment updated successfully!',
    'appointment-cancelled': 'Appointment cancelled successfully!',
    'appointment-confirmed': 'Appointment confirmed successfully!',
    'appointment-completed': 'Appointment marked as completed!'
  };
  
  const displayMessage = messages[message] || 'Operation completed successfully!';
  
  return (
    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 flex justify-between items-center">
      <div>
        <span className="font-bold">Success!</span> {displayMessage}
      </div>
      <button 
        onClick={() => setVisible(false)}
        className="text-green-700 hover:text-green-900"
      >
        <span className="text-2xl">&times;</span>
      </button>
    </div>
  );
}

function AppointmentsContent() {
  const { session, userProfile, role, isLoading, error } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get('status') || 'all';
  const messageParam = searchParams.get('message');
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [fetchingAppointments, setFetchingAppointments] = useState(false);
  const [appointmentError, setAppointmentError] = useState<string | null>(null);
  
  const fetchAppointments = useCallback(async () => {
    if (!session || !userProfile) return;
    
    setFetchingAppointments(true);
    setAppointmentError(null);
    
    try {
      const supabase = createClient();
      
      if (role === 'client') {
        // Get client ID - use maybeSingle to handle no results gracefully
        console.log('Fetching client data for user_id:', userProfile.id);
        const { error: clientError } = await supabase
          .from('clients')
          .select('id')
          .eq('user_id', userProfile.id)
          .maybeSingle();
        
        let clientData = await supabase
          .from('clients')
          .select('id')
          .eq('user_id', userProfile.id)
          .maybeSingle()
          .then(result => result.data);

        
        console.log('Client query result:', { clientData, clientError });
        
        // If no client exists, create one
        if (!clientError && !clientData) {
          console.log('No client found, creating new client...');
          const { data: newClient, error: createError } = await supabase
            .from('clients')
            .insert({ user_id: userProfile.id })
            .select('id')
            .single();
          
          if (createError) {
            console.error('Error creating client:', createError);
            throw new Error('Error creating client data');
          }
          
          console.log('Created new client:', newClient);
          clientData = newClient;
        } else if (clientError) {
          console.error('Error fetching client:', clientError);
          throw new Error(`Error fetching client data: ${clientError.message}`);
        }
        
        const finalClientData = clientData;
        
        if (finalClientData) {
          console.log('Fetching appointments for client_id:', finalClientData.id);
          // Get appointments for this client
          let query = supabase
            .from('appointments')
            .select(`
              *,
              professionals:professional_id (id, user_id, users:user_id(first_name, last_name, email)),
              services:service_id (id, name, price, duration_minutes)
            `)
            .eq('client_id', finalClientData.id)
            .order('date', { ascending: true });
          
          // Apply status filter if not 'all'
          if (statusFilter !== 'all') {
            query = query.eq('status', statusFilter);
          }
          
          const { data, error } = await query;
          
          if (error) {
            console.error('Error fetching appointments:', error);
            throw new Error(error.message);
          } else {
            console.log('Fetched appointments:', data);
            setAppointments(data || []);
          }
        } else {
          console.log('No client data available, setting empty appointments');
          setAppointments([]);
        }
      } else if (role === 'professional') {
        // Get professional ID
        console.log('Fetching professional data for user_id:', userProfile.id);
        const { error: professionalError } = await supabase
          .from('professionals')
          .select('id')
          .eq('user_id', userProfile.id)
          .maybeSingle();
          
        let professionalData = await supabase
          .from('professionals')
          .select('id')
          .eq('user_id', userProfile.id)
          .maybeSingle()
          .then(result => result.data);

        
        console.log('Professional query result:', { professionalData, professionalError });
        
        // If no professional exists, create one
        if (!professionalError && !professionalData) {
          console.log('No professional found, creating new professional...');
          const { data: newProfessional, error: createError } = await supabase
            .from('professionals')
            .insert({ user_id: userProfile.id })
            .select('id')
            .single();
          
          if (createError) {
            console.error('Error creating professional:', createError);
            throw new Error('Error creating professional data');
          }
          
          console.log('Created new professional:', newProfessional);
          professionalData = newProfessional;
        } else if (professionalError) {
          console.error('Error fetching professional:', professionalError);
          throw new Error(`Error fetching professional data: ${professionalError.message}`);
        }
        
        if (professionalData) {
          // Get appointments for this professional
          let query = supabase
            .from('appointments')
            .select(`
              *,
              clients:client_id (id, user_id, users:user_id(first_name, last_name, email)),
              services:service_id (id, name, price, duration_minutes)
            `)
            .eq('professional_id', professionalData.id)
            .order('date', { ascending: true });
          
          // Apply status filter if not 'all'
          if (statusFilter !== 'all') {
            query = query.eq('status', statusFilter);
          }
          
          const { data, error } = await query;
          
          if (error) {
            throw new Error(error.message);
          } else {
            setAppointments(data || []);
          }
        }
      } else if (role === 'admin') {
        // Admin can see all appointments
        let query = supabase
          .from('appointments')
          .select(`
            *,
            clients:client_id (id, user_id, users:user_id(first_name, last_name, email)),
            professionals:professional_id (id, user_id, users:user_id(first_name, last_name, email)),
            services:service_id (id, name, price, duration_minutes)
          `)
          .order('date', { ascending: true });
        
        // Apply status filter if not 'all'
        if (statusFilter !== 'all') {
          query = query.eq('status', statusFilter);
        }
        
        const { data, error } = await query;
        
        if (error) {
          throw new Error(error.message);
        } else {
          setAppointments(data || []);
        }
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAppointmentError('Failed to load appointments');
    } finally {
      setFetchingAppointments(false);
    }
  }, [session, userProfile, statusFilter, role]);
  
  useEffect(() => {
    if (!isLoading && !session) {
      router.push('/login?redirect=/dashboard/appointments');
      return;
    }
    
    if (session && userProfile) {
      fetchAppointments();
    }
  }, [isLoading, session, userProfile, router, fetchAppointments]);
  
  // Show loading state
  if (isLoading || fetchingAppointments) {
    return (
      <div className="flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-t-primary rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading appointments...</p>
        </div>
      </div>
    );
  }
  
  // Show error state
  if (error || appointmentError) {
    return (
      <div>
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Appointments</h1>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error || appointmentError || "Error loading appointments. Please try again later."}
          </div>
        </div>
      </div>
    );
  }
  
  // If not logged in (should be handled by useEffect redirect, but just in case)
  if (!session) {
    return null;
  }
  
  return (
    <div>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Appointments</h1>
          <div className="flex space-x-4">
            {role === 'client' && (
              <Link
                href="/appointments/book"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 z-10 inline-block"
              >
                Book Appointment
              </Link>
            )}
          </div>
        </div>
        
        {/* Display success message if present */}
        {messageParam && <SuccessMessage message={messageParam} />}
        
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex flex-wrap gap-4 relative z-10">
            <Link
              href="/dashboard/appointments"
              className={`px-4 py-2 rounded-md inline-block ${
                statusFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              All
            </Link>
            <Link
              href="/dashboard/appointments?status=pending"
              className={`px-4 py-2 rounded-md inline-block ${
                statusFilter === 'pending'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Pending
            </Link>
            <Link
              href="/dashboard/appointments?status=confirmed"
              className={`px-4 py-2 rounded-md inline-block ${
                statusFilter === 'confirmed'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Confirmed
            </Link>
            <Link
              href="/dashboard/appointments?status=completed"
              className={`px-4 py-2 rounded-md inline-block ${
                statusFilter === 'completed'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Completed
            </Link>
            <Link
              href="/dashboard/appointments?status=cancelled"
              className={`px-4 py-2 rounded-md inline-block ${
                statusFilter === 'cancelled'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Cancelled
            </Link>
          </div>
        </div>
        
        {appointments.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <p className="text-gray-600">
              No appointments found.
              {role === 'client' && (
                <Link href="/appointments/book" className="text-blue-600 ml-1 hover:underline font-medium">
                  Book an appointment
                </Link>
              )}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <AppointmentCard 
                key={appointment.id} 
                appointment={appointment}
                userRole={role}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AppointmentsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-t-primary rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading appointments...</p>
        </div>
      </div>
    }>
      <AppointmentsContent />
    </Suspense>
  );
}
