import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useLayerComparator } from '~/composables/useLayerComparator'
import { usePlansStore } from '~/stores/plans'
import type { Plan, PlanGroup } from '~/types/plan'

// ── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('#app', () => ({
  useRuntimeConfig: () => ({
    public: { socketUrl: 'http://localhost:4000' },
  }),
}))

// ── Fixtures ─────────────────────────────────────────────────────────────────

const makeLayer = (overrides: Record<string, unknown> = {}) => ({
  id: 'layer-1',
  planId: 'plan-1',
  name: 'Planta',
  type: 'BASE' as const,
  status: 'READY' as const,
  imageUrl: '/uploads/layer1.png',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  ...overrides,
})

const makePlan = (overrides: Record<string, unknown> = {}): Plan => ({
  id: 'plan-1',
  projectId: 'proj-1',
  sheetName: 'Planta Baja',
  version: 1,
  status: 'ACTIVE',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  layers: [makeLayer()],
  ...overrides,
})

const planV1 = makePlan({ id: 'plan-v1', version: 1, layers: [makeLayer({ id: 'l1', planId: 'plan-v1', imageUrl: '/uploads/v1.png' })] })
const planV2 = makePlan({ id: 'plan-v2', version: 2, layers: [makeLayer({ id: 'l2', planId: 'plan-v2', imageUrl: '/uploads/v2.png' })] })
const planV3 = makePlan({ id: 'plan-v3', version: 3, layers: [makeLayer({ id: 'l3', planId: 'plan-v3', imageUrl: '/uploads/v3.png' })] })

