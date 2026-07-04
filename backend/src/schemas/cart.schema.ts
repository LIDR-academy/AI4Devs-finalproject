import { z } from 'zod';

export const AddToCartSchema = z
  .object({
    productId: z.string().min(1),
    quantity: z.number().int().min(1).max(9999),
    size: z.string().max(50).optional(),
    color: z.string().max(50).optional(),
  })
  .strict();

export type AddToCartInput = z.infer<typeof AddToCartSchema>;

export const UpdateCartItemSchema = z
  .object({
    quantity: z.number().int().min(1).max(9999),
    size: z.string().max(50).optional(),
    color: z.string().max(50).optional(),
  })
  .strict();

export type UpdateCartItemInput = z.infer<typeof UpdateCartItemSchema>;
