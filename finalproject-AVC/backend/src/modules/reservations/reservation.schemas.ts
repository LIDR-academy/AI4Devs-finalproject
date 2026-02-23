import { z } from 'zod';
import { ReservationStatus } from '@prisma/client';

// Create reservation request schema
export const createReservationRequestSchema = z
    .object({
        courtId: z.string().uuid('Court ID must be a valid UUID'),
        startTime: z.string().datetime('Start time must be a valid ISO datetime'),
        endTime: z.string().datetime('End time must be a valid ISO datetime'),
    })
    .refine((data) => new Date(data.endTime) > new Date(data.startTime), {
        message: 'End time must be after start time',
        path: ['endTime'],
    });

// Reservation response schema
export const reservationResponseSchema = z.object({
    id: z.string().uuid(),
    courtId: z.string().uuid(),
    userId: z.string().uuid(),
    startTime: z.date(),
    endTime: z.date(),
    status: z.nativeEnum(ReservationStatus),
    createdAt: z.date(),
    court: z.object({
        id: z.string().uuid(),
        name: z.string(),
    }),
});

// Types
export type CreateReservationRequest = z.infer<typeof createReservationRequestSchema>;
export type ReservationResponse = z.infer<typeof reservationResponseSchema>;
