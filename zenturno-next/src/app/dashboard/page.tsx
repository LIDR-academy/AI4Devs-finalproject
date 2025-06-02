import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LogoutButton from '@/components/auth/LogoutButton'
import { UserRole } from '@/domain/user/UserRole'
import { getOrCreateUserProfile } from '@/lib/server-utils'

interface PageProps {
  searchParams: Promise<{ message?: string }>
}

export default async function Dashboard({ searchParams }: PageProps) {
  // Await searchParams for Next.js 15 compatibility
  const { message } = await searchParams;
  
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Get or create user profile with robust error handling
  const { userProfile, role } = await getOrCreateUserProfile(session);

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Error loading profile. Please try again later.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <LogoutButton />
        </div>
        
        {/* Success message */}
        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {decodeURIComponent(message)}
          </div>
        )}
        
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Welcome, {userProfile ? `${userProfile.name || ''}`.trim() : session.user.user_metadata?.name || 'User'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Email:</p>
              <p className="font-medium">{session.user.email}</p>
            </div>
            <div>
              <p className="text-gray-600">Role:</p>
              <p className="font-medium capitalize">{role}</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Common links for all users */}
          <DashboardCard
            title="My Profile"
            description="View and edit your profile information"
            link="/profile"
          />
          
          {/* Client-specific links */}
          {(role === UserRole.CLIENT || role === UserRole.ADMIN) && (
            <>
              <DashboardCard
                title="Book Appointment"
                description="Schedule a new appointment with a professional"
                link="/appointments/book"
              />
              <DashboardCard
                title="My Appointments"
                description="View and manage your upcoming appointments"
                link="/appointments"
              />
            </>
          )}
          
          {/* Professional-specific links */}
          {(role === UserRole.PROFESSIONAL || role === UserRole.ADMIN) && (
            <>
              <DashboardCard
                title="My Appointments"
                description="View and manage your appointment schedule"
                link="/appointments"
              />
            </>
          )}
          
          {/* Admin-specific links */}
          {role === UserRole.ADMIN && (
            <>
              <DashboardCard
                title="Manage Users"
                description="View and manage system users"
                link="/profile"
              />
              <DashboardCard
                title="Manage Services"
                description="View and manage available services"
                link="/appointments"
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function DashboardCard({ title, description, link }: { title: string; description: string; link: string }) {
  return (
    <a
      href={link}
      className="block bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow"
    >
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </a>
  )
}
