import { apiFetch } from '@/services/http/apiClient'
import type {
  CollaboratorEjemplarDetail,
  CollaboratorEjemplarPageResponse,
  CreateEjemplarRequest,
} from '@/types/catalog'

export type CollaboratorEjemplarSort =
  | 'modificado_en,desc'
  | 'modificado_en,asc'
  | 'creado_en,desc'
  | 'creado_en,asc'

export interface FetchCollaboratorEjemplaresQuery {
  page?: number
  size?: number
  sort?: CollaboratorEjemplarSort | string
  speciesId?: number
  /** Fecha inclusiva UTC (`YYYY-MM-DD`). */
  createdFrom?: string
  createdTo?: string
  /** Solo efectivo para rol ADMIN. */
  createdByUserId?: number
}

const COLLABORATOR_EJEMPLARES_PATH = '/api/catalog/ejemplares'
const DEFAULT_PAGE_SIZE = 20
const DEFAULT_SORT: CollaboratorEjemplarSort = 'modificado_en,desc'

export async function fetchCollaboratorEjemplares(
  query: FetchCollaboratorEjemplaresQuery = {},
  signal?: AbortSignal,
): Promise<CollaboratorEjemplarPageResponse> {
  return apiFetch<CollaboratorEjemplarPageResponse>(COLLABORATOR_EJEMPLARES_PATH, {
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

export async function fetchCollaboratorEjemplarDetail(
  ejemplarId: number,
  signal?: AbortSignal,
): Promise<CollaboratorEjemplarDetail> {
  return apiFetch<CollaboratorEjemplarDetail>(`${COLLABORATOR_EJEMPLARES_PATH}/${ejemplarId}`, {
    signal,
  })
}

export async function updateCollaboratorEjemplar(
  ejemplarId: number,
  payload: CreateEjemplarRequest,
  signal?: AbortSignal,
): Promise<CollaboratorEjemplarDetail> {
  return apiFetch<CollaboratorEjemplarDetail>(`${COLLABORATOR_EJEMPLARES_PATH}/${ejemplarId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
    signal,
  })
}

export async function deleteCollaboratorEjemplar(
  ejemplarId: number,
  signal?: AbortSignal,
): Promise<void> {
  await apiFetch<void>(`${COLLABORATOR_EJEMPLARES_PATH}/${ejemplarId}`, {
    method: 'DELETE',
    signal,
  })
}
