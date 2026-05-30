import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createRouter, createMemoryHistory } from 'vue-router'
import { es } from '@/i18n/locales/es'
import AuthGuardErrorView from '@/views/AuthGuardErrorView.vue'

const loginMock = vi.fn()

vi.mock('@/composables/useAuth', () => ({
  useAuth: () => ({
    login: loginMock,
  }),
}))

describe('AuthGuardErrorView', () => {
  it('renderiza cabecera y orden de acciones (secundario izquierda, primario derecha)', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', name: 'home', component: { template: '<div />' } },
        { path: '/auth/error', component: AuthGuardErrorView },
      ],
    })
    await router.push('/auth/error?reason=session')
    await router.isReady()

    const i18n = createI18n({ legacy: false, locale: 'es', messages: { es } })
    const wrapper = mount(AuthGuardErrorView, {
      global: { plugins: [router, i18n] },
    })

    expect(wrapper.get('h1.page-header__title').text()).toContain('sesión')
    const actions = wrapper.get('.auth-flow-page__actions')
    const buttons = actions.findAll('.btn')
    expect(buttons[0]?.classes()).toContain('btn-secondary')
    expect(buttons[1]?.classes()).toContain('btn-primary')
    expect(buttons[1]?.classes()).toContain('tree-form-submit')
  })
})
