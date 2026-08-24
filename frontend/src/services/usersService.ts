import { httpClient } from "./httpClient";

export type UserRecord = {
   id: number;
   email: string;
   nombre: string;
   rol: string;
   activo: boolean;
};

export const usersService = {
   list: () => httpClient.get<UserRecord[]>("/api/users/"),
   create: (payload: { email: string; nombre: string; password: string; rol: string }) =>
      httpClient.post<UserRecord>("/api/users/", payload),
   setActive: (id: number, activo: boolean) =>
      httpClient.patch<UserRecord>(`/api/users/${id}/`, { activo }),
   setRole: (id: number, rol: string) =>
      httpClient.patch<UserRecord>(`/api/users/${id}/`, { rol }),
};
