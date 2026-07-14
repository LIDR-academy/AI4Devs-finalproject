import { db } from "@/lib/db";

export async function listClientsVisibleToUser(userId: string, canViewAll: boolean) {
  return db.client.findMany({
    where: canViewAll
      ? undefined
      : {
          assignments: {
            some: {
              userId,
            },
          },
        },
    include: {
      primaryOwner: true,
      assignments: {
        include: {
          user: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getClientVisibleToUser(clientId: string, userId: string, canViewAll: boolean) {
  return db.client.findFirst({
    where: {
      id: clientId,
      ...(canViewAll
        ? {}
        : {
            assignments: {
              some: {
                userId,
              },
            },
          }),
    },
    include: {
      primaryOwner: true,
      assignments: {
        include: {
          user: true,
        },
      },
    },
  });
}