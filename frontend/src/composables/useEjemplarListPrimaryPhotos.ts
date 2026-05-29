import { onUnmounted, ref } from 'vue'
import { apiFetchBlob } from '@/services/http/apiClient'

/**
 * Miniaturas de la foto principal por árbol (HU-014, listado público).
 * Usa URLs de objeto locales; revoca al sustituir o al desmontar.
 */
export function useEjemplarListPrimaryPhotos() {
  const thumbUrls = ref<Record<number, string>>({})

  function revokeUrls(urls: Record<number, string>): void {
    for (const u of Object.values(urls)) {
      URL.revokeObjectURL(u)
    }
  }

  async function loadForEjemplarIds(ejemplarIds: readonly number[], signal?: AbortSignal): Promise<void> {
    revokeUrls(thumbUrls.value)
    thumbUrls.value = {}
    const next: Record<number, string> = {}
    await Promise.all(
      ejemplarIds.map(async (id) => {
        try {
          const blob = await apiFetchBlob(`/api/media/public/ejemplares/${id}/primary-photo`, { signal })
          if (blob !== null && blob.size > 0) {
            next[id] = URL.createObjectURL(blob)
          }
        } catch {
          /* miniatura opcional */
        }
      }),
    )
    if (signal?.aborted) {
      revokeUrls(next)
      return
    }
    thumbUrls.value = next
  }

  onUnmounted(() => {
    revokeUrls(thumbUrls.value)
    thumbUrls.value = {}
  })

  return { thumbUrls, loadForEjemplarIds }
}
