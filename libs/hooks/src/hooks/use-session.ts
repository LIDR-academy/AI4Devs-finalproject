import type { Session } from '@helsoft/supabase-services';
import { getSupabase } from '@helsoft/supabase-services';
import { useEffect, useState } from 'react';

import type { UseSessionResult } from './use-session.types';

export const useSession = (): UseSessionResult => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let supabase: ReturnType<typeof getSupabase>;
    try {
      supabase = getSupabase();
    } catch {
      setIsLoading(false);
      return;
    }
    supabase.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session);
        setIsLoading(false);
      })
      .catch(() => {
        setSession(null);
        setIsLoading(false);
      });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data?.subscription?.unsubscribe();
  }, []);

  return { session, isLoading };
};
