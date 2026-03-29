import { ref, watch } from 'vue'
import type { Ref, ComputedRef } from 'vue'

const STORAGE_KEY = 'layer-visibility'

/**
 * Manages per-layer visibility state, persisted in localStorage.
 * Key format: `layer-visibility:{planId}`
 * Default: all layers visible (true).
 * The first BASE layer should never be toggled — enforce this in the UI, not here.
 */
export function useLayerVisibility(
  planId: Ref<string | undefined> | ComputedRef<string | undefined>
) {
  const visibilityMap = ref<Record<string, boolean>>({})

  const load = (id: string) => {
    if (typeof localStorage === 'undefined') return
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}:${id}`)
      visibilityMap.value = stored ? JSON.parse(stored) : {}
    } catch {
      visibilityMap.value = {}
    }
  }

  const persist = (id: string) => {
    if (typeof localStorage === 'undefined') return
    try {
      localStorage.setItem(
        `${STORAGE_KEY}:${id}`,
        JSON.stringify(visibilityMap.value)
      )
    } catch { /* ignore write errors */ }
  }

  // Reload from storage whenever the plan changes
  watch(
    planId,
    (newId) => {
      if (newId) load(newId)
      else visibilityMap.value = {}
    },
    { immediate: true }
  )

  /** Returns true if visible. Defaults to true when not in map. */
  const isVisible = (layerId: string): boolean =>
    visibilityMap.value[layerId] !== false

  const toggleVisibility = (layerId: string) => {
    visibilityMap.value = {
      ...visibilityMap.value,
      [layerId]: !isVisible(layerId),
    }
    if (planId.value) persist(planId.value)
  }

  return { visibilityMap, isVisible, toggleVisibility }
}
