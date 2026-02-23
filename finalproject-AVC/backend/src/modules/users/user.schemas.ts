import { z } from 'zod';
import { Role } from '@prisma/client';

// Create user request schema
export const createUserRequestSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.nativeEnum(Role, { errorMap: () => ({ message: 'Role must be PLAYER or ADMIN' }) }),
});

// User response schema (without password)
export const userResponseSchema = z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    role: z.nativeEnum(Role),
    active: z.boolean(),
    createdAt: z.date(),
});

// Types
export type CreateUserRequest = z.infer<typeof createUserRequestSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;
