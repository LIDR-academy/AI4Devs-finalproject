import { apiFetch } from '@/services/http/apiClient'
import type {
  CreateTreeRequest,
  CreatedTreeResponse,
  MasterDataPageResponse,
  MasterListItem,
  PublicTreeDetail,
  PublicProvinceNamesResponse,
  PublicTreePageResponse,
} from '@/types/catalog'

export async function fetchSpecies(signal?: AbortSignal): Promise<MasterListItem[]> {
  const response = await apiFetch<MasterDataPageResponse<MasterListItem>>(
    '/api/catalog/species',
    {
      query: { unpaged: true },
      signal,
    },
  )
  return response.content
}

export async function fetchProvinces(signal?: AbortSignal): Promise<MasterListItem[]> {
  const response = await apiFetch<MasterDataPageResponse<MasterListItem>>(
    '/api/catalog/provinces',
    {
      query: { unpaged: true },
      signal,
    },
  )
  return response.content
}

/** Catálogo público de provincias (solo nombres). Para formularios autenticados usar `fetchProvinces`. */
export async function fetchPublicProvinceNames(signal?: AbortSignal): Promise<string[]> {
  const response = await apiFetch<PublicProvinceNamesResponse>('/api/catalog/public/provinces', {
    signal,
  })
  return response.names ?? []
}

export async function createTree(payload: CreateTreeRequest): Promise<CreatedTreeResponse> {
  return apiFetch<CreatedTreeResponse>('/api/catalog/trees', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export interface FetchPublicTreesQuery {
  page?: number
  size?: number
  sort?: string
  species?: string
  province?: string
  municipality?: string
  publicationState?: string
  publicMapVisibility?: string
}

export async function fetchPublicTrees(
  query: FetchPublicTreesQuery,
  signal?: AbortSignal,
): Promise<PublicTreePageResponse> {
  return apiFetch<PublicTreePageResponse>('/api/catalog/public/trees', {
    query: {
      page: query.page ?? 0,
      size: query.size ?? 20,
      sort: query.sort ?? 'species,asc',
      species: query.species,
      province: query.province,
      municipality: query.municipality,
      publicationState: query.publicationState,
      publicMapVisibility: query.publicMapVisibility,
    },
    signal,
  })
}

export async function fetchPublicTreeDetail(
  treeId: number,
  signal?: AbortSignal,
): Promise<PublicTreeDetail> {
  return apiFetch<PublicTreeDetail>(`/api/catalog/public/trees/${treeId}`, {
    signal,
  })
}
