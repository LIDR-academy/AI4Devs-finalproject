import { z } from 'zod';

export const RegisterUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/[A-Z]/, 'Must contain at least one uppercase letter').regex(/[0-9]/, 'Must contain at least one number'), // Adjust regex as needed
  fullName: z.string().min(2).optional(),
});

export type RegisterUserDto = z.infer<typeof RegisterUserSchema>;

export const LoginUserSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type LoginUserDto = z.infer<typeof LoginUserSchema>;
