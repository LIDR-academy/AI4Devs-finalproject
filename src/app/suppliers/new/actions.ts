"use server";

import { redirect } from "next/navigation";

import { canManageSuppliers } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/require-role";
import { createSupplierSchema } from "@/lib/validations/supplier";
import { createSupplier } from "@/modules/suppliers/create-supplier";

export type CreateSupplierFormState = {
  error?: string;
};

export async function createSupplierAction(
  _previousState: CreateSupplierFormState,
  formData: FormData,
): Promise<CreateSupplierFormState> {
  await requireRole(canManageSuppliers);

  const parsed = createSupplierSchema.safeParse({
    commercialName: formData.get("commercialName"),
    legalName: formData.get("legalName"),
    supplierType: formData.get("supplierType"),
    status: formData.get("status"),
    country: formData.get("country"),
    city: formData.get("city"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    paymentTerms: formData.get("paymentTerms"),
    currency: formData.get("currency"),
    incoterm: formData.get("incoterm"),
    averageLeadTimeDays: formData.get("averageLeadTimeDays"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "No se pudo validar el proveedor.",
    };
  }

  const supplier = await createSupplier(parsed.data);
  redirect(`/suppliers?created=${supplier.id}`);
}