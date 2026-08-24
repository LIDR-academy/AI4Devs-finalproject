import { httpClient } from "./httpClient";

export type LoginResponse = {
   access: string;
   refresh: string;
};

export type MeResponse = {
   id: number;
   email: string;
   nombre: string;
   rol: string | null;
   permissions: string[];
};

export const authService = {
   login: (email: string, password: string) =>
      httpClient.postPublic<LoginResponse>("/api/auth/login", { email, password }),
   refresh: (refresh: string) =>
      httpClient.postPublic<{ access: string }>("/api/auth/refresh", { refresh }),
   me: () => httpClient.get<MeResponse>("/api/auth/me"),
};
