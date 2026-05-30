import { apiFetch } from '@/services/http/apiClient'

export interface TaxonomyMasterListItem {
  id: number
  label: string
}

export interface TaxonomyGenusListItem {
  id: number
  label: string
  familyId: number
}

export interface TaxonomyMasterPage<T> {
  content: T[]
  totalElements: number
  totalPages: number
  page: number
  size: number
  unpaged: boolean
  first: boolean
  last: boolean
}

export interface TaxonomySpeciesItem {
  speciesId: number
  genusId: number
  scientificName: string
  commonName: string | null
  label: string
}

export interface TaxonomyFamilyItem {
  familyId: number
  scientificName: string
  commonName: string | null
  label: string
}

export interface TaxonomyGenusItem {
  genusId: number
  familyId: number
  scientificName: string
  commonName: string | null
  label: string
}

export interface CreateTaxonomyFamilyBody {
  scientificName: string
  commonName?: string
}

export interface CreateTaxonomyGenusBody {
  familyId: number
  scientificName: string
  commonName?: string
}

export interface CreateTaxonomySpeciesBody {
  genusId: number
  scientificName: string
  commonName?: string
}

const CATALOG = '/api/catalog'

export async function fetchAdminFamilies(
  unpaged = true,
  signal?: AbortSignal,
): Promise<TaxonomyMasterPage<TaxonomyMasterListItem>> {
  return apiFetch(`${CATALOG}/families`, {
    query: { unpaged, page: 0, size: 100 },
    signal,
  })
}

export async function fetchAdminGenera(
  familyId?: number,
  unpaged = true,
  signal?: AbortSignal,
): Promise<TaxonomyMasterPage<TaxonomyGenusListItem>> {
  return apiFetch(`${CATALOG}/genera`, {
    query: {
      unpaged,
      page: 0,
      size: 100,
      familyId: familyId ?? undefined,
    },
    signal,
  })
}

export async function fetchAdminSpeciesList(
  options: { page?: number; size?: number; unpaged?: boolean; signal?: AbortSignal } = {},
): Promise<TaxonomyMasterPage<TaxonomyMasterListItem>> {
  const { page = 0, size = 20, unpaged = false, signal } = options
  return apiFetch(`${CATALOG}/species`, {
    query: { unpaged, page, size },
    signal,
  })
}

export async function fetchAdminSpeciesDetail(
  speciesId: number,
  signal?: AbortSignal,
): Promise<TaxonomySpeciesItem> {
  return apiFetch(`${CATALOG}/species/${speciesId}`, { signal })
}

export async function createAdminFamily(
  body: CreateTaxonomyFamilyBody,
  signal?: AbortSignal,
): Promise<TaxonomyFamilyItem> {
  return apiFetch(`${CATALOG}/families`, {
    method: 'POST',
    body: JSON.stringify(body),
    signal,
  })
}

export async function createAdminGenus(
  body: CreateTaxonomyGenusBody,
  signal?: AbortSignal,
): Promise<TaxonomyGenusItem> {
  return apiFetch(`${CATALOG}/genera`, {
    method: 'POST',
    body: JSON.stringify(body),
    signal,
  })
}

export async function createAdminSpecies(
  body: CreateTaxonomySpeciesBody,
  signal?: AbortSignal,
): Promise<TaxonomySpeciesItem> {
  return apiFetch(`${CATALOG}/species`, {
    method: 'POST',
    body: JSON.stringify(body),
    signal,
  })
}

export async function updateAdminSpecies(
  speciesId: number,
  body: CreateTaxonomySpeciesBody,
  signal?: AbortSignal,
): Promise<TaxonomySpeciesItem> {
  return apiFetch(`${CATALOG}/species/${speciesId}`, {
    method: 'PUT',
    body: JSON.stringify(body),
    signal,
  })
}

export async function deleteAdminSpecies(speciesId: number, signal?: AbortSignal): Promise<void> {
  await apiFetch<void>(`${CATALOG}/species/${speciesId}`, {
    method: 'DELETE',
    signal,
  })
}
