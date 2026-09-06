import { z } from 'zod';
import { normalizePhoneInput } from './phoneNormalizer';

export const createClientSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(150, 'El nombre no puede superar 150 caracteres'),
  nationalId: z
    .string()
    .trim()
    .min(5, 'La identificación debe tener al menos 5 caracteres')
    .max(20, 'La identificación no puede superar 20 caracteres')
    .regex(
      /^[a-zA-Z0-9-]+$/,
      'La identificación solo puede contener letras, números y guiones',
    ),
  phone: z
    .string()
    .optional()
    .refine((value) => {
      if (!value || value.trim() === '') {
        return true;
      }

      return /^[0-9]{8,15}$/.test(normalizePhoneInput(value));
    }, 'El teléfono debe tener entre 8 y 15 dígitos'),
  email: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || z.string().email().safeParse(value).success,
      'Introduce un correo electrónico válido',
    ),
});

export type CreateClientFormValues = z.infer<typeof createClientSchema>;
