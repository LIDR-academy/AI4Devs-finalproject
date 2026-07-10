import { projectsApi } from '../../../services/projectsApi'
import type { Priority } from '../../shared/core/types'

export const useCasesClient = {
  listByProject: () => projectsApi.listUseCasesByProject(),
  create: (projectId: string, payload: { title: string; description: string; priority: Priority }) =>
    projectsApi.createUseCase(projectId, payload),
}
