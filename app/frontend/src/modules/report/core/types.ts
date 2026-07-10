import type { ProjectEstimationHistoryItem, ProjectReport, ProjectSummary } from '../../shared/core/types'

export type ReportSectionProps = {
  selectedProjectId: string
  selectedReportVersion: string
  projects: ProjectSummary[]
  projectEstimations: ProjectEstimationHistoryItem[]
  reportProject: ProjectReport | null
  isLoadingReport: boolean
  onSelectedProjectChange: (projectId: string) => void
  onSelectedVersionChange: (version: string) => void
  onLoadReport: () => void
  onExportPdf: () => void
  onExportCsv: () => void
  onExportJson: () => void
}
