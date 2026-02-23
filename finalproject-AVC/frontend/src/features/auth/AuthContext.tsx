import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginRequest } from '../../shared/types';
import { authApi } from '../../api/authApi';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (credentials: LoginRequest) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Check for existing token on mount
    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const currentUser = await authApi.getCurrentUser();
                    setUser(currentUser);
                } catch (error) {
                    // Token is invalid, remove it
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = async (credentials: LoginRequest) => {
        console.log('[AuthContext] Login called with:', credentials.email);
        const response = await authApi.login(credentials);
        console.log('[AuthContext] Login response:', response);
        console.log('[AuthContext] Response token:', response.token);
        console.log('[AuthContext] Response user:', response.user);

        const { token, user: loggedInUser } = response;
        console.log('[AuthContext] Destructured token:', token);
        console.log('[AuthContext] Destructured user:', loggedInUser);

        localStorage.setItem('token', token);
        console.log('[AuthContext] Token saved to localStorage');

        setUser(loggedInUser);
        console.log('[AuthContext] setUser called with:', loggedInUser);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const value: AuthContextType = {
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
