import { z } from "zod";

export const createProductSchema = z.object({
  supplierId: z.string().uuid("Selecciona un proveedor válido."),
  sku: z.string().trim().min(2, "El SKU es obligatorio."),
  supplierSku: z.string().trim().optional(),
  name: z.string().trim().min(2, "El nombre del producto es obligatorio."),
  brand: z.string().trim().optional(),
  category: z.string().trim().optional(),
  presentation: z.string().trim().optional(),
  unit: z.string().trim().optional(),
  basePrice: z.coerce.number().nonnegative("El precio base no puede ser negativo."),
  estimatedCost: z.union([z.coerce.number().nonnegative(), z.literal("")]).transform((value) => (value === "" ? undefined : value)),
  leadTimeDays: z.union([z.coerce.number().int().positive(), z.literal("")]).transform((value) => (value === "" ? undefined : value)),
  minimumOrderQuantity: z.union([z.coerce.number().int().positive(), z.literal("")]).transform((value) => (value === "" ? 1 : value)),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;