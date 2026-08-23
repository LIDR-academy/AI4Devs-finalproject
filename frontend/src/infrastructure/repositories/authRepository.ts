import type { AuthResponse, LoginRequest } from "@/domain/types/auth";
import apiClient from "./apiClient";

export const authRepository = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>("/auth/login", credentials);
    return data;
  },

  async refresh(refreshToken: string): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>("/auth/refresh", { refreshToken });
    return data;
  },

  async logout(): Promise<void> {
    await apiClient.post("/auth/logout");
  },
};
