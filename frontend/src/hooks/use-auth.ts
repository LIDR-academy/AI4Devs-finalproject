"use client";

import { useMemo } from "react";

import { useAuthStore } from "@/stores/auth-store";

type SessionPayload = {
  email: string;
  apiKeyStatus: "active" | "inactive" | "revoked";
  createdAt: string;
  lastRenewedAt: string | null;
  usageCount: number;
};

async function readSessionResponse(response: Response): Promise<SessionPayload | null> {
  const payload = (await response.json().catch(() => null)) as
    | { data?: SessionPayload; message?: string }
    | null;

  if (!response.ok || !payload?.data) {
    return null;
  }

  return payload.data;
}

export function useAuth() {
  const email = useAuthStore((state) => state.email);
  const apiKeyStatus = useAuthStore((state) => state.apiKeyStatus);
  const createdAt = useAuthStore((state) => state.createdAt);
  const lastRenewedAt = useAuthStore((state) => state.lastRenewedAt);
  const usageCount = useAuthStore((state) => state.usageCount);
  const isHydrating = useAuthStore((state) => state.isHydrating);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setSession = useAuthStore((state) => state.setSession);
  const setHydrating = useAuthStore((state) => state.setHydrating);
  const clearSession = useAuthStore((state) => state.clearSession);

  const actions = useMemo(
    () => ({
      login: async (nextApiKey: string, nextEmail: string) => {
        setHydrating(true);
        try {
          const response = await fetch("/api/auth/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: nextEmail, apiKey: nextApiKey }),
          });

          const data = await readSessionResponse(response);
          if (!data) {
            clearSession();
            throw new Error("Invalid email or API key");
          }

          setSession(data);
        } catch (error) {
          clearSession();
          throw error;
        }
      },
      logout: async () => {
        try {
          setHydrating(true);
          await fetch("/api/auth/session", {
            method: "DELETE",
            cache: "no-store",
          }).catch(() => null);
        } finally {
          clearSession();
        }
      },
      hydrateSession: async () => {
        setHydrating(true);
        try {
          const response = await fetch("/api/auth/session", {
            method: "GET",
            cache: "no-store",
          });

          const data = await readSessionResponse(response);
          if (!data) {
            clearSession();
            return;
          }

          setSession(data);
        } catch {
          clearSession();
        }
      },
    }),
    [clearSession, setHydrating, setSession],
  );

  return {
    email,
    apiKeyStatus,
    createdAt,
    lastRenewedAt,
    usageCount,
    isHydrating,
    isAuthenticated,
    ...actions,
  };
}
