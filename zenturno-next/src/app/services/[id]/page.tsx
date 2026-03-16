import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getServiceById } from '@/app/actions/service';
import { UserRole } from '@/domain/user/UserRole';
import Link from 'next/link';
import { Service } from '@/domain/service/Service';
import { Professional } from '@/domain/professional/Professional';

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { id } = await params;
  
  // Create Supabase client
  const supabase = await createClient();
  
  // Check if user is logged in
  const { data: { session } } = await supabase.auth.getSession();
  
  // If user is not logged in, redirect to login
  if (!session) {
    redirect(`/login?redirect=/services/${id}`);
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
  
  // Get service by ID
  const service = await getServiceById(id);
  
  // If service not found, redirect to services page
  if (!service) {
    redirect('/services');
  }
  
  // Format created and updated dates
  const formattedCreatedAt = service.getCreatedAt().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const formattedUpdatedAt = service.getUpdatedAt().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Service Details</h1>
          <div className="flex space-x-4">
            <Link
              href="/services"
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Back to Services
            </Link>
            <Link
              href={`/services/${id}/edit`}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Edit Service
            </Link>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">{service.getName()}</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-600">Price</p>
                  <p className="font-medium text-xl">{service.formatPrice()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Duration</p>
                  <p className="font-medium">{service.formatDuration()}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-gray-600">Service ID</p>
                <p className="font-medium">{service.getId()}</p>
              </div>
              <div>
                <p className="text-gray-600">Created At</p>
                <p className="font-medium">{formattedCreatedAt}</p>
              </div>
              <div>
                <p className="text-gray-600">Last Updated</p>
                <p className="font-medium">{formattedUpdatedAt}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Actions</h3>
          <div className="flex space-x-4">
            <Link
              href={`/services/${id}/edit`}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Edit Service
            </Link>
            <Link
              href={`/api/services/${id}/delete`}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Delete Service
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
