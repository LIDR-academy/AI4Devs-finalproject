import { useEffect, useState } from 'react';
import { getSupabase } from '@helsoft/services';
import type { Session } from '@helsoft/services';

export type UseSessionResult = {
  session: Session | null;
  /** True until the initial getSession() resolves — distinguishes "logged out" from "not yet known". */
  isLoading: boolean;
};

export const useSession = (): UseSessionResult => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let supabase;
    try {
      supabase = getSupabase();
    } catch {
      setIsLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsLoading(false);
    }).catch(() => { setSession(null); setIsLoading(false); })
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data?.subscription?.unsubscribe();
  }, []);

  return { session, isLoading };
};
