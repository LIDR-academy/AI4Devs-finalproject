import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createI18n } from 'vue-i18n'
import MyTreesListView from '@/views/MyTreesListView.vue'
import { es } from '@/i18n/locales/es'
import { HttpError, NetworkError } from '@/services/http/apiClient'

const fetchCollaboratorTreesMock = vi.hoisted(() => vi.fn())
const fetchSpeciesMock = vi.hoisted(() => vi.fn())
const hasRoleMock = vi.hoisted(() => vi.fn((_role?: string) => false))
const loadForTreeIdsMock = vi.hoisted(() => vi.fn())
const thumbUrlsMock = vi.hoisted(() => ({} as Record<number, string>))

vi.mock('@/services/catalog/collaboratorTreesService', () => ({
  fetchCollaboratorTrees: fetchCollaboratorTreesMock,
}))

vi.mock('@/services/catalog/catalogService', () => ({
  fetchSpecies: fetchSpeciesMock,
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

function routerLinkStub() {
  return {
    props: ['to'],
    template: '<a :href="typeof to === \'string\' ? to : JSON.stringify(to)"><slot /></a>',
  }
}

describe('MyTreesListView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    hasRoleMock.mockReturnValue(false)
    fetchSpeciesMock.mockResolvedValue([{ id: 1, label: 'Encina (Quercus ilex)' }])
    Object.keys(thumbUrlsMock).forEach((key) => {
      delete thumbUrlsMock[Number(key)]
    })
  })

  it('shows empty state when collaborator list has no results', async () => {
    fetchCollaboratorTreesMock.mockResolvedValue({
      content: [],
      totalResults: 0,
      page: 0,
      size: 20,
      sort: 'modificado_en,desc',
    })

    const wrapper = mount(MyTreesListView, {
      global: {
        plugins: [createTestI18n()],
        stubs: { RouterLink: routerLinkStub() },
      },
    })
    await flushPromises()

    expect(wrapper.text()).toContain('No hay resultados para los filtros seleccionados.')
  })

  it('shows loading state while collaborator trees are being fetched', async () => {
    fetchCollaboratorTreesMock.mockImplementation(() => new Promise(() => {}))

    const wrapper = mount(MyTreesListView, {
      global: {
        plugins: [createTestI18n()],
        stubs: { RouterLink: routerLinkStub() },
      },
    })
    await flushPromises()
    await nextTick()

    expect(wrapper.text()).toContain('Cargando tus fichas...')
  })

  it('shows service error state when request fails', async () => {
    fetchCollaboratorTreesMock.mockRejectedValue(new HttpError(503))

    const wrapper = mount(MyTreesListView, {
      global: {
        plugins: [createTestI18n()],
        stubs: { RouterLink: routerLinkStub() },
      },
    })
    await flushPromises()

    expect(wrapper.text()).toContain('El catálogo no está disponible')
  })

  it('renders tree card with edit link to trees-edit route', async () => {
    fetchCollaboratorTreesMock.mockResolvedValue({
      content: [
        {
          treeId: 42,
          nombreComun: 'Encina',
          nombreCientifico: 'Quercus ilex',
          provincia: 'Madrid',
          municipio: 'Madrid',
          publicationState: 'PUBLICADO',
          publicMapVisibility: 'PUBLICO',
          createdAt: '2026-01-01T00:00:00Z',
          modifiedAt: '2026-01-02T00:00:00Z',
        },
      ],
      totalResults: 1,
      page: 0,
      size: 20,
      sort: 'modificado_en,desc',
    })

    const wrapper = mount(MyTreesListView, {
      global: {
        plugins: [createTestI18n()],
        stubs: { RouterLink: routerLinkStub() },
      },
    })
    await flushPromises()

    expect(wrapper.text()).toContain('Encina (Quercus ilex)')
    expect(wrapper.text()).toContain('Estado')
    expect(wrapper.text()).toContain('Visibilidad')
    expect(wrapper.text()).toContain('PUBLICADO')
    expect(wrapper.text()).toContain('PUBLICO')
    expect(wrapper.text()).toContain('Editar')
    expect(wrapper.html()).toContain('trees-edit')
    expect(wrapper.html()).toContain('42')
  })

  it('does not show more filters for collaborator without admin role', async () => {
    fetchCollaboratorTreesMock.mockResolvedValue({
      content: [],
      totalResults: 0,
      page: 0,
      size: 20,
      sort: 'modificado_en,desc',
    })
    hasRoleMock.mockImplementation((role?: string) => role === 'COLABORADOR')

    const wrapper = mount(MyTreesListView, {
      global: {
        plugins: [createTestI18n()],
        stubs: { RouterLink: routerLinkStub() },
      },
    })
    await flushPromises()

    expect(wrapper.text()).not.toContain('Más filtros')
    expect(wrapper.find('#my-trees-filter-creator').isVisible()).toBe(false)
  })

  it('shows admin user filter when more filters is expanded', async () => {
    fetchCollaboratorTreesMock.mockResolvedValue({
      content: [],
      totalResults: 0,
      page: 0,
      size: 20,
      sort: 'modificado_en,desc',
    })
    hasRoleMock.mockImplementation((role?: string) => role === 'ADMIN')

    const wrapper = mount(MyTreesListView, {
      global: {
        plugins: [createTestI18n()],
        stubs: { RouterLink: routerLinkStub() },
      },
    })
    await flushPromises()

    const moreFiltersButton = wrapper
      .findAll('button')
      .find((button) => button.text() === 'Más filtros')
    expect(moreFiltersButton).toBeDefined()
    await moreFiltersButton!.trigger('click')
    await nextTick()

    expect(wrapper.find('#my-trees-filter-creator').exists()).toBe(true)
  })

  it('sends createdByUserId when admin applies numeric user filter', async () => {
    fetchCollaboratorTreesMock.mockResolvedValue({
      content: [],
      totalResults: 0,
      page: 0,
      size: 20,
      sort: 'modificado_en,desc',
    })
    hasRoleMock.mockImplementation((role?: string) => role === 'ADMIN')

    const wrapper = mount(MyTreesListView, {
      global: {
        plugins: [createTestI18n()],
        stubs: { RouterLink: routerLinkStub() },
      },
    })
    await flushPromises()

    const moreFiltersButton = wrapper
      .findAll('button')
      .find((button) => button.text() === 'Más filtros')
    await moreFiltersButton!.trigger('click')
    await nextTick()

    await wrapper.find('#my-trees-filter-creator').setValue(7)
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(fetchCollaboratorTreesMock).toHaveBeenCalledWith(
      expect.objectContaining({ createdByUserId: 7 }),
      expect.any(AbortSignal),
    )
  })

  it('sends speciesId when a species is selected from autocomplete', async () => {
    fetchCollaboratorTreesMock.mockResolvedValue({
      content: [],
      totalResults: 0,
      page: 0,
      size: 20,
      sort: 'modificado_en,desc',
    })

    const wrapper = mount(MyTreesListView, {
      global: {
        plugins: [createTestI18n()],
        stubs: { RouterLink: routerLinkStub() },
      },
    })
    await flushPromises()

    const speciesInput = wrapper.find('#my-trees-filter-species')
    await speciesInput.setValue('Encina (Quercus ilex)')
    await speciesInput.trigger('focus')
    await nextTick()

    const suggestion = wrapper.find('.species-autocomplete-item')
    await suggestion.trigger('mousedown')
    await nextTick()

    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(fetchCollaboratorTreesMock).toHaveBeenCalledWith(
      expect.objectContaining({ speciesId: 1 }),
      expect.any(AbortSignal),
    )
  })

  it('maps network failures to the expected user-facing message', async () => {
    fetchCollaboratorTreesMock.mockRejectedValue(new NetworkError())

    const wrapper = mount(MyTreesListView, {
      global: {
        plugins: [createTestI18n()],
        stubs: { RouterLink: routerLinkStub() },
      },
    })
    await flushPromises()

    expect(wrapper.text()).toContain('No se pudo conectar con el servicio')
  })
})
