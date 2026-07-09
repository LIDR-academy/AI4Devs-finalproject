import { useMutation } from "@tanstack/react-query";
import type { AuthResponse, LoginRequest } from "@/types/auth";
import apiClient from "./client";

export function useLogin() {
  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const { data } = await apiClient.post<AuthResponse>("/auth/login", credentials);
      return data;
    },
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: async () => {
      await apiClient.post("/auth/logout");
    },
  });
}

export function useRefreshToken() {
  return useMutation({
    mutationFn: async (refreshToken: string) => {
      const { data } = await apiClient.post<AuthResponse>("/auth/refresh", { refreshToken });
      return data;
    },
  });
}
