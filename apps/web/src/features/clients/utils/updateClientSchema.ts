import { z } from 'zod';
import { normalizePhoneInput } from './phoneNormalizer';

export const updateClientSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(150, 'El nombre no puede superar 150 caracteres'),
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

export type UpdateClientFormValues = z.infer<typeof updateClientSchema>;
