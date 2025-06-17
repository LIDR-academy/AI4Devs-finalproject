"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function ProfilePage() {
  const { session, userProfile, role, isLoading, error, signOut } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!isLoading && !session) {
      router.push('/login?redirect=/dashboard/profile');
    }
  }, [isLoading, session, router]);
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  // Show error state
  if (error || !userProfile) {
    return (
      <div>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Profile</h1>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error || "Error loading profile. Please try again later."}
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
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Profile</h1>
          <button 
            onClick={async () => {
              try {
                await signOut();
              } catch (error) {
                console.error('Error signing out:', error);
              }
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Logout
          </button>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">Your Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <div className="p-3 bg-gray-100 rounded-md">
                {(userProfile?.first_name && userProfile?.last_name)
                  ? `${userProfile.first_name} ${userProfile.last_name}`
                  : userProfile?.first_name || userProfile?.last_name || session.user.user_metadata?.name || 'Not set'}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="p-3 bg-gray-100 rounded-md">
                {session.user.email}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <div className="p-3 bg-gray-100 rounded-md capitalize">
                {role}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
              <div className="p-3 bg-gray-100 rounded-md">
                {userProfile?.created_at 
                  ? new Date(userProfile.created_at).toLocaleDateString() 
                  : new Date(session.user.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <Link 
              href="/dashboard/profile/edit" 
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Edit Profile
            </Link>
          </div>
        </div>
        
        {/* Role-specific information */}
        {role === 'professional' && (
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-6">Professional Information</h2>
            <p className="text-gray-600 mb-4">
              Manage your professional details and services.
            </p>
            <div className="flex space-x-4">
              <Link 
                href="/dashboard/profile/professional" 
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Manage Professional Details
              </Link>
              <Link 
                href="/dashboard/services" 
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Manage Services
              </Link>
            </div>
          </div>
        )}
        
        {role === 'client' && (
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-6">Client Information</h2>
            <p className="text-gray-600 mb-4">
              Manage your client details and view your appointment history.
            </p>
            <div className="flex space-x-4">
              <Link 
                href="/dashboard/profile/client" 
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Manage Client Details
              </Link>
              <Link 
                href="/dashboard/appointments" 
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                View Appointments
              </Link>
            </div>
          </div>
        )}
        
        {role === 'admin' && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Admin Controls</h2>
            <p className="text-gray-600 mb-4">
              Access administrative functions and system settings.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link 
                href="/dashboard/admin/users" 
                className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 text-center"
              >
                Manage Users
              </Link>
              <Link 
                href="/dashboard/admin/professionals" 
                className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 text-center"
              >
                Manage Professionals
              </Link>
              <Link 
                href="/dashboard/admin/services" 
                className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 text-center"
              >
                Manage Services
              </Link>
              <Link 
                href="/dashboard/admin/settings" 
                className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 text-center"
              >
                System Settings
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
