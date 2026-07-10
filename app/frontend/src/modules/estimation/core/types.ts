import type { AgentRole, EstimationResult, ProjectSummary } from '../../shared/core/types'

export type EstimationSectionProps = {
  selectedProjectId: string
  projects: ProjectSummary[]
  estimationModel: string
  canEstimate: boolean
  isEstimating: boolean
  activeAgentRoles: AgentRole[]
  selectedRoles: string[]
  selectedProjectName?: string
  estimationResult: EstimationResult | null
  onSelectedProjectChange: (projectId: string) => void
  onEstimationModelChange: (value: string) => void
  onEstimate: () => void
  onToggleRole: (roleKey: string) => void
  onGoToRoles: () => void
}
