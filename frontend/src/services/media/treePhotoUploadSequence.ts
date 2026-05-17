import { apiFetch, NetworkError } from '@/services/http/apiClient'
import type {
  ConfirmPhotoUploadRequest,
  PhotoMetadataResponse,
  PresignUploadRequest,
  PresignUploadResponse,
} from '@/types/media'

export class ObjectStorageUploadError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ObjectStorageUploadError'
    this.status = status
  }
}

const DIMENSION_READ_TIMEOUT_MS = 8_000
const OBJECT_STORAGE_PUT_TIMEOUT_MS = 120_000

async function readImageDimensionsOptional(file: File): Promise<{ width?: number; height?: number }> {
  const objectUrl = URL.createObjectURL(file)
  let settled = false
  return await new Promise((resolve) => {
    const finish = (dims: { width?: number; height?: number }) => {
      if (settled) {
        return
      }
      settled = true
      URL.revokeObjectURL(objectUrl)
      resolve(dims)
    }
    const img = new Image()
    const timer = globalThis.setTimeout(() => finish({}), DIMENSION_READ_TIMEOUT_MS)
    img.onload = () => {
      globalThis.clearTimeout(timer)
      const width = img.naturalWidth > 0 ? img.naturalWidth : undefined
      const height = img.naturalHeight > 0 ? img.naturalHeight : undefined
      finish({ width, height })
    }
    img.onerror = () => {
      globalThis.clearTimeout(timer)
      finish({})
    }
    img.src = objectUrl
  })
}

function objectStoragePutSignal(): AbortSignal | undefined {
  const ctor = globalThis.AbortSignal
  if (ctor && typeof ctor.timeout === 'function') {
    return ctor.timeout(OBJECT_STORAGE_PUT_TIMEOUT_MS)
  }
  return undefined
}

export async function putFileToObjectStorageUrl(uploadUrl: string, file: File): Promise<void> {
  const contentType = file.type && file.type.length > 0 ? file.type : 'application/octet-stream'
  let response: Response
  try {
    response = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': contentType,
      },
      signal: objectStoragePutSignal(),
    })
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new NetworkError('OBJECT_STORAGE_PUT_TIMEOUT')
    }
    throw new NetworkError()
  }
  if (!response.ok) {
    throw new ObjectStorageUploadError(
      response.status,
      `STORAGE_UPLOAD_HTTP_${response.status}`,
    )
  }
}

export interface UploadPhotosForTreeOptions {
  startOrden?: number
  signal?: AbortSignal
}

/**
 * presign → PUT binario → confirmar metadatos, en orden estable por fichero.
 * `orden` de cada confirmación = `startOrden + índice` (debe coincidir con fotos ya confirmadas en servidor).
 */
export async function uploadPhotosForTree(
  treeId: number,
  files: readonly File[],
  options: UploadPhotosForTreeOptions = {},
): Promise<void> {
  const startOrden = options.startOrden ?? 0
  const signal = options.signal

  for (let index = 0; index < files.length; index++) {
    const file = files[index]
    const orden = startOrden + index
    const presignBody: PresignUploadRequest = {
      arbolId: treeId,
      nombreFicheroOriginal: file.name,
      tipoMime: file.type,
      tamanoBytes: file.size,
    }
    const presign = await apiFetch<PresignUploadResponse>('/api/media/uploads/presign', {
      method: 'POST',
      body: JSON.stringify(presignBody),
      signal,
    })

    await putFileToObjectStorageUrl(presign.uploadUrl, file)

    const dims = await readImageDimensionsOptional(file)
    const confirmBody: ConfirmPhotoUploadRequest = {
      arbolId: treeId,
      bucket: presign.bucket,
      objectKey: presign.objectKey,
      nombreFicheroOriginal: file.name,
      tipoMime: file.type,
      tamanoBytes: file.size,
      anchoPx: dims.width ?? null,
      altoPx: dims.height ?? null,
      orden,
      esPrincipal: false,
      checksumSha256: null,
    }
    await apiFetch<PhotoMetadataResponse>('/api/media/photos/confirm', {
      method: 'POST',
      body: JSON.stringify(confirmBody),
      signal,
    })
  }
}

/** Tras crear el árbol: sube desde orden 0. */
export async function uploadPhotosForTreeAfterCreate(treeId: number, files: readonly File[]): Promise<void> {
  await uploadPhotosForTree(treeId, files, { startOrden: 0 })
}
