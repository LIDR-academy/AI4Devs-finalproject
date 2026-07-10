import { projectsApi } from '../../../services/projectsApi'

export const estimationClient = {
  estimate: (projectId: string, payload: { roles: string[]; model: string }) => projectsApi.estimateProject(projectId, payload),
}
