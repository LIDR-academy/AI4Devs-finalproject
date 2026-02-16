import api from './client';
import { Payment } from '../shared/types';

export interface CreatePaymentRequest {
    reservationId: string;
}

export interface ConfirmPaymentResponse {
    payment: Payment;
    reservation: {
        id: string;
        status: string;
    };
}

export const paymentsApi = {
    /**
     * Initiate payment for a reservation
     */
    initiatePayment: async (reservationId: string): Promise<Payment> => {
        const response = await api.post<Payment>('/payments', { reservationId });
        return response.data;
    },

    /**
     * Confirm payment
     */
    confirmPayment: async (paymentId: string): Promise<ConfirmPaymentResponse> => {
        const response = await api.post<ConfirmPaymentResponse>(`/payments/${paymentId}/confirm`);
        return response.data;
    },
};
