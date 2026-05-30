/** Cuerpo de `POST /api/media/uploads/presign` (alineado con media-service). */
export interface PresignUploadRequest {
  ejemplarId: number
  nombreFicheroOriginal: string
  tipoMime: string
  tamanoBytes: number
}

export interface PresignUploadResponse {
  uploadUrl: string
  bucket: string
  objectKey: string
  expiresAt: string
}

/** Cuerpo de `POST /api/media/photos/confirm`. */
export interface ConfirmPhotoUploadRequest {
  ejemplarId: number
  bucket: string
  objectKey: string
  nombreFicheroOriginal: string
  tipoMime: string
  tamanoBytes: number
  anchoPx?: number | null
  altoPx?: number | null
  orden?: number | null
  esPrincipal?: boolean | null
  checksumSha256?: string | null
}

export interface PhotoMetadataResponse {
  photoId: number
  ejemplarId: number
  bucket: string
  objectKey: string
  nombreFicheroOriginal: string
  tipoMime: string
  tamanoBytes: number
  anchoPx: number | null
  altoPx: number | null
  orden: number
  esPrincipal: boolean
  subidaEn: string
}

export type PhotoVisibilityCategory = 'PUBLIC' | 'PRIVATE'

/** Respuesta de `GET /api/media/ejemplares/{ejemplarId}/photos`. */
export interface EjemplarPhotoGalleryItem {
  id: number
  url: string
  esPrincipal: boolean
  orden: number
  mimeType: string
  ancho: number | null
  alto: number | null
  categoria: PhotoVisibilityCategory
}
