import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createRouter, createMemoryHistory } from 'vue-router'
import { es } from '@/i18n/locales/es'
import HomeDashboardTile from '@/components/home/HomeDashboardTile.vue'

describe('HomeDashboardTile', () => {
  it('renderiza título, descripción y enlace de ruta', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/x', name: 'tile-test', component: { template: '<div />' } }],
    })
    await router.push('/x')
    await router.isReady()

    const i18n = createI18n({ legacy: false, locale: 'es', messages: { es } })
    const wrapper = mount(HomeDashboardTile, {
      props: {
        to: { name: 'tile-test' },
        title: 'Título de prueba',
        description: 'Descripción de apoyo.',
      },
      global: { plugins: [router, i18n] },
      slots: { icon: '<span class="slot-icon" />' },
    })

    expect(wrapper.text()).toContain('Título de prueba')
    expect(wrapper.text()).toContain('Descripción de apoyo.')
    expect(wrapper.find('.slot-icon').exists()).toBe(true)
    const link = wrapper.find('a.home-tile')
    expect(link.exists()).toBe(true)
    expect(link.attributes('href')).toContain('/x')
  })
})
