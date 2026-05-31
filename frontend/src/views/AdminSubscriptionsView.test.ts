import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { es } from '@/i18n/locales/es'
import AdminSubscriptionsView from '@/views/AdminSubscriptionsView.vue'

const fetchMock = vi.hoisted(() => vi.fn())

vi.mock('@/services/notifications/adminSubscriptions', () => ({
  fetchAdminSubscriptions: fetchMock,
  patchAdminSubscriptionEstado: vi.fn(),
}))

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>()
  return {
    ...actual,
    useRoute: () => ({
      meta: { pageTitleKey: 'adminSubscriptions.title' },
    }),
  }
})

describe('AdminSubscriptionsView', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    fetchMock.mockResolvedValue({
      content: [],
      totalElements: 0,
      totalPages: 0,
      page: 0,
      size: 20,
      unpaged: false,
      first: true,
      last: true,
    })
  })

  it('renderiza cabecera y filtros de suscripciones admin', async () => {
    const i18n = createI18n({ legacy: false, locale: 'es', messages: { es } })
    const wrapper = mount(AdminSubscriptionsView, {
      global: { plugins: [i18n] },
    })
    await flushPromises()

    expect(wrapper.get('h1.page-header__title').text()).toContain('Gestión de suscripciones')
    expect(wrapper.find('#admin-sub-filter-email').exists()).toBe(true)
    expect(wrapper.find('#admin-sub-filter-estado').exists()).toBe(true)
    expect(wrapper.find('.catalog-toolbar__fields--pair').exists()).toBe(true)
  })
})
