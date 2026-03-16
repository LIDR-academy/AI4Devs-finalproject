"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { synchronizeSession, clearAuthData } from '@/lib/auth-utils';
import { Session } from '@supabase/supabase-js';

type UserProfile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  role: string;
  phone: string | null;
  created_at: string;
  updated_at: string;
};

type AuthContextType = {
  session: any | null;
  userProfile: UserProfile | null;
  role: string;
  isLoading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<any | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<string>('client');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchUserProfile = async () => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setIsLoading(false);
        return;
      }
      
      setSession(session);
      
      // Get user profile from database
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('email', session.user.email)
        .single();
      
      if (profileError) {
        if (profileError.code === 'PGRST116') {
          // User doesn't exist - create user record
          const name = session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User';
          const userRole = session.user.user_metadata?.role || 'client';
          
          const userInsertData = {
            email: session.user.email,
            first_name: session.user.user_metadata?.first_name || name,
            last_name: session.user.user_metadata?.last_name || null,
            role: userRole,
            phone: session.user.user_metadata?.phone || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert(userInsertData)
            .select()
            .single();
          
          if (createError) {
            setError('Error creating user profile');
            // Fallback to session data
            const fallbackProfile = {
              id: session.user.id,
              first_name: session.user.user_metadata?.first_name || session.user.user_metadata?.name || null,
              last_name: session.user.user_metadata?.last_name || null,
              email: session.user.email || '',
              role: userRole,
              phone: session.user.user_metadata?.phone || null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            setUserProfile(fallbackProfile);
            setRole(userRole);
          } else {
            setUserProfile(newUser);
            setRole(newUser.role);
          }
        } else {
          setError('Error fetching user profile');
          // Fallback to session data
          const fallbackRole = session.user.user_metadata?.role || 'client';
          const fallbackProfile = {
            id: session.user.id,
            first_name: session.user.user_metadata?.first_name || session.user.user_metadata?.name || null,
            last_name: session.user.user_metadata?.last_name || null,
            email: session.user.email || '',
            role: fallbackRole,
            phone: session.user.user_metadata?.phone || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          setUserProfile(fallbackProfile);
          setRole(fallbackRole);
        }
      } else {
        // User profile found
        setUserProfile(profile);
        setRole(profile.role);
      }
    } catch (error) {
      setError('Unexpected error fetching user data');
      console.error('Error in fetchUserProfile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    setIsLoading(true);
    setError(null);
    await fetchUserProfile();
  };

  const signOut = async () => {
    try {
      console.log('Starting sign-out process');
      
      // 1. First clear all client-side auth data using our utility
      console.log('Clearing client-side auth data');
      clearAuthData();
      
      console.log('Resetting React state');
      // Reset React state
      setSession(null);
      setUserProfile(null);
      setRole('client');
      
      // 2. Then try server-side sign-out, but handle errors gracefully
      try {
        console.log('Attempting server-side sign-out');
        const supabase = createClient();
        
        // Check if we have a valid session before trying to sign out
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (sessionData?.session) {
          console.log('Valid session found, signing out');
          await supabase.auth.signOut();
          console.log('Server-side sign-out successful');
        } else {
          console.info('No valid session found, skipping server-side sign-out');
        }
      } catch (error: any) {
        // If it's the expected "session not found" error, just log it as info
        if (error?.message?.includes('session not found') || 
            error?.code === 'session_not_found') {
          console.info('Session already expired or not found on server:', error);
        } else {
          // For other errors, log as warning but continue
          console.warn('Non-critical error during sign-out:', error);
        }
      }
      
      console.log('Sign-out process complete, redirecting to login');
      // 3. Always redirect to login page
      router.replace('/login');
    } catch (error) {
      // Even if something goes wrong, try to redirect to login
      console.error('Error during sign-out cleanup:', error);
      router.replace('/login');
    }
  };

  // Initial auth setup and session check
  useEffect(() => {
    const supabase = createClient();
    
    // Initial session check
    const checkSession = async () => {
      try {
        // Use synchronizeSession to ensure consistent state
        const session = await synchronizeSession();
        setSession(session);
        if (session) {
          fetchUserProfile();
        } else {
          setUserProfile(null);
          setRole('client');
        }
      } catch (error) {
        console.warn("Session check failed:", error);
        setSession(null);
        setUserProfile(null);
        setRole('client');
      }
    };
    
    checkSession();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state change:", event);
        setSession(session);
        
        if (session) {
          fetchUserProfile();
        } else {
          setUserProfile(null);
          setRole('client');
          
          // If explicitly signed out, clear everything
          if (event === 'SIGNED_OUT') {
            // Additional cleanup if needed
          }
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Proactive session refresh
  useEffect(() => {
    if (!session) return;
    
    // Calculate when to refresh (e.g., 5 minutes before expiry)
    const expiresAt = session.expires_at ? session.expires_at * 1000 : 0; // convert to milliseconds
    if (!expiresAt) return;
    
    const refreshTime = expiresAt - (5 * 60 * 1000); // 5 minutes before expiry
    const now = Date.now();
    
    let refreshTimeout: NodeJS.Timeout | undefined;
    if (refreshTime > now) {
      refreshTimeout = setTimeout(async () => {
        try {
          const supabase = createClient();
          const { error } = await supabase.auth.refreshSession();
          if (error) {
            console.warn("Session refresh failed:", error);
          }
        } catch (error) {
          console.warn("Session refresh exception:", error);
        }
      }, refreshTime - now);
    }
    
    return () => {
      if (refreshTimeout) clearTimeout(refreshTimeout);
    };
  }, [session]);

  return (
    <AuthContext.Provider
      value={{
        session,
        userProfile,
        role,
        isLoading,
        error,
        refreshProfile,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
