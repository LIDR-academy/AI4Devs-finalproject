const DEFAULT_MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024
const DEFAULT_MAX_PHOTOS = 10
const DEFAULT_ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const

export type TreePhotoValidationCode =
  | 'maxPhotos'
  | 'invalidMime'
  | 'maxFileSize'
  | 'emptyFile'

export interface TreePhotoValidationMessages {
  maxPhotos: (max: number) => string
  invalidMime: (allowed: string) => string
  maxFileSize: (maxMb: number) => string
}

export function validateTreePhotoFile(
  file: File,
  currentPhotoCount: number,
  _messages: TreePhotoValidationMessages,
  options?: {
    maxPhotos?: number
    maxFileSizeBytes?: number
    allowedMimeTypes?: readonly string[]
  },
): TreePhotoValidationCode | null {
  const maxPhotos = options?.maxPhotos ?? DEFAULT_MAX_PHOTOS
  const maxFileSizeBytes = options?.maxFileSizeBytes ?? DEFAULT_MAX_FILE_SIZE_BYTES
  const allowedMimeTypes = options?.allowedMimeTypes ?? DEFAULT_ALLOWED_MIME_TYPES

  if (currentPhotoCount >= maxPhotos) {
    return 'maxPhotos'
  }
  if (file.size <= 0) {
    return 'emptyFile'
  }
  if (!allowedMimeTypes.includes(file.type)) {
    return 'invalidMime'
  }
  if (file.size > maxFileSizeBytes) {
    return 'maxFileSize'
  }
  return null
}

export function treePhotoValidationMessage(
  code: TreePhotoValidationCode,
  messages: TreePhotoValidationMessages,
  options?: {
    maxPhotos?: number
    maxFileSizeBytes?: number
    allowedMimeTypes?: readonly string[]
  },
): string {
  const maxPhotos = options?.maxPhotos ?? DEFAULT_MAX_PHOTOS
  const maxFileSizeBytes = options?.maxFileSizeBytes ?? DEFAULT_MAX_FILE_SIZE_BYTES
  const allowedMimeTypes = options?.allowedMimeTypes ?? DEFAULT_ALLOWED_MIME_TYPES
  const maxMb = Math.round(maxFileSizeBytes / (1024 * 1024))
  const allowedLabel = allowedMimeTypes
    .map((mime) => mime.replace('image/', '').toUpperCase())
    .join(', ')

  switch (code) {
    case 'maxPhotos':
      return messages.maxPhotos(maxPhotos)
    case 'invalidMime':
      return messages.invalidMime(allowedLabel)
    case 'maxFileSize':
      return messages.maxFileSize(maxMb)
    case 'emptyFile':
      return messages.invalidMime(allowedLabel)
  }
}

export const TREE_PHOTO_MAX_PER_TREE = DEFAULT_MAX_PHOTOS
