"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireActiveUser } from "@/lib/auth/require-active-user";
import { createClientSchema } from "@/lib/validations/client";
import { createClientForUser } from "@/modules/clients/create-client";

export type CreateClientFormState = {
  error?: string;
};

export async function createClientAction(
  _previousState: CreateClientFormState,
  formData: FormData,
): Promise<CreateClientFormState> {
  const currentUser = await requireActiveUser();

  const parsed = createClientSchema.safeParse({
    commercialName: formData.get("commercialName"),
    legalName: formData.get("legalName"),
    clientType: formData.get("clientType"),
    country: formData.get("country"),
    city: formData.get("city"),
    address: formData.get("address"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    taxId: formData.get("taxId"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "No se pudo validar el cliente.",
    };
  }

  const client = await createClientForUser(parsed.data, currentUser.authUser.id);

  revalidatePath("/");
  redirect(`/clients/${client.id}?created=1`);
}