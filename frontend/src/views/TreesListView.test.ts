import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createI18n } from 'vue-i18n'
import TreesListView from '@/views/TreesListView.vue'
import { es } from '@/i18n/locales/es'
import { HttpError, NetworkError } from '@/services/http/apiClient'

const fetchPublicTreesMock = vi.hoisted(() => vi.fn())
const fetchPublicProvinceNamesMock = vi.hoisted(() => vi.fn())
const hasRoleMock = vi.hoisted(() => vi.fn(() => false))
const loadForTreeIdsMock = vi.hoisted(() => vi.fn())
const thumbUrlsMock = vi.hoisted(() => ({} as Record<number, string>))

vi.mock('@/services/catalog/catalogService', () => ({
  fetchPublicTrees: fetchPublicTreesMock,
  fetchPublicProvinceNames: fetchPublicProvinceNamesMock,
}))

vi.mock('@/composables/useAuth', () => ({
  useAuth: () => ({
    hasRole: hasRoleMock,
  }),
}))

vi.mock('@/composables/useTreeListPrimaryPhotos', () => ({
  useTreeListPrimaryPhotos: () => ({
    thumbUrls: { value: thumbUrlsMock },
    loadForTreeIds: loadForTreeIdsMock,
  }),
}))

function createTestI18n() {
  return createI18n({
    legacy: false,
    locale: 'es',
    fallbackLocale: 'es',
    messages: { es },
  })
}

describe('TreesListView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    hasRoleMock.mockReturnValue(false)
    fetchPublicProvinceNamesMock.mockResolvedValue(['Madrid'])
    Object.keys(thumbUrlsMock).forEach((key) => {
      delete thumbUrlsMock[Number(key)]
    })
  })

  it('shows empty state when public list has no results', async () => {
    fetchPublicTreesMock.mockResolvedValue({
      content: [],
      totalResults: 0,
      page: 0,
      size: 20,
      sort: 'especie,asc',
    })

    const wrapper = mount(TreesListView, {
      global: {
        plugins: [createTestI18n()],
        stubs: {
          RouterLink: {
            template: '<a><slot /></a>',
          },
        },
      },
    })
    await flushPromises()

    expect(wrapper.text()).toContain('No hay resultados para los filtros seleccionados.')
  })

  it('shows loading state while public trees are being fetched', async () => {
    fetchPublicTreesMock.mockImplementation(
      () => new Promise(() => {}),
    )

    const wrapper = mount(TreesListView, {
      global: {
        plugins: [createTestI18n()],
        stubs: {
          RouterLink: {
            template: '<a><slot /></a>',
          },
        },
      },
    })
    await nextTick()

    expect(wrapper.text()).toContain('Cargando árboles publicados...')
  })

  it('shows service error state when request fails', async () => {
    fetchPublicTreesMock.mockRejectedValue(new HttpError(503))

    const wrapper = mount(TreesListView, {
      global: {
        plugins: [createTestI18n()],
        stubs: {
          RouterLink: {
            template: '<a><slot /></a>',
          },
        },
      },
    })
    await flushPromises()

    expect(wrapper.text()).toContain('El catálogo no está disponible')
  })

  it('renders public tree card and navigation link to detail route', async () => {
    fetchPublicTreesMock.mockResolvedValue({
      content: [
        {
          treeId: 42,
          nombreComun: 'Encina',
          nombreCientifico: 'Quercus ilex',
          provincia: 'Madrid',
          municipio: 'Madrid',
          estado: 'PUBLICADO',
          visibilidad: 'PUBLICO',
        },
      ],
      totalResults: 1,
      page: 0,
      size: 20,
      sort: 'especie,asc',
    })

    const wrapper = mount(TreesListView, {
      global: {
        plugins: [createTestI18n()],
        stubs: {
          RouterLink: {
            template: '<a><slot /></a>',
          },
        },
      },
    })
    await flushPromises()

    expect(wrapper.text()).toContain('Encina (Quercus ilex)')
    expect(wrapper.html()).toContain('to="/trees/42"')
  })

  it('uses default image when tree has no primary photo', async () => {
    fetchPublicTreesMock.mockResolvedValue({
      content: [
        {
          treeId: 50,
          nombreComun: 'Pino',
          nombreCientifico: 'Pinus pinea',
          provincia: 'Madrid',
          municipio: 'Madrid',
          estado: 'PUBLICADO',
          visibilidad: 'PUBLICO',
        },
      ],
      totalResults: 1,
      page: 0,
      size: 20,
      sort: 'especie,asc',
    })

    const wrapper = mount(TreesListView, {
      global: {
        plugins: [createTestI18n()],
        stubs: {
          RouterLink: {
            template: '<a><slot /></a>',
          },
        },
      },
    })
    await flushPromises()

    const img = wrapper.get('.tree-card-thumb-img')
    expect(img.attributes('src')).toBe('/MyTreeLibrary.png')
  })

  it('maps network failures to the expected user-facing message', async () => {
    fetchPublicTreesMock.mockRejectedValue(new NetworkError())

    const wrapper = mount(TreesListView, {
      global: {
        plugins: [createTestI18n()],
        stubs: {
          RouterLink: {
            template: '<a><slot /></a>',
          },
        },
      },
    })
    await flushPromises()

    expect(wrapper.text()).toContain('No se pudo conectar con el servicio. Verifica el entorno local.')
  })
})
