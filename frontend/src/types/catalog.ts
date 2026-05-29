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

export interface CreateEjemplarRequest {
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

export interface CreatedEjemplarResponse {
  ejemplarId: number
}

export interface PublicEjemplarListItem {
  ejemplarId: number
  nombreComun: string
  nombreCientifico: string
  provincia: string
  municipio: string
  estado: PublicationState
  visibilidad: PublicMapVisibility
}

export interface PublicEjemplarPageResponse {
  content: PublicEjemplarListItem[]
  totalResults: number
  page: number
  size: number
  sort: string
}

export interface PublicEjemplarDetail {
  ejemplarId: number
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

/** Ítem de `GET /api/catalog/ejemplares` (listado colaborador, HU-008). */
export interface CollaboratorEjemplarListItem {
  ejemplarId: number
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

export interface CollaboratorEjemplarPageResponse {
  content: CollaboratorEjemplarListItem[]
  totalResults: number
  page: number
  size: number
  sort: string
}

/** Detalle de `GET` / `PUT` `/api/catalog/ejemplares/{id}` (HU-008). */
export interface CollaboratorEjemplarDetail {
  ejemplarId: number
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
