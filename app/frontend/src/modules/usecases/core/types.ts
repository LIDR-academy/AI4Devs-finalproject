import type { Priority, UseCaseTableRow } from '../../shared/core/types'

export type UseCasesSectionProps = {
  useCaseFilterProject: string
  useCaseFilterTitle: string
  useCaseFilterPriority: 'ALL' | Priority
  priorityOptions: Array<{ value: Priority; label: string }>
  isLoadingUseCasesTable: boolean
  filteredUseCasesTable: UseCaseTableRow[]
  paginatedUseCases: UseCaseTableRow[]
  useCasePage: number
  useCaseRowsPerPage: number
  onUseCaseFilterProjectChange: (value: string) => void
  onUseCaseFilterTitleChange: (value: string) => void
  onUseCaseFilterPriorityChange: (value: 'ALL' | Priority) => void
  onUseCasePageChange: (value: number) => void
  onUseCaseRowsPerPageChange: (value: number) => void
}
