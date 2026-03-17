import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { UserRole } from '@/domain/user/UserRole';
import { getOrCreateUserProfile } from '@/lib/server-utils';
import BookingForm from '@/components/appointments/BookingForm';

export default async function BookAppointmentPage() {
  // Create Supabase client
  const supabase = await createClient();
  
  // Check if user is logged in
  const { data: { session } } = await supabase.auth.getSession();
  
  // If user is not logged in, redirect to login
  if (!session) {
    redirect('/login?redirect=/appointments/book');
  }

  // Get or create user profile with robust error handling
  const { userProfile, role } = await getOrCreateUserProfile(session);
  
  if (!userProfile) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Book an Appointment</h1>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Error loading profile. Please try again later.
          </div>
        </div>
      </div>
    );
  }
  
  // Check if user is a client
  if (role !== UserRole.CLIENT) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Book an Appointment</h1>
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            <p>Only clients can book appointments.</p>
            <p className="mt-2">
              <a href="/dashboard" className="text-primary-600 hover:underline">
                Return to Dashboard
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Book an Appointment</h1>
          <a 
            href="/appointments" 
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Back to Appointments
          </a>
        </div>
        
        <BookingForm />
      </div>
    </div>
  );
}
