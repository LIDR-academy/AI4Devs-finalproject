/**
 * Zod schema for trip form validation
 */

import { z } from 'zod';

export const createTripSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'El nombre del viaje es requerido')
    .max(255, 'El nombre del viaje no puede exceder 255 caracteres'),
  currency: z
    .enum(['COP', 'USD'], { message: 'La moneda debe ser COP o USD' })
    .optional()
    .default('COP'),
});

export type CreateTripFormData = z.infer<typeof createTripSchema>;
