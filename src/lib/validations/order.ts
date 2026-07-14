import { z } from "zod";

export const createOrderItemSchema = z.object({
  productId: z.string().uuid("Producto inválido."),
  quantity: z.coerce.number().int().positive("La cantidad debe ser mayor que cero."),
});

export const createOrderSchema = z.object({
  clientId: z.string().uuid("Selecciona un cliente válido."),
  items: z.array(createOrderItemSchema).min(1, "La orden debe tener al menos un producto."),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;