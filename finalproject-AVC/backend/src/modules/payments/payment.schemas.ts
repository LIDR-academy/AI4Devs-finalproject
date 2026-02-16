import { z } from 'zod';
import { PaymentStatus } from '@prisma/client';

// Create payment request schema
export const createPaymentRequestSchema = z.object({
    reservationId: z.string().uuid('Reservation ID must be a valid UUID'),
});

// Payment response schema
export const paymentResponseSchema = z.object({
    id: z.string().uuid(),
    reservationId: z.string().uuid(),
    userId: z.string().uuid(),
    amount: z.number().positive(),
    status: z.nativeEnum(PaymentStatus),
    paymentUrl: z.string().url(),
    createdAt: z.date(),
});

// Confirm payment response schema
export const confirmPaymentResponseSchema = z.object({
    payment: paymentResponseSchema,
    reservation: z.object({
        id: z.string().uuid(),
        status: z.string(),
    }),
});

// Types
export type CreatePaymentRequest = z.infer<typeof createPaymentRequestSchema>;
export type PaymentResponse = z.infer<typeof paymentResponseSchema>;
export type ConfirmPaymentResponse = z.infer<typeof confirmPaymentResponseSchema>;
