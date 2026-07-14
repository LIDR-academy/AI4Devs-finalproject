import type { UserProfile, UserRole } from "@prisma/client";
import type { User } from "@supabase/supabase-js";

export type CurrentUser = {
  authUser: User;
  profile: UserProfile | null;
  role: UserRole | null;
  isActive: boolean;
};