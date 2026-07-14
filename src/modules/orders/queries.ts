import { db } from "@/lib/db";

export async function listOrders() {
  return db.customerOrder.findMany({
    include: {
      client: true,
      owner: true,
      supplier: true,
      items: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getOrderById(orderId: string) {
  return db.customerOrder.findUnique({
    where: {
      id: orderId,
    },
    include: {
      client: true,
      owner: true,
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
}