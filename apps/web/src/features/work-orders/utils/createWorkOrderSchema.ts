import { z } from 'zod';

export const createWorkOrderSchema = z.object({
  vehicleId: z.string().uuid(),
  entryReason: z
    .string()
    .trim()
    .min(5, 'Mínimo 5 caracteres')
    .max(500, 'Máximo 500 caracteres'),
  mileage: z
    .number()
    .int('Debe ser un número entero')
    .min(0, 'Debe ser 0 o mayor'),
  assignedMechanicId: z.union([z.string().uuid(), z.literal('')]).optional(),
  initialTasks: z
    .array(
      z.object({
        description: z
          .string()
          .trim()
          .min(3, 'Mínimo 3 caracteres')
          .max(300, 'Máximo 300 caracteres'),
      }),
    )
    .min(1, 'Agrega al menos una tarea'),
});

export type CreateWorkOrderFormValues = z.infer<typeof createWorkOrderSchema>;
