import { loginUser } from '@/api/authApi';
import { useToast } from '@/components/ui/use-toast';
import { AuthState, LoginCredentials, User } from '@/types/dto';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  auth: AuthState;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Secure token storage utility
const secureStorage = {
  setToken: (token: string) => {
    // In production, this should be httpOnly cookies
    // For now, we'll use sessionStorage which is more secure than localStorage
    sessionStorage.setItem('auth_token', token);
    // Also save to localStorage for API compatibility
    localStorage.setItem('token', token);
    // Set expiry time (1 hour)
    const expiry = new Date().getTime() + (60 * 60 * 1000);
    sessionStorage.setItem('auth_expiry', expiry.toString());
  },
  
  getToken: (): string | null => {
    const token = sessionStorage.getItem('auth_token');
    const expiry = sessionStorage.getItem('auth_expiry');
    
    if (!token || !expiry) return null;
    
    // Check if token is expired
    if (new Date().getTime() > parseInt(expiry)) {
      secureStorage.clearToken();
      return null;
    }
    
    return token;
  },
  
  clearToken: () => {
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_expiry');
    sessionStorage.removeItem('user_data');
    // Also clear from localStorage
    localStorage.removeItem('token');
  },
  
  setUser: (user: User) => {
    sessionStorage.setItem('user_data', JSON.stringify(user));
  },
  
  getUser: (): User | null => {
    const userData = sessionStorage.getItem('user_data');
    if (!userData) return null;
    
    try {
      return JSON.parse(userData);
    } catch {
      return null;
    }
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    token: null
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Check for existing auth on mount
  useEffect(() => {
    const storedToken = secureStorage.getToken();
    const storedUser = secureStorage.getUser();
    
    if (storedToken && storedUser) {
      setAuth({
        user: storedUser,
        token: storedToken,
        isAuthenticated: true
      });
    }
    
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const response = await loginUser(credentials);
      
      const user: User = {
        id: response.user.id,
        email: response.user.email,
        name: `${response.user.firstName} ${response.user.lastName}`.trim()
      };
      
      // Save to state
      setAuth({
        user,
        token: response.token,
        isAuthenticated: true
      });
      
      // Save to secure storage
      secureStorage.setToken(response.token);
      secureStorage.setUser(user);
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.name || user.email}!`,
      });
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid email or password.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Clear state
    setAuth({
      user: null,
      token: null,
      isAuthenticated: false
    });
    
    // Clear secure storage
    secureStorage.clearToken();
    
    toast({
      title: "Logged out",
      description: "You have been successfully logged out."
    });
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
