import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import LayerComparatorControls from '~/components/layers/LayerComparatorControls.vue'
import type { Plan } from '~/types/plan'

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

const mockPlanV1: Plan = {
  id: 'plan-1',
  projectId: 'proj-1',
  sheetName: 'Planta Baja',
  version: 1,
  status: 'ACTIVE',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  layers: [makeLayer({ id: 'l1', planId: 'plan-1', imageUrl: '/uploads/v1.png' })],
}

const mockPlanV2: Plan = {
  id: 'plan-2',
  projectId: 'proj-1',
  sheetName: 'Planta Baja',
  version: 2,
  status: 'ACTIVE',
  createdAt: '2026-02-01T00:00:00Z',
  updatedAt: '2026-02-01T00:00:00Z',
  layers: [makeLayer({ id: 'l2', planId: 'plan-2', imageUrl: '/uploads/v2.png' })],
}

const defaultProps = {
  opacity: 0.5,
  basePlanId: 'plan-1',
  proposalPlanId: 'plan-2',
  plans: [mockPlanV2, mockPlanV1], // ordenados desc por convención
}

const mountComponent = (props = defaultProps) =>
  mount(LayerComparatorControls, { props })

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('LayerComparatorControls', () => {

  // ── Renderizado ──────────────────────────────────────────────────────────────

  describe('renderizado', () => {
    it('renderiza el slider con valor 50 cuando opacity es 0.5', () => {
      const wrapper = mountComponent()
      const slider = wrapper.find('input[type="range"]')
      expect(slider.exists()).toBe(true)
      expect((slider.element as HTMLInputElement).value).toBe('50')
    })

    it('renderiza el slider con valor 0 cuando opacity es 0', () => {
      const wrapper = mountComponent({ ...defaultProps, opacity: 0 })
      const slider = wrapper.find('input[type="range"]')
      expect((slider.element as HTMLInputElement).value).toBe('0')
    })

    it('renderiza el slider con valor 100 cuando opacity es 1', () => {
      const wrapper = mountComponent({ ...defaultProps, opacity: 1 })
      const slider = wrapper.find('input[type="range"]')
      expect((slider.element as HTMLInputElement).value).toBe('100')
    })

    it('renderiza dos dropdowns (base y propuesta)', () => {
      const wrapper = mountComponent()
      const selects = wrapper.findAll('select')
      expect(selects).toHaveLength(2)
    })

    it('el dropdown base excluye el plan seleccionado como propuesta', () => {
      const wrapper = mountComponent()
      const [baseSelect] = wrapper.findAll('select')
      const options = baseSelect.findAll('option')
      // proposalPlanId es 'plan-2' → base solo muestra 'plan-1'
      expect(options).toHaveLength(1)
      expect(options[0].attributes('value')).toBe('plan-1')
    })

    it('el dropdown propuesta excluye el plan seleccionado como base', () => {
      const wrapper = mountComponent()
      const [, proposalSelect] = wrapper.findAll('select')
      const options = proposalSelect.findAll('option')
      // basePlanId es 'plan-1' → propuesta solo muestra 'plan-2'
      expect(options).toHaveLength(1)
      expect(options[0].attributes('value')).toBe('plan-2')
    })

    it('las opciones muestran la versión en formato "v{n}"', () => {
      const wrapper = mountComponent()
      // Base dropdown: excluye plan-2 (proposalPlanId), solo muestra plan-1 (v1)
      const [baseSelect, proposalSelect] = wrapper.findAll('select')
      expect(baseSelect.findAll('option')[0].text()).toContain('v1')
      // Proposal dropdown: excluye plan-1 (basePlanId), solo muestra plan-2 (v2)
      expect(proposalSelect.findAll('option')[0].text()).toContain('v2')
    })

    it('renderiza el botón de alternancia rápida (blink)', () => {
      const wrapper = mountComponent()
      const button = wrapper.find('button')
      expect(button.exists()).toBe(true)
      expect(button.text()).toContain('Alternar')
    })

    it('renderiza el label "Base" y "Propuesta" en extremos del slider', () => {
      const wrapper = mountComponent()
      const text = wrapper.text()
      expect(text).toContain('Base')
      expect(text).toContain('Propuesta')
    })

    it('renderiza dos labels de columna (Base sobre dropdown izquierdo, Propuesta sobre el derecho)', () => {
      const wrapper = mountComponent()
      const labels = wrapper.findAll('label')
      const labelTexts = labels.map(l => l.text())
      expect(labelTexts).toContain('Base')
      expect(labelTexts).toContain('Propuesta')
    })
  })

  // ── Slider ───────────────────────────────────────────────────────────────────

  describe('slider', () => {
    it('emite update:opacity con valor 0–1 al mover el slider', async () => {
      const wrapper = mountComponent()
      const slider = wrapper.find('input[type="range"]')
      await slider.setValue('75')
      await slider.trigger('input')

      expect(wrapper.emitted('update:opacity')).toBeTruthy()
      expect(wrapper.emitted('update:opacity')?.[0]).toEqual([0.75])
    })

    it('convierte correctamente slider=0 a opacity=0', async () => {
      const wrapper = mountComponent()
      const slider = wrapper.find('input[type="range"]')
      await slider.setValue('0')
      await slider.trigger('input')

      expect(wrapper.emitted('update:opacity')?.[0]).toEqual([0])
    })

    it('convierte correctamente slider=100 a opacity=1', async () => {
      const wrapper = mountComponent()
      const slider = wrapper.find('input[type="range"]')
      await slider.setValue('100')
      await slider.trigger('input')

      expect(wrapper.emitted('update:opacity')?.[0]).toEqual([1])
    })

    it('el slider tiene min=0, max=100 y step=1', () => {
      const wrapper = mountComponent()
      const slider = wrapper.find('input[type="range"]')
      expect(slider.attributes('min')).toBe('0')
      expect(slider.attributes('max')).toBe('100')
      expect(slider.attributes('step')).toBe('1')
    })
  })

  // ── Dropdowns ────────────────────────────────────────────────────────────────

  describe('dropdowns', () => {
    // Para los tests de cambio usamos 3 planes para que haya opciones válidas en ambos selectores
    const mockPlanV3: Plan = {
      id: 'plan-3',
      projectId: 'proj-1',
      sheetName: 'Planta Baja',
      version: 3,
      status: 'ACTIVE',
      createdAt: '2026-03-01T00:00:00Z',
      updatedAt: '2026-03-01T00:00:00Z',
      layers: [makeLayer({ id: 'l3', planId: 'plan-3', imageUrl: '/uploads/v3.png' })],
    }
    const propsThreePlans = {
      opacity: 0.5,
      basePlanId: 'plan-1',
      proposalPlanId: 'plan-3',
      plans: [mockPlanV3, mockPlanV2, mockPlanV1], // desc
    }

    it('el dropdown base tiene seleccionado el basePlanId inicial', () => {
      const wrapper = mountComponent()
      const [baseSelect] = wrapper.findAll('select')
      expect((baseSelect.element as HTMLSelectElement).value).toBe('plan-1')
    })

    it('el dropdown propuesta tiene seleccionado el proposalPlanId inicial', () => {
      const wrapper = mountComponent()
      const [, proposalSelect] = wrapper.findAll('select')
      expect((proposalSelect.element as HTMLSelectElement).value).toBe('plan-2')
    })

    it('emite update:basePlanId con el id seleccionado al cambiar base', async () => {
      // Con 3 planes: base=plan-1, proposal=plan-3 → base dropdown tiene plan-1 y plan-2
      const wrapper = mountComponent(propsThreePlans)
      const [baseSelect] = wrapper.findAll('select')
      await baseSelect.setValue('plan-2')

      expect(wrapper.emitted('update:basePlanId')).toBeTruthy()
      expect(wrapper.emitted('update:basePlanId')?.[0]).toEqual(['plan-2'])
    })

    it('emite update:proposalPlanId con el id seleccionado al cambiar propuesta', async () => {
      // Con 3 planes: base=plan-1, proposal=plan-3 → proposal dropdown tiene plan-2 y plan-3
      const wrapper = mountComponent(propsThreePlans)
      const [, proposalSelect] = wrapper.findAll('select')
      await proposalSelect.setValue('plan-2')

      expect(wrapper.emitted('update:proposalPlanId')).toBeTruthy()
      expect(wrapper.emitted('update:proposalPlanId')?.[0]).toEqual(['plan-2'])
    })
  })

  // ── Botón Blink ──────────────────────────────────────────────────────────────

  describe('botón blink', () => {
    it('emite evento blink al hacer click', async () => {
      const wrapper = mountComponent()
      const button = wrapper.find('button')
      await button.trigger('click')
      expect(wrapper.emitted('blink')).toBeTruthy()
      expect(wrapper.emitted('blink')).toHaveLength(1)
    })

    it('emite blink múltiples veces al hacer click varias veces', async () => {
      const wrapper = mountComponent()
      const button = wrapper.find('button')
      await button.trigger('click')
      await button.trigger('click')
      await button.trigger('click')
      expect(wrapper.emitted('blink')).toHaveLength(3)
    })

    it('aplica clases de extremo (accent) cuando opacity es 0', () => {
      const wrapper = mountComponent({ ...defaultProps, opacity: 0 })
      const button = wrapper.find('button')
      expect(button.classes()).toContain('bg-accent')
      expect(button.classes()).toContain('text-white')
    })

    it('aplica clases de extremo (accent) cuando opacity es 1', () => {
      const wrapper = mountComponent({ ...defaultProps, opacity: 1 })
      const button = wrapper.find('button')
      expect(button.classes()).toContain('bg-accent')
    })

    it('aplica clases neutras cuando opacity es 0.5', () => {
      const wrapper = mountComponent({ ...defaultProps, opacity: 0.5 })
      const button = wrapper.find('button')
      expect(button.classes()).toContain('bg-gray-100')
      expect(button.classes()).not.toContain('bg-accent')
    })
  })

  // ── Accesibilidad ────────────────────────────────────────────────────────────

  describe('accesibilidad', () => {
    it('el slider tiene aria-label descriptivo', () => {
      const wrapper = mountComponent()
      const slider = wrapper.find('input[type="range"]')
      expect(slider.attributes('aria-label')).toBe('Comparador de opacidad')
    })

    it('el slider tiene aria-valuemin, aria-valuemax y aria-valuenow', () => {
      const wrapper = mountComponent()
      const slider = wrapper.find('input[type="range"]')
      expect(slider.attributes('aria-valuemin')).toBe('0')
      expect(slider.attributes('aria-valuemax')).toBe('100')
      expect(slider.attributes('aria-valuenow')).toBe('50')
    })

    it('el dropdown base tiene aria-label', () => {
      const wrapper = mountComponent()
      const [baseSelect] = wrapper.findAll('select')
      expect(baseSelect.attributes('aria-label')).toBeTruthy()
    })

    it('el dropdown propuesta tiene aria-label', () => {
      const wrapper = mountComponent()
      const [, proposalSelect] = wrapper.findAll('select')
      expect(proposalSelect.attributes('aria-label')).toBeTruthy()
    })

    it('los labels de columna están asociados a sus selects (htmlFor/id)', () => {
      const wrapper = mountComponent()
      const labels = wrapper.findAll('label')
      labels.forEach(label => {
        const forAttr = label.attributes('for')
        expect(forAttr).toBeTruthy()
        const select = wrapper.find(`#${forAttr}`)
        expect(select.exists()).toBe(true)
      })
    })

    it('el botón blink tiene aria-label', () => {
      const wrapper = mountComponent()
      const button = wrapper.find('button')
      expect(button.attributes('aria-label')).toBeTruthy()
    })

    it('el contenedor tiene role="group" y aria-label', () => {
      const wrapper = mountComponent()
      const container = wrapper.find('[role="group"]')
      expect(container.exists()).toBe(true)
      expect(container.attributes('aria-label')).toBeTruthy()
    })
  })
})
