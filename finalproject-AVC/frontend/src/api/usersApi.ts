import api from './client';
import { User, CreateUserRequest } from '../shared/types';

export const usersApi = {
    /**
     * Create a new user (Admin only)
     */
    createUser: async (userData: CreateUserRequest): Promise<User> => {
        const response = await api.post<User>('/auth/register', userData);
        return response.data;
    },
};
