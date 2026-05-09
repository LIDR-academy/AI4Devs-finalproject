import { describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import TreePhotoFullscreenViewer from '@/components/TreePhotoFullscreenViewer.vue'
import { es } from '@/i18n/locales/es'

function createTestI18n() {
  return createI18n({
    legacy: false,
    locale: 'es',
    fallbackLocale: 'es',
    messages: { es },
  })
}

const basePhotos = [
  {
    id: 1,
    url: 'http://localhost:9000/mtl-photos/trees/42/one.jpg',
    esPrincipal: true,
    orden: 0,
    mimeType: 'image/jpeg',
    ancho: 1200,
    alto: 800,
    categoria: 'PUBLIC' as const,
  },
  {
    id: 2,
    url: 'http://localhost:9000/mtl-photos/trees/42/two.jpg',
    esPrincipal: false,
    orden: 1,
    mimeType: 'image/jpeg',
    ancho: 1200,
    alto: 800,
    categoria: 'PUBLIC' as const,
  },
]

describe('TreePhotoFullscreenViewer', () => {
  it('shows single-image mode without pagination controls', async () => {
    const wrapper = mount(TreePhotoFullscreenViewer, {
      props: {
        photos: [basePhotos[0]],
        initialIndex: 0,
        title: 'Encina (Quercus ilex)',
      },
      global: {
        plugins: [createTestI18n()],
        stubs: {
          VueZoomable: {
            name: 'VueZoomable',
            template: '<div class="zoomable-stub"><slot /></div>',
          },
        },
      },
    })
    await flushPromises()

    expect(wrapper.find('.tree-photo-viewer-image').exists()).toBe(true)
    expect(wrapper.find('.tree-photo-viewer-controls').exists()).toBe(false)
  })

  it('navigates respecting gallery order and wraps around', async () => {
    const wrapper = mount(TreePhotoFullscreenViewer, {
      props: {
        photos: basePhotos,
        initialIndex: 0,
        title: 'Encina (Quercus ilex)',
      },
      global: {
        plugins: [createTestI18n()],
        stubs: {
          VueZoomable: {
            name: 'VueZoomable',
            template: '<div class="zoomable-stub"><slot /></div>',
          },
        },
      },
    })
    await flushPromises()

    expect(wrapper.get('.tree-photo-viewer-image').attributes('src')).toContain('one.jpg')
    expect(wrapper.text()).toContain('Imagen 1 de 2')

    const nextButton = wrapper.findAll('button').find((button) => button.text() === 'Siguiente')
    expect(nextButton?.exists()).toBe(true)
    if (!nextButton) {
      throw new Error('No se encontró el botón Siguiente en el visor')
    }
    await nextButton.trigger('click')
    expect(wrapper.get('.tree-photo-viewer-image').attributes('src')).toContain('two.jpg')
    expect(wrapper.text()).toContain('Imagen 2 de 2')

    await nextButton.trigger('click')
    expect(wrapper.get('.tree-photo-viewer-image').attributes('src')).toContain('one.jpg')
    expect(wrapper.text()).toContain('Imagen 1 de 2')
  })
})
