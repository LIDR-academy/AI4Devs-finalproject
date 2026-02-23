import { z } from 'zod';

// Login request schema
export const loginRequestSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Login response schema
export const loginResponseSchema = z.object({
    token: z.string(),
    user: z.object({
        id: z.string(),
        email: z.string(),
        role: z.enum(['PLAYER', 'ADMIN']),
        active: z.boolean(),
        createdAt: z.string(),
    }),
});

// Types
export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
