import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { UserRole } from '@/domain/user/UserRole';
import Link from 'next/link';

export default async function CreateServicePage() {
  // Create Supabase client
  const supabase = await createClient();
  
  // Check if user is logged in
  const { data: { session } } = await supabase.auth.getSession();
  
  // If user is not logged in, redirect to login
  if (!session) {
    redirect('/login?redirect=/services/create');
  }
  
  // Get user profile from database
  const { data: profile, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', session.user.email)
    .single();
  
  if (error) {
    console.error('Error fetching user profile:', error);
  }
  
  // Get user role from profile or session metadata
  const role = profile?.role || session.user.user_metadata?.role || UserRole.CLIENT;
  
  // Only admins can access this page
  if (role !== UserRole.ADMIN) {
    redirect('/dashboard');
  }
  
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Create New Service</h1>
          <div className="flex space-x-4">
            <Link
              href="/services"
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Cancel
            </Link>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <form action="/api/services/create" method="POST" className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Service Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="e.g., Haircut, Massage, Manicure"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Price
              </label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  id="price"
                  name="price"
                  placeholder="0.00"
                  className="w-full p-3 pl-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="durationMinutes" className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                min="1"
                id="durationMinutes"
                name="durationMinutes"
                placeholder="e.g., 30, 60, 90"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                Enter the typical duration of this service in minutes.
              </p>
            </div>
            
            <div className="pt-4">
              <button
                type="submit"
                className="w-full md:w-auto px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                Create Service
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
