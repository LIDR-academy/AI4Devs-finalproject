import { apiFetch } from '@/services/http/apiClient'
import type { TreePhotoGalleryItem } from '@/types/media'

export async function fetchTreePhotoGallery(
  treeId: number,
  signal?: AbortSignal,
): Promise<TreePhotoGalleryItem[]> {
  return apiFetch<TreePhotoGalleryItem[]>(`/api/media/trees/${treeId}/photos`, { signal })
}

export async function deleteTreePhoto(photoId: number, signal?: AbortSignal): Promise<void> {
  await apiFetch<void>(`/api/media/photos/${photoId}`, {
    method: 'DELETE',
    signal,
  })
}
