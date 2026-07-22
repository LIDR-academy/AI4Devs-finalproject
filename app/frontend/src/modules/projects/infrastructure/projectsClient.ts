import { projectsApi } from '../../../services/projectsApi'
import type { Complexity } from '../../shared/core/types'

export const projectsClient = {
  list: () => projectsApi.listProjects(),
  create: (payload: { name: string; description: string; complexity: Complexity }) => projectsApi.createProject(payload),
}
