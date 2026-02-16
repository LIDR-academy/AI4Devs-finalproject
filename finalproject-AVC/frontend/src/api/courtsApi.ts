import api from './client';
import { Court, TimeSlot } from '../shared/types';

export const courtsApi = {
    /**
     * Get all active courts
     */
    getCourts: async (): Promise<Court[]> => {
        const response = await api.get<Court[]>('/courts');
        return response.data;
    },

    /**
     * Get court availability for a specific date
     */
    getCourtAvailability: async (courtId: string, date: string): Promise<TimeSlot[]> => {
        const response = await api.get<TimeSlot[]>(`/courts/${courtId}/availability`, {
            params: { date },
        });
        return response.data;
    },

    /**
     * Create a new court (Admin only)
     */
    createCourt: async (name: string): Promise<Court> => {
        const response = await api.post<Court>('/courts', { name });
        return response.data;
    },
};
