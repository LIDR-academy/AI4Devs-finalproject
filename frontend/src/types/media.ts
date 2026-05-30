/** Cuerpo de `POST /api/media/uploads/presign` (alineado con media-service). */
export interface PresignUploadRequest {
  treeId: number
  originalFileName: string
  mimeType: string
  sizeBytes: number
}

export interface PresignUploadResponse {
  uploadUrl: string
  bucket: string
  objectKey: string
  expiresAt: string
}

/** Cuerpo de `POST /api/media/photos/confirm`. */
export interface ConfirmPhotoUploadRequest {
  treeId: number
  bucket: string
  objectKey: string
  originalFileName: string
  mimeType: string
  sizeBytes: number
  widthPx?: number | null
  heightPx?: number | null
  order?: number | null
  isPrimary?: boolean | null
  checksumSha256?: string | null
}

export interface PhotoMetadataResponse {
  photoId: number
  treeId: number
  bucket: string
  objectKey: string
  originalFileName: string
  mimeType: string
  sizeBytes: number
  widthPx: number | null
  heightPx: number | null
  order: number
  isPrimary: boolean
  uploadedAt: string
}

export type PhotoVisibilityCategory = 'PUBLIC' | 'PRIVATE'

/** Respuesta de `GET /api/media/trees/{treeId}/photos`. */
export interface TreePhotoGalleryItem {
  id: number
  url: string
  isPrimary: boolean
  order: number
  mimeType: string
  width: number | null
  height: number | null
  category: PhotoVisibilityCategory
}
