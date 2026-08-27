import { apiRequest } from '../../../shared/http/apiClient.js';

export interface PermissionDto {
  id: string;
  code: string;
  name: string;
  module: string;
  description?: string;
}

export interface RoleDto {
  id: string;
  name: string;
  description?: string;
  permissions: PermissionDto[];
}

export const RolesService = {
  async fetchRoles(): Promise<RoleDto[]> {
    return apiRequest<RoleDto[]>('/roles');
  },

  async fetchPermissions(): Promise<PermissionDto[]> {
    return apiRequest<PermissionDto[]>('/roles/permissions');
  },

  async createRole(data: { name: string; description?: string; permissionIds?: string[] }): Promise<RoleDto> {
    return apiRequest<RoleDto>('/roles', {
      method: 'POST',
      body: data,
    });
  },

  async updateRolePermissions(roleId: string, permissionIds: string[]): Promise<void> {
    await apiRequest<void>(`/roles/${roleId}/permissions`, {
      method: 'PUT',
      body: { permissionIds },
    });
  },
};
