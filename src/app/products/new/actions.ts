"use server";

import { redirect } from "next/navigation";

import { canManageProducts } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/require-role";
import { createProductSchema } from "@/lib/validations/product";
import { createProduct } from "@/modules/products/create-product";

export type CreateProductFormState = {
  error?: string;
};

export async function createProductAction(
  _previousState: CreateProductFormState,
  formData: FormData,
): Promise<CreateProductFormState> {
  await requireRole(canManageProducts);

  const parsed = createProductSchema.safeParse({
    supplierId: formData.get("supplierId"),
    sku: formData.get("sku"),
    supplierSku: formData.get("supplierSku"),
    name: formData.get("name"),
    brand: formData.get("brand"),
    category: formData.get("category"),
    presentation: formData.get("presentation"),
    unit: formData.get("unit"),
    basePrice: formData.get("basePrice"),
    estimatedCost: formData.get("estimatedCost"),
    leadTimeDays: formData.get("leadTimeDays"),
    minimumOrderQuantity: formData.get("minimumOrderQuantity"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "No se pudo validar el producto.",
    };
  }

  try {
    const product = await createProduct(parsed.data);
    redirect(`/products?created=${product.id}`);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "No se pudo crear el producto.",
    };
  }
}