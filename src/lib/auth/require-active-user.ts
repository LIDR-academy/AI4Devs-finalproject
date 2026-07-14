import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/get-current-user";

export async function requireActiveUser() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  if (!currentUser.isActive) {
    redirect("/login?reason=inactive");
  }

  return currentUser;
}