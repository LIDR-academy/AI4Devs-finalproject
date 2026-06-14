import { z } from 'zod';

export const AddToCartSchema = z
  .object({
    productId: z.string().min(1),
    quantity: z.number().int().min(1),
    size: z.string().optional(),
    color: z.string().optional(),
  })
  .strict();

export type AddToCartInput = z.infer<typeof AddToCartSchema>;
