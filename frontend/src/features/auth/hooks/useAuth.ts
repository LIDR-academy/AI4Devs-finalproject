import { useAuthStore } from '../stores/authStore';
import type { User } from '../types';

export const useAuth = () => {
  const { user, setUser, clearUser } = useAuthStore();

  const login = async (email: string, password: string): Promise<void> => {
    // TODO: Replace with actual API call
    // Simulated API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email && password) {
          const mockUser: User = {
            id: '1',
            email,
            name: 'John Doe',
          };
          setUser(mockUser);
          resolve();
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 500);
    });
  };

  const logout = () => {
    clearUser();
  };

  return {
    user,
    login,
    logout,
    isAuthenticated: !!user,
  };
};