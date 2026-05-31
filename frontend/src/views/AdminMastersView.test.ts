import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import AdminMastersView from '@/views/AdminMastersView.vue'
import { es } from '@/i18n/locales/es'
import { HttpError } from '@/services/http/apiClient'

const fetchAdminSpeciesListMock = vi.hoisted(() => vi.fn())
const fetchAdminGeneraMock = vi.hoisted(() => vi.fn())
const fetchAdminFamiliesMock = vi.hoisted(() => vi.fn())
const fetchAdminSpeciesDetailMock = vi.hoisted(() => vi.fn())
const createAdminSpeciesMock = vi.hoisted(() => vi.fn())
const createAdminGenusMock = vi.hoisted(() => vi.fn())
const deleteAdminSpeciesMock = vi.hoisted(() => vi.fn())
const fetchSpeciesMock = vi.hoisted(() => vi.fn())

vi.mock('@/services/catalog/adminTaxonomy', () => ({
  fetchAdminSpeciesList: fetchAdminSpeciesListMock,
  fetchAdminGenera: fetchAdminGeneraMock,
  fetchAdminFamilies: fetchAdminFamiliesMock,
  fetchAdminSpeciesDetail: fetchAdminSpeciesDetailMock,
  createAdminSpecies: createAdminSpeciesMock,
  updateAdminSpecies: vi.fn(),
  deleteAdminSpecies: deleteAdminSpeciesMock,
  createAdminGenus: createAdminGenusMock,
  createAdminFamily: vi.fn(),
}))

vi.mock('@/services/catalog/catalogService', () => ({
  fetchSpecies: fetchSpeciesMock,
}))

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>()
  return {
    ...actual,
    useRoute: () => ({
      meta: { pageTitleKey: 'adminMasters.title' },
    }),
  }
})

