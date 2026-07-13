import type { Session, User } from '@supabase/supabase-js';

export type SignInWithPasswordParams = {
  email: string;
  password: string;
};

export type SignInWithPasswordResult = {
  session: Session | null;
  user: User | null;
};
