import { z } from 'zod';

export const updateUserSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, 'El nombre debe tener al menos 2 caracteres')
      .max(120, 'El nombre no puede superar 120 caracteres'),
    email: z
      .string()
      .trim()
      .email('Introduce un correo electrónico válido'),
    role: z.enum(['ADMIN', 'MECHANIC'], {
      message: 'Selecciona un rol',
    }),
    resetPassword: z.boolean(),
    password: z.string().optional(),
    canActAsMechanic: z.boolean(),
  })
  .superRefine((values, ctx) => {
    if (values.resetPassword) {
      if (!values.password || values.password.length < 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['password'],
          message: 'La contraseña debe tener al menos 8 caracteres',
        });
      }
    }
  });

export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;
