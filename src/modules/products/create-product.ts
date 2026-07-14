import { ProductStatus, SupplierStatus } from "@prisma/client";

import { db } from "@/lib/db";
import type { CreateProductInput } from "@/lib/validations/product";

export async function createProduct(input: CreateProductInput) {
  const supplier = await db.supplier.findUnique({
    where: { id: input.supplierId },
  });

  if (!supplier || supplier.status !== SupplierStatus.ACTIVE) {
    throw new Error("El proveedor principal debe estar activo.");
  }

  if (input.status === ProductStatus.ACTIVE && !input.supplierId) {
    throw new Error("Un producto activo debe tener proveedor principal.");
  }

  const estimatedMargin =
    typeof input.estimatedCost === "number" && input.basePrice > 0
      ? Number((((input.basePrice - input.estimatedCost) / input.basePrice) * 100).toFixed(2))
      : undefined;

  return db.product.create({
    data: {
      supplierId: input.supplierId,
      sku: input.sku,
      supplierSku: input.supplierSku || null,
      name: input.name,
      brand: input.brand || null,
      category: input.category || null,
      presentation: input.presentation || null,
      unit: input.unit || null,
      basePrice: input.basePrice,
      estimatedCost: input.estimatedCost,
      estimatedMargin,
      leadTimeDays: input.leadTimeDays,
      minimumOrderQuantity: input.minimumOrderQuantity,
      status: input.status,
    },
  });
}