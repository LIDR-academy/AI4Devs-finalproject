import { create } from "zustand";

type ApiKeyStatus = "active" | "inactive" | "revoked";

type AuthState = {
  email?: string;
  apiKeyStatus?: ApiKeyStatus;
  createdAt?: string;
  lastRenewedAt?: string | null;
  usageCount?: number;
  isHydrating: boolean;
  isAuthenticated: boolean;
  setSession: (payload: {
    email: string;
    apiKeyStatus: ApiKeyStatus;
    createdAt: string;
    lastRenewedAt: string | null;
    usageCount: number;
  }) => void;
  setHydrating: (value: boolean) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  email: undefined,
  apiKeyStatus: undefined,
  createdAt: undefined,
  lastRenewedAt: undefined,
  usageCount: undefined,
  isHydrating: true,
  isAuthenticated: false,
  setSession: ({ email, apiKeyStatus, createdAt, lastRenewedAt, usageCount }) =>
    set({
      email,
      apiKeyStatus,
      createdAt,
      lastRenewedAt,
      usageCount,
      isHydrating: false,
      isAuthenticated: true,
    }),
  setHydrating: (value) =>
    set({
      isHydrating: value,
    }),
  clearSession: () =>
    set({
      email: undefined,
      apiKeyStatus: undefined,
      createdAt: undefined,
      lastRenewedAt: undefined,
      usageCount: undefined,
      isHydrating: false,
      isAuthenticated: false,
    }),
}));
