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

/** Ítem de `GET /api/catalog/trees` (listado colaborador, HU-008). */
export interface CollaboratorTreeListItem {
  treeId: number
  speciesId: number
  nombreComun: string
  nombreCientifico: string
  provincia: string
  municipio: string
  publicationState: PublicationState
  publicMapVisibility: PublicMapVisibility
  createdAt: string
  modifiedAt: string
  createdByUserId?: number
}

export interface CollaboratorTreePageResponse {
  content: CollaboratorTreeListItem[]
  totalResults: number
  page: number
  size: number
  sort: string
}

/** Detalle de `GET` / `PUT` `/api/catalog/trees/{id}` (HU-008). */
export interface CollaboratorTreeDetail {
  treeId: number
  speciesId: number
  provinceId: number
  latitude: number
  longitude: number
  municipality?: string
  description?: string
  altitude?: number | null
  publicationState: PublicationState
  publicMapVisibility: PublicMapVisibility
  createdByUserId: number
  speciesLabel?: string
  provinceLabel?: string
  createdAt?: string
  modifiedAt?: string
}
