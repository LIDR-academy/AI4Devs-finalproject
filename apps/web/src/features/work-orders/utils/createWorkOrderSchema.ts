import { z } from 'zod';

const broughtByPhoneSchema = z
  .string()
  .trim()
  .refine(
    (value) => value === '' || /^[0-9]{8,15}$/.test(value),
    'El teléfono debe tener entre 8 y 15 dígitos',
  );

export const createWorkOrderSchema = z
  .object({
    vehicleId: z.string().uuid(),
    entryReason: z
      .string()
      .trim()
      .min(5, 'Mínimo 5 caracteres')
      .max(500, 'Máximo 500 caracteres'),
    mileage: z.union([
      z.number().int('Debe ser un número entero').min(0, 'Debe ser 0 o mayor'),
      z.null(),
    ]),
    assignedMechanicId: z.union([z.string().uuid(), z.literal('')]).optional(),
    intakeMode: z.enum(['OWNER', 'THIRD_PARTY']),
    broughtByName: z.string().optional(),
    broughtByPhone: broughtByPhoneSchema.optional(),
    vehicleHasOwner: z.boolean(),
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
  })
  .superRefine((values, ctx) => {
    if (values.intakeMode === 'OWNER' && !values.vehicleHasOwner) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['intakeMode'],
        message:
          'El vehículo no tiene dueño; usa “Traído por tercero” o asocia un propietario.',
      });
    }

    if (values.intakeMode === 'THIRD_PARTY') {
      const name = values.broughtByName?.trim() ?? '';
      if (name.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['broughtByName'],
          message: 'Indica el nombre de quien trae el vehículo (mínimo 2 caracteres)',
        });
      } else if (name.length > 150) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['broughtByName'],
          message: 'El nombre no puede superar 150 caracteres',
        });
      }
    }
  });

export type CreateWorkOrderFormValues = z.infer<typeof createWorkOrderSchema>;
