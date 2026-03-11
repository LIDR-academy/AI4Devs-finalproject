import { create } from "zustand";

type AuthState = {
  apiKey?: string;
  email?: string;
  isAuthenticated: boolean;
  setSession: (payload: { apiKey: string; email: string }) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  apiKey: undefined,
  email: undefined,
  isAuthenticated: false,
  setSession: ({ apiKey, email }) =>
    set({
      apiKey,
      email,
      isAuthenticated: true,
    }),
  clearSession: () =>
    set({
      apiKey: undefined,
      email: undefined,
      isAuthenticated: false,
    }),
}));
