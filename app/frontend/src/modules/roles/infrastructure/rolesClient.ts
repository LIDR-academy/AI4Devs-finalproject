import { projectsApi } from '../../../services/projectsApi'

export const rolesClient = {
  list: () => projectsApi.listAgentRoles(),
  create: (payload: { name: string; key?: string; description?: string }) => projectsApi.createAgentRole(payload),
  update: (roleId: string, payload: { name?: string; key?: string; description?: string; isActive?: boolean }) =>
    projectsApi.updateAgentRole(roleId, payload),
  remove: (roleId: string) => projectsApi.deleteAgentRole(roleId),
}
