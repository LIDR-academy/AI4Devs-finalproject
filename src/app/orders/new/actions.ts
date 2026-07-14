"use server";

import { redirect } from "next/navigation";

import { canManageOrders } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/require-role";
import { createOrderSchema } from "@/lib/validations/order";
import { createCustomerOrder } from "@/modules/orders/create-order";

export type CreateOrderFormState = {
  error?: string;
};

export async function createOrderAction(
  _previousState: CreateOrderFormState,
  formData: FormData,
): Promise<CreateOrderFormState> {
  const currentUser = await requireRole(canManageOrders);
  const rawItems = String(formData.get("items") ?? "[]");

  let parsedItems: unknown;

  try {
    parsedItems = JSON.parse(rawItems);
  } catch {
    return {
      error: "No se pudieron leer las líneas de la orden.",
    };
  }

  const parsed = createOrderSchema.safeParse({
    clientId: formData.get("clientId"),
    items: parsedItems,
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "No se pudo validar la orden.",
    };
  }

  try {
    const result = await createCustomerOrder(parsed.data, currentUser.authUser.id);
    const warning = result.hasMixedSuppliers ? "&warning=mixed-suppliers" : "";

    redirect(`/orders/${result.order.id}?created=1${warning}`);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "No se pudo crear la orden.",
    };
  }
}