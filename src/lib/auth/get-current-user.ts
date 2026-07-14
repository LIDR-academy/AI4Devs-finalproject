import { cache } from "react";

import { db } from "@/lib/db";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CurrentUser } from "@/lib/auth/types";

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const profile = await db.userProfile.findUnique({
    where: { id: user.id },
  });

  return {
    authUser: user,
    profile,
    role: profile?.role ?? null,
    isActive: profile?.isActive ?? false,
  };
});