beforeAll(() => {
  if (typeof HTMLDialogElement === 'undefined') {
    return
  }
  const proto = HTMLDialogElement.prototype as HTMLDialogElement & {
    showModal?: () => void
  }
  if (typeof proto.showModal !== 'function') {
    proto.showModal = function (this: HTMLDialogElement) {
      this.setAttribute('open', '')
    }
  }
  if (typeof (proto as { close?: () => void }).close !== 'function') {
    ;(proto as { close: () => void }).close = function (this: HTMLDialogElement) {
      this.removeAttribute('open')
    }
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

const emptyPage = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  page: 0,
  size: 100,
  unpaged: true,
  first: true,
  last: true,
}

describe('AdminMastersView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fetchSpeciesMock.mockResolvedValue([{ id: 1, label: 'Encina (Quercus ilex)' }])
    fetchAdminSpeciesListMock.mockResolvedValue({
      ...emptyPage,
      content: [{ id: 1, label: 'Encina (Quercus ilex)', genusId: 10, genusLabel: 'Robles (Quercus)' }],
    })
    fetchAdminGeneraMock.mockResolvedValue({
      ...emptyPage,
      content: [{ id: 10, label: 'Quercus', familyId: 5 }],
    })
    fetchAdminFamiliesMock.mockResolvedValue(emptyPage)
  })

  it('muestra listado de especies tras cargar', async () => {
    const wrapper = mount(AdminMastersView, {
      global: {
        plugins: [createTestI18n()],
        stubs: { MtlConfirmDialog: true },
      },
    })
    await flushPromises()

    expect(wrapper.text()).toContain('Encina (Quercus ilex)')
    expect(wrapper.text()).toContain('Robles (Quercus)')
    expect(fetchAdminSpeciesListMock).toHaveBeenCalled()
  })

  it('precarga formulario al editar una especie', async () => {
    fetchAdminSpeciesDetailMock.mockResolvedValueOnce({
      speciesId: 1,
      genusId: 10,
      scientificName: 'Quercus ilex',
      commonName: 'Encina',
      label: 'Encina (Quercus ilex)',
    })

    const wrapper = mount(AdminMastersView, {
      global: {
        plugins: [createTestI18n()],
        stubs: { MtlConfirmDialog: true },
      },
    })
    await flushPromises()

    const editButton = wrapper.findAll('button').find((b) => b.text() === 'Editar')
    expect(editButton).toBeDefined()
    await editButton!.trigger('click')
    await flushPromises()

    expect(fetchAdminSpeciesDetailMock).toHaveBeenCalledWith(1, expect.any(AbortSignal))
    const scientificInput = wrapper.get('#admin-species-scientific')
    expect((scientificInput.element as HTMLInputElement).value).toBe('Quercus ilex')
  })

  it('crea especie con datos del formulario en popup', async () => {
    createAdminSpeciesMock.mockResolvedValueOnce({
      speciesId: 2,
      genusId: 10,
      scientificName: 'Pinus pinea',
      commonName: null,
      label: 'Pinus pinea',
    })

    const wrapper = mount(AdminMastersView, {
      global: {
        plugins: [createTestI18n()],
        stubs: { MtlConfirmDialog: true },
      },
    })
    await flushPromises()

    const createButton = wrapper
      .findAll('button')
      .find((b) => b.text() === 'Crear' && b.attributes('type') === 'button')
    expect(createButton).toBeDefined()
    await createButton!.trigger('click')
    await flushPromises()

    await wrapper.get('#admin-species-genus').setValue('10')
    await wrapper.get('#admin-species-scientific').setValue('Pinus pinea')
    await wrapper.get('#admin-masters-form').trigger('submit.prevent')
    await flushPromises()

    expect(createAdminSpeciesMock).toHaveBeenCalledWith(
      {
        genusId: 10,
        scientificName: 'Pinus pinea',
        commonName: undefined,
      },
      expect.any(AbortSignal),
    )
  })

  it('muestra error 409 al confirmar borrado con fichas referenciadas', async () => {
    deleteAdminSpeciesMock.mockRejectedValueOnce(new HttpError(409, { title: 'Conflicto', status: 409 }))

    const wrapper = mount(AdminMastersView, {
      global: {
        plugins: [createTestI18n()],
        stubs: {
          MtlConfirmDialog: {
            template: '<div><button data-testid="confirm-delete" @click="$emit(\'confirm\')">Confirmar</button></div>',
            props: ['open', 'title', 'message', 'cancelLabel', 'confirmLabel', 'confirmDanger'],
          },
        },
      },
    })
    await flushPromises()

    const deleteButton = wrapper.findAll('button').find((b) => b.text() === 'Eliminar')
    await deleteButton!.trigger('click')
    await wrapper.get('[data-testid="confirm-delete"]').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('fichas de árbol')
    expect(deleteAdminSpeciesMock).toHaveBeenCalledWith(1, expect.any(AbortSignal))
  })

  it('abre modal de género y preselecciona tras crear', async () => {
    createAdminGenusMock.mockImplementationOnce(async () => {
      fetchAdminGeneraMock.mockResolvedValue({
        ...emptyPage,
        content: [
          { id: 10, label: 'Quercus', familyId: 5 },
          { id: 77, label: 'Pinus', familyId: 5 },
        ],
      })
      return {
        genusId: 77,
        familyId: 5,
        scientificName: 'Pinus',
        commonName: null,
        label: 'Pinus',
      }
    })
    fetchAdminFamiliesMock.mockResolvedValue({
      ...emptyPage,
      content: [{ id: 5, label: 'Pinaceae' }],
    })

    const wrapper = mount(AdminMastersView, {
      global: {
        plugins: [createTestI18n()],
        stubs: { MtlConfirmDialog: true },
      },
    })
    await flushPromises()

    const createButton = wrapper
      .findAll('button')
      .find((b) => b.text() === 'Crear' && b.attributes('type') === 'button')
    await createButton!.trigger('click')
    await flushPromises()

    const addGenusButton = wrapper
      .findAll('button')
      .find((b) => b.attributes('aria-label') === 'Alta de género')
    expect(addGenusButton).toBeDefined()
    await addGenusButton!.trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Alta de género')

    await wrapper.get('#admin-genus-family').setValue('5')
    await wrapper.get('#admin-genus-scientific').setValue('Pinus')
    await wrapper.findAll('dialog.mtl-form-dialog--genus form')[0]!.trigger('submit.prevent')
    await flushPromises()

    expect(createAdminGenusMock).toHaveBeenCalled()
    expect((wrapper.get('#admin-species-genus').element as HTMLSelectElement).value).toBe('77')
  })

  it('abre popup de alta al pulsar Crear', async () => {
    const wrapper = mount(AdminMastersView, {
      global: {
        plugins: [createTestI18n()],
        stubs: { MtlConfirmDialog: true },
      },
    })
    await flushPromises()

    const createButton = wrapper
      .findAll('button')
      .find((b) => b.text() === 'Crear' && b.attributes('type') === 'button')
    await createButton!.trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Alta de especie')
    expect(wrapper.get('#admin-species-scientific')).toBeTruthy()
  })

  it('Volver cierra el popup de especie', async () => {
    const wrapper = mount(AdminMastersView, {
      global: {
        plugins: [createTestI18n()],
        stubs: { MtlConfirmDialog: true },
      },
    })
    await flushPromises()

    const createButton = wrapper
      .findAll('button')
      .find((b) => b.text() === 'Crear' && b.attributes('type') === 'button')
    await createButton!.trigger('click')
    await flushPromises()

    const backButton = wrapper
      .findAll('dialog.mtl-form-dialog--species button')
      .find((b) => b.text() === 'Volver')
    await backButton!.trigger('click')
    await flushPromises()

    expect(wrapper.find('dialog.mtl-form-dialog--species[open]').exists()).toBe(false)
  })

  it('editar muestra título de edición en el popup', async () => {
    fetchAdminSpeciesDetailMock.mockResolvedValueOnce({
      speciesId: 1,
      genusId: 10,
      scientificName: 'Quercus ilex',
      commonName: 'Encina',
      label: 'Encina (Quercus ilex)',
    })

    const wrapper = mount(AdminMastersView, {
      global: {
        plugins: [createTestI18n()],
        stubs: { MtlConfirmDialog: true },
      },
    })
    await flushPromises()

    const editButton = wrapper.findAll('button').find((b) => b.text() === 'Editar')
    await editButton!.trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Editar especie')
  })

  it('muestra botón Crear aunque falle la carga del listado', async () => {
    fetchAdminSpeciesListMock.mockRejectedValueOnce(new HttpError(503, { title: 'Unavailable', status: 503 }))

    const wrapper = mount(AdminMastersView, {
      global: {
        plugins: [createTestI18n()],
        stubs: { MtlConfirmDialog: true },
      },
    })
    await flushPromises()

    const createButton = wrapper
      .findAll('button')
      .find((b) => b.text() === 'Crear' && b.attributes('type') === 'button')
    expect(createButton).toBeDefined()
    expect(wrapper.text()).toContain('503')
  })

  it('muestra paginación cuando hay más de una página', async () => {
    fetchAdminSpeciesListMock.mockResolvedValue({
      ...emptyPage,
      content: [{ id: 1, label: 'Encina (Quercus ilex)', genusId: 10, genusLabel: 'Robles (Quercus)' }],
      totalElements: 25,
      totalPages: 2,
      last: false,
    })

    const wrapper = mount(AdminMastersView, {
      global: {
        plugins: [createTestI18n()],
        stubs: { MtlConfirmDialog: true },
      },
    })
    await flushPromises()

    expect(wrapper.text()).toContain('Página 1 de 2')
    const nextButton = wrapper.findAll('button').find((b) => b.text() === 'Siguiente')
    expect(nextButton).toBeDefined()
    expect((nextButton!.element as HTMLButtonElement).disabled).toBe(false)
  })

  it('aplica filtro de género y reenvía genusId al listado', async () => {
    const wrapper = mount(AdminMastersView, {
      global: {
        plugins: [createTestI18n()],
        stubs: { MtlConfirmDialog: true },
      },
    })
    await flushPromises()

    await wrapper.get('#admin-masters-filter-genus').setValue('10')
    await wrapper.get('.catalog-toolbar__form').trigger('submit.prevent')
    await flushPromises()

    expect(fetchAdminSpeciesListMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 0, genusId: 10 }),
    )
  })

  it('limpia filtros al pulsar Limpiar', async () => {
    const wrapper = mount(AdminMastersView, {
      global: {
        plugins: [createTestI18n()],
        stubs: { MtlConfirmDialog: true },
      },
    })
    await flushPromises()

    await wrapper.get('#admin-masters-filter-genus').setValue('10')
    await wrapper.get('.catalog-toolbar__form').trigger('submit.prevent')
    await flushPromises()

    const clearButton = wrapper.findAll('button').find((b) => b.text() === 'Limpiar')
    expect(clearButton).toBeDefined()
    await clearButton!.trigger('click')
    await flushPromises()

    expect((wrapper.get('#admin-masters-filter-genus').element as HTMLSelectElement).value).toBe('')
    expect(fetchAdminSpeciesListMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 0, genusId: undefined, speciesId: undefined }),
    )
  })
})
