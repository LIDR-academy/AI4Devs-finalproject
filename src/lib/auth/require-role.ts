import { notFound } from "next/navigation";

import { requireActiveUser } from "@/lib/auth/require-active-user";

export async function requireRole(check: (role: Awaited<ReturnType<typeof requireActiveUser>>["role"]) => boolean) {
  const currentUser = await requireActiveUser();

  if (!check(currentUser.role)) {
    notFound();
  }

  return currentUser;
}