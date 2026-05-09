import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createRouter, createMemoryHistory } from 'vue-router'
import { es } from '@/i18n/locales/es'
import SubscribeByEmailView from '@/views/SubscribeByEmailView.vue'

vi.mock('@/services/notifications/publicSubscription', () => ({
  registerPublicSubscriptionByEmail: vi.fn(),
}))

describe('SubscribeByEmailView', () => {
  it('renderiza título y formulario de correo', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', name: 'home', component: { template: '<div />' } },
        {
          path: '/subscriptions/new',
          component: SubscribeByEmailView,
          meta: { pageTitleKey: 'subscriptionNew.title' },
        },
      ],
    })
    await router.push('/subscriptions/new')
    await router.isReady()

    const i18n = createI18n({ legacy: false, locale: 'es', messages: { es } })
    const wrapper = mount(SubscribeByEmailView, {
      global: { plugins: [router, i18n] },
    })

    expect(wrapper.get('h2').text()).toContain('Suscripción')
    expect(wrapper.find('#subscription-email').exists()).toBe(true)
  })
})
