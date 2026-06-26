import { z } from 'zod';

const currentYear = new Date().getFullYear();

export const updateVehicleSchema = z.object({
  licensePlate: z
    .string()
    .trim()
    .min(2, 'La placa debe tener al menos 2 caracteres')
    .max(15, 'La placa no puede superar 15 caracteres'),
  brand: z
    .string()
    .trim()
    .min(1, 'La marca es obligatoria')
    .max(60, 'La marca no puede superar 60 caracteres'),
  model: z
    .string()
    .trim()
    .min(1, 'El modelo es obligatorio')
    .max(60, 'El modelo no puede superar 60 caracteres'),
  year: z
    .number()
    .int('El año debe ser un número entero')
    .min(1900, 'El año debe ser 1900 o posterior')
    .max(currentYear + 1, `El año no puede ser posterior a ${currentYear + 1}`),
  color: z
    .string()
    .trim()
    .max(40, 'El color no puede superar 40 caracteres')
    .optional(),
});

export type UpdateVehicleFormValues = z.infer<typeof updateVehicleSchema>;
