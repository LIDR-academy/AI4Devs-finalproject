import { db } from "@/lib/db";
import type { CreateSupplierInput } from "@/lib/validations/supplier";

export async function createSupplier(input: CreateSupplierInput) {
  return db.supplier.create({
    data: {
      commercialName: input.commercialName,
      legalName: input.legalName || null,
      supplierType: input.supplierType,
      status: input.status,
      country: input.country || null,
      city: input.city || null,
      email: input.email || null,
      phone: input.phone || null,
      paymentTerms: input.paymentTerms || null,
      currency: input.currency || null,
      incoterm: input.incoterm || null,
      averageLeadTimeDays: input.averageLeadTimeDays,
    },
  });
}