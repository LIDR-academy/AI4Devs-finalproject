import { OrderCommercialStatus } from "@prisma/client";

import { db } from "@/lib/db";
import type { CreateOrderInput } from "@/lib/validations/order";

function buildOrderNumber() {
  const now = new Date();
  const stamp = now.toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();

  return `ORD-${stamp}-${random}`;
}

export async function createCustomerOrder(input: CreateOrderInput, ownerId: string) {
  const client = await db.client.findUnique({
    where: { id: input.clientId },
  });

  if (!client) {
    throw new Error("El cliente seleccionado no existe.");
  }

  const products = await db.product.findMany({
    where: {
      id: {
        in: input.items.map((item) => item.productId),
      },
    },
    include: {
      supplier: true,
    },
  });

  if (products.length !== input.items.length) {
    throw new Error("Uno o más productos seleccionados no existen.");
  }

  const productMap = new Map(products.map((product) => [product.id, product]));

  const normalizedItems = input.items.map((item) => {
    const product = productMap.get(item.productId);

    if (!product) {
      throw new Error("No se pudo resolver uno de los productos de la orden.");
    }

    return {
      product,
      quantity: item.quantity,
      unitPrice: Number(product.basePrice),
      discount: 0,
      total: Number(product.basePrice) * item.quantity,
    };
  });

  const subtotal = normalizedItems.reduce((sum, item) => sum + item.total, 0);
  const taxes = 0;
  const discount = 0;
  const total = subtotal + taxes - discount;
  const distinctSuppliers = [...new Set(normalizedItems.map((item) => item.product.supplierId))];
  const hasMixedSuppliers = distinctSuppliers.length > 1;

  const order = await db.customerOrder.create({
    data: {
      clientId: input.clientId,
      ownerId,
      supplierId: hasMixedSuppliers ? null : distinctSuppliers[0],
      orderNumber: buildOrderNumber(),
      commercialStatus: OrderCommercialStatus.CREATED,
      subtotal,
      taxes,
      discount,
      total,
      items: {
        create: normalizedItems.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
          total: item.total,
        })),
      },
    },
    include: {
      client: true,
      supplier: true,
      items: {
        include: {
          product: {
            include: {
              supplier: true,
            },
          },
        },
      },
    },
  });

  return {
    order,
    hasMixedSuppliers,
  };
}