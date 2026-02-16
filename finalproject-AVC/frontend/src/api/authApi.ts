import api from './client';
import { LoginRequest, LoginResponse, User } from '../shared/types';

export const authApi = {
    /**
     * Login with email and password
     */
    login: async (credentials: LoginRequest): Promise<LoginResponse> => {
        const response = await api.post<LoginResponse>('/auth/login', credentials);
        return response.data;
    },

    /**
     * Get current authenticated user
     */
    getCurrentUser: async (): Promise<User> => {
        const response = await api.get<User>('/auth/me');
        return response.data;
    },
};
