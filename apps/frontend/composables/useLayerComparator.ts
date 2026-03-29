import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { usePlansStore } from '~/stores/plans'
import type { Plan } from '~/types/plan'

export function useLayerComparator() {
  const config = useRuntimeConfig()
  const store = usePlansStore()
  const { groups } = storeToRefs(store)

  // ── Estado reactivo ──────────────────────────────────────────────────────────
  const opacity = ref(0.5)
  const basePlanId = ref<string | null>(null)
  const proposalPlanId = ref<string | null>(null)
  // Guardamos el sheetName del plan activo para filtrar el grupo correcto
  const currentSheetName = ref<string | null>(null)

  // ── Helper URL ───────────────────────────────────────────────────────────────
  const _resolveUrl = (path?: string): string => {
    if (!path) return ''
    if (path.startsWith('http')) return path
    const base = (config.public.socketUrl as string).replace(/\/$/, '')
    const clean = path.startsWith('/') ? path : `/${path}`
    return `${base}${clean}`
  }

  // ── Computed ─────────────────────────────────────────────────────────────────

  /**
   * Lista de planes del mismo sheet que el plan activo, ordenados por versión desc.
   * Se deriva de store.groups para no requerir fetch adicional.
   */
  const comparatorPlans = computed<Plan[]>(() => {
    if (!currentSheetName.value) return []
    const group = groups.value.find((g: any) => g.sheetName === currentSheetName.value)
    if (!group) return []
    return [...group.plans].sort((a, b) => b.version - a.version)
  })

  /** El comparador sólo se activa cuando hay al menos 2 versiones disponibles. */
  const comparatorEnabled = computed(() => comparatorPlans.value.length >= 2)

  /** URL resuelta de la capa BASE (status READY) del plan seleccionado como base. */
  const baseImageUrl = computed((): string => {
    if (!basePlanId.value) return ''
    const plan = comparatorPlans.value.find(p => p.id === basePlanId.value)
    const layer = plan?.layers?.find((l: any) => l.type === 'BASE' && l.status === 'READY')
    return _resolveUrl(layer?.imageUrl)
  })

  /** URL resuelta de la capa BASE (status READY) del plan seleccionado como propuesta. */
  const proposalImageUrl = computed((): string => {
    if (!proposalPlanId.value) return ''
    const plan = comparatorPlans.value.find(p => p.id === proposalPlanId.value)
    const layer = plan?.layers?.find((l: any) => l.type === 'BASE' && l.status === 'READY')
    return _resolveUrl(layer?.imageUrl)
  })

  // ── Funciones ─────────────────────────────────────────────────────────────────

  /**
   * Inicializa el comparador con los valores por defecto:
   * - Propuesta → plan actual (versión más reciente vista)
   * - Base      → versión inmediatamente anterior
   * Resetea la opacidad a 50%.
   */
  const initComparator = (plan: Plan) => {
    currentSheetName.value = plan.sheetName
    // comparatorPlans re-evalúa inmediatamente porque currentSheetName cambió
    const sorted = comparatorPlans.value

    if (sorted.length < 2) {
      proposalPlanId.value = plan.id
      basePlanId.value = null
      opacity.value = 0.5
      return
    }

    const idx = sorted.findIndex(p => p.id === plan.id)

    if (idx !== -1 && idx < sorted.length - 1) {
      // El plan existe y tiene una versión anterior
      proposalPlanId.value = sorted[idx].id
      basePlanId.value = sorted[idx + 1].id
    } else {
      // Fallback: la más reciente como propuesta, la segunda como base
      proposalPlanId.value = sorted[0].id
      basePlanId.value = sorted[1].id
    }

    opacity.value = 0.5
  }

  /**
   * Alterna la opacidad entre 0 y 1 para comparación rápida (blink).
   * Si estaba en 0 → va a 1. En cualquier otro valor → va a 0.
   */
  const toggleBlink = () => {
    opacity.value = opacity.value === 0 ? 1 : 0
  }

  return {
    opacity,
    basePlanId,
    proposalPlanId,
    comparatorPlans,
    comparatorEnabled,
    baseImageUrl,
    proposalImageUrl,
    initComparator,
    toggleBlink,
  }
}
