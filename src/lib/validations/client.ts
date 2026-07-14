import { z } from "zod";

export const createClientSchema = z.object({
  commercialName: z.string().trim().min(2, "El nombre comercial es obligatorio."),
  legalName: z.string().trim().optional(),
  clientType: z.enum(["PROSPECT", "CUSTOMER", "DISTRIBUTOR", "OTHER"]),
  country: z.string().trim().optional(),
  city: z.string().trim().optional(),
  address: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  email: z.email("Introduce un email válido.").optional().or(z.literal("")),
  taxId: z.string().trim().optional(),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;