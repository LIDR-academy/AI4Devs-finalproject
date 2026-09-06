import { z } from 'zod';

export const addTaskSchema = z.object({
  description: z
    .string()
    .trim()
    .min(3, 'Mínimo 3 caracteres')
    .max(300, 'Máximo 300 caracteres'),
});

export type AddTaskFormValues = z.infer<typeof addTaskSchema>;

export const completeTaskSchema = z.object({
  cost: z.number().min(0, 'El costo debe ser 0 o mayor'),
  costNotes: z
    .string()
    .trim()
    .max(500, 'Máximo 500 caracteres')
    .optional(),
});

export type CompleteTaskFormValues = z.infer<typeof completeTaskSchema>;
