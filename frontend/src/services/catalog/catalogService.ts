import { apiFetch } from '@/services/http/apiClient'
import type {
  CreateEjemplarRequest,
  CreatedEjemplarResponse,
  MasterDataPageResponse,
  MasterListItem,
  PublicEjemplarDetail,
  PublicProvinceNamesResponse,
  PublicEjemplarPageResponse,
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

export async function createEjemplar(payload: CreateEjemplarRequest): Promise<CreatedEjemplarResponse> {
  return apiFetch<CreatedEjemplarResponse>('/api/catalog/ejemplares', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export interface FetchPublicEjemplaresQuery {
  page?: number
  size?: number
  sort?: string
  especie?: string
  provincia?: string
  municipio?: string
  estado?: string
  visibilidad?: string
}

export async function fetchPublicEjemplares(
  query: FetchPublicEjemplaresQuery,
  signal?: AbortSignal,
): Promise<PublicEjemplarPageResponse> {
  return apiFetch<PublicEjemplarPageResponse>('/api/catalog/public/ejemplares', {
    query: {
      page: query.page ?? 0,
      size: query.size ?? 20,
      sort: query.sort ?? 'especie,asc',
      especie: query.especie,
      provincia: query.provincia,
      municipio: query.municipio,
      estado: query.estado,
      visibilidad: query.visibilidad,
    },
    signal,
  })
}

export async function fetchPublicEjemplarDetail(
  ejemplarId: number,
  signal?: AbortSignal,
): Promise<PublicEjemplarDetail> {
  return apiFetch<PublicEjemplarDetail>(`/api/catalog/public/ejemplares/${ejemplarId}`, {
    signal,
  })
}
