import { apiFetch } from '@/services/http/apiClient'
import type { EjemplarPhotoGalleryItem } from '@/types/media'

export async function fetchEjemplarPhotoGallery(
  ejemplarId: number,
  signal?: AbortSignal,
): Promise<EjemplarPhotoGalleryItem[]> {
  return apiFetch<EjemplarPhotoGalleryItem[]>(`/api/media/ejemplares/${ejemplarId}/photos`, { signal })
}

export async function deleteEjemplarPhoto(photoId: number, signal?: AbortSignal): Promise<void> {
  await apiFetch<void>(`/api/media/photos/${photoId}`, {
    method: 'DELETE',
    signal,
  })
}
