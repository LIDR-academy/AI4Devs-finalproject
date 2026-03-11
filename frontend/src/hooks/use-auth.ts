"use client";

import { useMemo } from "react";

import { initializeApiClient } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

export function useAuth() {
  const apiKey = useAuthStore((state) => state.apiKey);
  const email = useAuthStore((state) => state.email);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);

  const actions = useMemo(
    () => ({
      login: (nextApiKey: string, nextEmail: string) => {
        setSession({ apiKey: nextApiKey, email: nextEmail });
        initializeApiClient(() => nextApiKey);
      },
      logout: () => {
        clearSession();
        initializeApiClient(() => undefined);
      },
    }),
    [clearSession, setSession],
  );

  return {
    apiKey,
    email,
    isAuthenticated,
    ...actions,
  };
}
