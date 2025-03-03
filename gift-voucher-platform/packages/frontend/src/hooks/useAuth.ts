import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useCallback } from 'react';

interface User {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  role?: string;
}

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const user: User | null = session?.user || null;
  const isAuthenticated = !!session;
  const isLoading = status === 'loading';

  const logout = useCallback(async () => {
    await signOut({ redirect: false });
    router.push('/login');
  }, [router]);

  const isAdmin = useCallback(() => {
    return user?.role === 'admin';
  }, [user]);

  const isStoreManager = useCallback(() => {
    return user?.role === 'store_manager';
  }, [user]);

  const isCustomer = useCallback(() => {
    return user?.role === 'customer';
  }, [user]);

  const hasPermission = useCallback((requiredRoles: string[]) => {
    if (!user || !user.role) return false;
    return requiredRoles.includes(user.role);
  }, [user]);

  return {
    user,
    isAuthenticated,
    isLoading,
    logout,
    isAdmin,
    isStoreManager,
    isCustomer,
    hasPermission
  };
} 