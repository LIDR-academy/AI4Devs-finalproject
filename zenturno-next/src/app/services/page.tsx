import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getServices } from '@/app/actions/service';
import { UserRole } from '@/domain/user/UserRole';
import { getOrCreateUserProfile } from '@/lib/server-utils';
import Link from 'next/link';

export default async function ServicesPage() {
  // Create Supabase client
  const supabase = await createClient();
  
  // Check if user is logged in
  const { data: { session } } = await supabase.auth.getSession();
  
  // If user is not logged in, redirect to login
  if (!session) {
    redirect('/login?redirect=/services');
  }
  
  // Get or create user profile with robust error handling
  const { userProfile, role } = await getOrCreateUserProfile();

  if (!userProfile) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Services</h1>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Error loading profile. Please try again later.
          </div>
        </div>
      </div>
    );
  }
  
  // Only admins can access this page
  if (role !== UserRole.ADMIN) {
    redirect('/dashboard');
  }
  
  // Get all services
  const services = await getServices();
  
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Services</h1>
          <div className="flex space-x-4">
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Back to Dashboard
            </Link>
            <Link
              href="/services/create"
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Create Service
            </Link>
          </div>
        </div>
        
        {services.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <p className="text-gray-600">No services found.</p>
            <p className="mt-2">
              <Link href="/services/create" className="text-primary-600 hover:underline">
                Create your first service
              </Link>
            </p>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {services.map((service) => (
                  <tr key={service.getId()} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {service.getName()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {service.formatPrice()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {service.formatDuration()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link
                          href={`/services/${service.getId()}`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          View
                        </Link>
                        <Link
                          href={`/services/${service.getId()}/edit`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/api/services/${service.getId()}/delete`}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
