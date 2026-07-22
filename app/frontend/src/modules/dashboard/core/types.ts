import type { ProjectSummary } from '../../shared/core/types'

export type DashboardSectionProps = {
  projects: ProjectSummary[]
  filteredProjects: ProjectSummary[]
  totalUseCases: number
  workflowProgress: number
  selectedProjectName?: string
  onSelectProject: (projectId: string) => void
}
