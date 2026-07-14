import { ClientMemberRole, ClientStatus, type Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import type { CreateClientInput } from "@/lib/validations/client";

export async function createClientForUser(input: CreateClientInput, userId: string) {
  return db.$transaction(async (tx) => {
    const client = await tx.client.create({
      data: {
        commercialName: input.commercialName,
        legalName: input.legalName || null,
        clientType: input.clientType,
        status: ClientStatus.PROSPECT,
        country: input.country || null,
        city: input.city || null,
        address: input.address || null,
        phone: input.phone || null,
        email: input.email || null,
        taxId: input.taxId || null,
        primaryOwnerId: userId,
      },
    });

    await tx.clientAssignment.create({
      data: {
        clientId: client.id,
        userId,
        memberRole: ClientMemberRole.OWNER,
      },
    });

    return client;
  });
}

export type ClientRecord = Prisma.ClientGetPayload<Record<string, never>>;