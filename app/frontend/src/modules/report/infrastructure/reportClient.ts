import { projectsApi } from '../../../services/projectsApi'

export const reportClient = {
  listEstimations: (projectId: string) => projectsApi.listProjectEstimations(projectId),
  getProjectReport: (projectId: string, version?: number) => projectsApi.getProjectReport(projectId, version),
}
