import { http } from './http'
import type {
  AgentRole,
  EstimationResult,
  ProjectEstimationHistoryItem,
  ProjectReport,
  ProjectSummary,
  UseCaseTableRow,
} from '../modules/shared/core/types'

export const projectsApi = {
  listProjects: async () => {
    const { data } = await http.get<ProjectSummary[]>('/projects')
    return data
  },
  listUseCasesByProject: async () => {
    const { data } = await http.get<UseCaseTableRow[]>('/projects/use-cases')
    return data
  },
  listAgentRoles: async () => {
    const { data } = await http.get<AgentRole[]>('/projects/agent-roles')
    return data
  },
  createProject: async (payload: { name: string; description: string; complexity: string }) => {
    const { data } = await http.post<ProjectSummary>('/projects', payload)
    return data
  },
  createUseCase: async (
    projectId: string,
    payload: { title: string; description: string; priority: string },
  ) => {
    const { data } = await http.post(`/projects/${projectId}/use-cases`, payload)
    return data
  },
  listProjectEstimations: async (projectId: string) => {
    const { data } = await http.get<ProjectEstimationHistoryItem[]>(`/projects/${projectId}/estimations`)
    return data
  },
  getProjectReport: async (projectId: string, version?: number) => {
    const query = typeof version === 'number' ? `?version=${version}` : ''
    const { data } = await http.get<ProjectReport>(`/projects/${projectId}${query}`)
    return data
  },
  estimateProject: async (projectId: string, payload: { roles: string[]; model: string }) => {
    const { data } = await http.post<EstimationResult>(`/projects/${projectId}/estimate`, payload)
    return data
  },
  createAgentRole: async (payload: { name: string; key?: string; description?: string }) => {
    const { data } = await http.post<AgentRole>('/projects/agent-roles', payload)
    return data
  },
  updateAgentRole: async (roleId: string, payload: { name?: string; key?: string; description?: string; isActive?: boolean }) => {
    const { data } = await http.put<AgentRole>(`/projects/agent-roles/${roleId}`, payload)
    return data
  },
  deleteAgentRole: async (roleId: string) => {
    await http.delete(`/projects/agent-roles/${roleId}`)
  },
}
