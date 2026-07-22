import type { ProjectSummary } from '../../shared/core/types'

export type DashboardMetrics = {
  estimatedProjects: number
  averageUseCasesPerProject: number
}

export const dashboardClient = {
  buildMetrics(projects: ProjectSummary[]): DashboardMetrics {
    const estimatedProjects = projects.filter((project) => (project._count?.useCases ?? 0) > 0).length
    const totalUseCases = projects.reduce((acc, project) => acc + (project._count?.useCases ?? 0), 0)
    const averageUseCasesPerProject = projects.length > 0 ? Math.round((totalUseCases / projects.length) * 10) / 10 : 0

    return {
      estimatedProjects,
      averageUseCasesPerProject,
    }
  },
}
