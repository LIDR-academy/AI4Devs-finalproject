import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { updateProfile } from '@/app/actions/profile';
import { UserRole } from '@/domain/user/UserRole';

export default async function EditProfilePage() {
  // Create Supabase client
  const supabase = await createClient();
  
  // Check if user is logged in
  const { data: { session } } = await supabase.auth.getSession();
  
  // If user is not logged in, redirect to login
  if (!session) {
    redirect('/login?redirect=/profile/edit');
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
  const role = profile?.role || session.user.user_metadata?.role || 'client';
  
  // Get client or professional data based on role
  let clientData = null;
  let professionalData = null;
  
  if (role === UserRole.CLIENT && profile?.id) {
    const { data } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', profile.id)
      .single();
    
    clientData = data;
  } else if (role === UserRole.PROFESSIONAL && profile?.id) {
    const { data } = await supabase
      .from('professionals')
      .select('*')
      .eq('user_id', profile.id)
      .single();
    
    professionalData = data;
  }
  
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Edit Profile</h1>
          <a 
            href="/profile" 
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Back to Profile
          </a>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <form action="/api/profile/update" method="POST">
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  defaultValue={(profile?.first_name && profile?.last_name)
                    ? `${profile.first_name} ${profile.last_name}`
                    : profile?.first_name || profile?.last_name || ''}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  defaultValue={session.user.email}
                  className="w-full p-3 border border-gray-300 rounded-md bg-gray-100"
                  disabled
                />
                <p className="mt-1 text-sm text-gray-500">
                  Email cannot be changed as it is used for authentication.
                </p>
              </div>
              
              {role === UserRole.CLIENT && (
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    defaultValue={clientData?.phone || ''}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., +1 (555) 123-4567"
                  />
                </div>
              )}
              
              {role === UserRole.PROFESSIONAL && (
                <div>
                  <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 mb-1">
                    Specialty
                  </label>
                  <input
                    type="text"
                    id="specialty"
                    name="specialty"
                    defaultValue={professionalData?.specialty || ''}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., Hair Stylist, Massage Therapist"
                  />
                </div>
              )}
              
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <input
                  type="text"
                  id="role"
                  defaultValue={role}
                  className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 capitalize"
                  disabled
                />
                <p className="mt-1 text-sm text-gray-500">
                  Role cannot be changed. Please contact an administrator if you need to change your role.
                </p>
              </div>
              
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full md:w-auto px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
