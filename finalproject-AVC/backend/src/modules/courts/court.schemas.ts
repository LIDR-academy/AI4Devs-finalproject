import { z } from 'zod';

// Create court request schema
export const createCourtRequestSchema = z.object({
    name: z.string().min(1, 'Court name is required'),
});

// Court response schema
export const courtResponseSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    active: z.boolean(),
    createdAt: z.date(),
});

// Availability query schema
export const availabilityQuerySchema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
});

// Time slot schema
export const timeSlotSchema = z.object({
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
    available: z.boolean(),
});

// Types
export type CreateCourtRequest = z.infer<typeof createCourtRequestSchema>;
export type CourtResponse = z.infer<typeof courtResponseSchema>;
export type AvailabilityQuery = z.infer<typeof availabilityQuerySchema>;
export type TimeSlot = z.infer<typeof timeSlotSchema>;
