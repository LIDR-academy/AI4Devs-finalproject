import { httpClient } from "./httpClient";

export type Permission = { codigo: string; descripcion: string };
export type Role = { id: number; nombre: string; descripcion: string; permissions: string[] };

export const rolesService = {
   listRoles: () => httpClient.get<Role[]>("/api/roles/"),
   listPermissions: () => httpClient.get<Permission[]>("/api/permisos"),
   updateRolePermissions: (roleId: number, permissions: string[]) =>
      httpClient.patch(`/api/roles/${roleId}/`, { permissions }),
};
