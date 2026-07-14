import { db } from "@/lib/db";

export async function listSuppliers() {
  return db.supplier.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}