export type PublicationState = 'BORRADOR' | 'PUBLICADO'
export type PublicMapVisibility = 'PRIVADO' | 'PUBLICO'

export interface MasterListItem {
  id: number
  label: string
}

export interface MasterDataPageResponse<TItem> {
  content: TItem[]
  totalElements: number
  totalPages: number
  page: number
  size: number
  unpaged: boolean
  first: boolean
  last: boolean
}

export interface CreateTreeRequest {
  speciesId: number
  provinceId: number
  municipality?: string
  description?: string
  latitude: number
  longitude: number
  altitude?: number
  publicMapVisibility?: PublicMapVisibility
  publicationState?: PublicationState
}

export interface CreatedTreeResponse {
  treeId: number
}

export interface PublicTreeListItem {
  treeId: number
  nombreComun: string
  nombreCientifico: string
  provincia: string
  municipio: string
  estado: PublicationState
  visibilidad: PublicMapVisibility
}

export interface PublicTreePageResponse {
  content: PublicTreeListItem[]
  totalResults: number
  page: number
  size: number
  sort: string
}

export interface PublicTreeDetail {
  treeId: number
  nombreComun: string
  nombreCientifico: string
  provincia: string
  municipio: string
  estado: PublicationState
  visibilidad: PublicMapVisibility
  descripcion: string
  latitud: number
  longitud: number
  altura: number | null
}

/** Respuesta de `GET /api/catalog/public/provinces` (solo nombres, sin códigos). */
export interface PublicProvinceNamesResponse {
  nombres: string[]
}
