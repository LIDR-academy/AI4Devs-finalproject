import { apiFetch } from '@/services/http/apiClient'
import type { TreePhotoGalleryItem } from '@/types/media'

export async function fetchTreePhotoGallery(
  treeId: number,
  signal?: AbortSignal,
): Promise<TreePhotoGalleryItem[]> {
  return apiFetch<TreePhotoGalleryItem[]>(`/api/media/trees/${treeId}/photos`, { signal })
}
