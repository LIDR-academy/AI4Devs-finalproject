import api from './client';
import { Reservation } from '../shared/types';

export interface CreateReservationRequest {
    courtId: string;
    startTime: string;
    endTime: string;
}

export const reservationsApi = {
    /**
     * Create a new reservation
     */
    createReservation: async (data: CreateReservationRequest): Promise<Reservation> => {
        const response = await api.post<Reservation>('/reservations', data);
        return response.data;
    },

    /**
     * Get current user's reservations
     */
    getMyReservations: async (): Promise<Reservation[]> => {
        const response = await api.get<Reservation[]>('/reservations/my');
        return response.data;
    },
};
