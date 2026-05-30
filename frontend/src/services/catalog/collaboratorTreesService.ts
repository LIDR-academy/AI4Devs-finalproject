import { apiFetch } from '@/services/http/apiClient'
import type {
  CollaboratorTreeDetail,
  CollaboratorTreePageResponse,
  CreateTreeRequest,
} from '@/types/catalog'

export type CollaboratorTreeSort =
  | 'modificado_en,desc'
  | 'modificado_en,asc'
  | 'creado_en,desc'
  | 'creado_en,asc'

export interface FetchCollaboratorTreesQuery {
  page?: number
  size?: number
  sort?: CollaboratorTreeSort | string
  speciesId?: number
  /** Fecha inclusiva UTC (`YYYY-MM-DD`). */
  createdFrom?: string
  createdTo?: string
  /** Solo efectivo para rol ADMIN. */
  createdByUserId?: number
}

const COLLABORATOR_TREES_API_PATH = '/api/catalog/trees'
const DEFAULT_PAGE_SIZE = 20
const DEFAULT_SORT: CollaboratorTreeSort = 'modificado_en,desc'

export async function fetchCollaboratorTrees(
  query: FetchCollaboratorTreesQuery = {},
  signal?: AbortSignal,
): Promise<CollaboratorTreePageResponse> {
  return apiFetch<CollaboratorTreePageResponse>(COLLABORATOR_TREES_API_PATH, {
    query: {
      page: query.page ?? 0,
      size: query.size ?? DEFAULT_PAGE_SIZE,
      sort: query.sort ?? DEFAULT_SORT,
      speciesId: query.speciesId,
      createdFrom: query.createdFrom,
      createdTo: query.createdTo,
      createdByUserId: query.createdByUserId,
    },
    signal,
  })
}

export async function fetchCollaboratorTreeDetail(
  treeId: number,
  signal?: AbortSignal,
): Promise<CollaboratorTreeDetail> {
  return apiFetch<CollaboratorTreeDetail>(`${COLLABORATOR_TREES_API_PATH}/${treeId}`, {
    signal,
  })
}

export async function updateCollaboratorTree(
  treeId: number,
  payload: CreateTreeRequest,
  signal?: AbortSignal,
): Promise<CollaboratorTreeDetail> {
  return apiFetch<CollaboratorTreeDetail>(`${COLLABORATOR_TREES_API_PATH}/${treeId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
    signal,
  })
}

export async function deleteCollaboratorTree(
  treeId: number,
  signal?: AbortSignal,
): Promise<void> {
  await apiFetch<void>(`${COLLABORATOR_TREES_API_PATH}/${treeId}`, {
    method: 'DELETE',
    signal,
  })
}
