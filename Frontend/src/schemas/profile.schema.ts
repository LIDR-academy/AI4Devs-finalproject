import { z } from 'zod';

/**
 * Profile update form schema
 * Aligns with backend UpdateUserDto: nombre, email, contraseña (optional, min 8)
 */
export const updateProfileSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('El email debe tener un formato válido').min(1, 'El email es requerido'),
  contraseña: z
    .union([z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'), z.literal('')])
    .optional(),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
