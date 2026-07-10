import type { AgentRole } from '../../shared/core/types'

export type RolesSectionProps = {
  isLoadingRoles: boolean
  agentRoles: AgentRole[]
  onOpenCreateRole: () => void
  onReloadRoles: () => void
  onEditRole: (role: AgentRole) => void
  onToggleRoleActive: (role: AgentRole) => void
  onDeleteRole: (roleId: string) => void
}