const makeGroup = (plans: Plan[]): PlanGroup => ({
  sheetName: 'Planta Baja',
  latestVersion: Math.max(...plans.map(p => p.version)),
  plans,
})

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useLayerComparator', () => {
  let store: ReturnType<typeof usePlansStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = usePlansStore()
    vi.clearAllMocks()
  })

  // ── opacity ─────────────────────────────────────────────────────────────────

  describe('opacity', () => {
    it('tiene valor inicial de 0.5', () => {
      const { opacity } = useLayerComparator()
      expect(opacity.value).toBe(0.5)
    })

    it('puede actualizarse directamente', () => {
      const { opacity } = useLayerComparator()
      opacity.value = 0.8
      expect(opacity.value).toBe(0.8)
    })
  })

  // ── comparatorEnabled ────────────────────────────────────────────────────────

  describe('comparatorEnabled', () => {
    it('devuelve false cuando no hay planes cargados en el store', () => {
      const { comparatorEnabled } = useLayerComparator()
      expect(comparatorEnabled.value).toBe(false)
    })

    it('devuelve false si el grupo tiene 1 solo plan', () => {
      store.groups = [makeGroup([planV1])]
      const { comparatorEnabled, initComparator } = useLayerComparator()
      initComparator(planV1)
      expect(comparatorEnabled.value).toBe(false)
    })

    it('devuelve true si el grupo tiene 2 planes', () => {
      store.groups = [makeGroup([planV1, planV2])]
      const { comparatorEnabled, initComparator } = useLayerComparator()
      initComparator(planV2)
      expect(comparatorEnabled.value).toBe(true)
    })

    it('devuelve true si el grupo tiene 3 o más planes', () => {
      store.groups = [makeGroup([planV1, planV2, planV3])]
      const { comparatorEnabled, initComparator } = useLayerComparator()
      initComparator(planV3)
      expect(comparatorEnabled.value).toBe(true)
    })
  })

  // ── comparatorPlans ──────────────────────────────────────────────────────────

  describe('comparatorPlans', () => {
    it('devuelve los planes del mismo sheetName ordenados por versión descendente', () => {
      store.groups = [makeGroup([planV1, planV2, planV3])]
      const { comparatorPlans, initComparator } = useLayerComparator()
      initComparator(planV2)
      expect(comparatorPlans.value.map((p: any) => p.version)).toEqual([3, 2, 1])
    })

    it('devuelve array vacío cuando currentSheetName no coincide con ningún grupo', () => {
      store.groups = [makeGroup([planV1])]
      const { comparatorPlans } = useLayerComparator()
      // initComparator no se ha llamado → currentSheetName es null
      expect(comparatorPlans.value).toEqual([])
    })
  })

  // ── initComparator ───────────────────────────────────────────────────────────

  describe('initComparator', () => {
    it('asigna proposalPlanId al plan actual (versión más reciente)', () => {
      store.groups = [makeGroup([planV1, planV2])]
      const { proposalPlanId, initComparator } = useLayerComparator()
      initComparator(planV2)
      expect(proposalPlanId.value).toBe('plan-v2')
    })

    it('asigna basePlanId al plan con la versión inmediatamente anterior', () => {
      store.groups = [makeGroup([planV1, planV2])]
      const { basePlanId, initComparator } = useLayerComparator()
      initComparator(planV2)
      expect(basePlanId.value).toBe('plan-v1')
    })

    it('con 3 versiones: proposal=v3, base=v2 cuando se pasa v3', () => {
      store.groups = [makeGroup([planV1, planV2, planV3])]
      const { basePlanId, proposalPlanId, initComparator } = useLayerComparator()
      initComparator(planV3)
      expect(proposalPlanId.value).toBe('plan-v3')
      expect(basePlanId.value).toBe('plan-v2')
    })

    it('usa fallback (latest/second) cuando el plan no está en el grupo ordenado', () => {
      const planExterno = makePlan({ id: 'plan-ext', version: 99, sheetName: 'Planta Baja' })
      store.groups = [makeGroup([planV1, planV2])]
      const { basePlanId, proposalPlanId, initComparator } = useLayerComparator()
      initComparator(planExterno)
      // Fallback: latest como proposal (plan-v2, version=2), second como base (plan-v1)
      expect(proposalPlanId.value).toBe('plan-v2')
      expect(basePlanId.value).toBe('plan-v1')
    })

    it('deja basePlanId en null si solo hay 1 versión', () => {
      store.groups = [makeGroup([planV1])]
      const { basePlanId, initComparator } = useLayerComparator()
      initComparator(planV1)
      expect(basePlanId.value).toBeNull()
    })

    it('resetea la opacidad a 0.5 en cada llamada', () => {
      store.groups = [makeGroup([planV1, planV2])]
      const { opacity, initComparator } = useLayerComparator()
      opacity.value = 1
      initComparator(planV2)
      expect(opacity.value).toBe(0.5)
    })
  })

  // ── baseImageUrl / proposalImageUrl ──────────────────────────────────────────

  describe('baseImageUrl', () => {
    it('devuelve la URL resuelta de la capa BASE con status READY del plan base', () => {
      store.groups = [makeGroup([planV1, planV2])]
      const { baseImageUrl, initComparator } = useLayerComparator()
      initComparator(planV2)
      expect(baseImageUrl.value).toBe('http://localhost:4000/uploads/v1.png')
    })

    it('devuelve string vacío cuando basePlanId es null', () => {
      store.groups = [makeGroup([planV1])]
      const { baseImageUrl, initComparator } = useLayerComparator()
      initComparator(planV1)
      expect(baseImageUrl.value).toBe('')
    })

    it('devuelve string vacío si la capa BASE del plan base no está en status READY', () => {
      const planConLayerProcessing = makePlan({
        id: 'plan-proc',
        version: 1,
        layers: [makeLayer({ status: 'PROCESSING', imageUrl: '/uploads/proc.png' })],
      })
      const planV2Alt = makePlan({ id: 'plan-v2-alt', version: 2 })
      store.groups = [makeGroup([planConLayerProcessing, planV2Alt])]
      const { baseImageUrl, initComparator } = useLayerComparator()
      initComparator(planV2Alt)
      expect(baseImageUrl.value).toBe('')
    })

    it('devuelve la URL completa si imageUrl ya es una URL absoluta', () => {
      const planAbsolute = makePlan({
        id: 'plan-abs',
        version: 1,
        layers: [makeLayer({ imageUrl: 'https://cdn.example.com/image.png' })],
      })
      const planV2Alt = makePlan({ id: 'plan-v2-abs', version: 2 })
      store.groups = [makeGroup([planAbsolute, planV2Alt])]
      const { baseImageUrl, initComparator } = useLayerComparator()
      initComparator(planV2Alt)
      expect(baseImageUrl.value).toBe('https://cdn.example.com/image.png')
    })
  })

  describe('proposalImageUrl', () => {
    it('devuelve la URL resuelta de la capa BASE con status READY del plan propuesta', () => {
      store.groups = [makeGroup([planV1, planV2])]
      const { proposalImageUrl, initComparator } = useLayerComparator()
      initComparator(planV2)
      expect(proposalImageUrl.value).toBe('http://localhost:4000/uploads/v2.png')
    })

    it('devuelve string vacío si la capa BASE de la propuesta no está READY', () => {
      const planSinCapaReady = makePlan({
        id: 'plan-sin',
        version: 2,
        layers: [makeLayer({ status: 'ERROR', imageUrl: '/uploads/err.png' })],
      })
      store.groups = [makeGroup([planV1, planSinCapaReady])]
      const { proposalImageUrl, initComparator } = useLayerComparator()
      initComparator(planSinCapaReady)
      expect(proposalImageUrl.value).toBe('')
    })
  })

  // ── toggleBlink ──────────────────────────────────────────────────────────────

  describe('toggleBlink', () => {
    it('cambia opacity de 0.5 a 0 en la primera llamada', () => {
      const { opacity, toggleBlink } = useLayerComparator()
      expect(opacity.value).toBe(0.5)
      toggleBlink()
      expect(opacity.value).toBe(0)
    })

    it('cambia opacity de 0 a 1 en la segunda llamada', () => {
      const { opacity, toggleBlink } = useLayerComparator()
      toggleBlink() // 0.5 → 0
      toggleBlink() // 0 → 1
      expect(opacity.value).toBe(1)
    })

    it('cambia opacity de 1 a 0 en la tercera llamada', () => {
      const { opacity, toggleBlink } = useLayerComparator()
      toggleBlink() // 0.5 → 0
      toggleBlink() // 0 → 1
      toggleBlink() // 1 → 0
      expect(opacity.value).toBe(0)
    })

    it('alterna entre 0 y 1 en llamadas sucesivas desde 0', () => {
      const { opacity, toggleBlink } = useLayerComparator()
      opacity.value = 0
      toggleBlink()
      expect(opacity.value).toBe(1)
      toggleBlink()
      expect(opacity.value).toBe(0)
    })
  })
})
