/**
 * Zod schema for expense form validation
 */

import { z } from 'zod';

export const createExpenseSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  amount: z
    .number({ message: 'El monto debe ser un número válido' })
    .positive('El monto debe ser positivo')
    .refine(
      value => {
        // Check if number has at most 2 decimal places
        const decimal_places = (value.toString().split('.')[1] || '').length;
        return decimal_places <= 2;
      },
      { message: 'El monto no puede tener más de 2 decimales' },
    )
    .refine(value => value >= 0.01, { message: 'El monto debe ser mayor a 0' }),
  category_id: z.number({ message: 'Debe seleccionar una categoría válida' }),
  payer_id: z.string().uuid('El pagador es requerido'),
  beneficiary_ids: z.array(z.string().uuid()).min(1, 'Debe seleccionar al menos un beneficiario'),
  receipt_url: z.string().url('URL inválida').optional().or(z.literal('')),
  expense_date: z
    .string()
    .min(1, 'La fecha del gasto es requerida')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe tener el formato YYYY-MM-DD'),
});

export type CreateExpenseFormData = z.infer<typeof createExpenseSchema>;
