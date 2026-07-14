import { ProductStatus } from "@prisma/client";

import { db } from "@/lib/db";

export async function listProducts() {
  return db.product.findMany({
    include: {
      supplier: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function listActiveProducts() {
  return db.product.findMany({
    where: {
      status: ProductStatus.ACTIVE,
    },
    include: {
      supplier: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}