import type { Complexity, ProjectSummary } from '../../shared/core/types'

export type ProjectsSectionProps = {
  projectSearch: string
  projectFilterComplexity: 'ALL' | Complexity
  projectFilterMinUseCases: string
  complexityOptions: Array<{ value: Complexity; label: string }>
  isLoadingProjects: boolean
  filteredProjects: ProjectSummary[]
  paginatedProjects: ProjectSummary[]
  projectPage: number
  projectRowsPerPage: number
  onProjectSearchChange: (value: string) => void
  onProjectFilterComplexityChange: (value: 'ALL' | Complexity) => void
  onProjectFilterMinUseCasesChange: (value: string) => void
  onSelectProject: (projectId: string) => void
  onProjectPageChange: (page: number) => void
  onProjectRowsPerPageChange: (rowsPerPage: number) => void
}
