import { SupplierStatus } from "@prisma/client";

import { db } from "@/lib/db";

export async function listActiveSuppliers() {
  return db.supplier.findMany({
    where: {
      status: SupplierStatus.ACTIVE,
    },
    orderBy: {
      commercialName: "asc",
    },
  });
}