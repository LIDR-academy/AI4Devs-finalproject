import { z } from 'zod';

export const createUserSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(120, 'El nombre no puede superar 120 caracteres'),
  email: z
    .string()
    .trim()
    .email('Introduce un correo electrónico válido'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres'),
  role: z.enum(['ADMIN', 'MECHANIC'], {
    message: 'Selecciona un rol',
  }),
  canActAsMechanic: z.boolean(),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;
