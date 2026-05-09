import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createI18n } from 'vue-i18n'
import TreesDetailView from '@/views/TreesDetailView.vue'
import { es } from '@/i18n/locales/es'
import { HttpError, NetworkError } from '@/services/http/apiClient'

const fetchPublicTreeDetailMock = vi.hoisted(() => vi.fn())
const fetchTreePhotoGalleryMock = vi.hoisted(() => vi.fn())
const routeMock = vi.hoisted(() => ({
  params: { id: '42' },
}))

vi.mock('@/services/catalog/catalogService', () => ({
  fetchPublicTreeDetail: fetchPublicTreeDetailMock,
}))

vi.mock('@/services/media/treeGalleryService', () => ({
  fetchTreePhotoGallery: fetchTreePhotoGalleryMock,
}))

vi.mock('vue-router', async () => {
  const actual = await vi.importActual<typeof import('vue-router')>('vue-router')
  return {
    ...actual,
    useRoute: () => routeMock,
  }
})

function createTestI18n() {
  return createI18n({
    legacy: false,
    locale: 'es',
    fallbackLocale: 'es',
    messages: { es },
  })
}

describe('TreesDetailView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    routeMock.params.id = '42'
    fetchTreePhotoGalleryMock.mockResolvedValue([])
  })

  it('renders detail fields for a published tree', async () => {
    fetchPublicTreeDetailMock.mockResolvedValue({
      treeId: 42,
      nombreComun: 'Encina',
      nombreCientifico: 'Quercus ilex',
      provincia: 'Madrid',
      municipio: 'Madrid',
      estado: 'PUBLICADO',
      visibilidad: 'PUBLICO',
      descripcion: 'Detalle',
      latitud: 40.4168,
      longitud: -3.7038,
      altura: 667,
    })

    const wrapper = mount(TreesDetailView, {
      global: {
        plugins: [createTestI18n()],
        stubs: {
          RouterLink: true,
          TreeLocationMapPreview: {
            name: 'TreeLocationMapPreview',
            template: '<div class="tree-location-map-stub" />',
            props: ['latitude', 'longitude', 'showMarker', 'readOnly'],
          },
        },
      },
    })
    await flushPromises()

    expect(wrapper.find('h2').text()).toContain('Encina (Quercus ilex)')
    expect((wrapper.get('#tree-detail-province').element as HTMLInputElement).value).toBe('Madrid')
    expect((wrapper.get('#tree-detail-municipality').element as HTMLInputElement).value).toBe('Madrid')
    expect((wrapper.get('#tree-detail-state').element as HTMLInputElement).value).toBe('PUBLICADO')
    expect((wrapper.get('#tree-detail-visibility').element as HTMLInputElement).value).toBe('PUBLICO')

    const mapStub = wrapper.findComponent({ name: 'TreeLocationMapPreview' })
    expect(mapStub.exists()).toBe(true)
    expect(mapStub.props('latitude')).toBe('40.4168')
    expect(mapStub.props('longitude')).toBe('-3.7038')
    expect(mapStub.props('showMarker')).toBe(true)
    expect(mapStub.props('readOnly')).toBe(true)
    expect(wrapper.text()).toContain('No hay fotografías disponibles para este árbol.')
  })

  it('renders carousel controls when there are multiple photos', async () => {
    fetchPublicTreeDetailMock.mockResolvedValue({
      treeId: 42,
      nombreComun: 'Encina',
      nombreCientifico: 'Quercus ilex',
      provincia: 'Madrid',
      municipio: 'Madrid',
      estado: 'PUBLICADO',
      visibilidad: 'PUBLICO',
      descripcion: 'Detalle',
      latitud: 40.4168,
      longitud: -3.7038,
      altura: 667,
    })
    fetchTreePhotoGalleryMock.mockResolvedValue([
      {
        id: 1,
        url: 'http://localhost:9000/mtl-photos/trees/42/one.jpg',
        esPrincipal: true,
        orden: 0,
        mimeType: 'image/jpeg',
        ancho: 1200,
        alto: 800,
        categoria: 'PUBLIC',
      },
      {
        id: 2,
        url: 'http://localhost:9000/mtl-photos/trees/42/two.jpg',
        esPrincipal: false,
        orden: 1,
        mimeType: 'image/jpeg',
        ancho: 1200,
        alto: 800,
        categoria: 'PUBLIC',
      },
    ])

    const wrapper = mount(TreesDetailView, {
      global: {
        plugins: [createTestI18n()],
        stubs: {
          RouterLink: true,
          TreeLocationMapPreview: true,
        },
      },
    })
    await flushPromises()

    expect(wrapper.find('.tree-detail-gallery-image').exists()).toBe(true)
    expect(wrapper.text()).toContain('Imagen 1 de 2')
    expect(wrapper.text()).toContain('Anterior')
    expect(wrapper.text()).toContain('Siguiente')

    const nextButton = wrapper.findAll('button').find((button) => button.text() === 'Siguiente')
    expect(nextButton).toBeDefined()
    await nextButton!.trigger('click')
    expect(wrapper.text()).toContain('Imagen 2 de 2')

    const previousButton = wrapper.findAll('button').find((button) => button.text() === 'Anterior')
    expect(previousButton).toBeDefined()
    await previousButton!.trigger('click')
    expect(wrapper.text()).toContain('Imagen 1 de 2')
  })

  it('renders single-image mode without carousel controls', async () => {
    fetchPublicTreeDetailMock.mockResolvedValue({
      treeId: 42,
      nombreComun: 'Encina',
      nombreCientifico: 'Quercus ilex',
      provincia: 'Madrid',
      municipio: 'Madrid',
      estado: 'PUBLICADO',
      visibilidad: 'PUBLICO',
      descripcion: 'Detalle',
      latitud: 40.4168,
      longitud: -3.7038,
      altura: 667,
    })
    fetchTreePhotoGalleryMock.mockResolvedValue([
      {
        id: 1,
        url: 'http://localhost:9000/mtl-photos/trees/42/one.jpg',
        esPrincipal: true,
        orden: 0,
        mimeType: 'image/jpeg',
        ancho: 1200,
        alto: 800,
        categoria: 'PUBLIC',
      },
    ])

    const wrapper = mount(TreesDetailView, {
      global: {
        plugins: [createTestI18n()],
        stubs: {
          RouterLink: true,
          TreeLocationMapPreview: true,
        },
      },
    })
    await flushPromises()

    expect(wrapper.find('.tree-detail-gallery-image').exists()).toBe(true)
    expect(wrapper.text()).not.toContain('Imagen 1 de 1')
    expect(wrapper.text()).not.toContain('Anterior')
    expect(wrapper.text()).not.toContain('Siguiente')
  })

  it('opens the fullscreen viewer from accessible trigger and closes it on demand', async () => {
    fetchPublicTreeDetailMock.mockResolvedValue({
      treeId: 42,
      nombreComun: 'Encina',
      nombreCientifico: 'Quercus ilex',
      provincia: 'Madrid',
      municipio: 'Madrid',
      estado: 'PUBLICADO',
      visibilidad: 'PUBLICO',
      descripcion: 'Detalle',
      latitud: 40.4168,
      longitud: -3.7038,
      altura: 667,
    })
    fetchTreePhotoGalleryMock.mockResolvedValue([
      {
        id: 1,
        url: 'http://localhost:9000/mtl-photos/trees/42/one.jpg',
        esPrincipal: true,
        orden: 0,
        mimeType: 'image/jpeg',
        ancho: 1200,
        alto: 800,
        categoria: 'PUBLIC',
      },
      {
        id: 2,
        url: 'http://localhost:9000/mtl-photos/trees/42/two.jpg',
        esPrincipal: false,
        orden: 1,
        mimeType: 'image/jpeg',
        ancho: 1200,
        alto: 800,
        categoria: 'PUBLIC',
      },
    ])

    const wrapper = mount(TreesDetailView, {
      global: {
        plugins: [createTestI18n()],
        stubs: {
          RouterLink: true,
          TreeLocationMapPreview: true,
          TreePhotoFullscreenViewer: {
            name: 'TreePhotoFullscreenViewer',
            template:
              '<div class="tree-photo-viewer-stub"><button class="tree-photo-viewer-close-stub" @click="$emit(\'close\')">close</button></div>',
            props: ['photos', 'initialIndex', 'title'],
            emits: ['close'],
          },
        },
      },
    })
    await flushPromises()

    expect(wrapper.findComponent({ name: 'TreePhotoFullscreenViewer' }).exists()).toBe(false)

    const openViewerButton = wrapper.get('.tree-detail-gallery-open-btn')
    expect(openViewerButton.attributes('aria-label')).toBe('Abrir visor ampliado de fotografías')
    await openViewerButton.trigger('keydown.enter')

    const viewer = wrapper.findComponent({ name: 'TreePhotoFullscreenViewer' })
    expect(viewer.exists()).toBe(true)
    expect(viewer.props('photos')).toHaveLength(2)
    expect(viewer.props('title')).toBe('Encina (Quercus ilex)')

    await wrapper.get('.tree-photo-viewer-close-stub').trigger('click')
    expect(wrapper.findComponent({ name: 'TreePhotoFullscreenViewer' }).exists()).toBe(false)
  })

  it('shows loading state while detail request is pending', async () => {
    fetchPublicTreeDetailMock.mockImplementation(
      () => new Promise(() => {}),
    )

    const wrapper = mount(TreesDetailView, {
      global: {
        plugins: [createTestI18n()],
        stubs: {
          RouterLink: true,
          TreeLocationMapPreview: true,
        },
      },
    })
    await nextTick()

    expect(wrapper.text()).toContain('Cargando detalle del árbol...')
  })

  it('shows not-found message for invalid id before calling backend', async () => {
    routeMock.params.id = 'abc'

    const wrapper = mount(TreesDetailView, {
      global: {
        plugins: [createTestI18n()],
        stubs: {
          RouterLink: true,
          TreeLocationMapPreview: true,
        },
      },
    })
    await flushPromises()

    expect(fetchPublicTreeDetailMock).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('No se ha encontrado una ficha pública con ese identificador.')
  })

  it('shows not-found UX when backend returns 404', async () => {
    fetchPublicTreeDetailMock.mockRejectedValue(new HttpError(404))

    const wrapper = mount(TreesDetailView, {
      global: {
        plugins: [createTestI18n()],
        stubs: {
          RouterLink: true,
          TreeLocationMapPreview: true,
        },
      },
    })
    await flushPromises()

    expect(wrapper.text()).toContain('No se ha encontrado una ficha pública con ese identificador.')
    expect(wrapper.text()).toContain('Comprueba el enlace o vuelve al listado de fichas publicadas.')
  })

  it('shows network error message when service is unreachable', async () => {
    fetchPublicTreeDetailMock.mockRejectedValue(new NetworkError())

    const wrapper = mount(TreesDetailView, {
      global: {
        plugins: [createTestI18n()],
        stubs: {
          RouterLink: true,
          TreeLocationMapPreview: true,
        },
      },
    })
    await flushPromises()

    expect(wrapper.text()).toContain('No se pudo conectar con el servicio. Verifica el entorno local.')
  })

  it('shows no-location message when coordinates are out of range', async () => {
    fetchPublicTreeDetailMock.mockResolvedValue({
      treeId: 42,
      nombreComun: 'Encina',
      nombreCientifico: 'Quercus ilex',
      provincia: 'Madrid',
      municipio: 'Madrid',
      estado: 'PUBLICADO',
      visibilidad: 'PUBLICO',
      descripcion: 'Detalle',
      latitud: 200,
      longitud: -3.7038,
      altura: null,
    })

    const wrapper = mount(TreesDetailView, {
      global: {
        plugins: [createTestI18n()],
        stubs: {
          RouterLink: true,
          TreeLocationMapPreview: true,
        },
      },
    })
    await flushPromises()

    expect(wrapper.text()).toContain('No hay coordenadas válidas para mostrar la localización en el mapa.')
    expect(wrapper.findComponent({ name: 'TreeLocationMapPreview' }).exists()).toBe(false)
  })
})
