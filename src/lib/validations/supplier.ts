import { z } from "zod";

export const createSupplierSchema = z.object({
  commercialName: z.string().trim().min(2, "El nombre comercial es obligatorio."),
  legalName: z.string().trim().optional(),
  supplierType: z.enum(["MANUFACTURER", "PRODUCER", "EXPORTER", "DISTRIBUTOR", "OTHER"]),
  status: z.enum(["PROSPECT", "UNDER_REVIEW", "ACTIVE", "INACTIVE", "BLOCKED"]),
  country: z.string().trim().optional(),
  city: z.string().trim().optional(),
  email: z.email("Introduce un email válido.").optional().or(z.literal("")),
  phone: z.string().trim().optional(),
  paymentTerms: z.string().trim().optional(),
  currency: z.string().trim().optional(),
  incoterm: z.string().trim().optional(),
  averageLeadTimeDays: z
    .union([z.coerce.number().int().positive(), z.literal("")])
    .transform((value) => (value === "" ? undefined : value)),
});

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;