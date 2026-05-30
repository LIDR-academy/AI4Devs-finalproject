import { createApp, nextTick } from 'vue'
import { createI18n } from 'vue-i18n'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HttpError, NetworkError } from '@/services/http/apiClient'
import { es } from '@/i18n/locales/es'
import { mapAdminTaxonomyError, useAdminTaxonomyMasters } from '@/composables/useAdminTaxonomyMasters'

const fetchAdminSpeciesListMock = vi.hoisted(() => vi.fn())
const fetchAdminGeneraMock = vi.hoisted(() => vi.fn())
const fetchAdminFamiliesMock = vi.hoisted(() => vi.fn())
const fetchAdminSpeciesDetailMock = vi.hoisted(() => vi.fn())
const createAdminGenusMock = vi.hoisted(() => vi.fn())
const createAdminFamilyMock = vi.hoisted(() => vi.fn())
const createAdminSpeciesMock = vi.hoisted(() => vi.fn())
const deleteAdminSpeciesMock = vi.hoisted(() => vi.fn())

vi.mock('@/services/catalog/adminTaxonomy', () => ({
  fetchAdminSpeciesList: fetchAdminSpeciesListMock,
  fetchAdminGenera: fetchAdminGeneraMock,
  fetchAdminFamilies: fetchAdminFamiliesMock,
  fetchAdminSpeciesDetail: fetchAdminSpeciesDetailMock,
  createAdminSpecies: createAdminSpeciesMock,
  updateAdminSpecies: vi.fn(),
  createAdminGenus: createAdminGenusMock,
  createAdminFamily: createAdminFamilyMock,
  deleteAdminSpecies: deleteAdminSpeciesMock,
}))

function createTestI18n() {
  return createI18n({
    legacy: false,
    locale: 'es',
    fallbackLocale: 'es',
    messages: { es },
  })
}

function mountMasters() {
  let api!: ReturnType<typeof useAdminTaxonomyMasters>
  const app = createApp({
    setup() {
      api = useAdminTaxonomyMasters()
      return () => null
    },
  })
  app.use(createTestI18n())
  app.mount(document.createElement('div'))
  return api
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

describe('mapAdminTaxonomyError', () => {
  const t = (key: string) => key

  it('mapea NetworkError', () => {
    expect(mapAdminTaxonomyError(new NetworkError(), t)).toBe('adminMasters.messages.network')
  })

  it('mapea 409 a conflictDelete', () => {
    expect(mapAdminTaxonomyError(new HttpError(409, { title: 'Conflicto', status: 409 }), t)).toBe(
      'adminMasters.messages.conflictDelete',
    )
  })

  it('mapea 400 con detail del Problem', () => {
    expect(
      mapAdminTaxonomyError(
        new HttpError(400, { title: 'Bad', status: 400, detail: 'Campo inválido' }),
        t,
      ),
    ).toBe('Campo inválido')
  })
})

describe('useAdminTaxonomyMasters', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fetchAdminSpeciesListMock.mockResolvedValue({
      ...emptyPage,
      content: [{ id: 1, label: 'Encina (Quercus ilex)', genusId: 10, genusLabel: 'Robles (Quercus)' }],
    })
    fetchAdminGeneraMock.mockResolvedValue({
      ...emptyPage,
      content: [{ id: 10, label: 'Quercus', familyId: 5 }],
    })
    fetchAdminFamiliesMock.mockResolvedValue({
      ...emptyPage,
      content: [{ id: 5, label: 'Fagaceae' }],
    })
  })

  it('reloadAll rellena listas', async () => {
    const masters = mountMasters()
    await masters.reloadAll()
    await nextTick()
    expect(masters.speciesList.value).toHaveLength(1)
    expect(masters.generaList.value).toHaveLength(1)
    expect(masters.errorMessage.value).toBe('')
  })

  it('reloadAll con NetworkError muestra mensaje de red', async () => {
    fetchAdminSpeciesListMock.mockRejectedValueOnce(new NetworkError())
    const masters = mountMasters()
    await masters.reloadAll()
    await nextTick()
    expect(masters.errorMessage.value).toContain('conectar')
  })

  it('submitGenusModal preselecciona género creado', async () => {
    createAdminGenusMock.mockResolvedValueOnce({
      genusId: 77,
      familyId: 5,
      scientificName: 'Pinus',
      commonName: null,
      label: 'Pinus',
    })
    const masters = mountMasters()
    await masters.reloadAll()
    masters.genusModalFamilyId.value = 5
    masters.genusModalScientific.value = 'Pinus'
    await masters.submitGenusModal()
    await nextTick()
    expect(masters.formGenusId.value).toBe(77)
    expect(masters.showGenusModal.value).toBe(false)
  })

  it('submitFamilyModal preselecciona familia en modal de género', async () => {
    createAdminFamilyMock.mockResolvedValueOnce({
      familyId: 88,
      scientificName: 'Pinaceae',
      commonName: null,
      label: 'Pinaceae',
    })
    const masters = mountMasters()
    masters.familyModalScientific.value = 'Pinaceae'
    await masters.submitFamilyModal()
    await nextTick()
    expect(masters.genusModalFamilyId.value).toBe(88)
    expect(masters.showFamilyModal.value).toBe(false)
  })

  it('submitSpecies rechaza formulario inválido sin llamar al API', async () => {
    const masters = mountMasters()
    await masters.reloadAll()
    masters.openCreateSpecies()
    await masters.submitSpecies()
    await nextTick()
    expect(createAdminSpeciesMock).not.toHaveBeenCalled()
    expect(masters.speciesFormError.value).toContain('obligatorio')
  })

  it('confirmDelete con 409 muestra conflicto', async () => {
    deleteAdminSpeciesMock.mockRejectedValueOnce(new HttpError(409, { title: 'Conflicto', status: 409 }))
    const masters = mountMasters()
    masters.deleteTarget.value = {
      id: 1,
      label: 'Encina',
      genusId: 10,
      genusLabel: 'Robles (Quercus)',
    }
    await masters.confirmDelete()
    await nextTick()
    expect(masters.errorMessage.value).toContain('fichas de árbol')
  })

  it('goNextSpeciesPage avanza y recarga listado', async () => {
    fetchAdminSpeciesListMock
      .mockResolvedValueOnce({
        ...emptyPage,
        content: [{ id: 1, label: 'Encina (Quercus ilex)', genusId: 10, genusLabel: 'Robles (Quercus)' }],
        totalElements: 25,
        totalPages: 2,
        last: false,
      })
      .mockResolvedValueOnce({
        ...emptyPage,
        page: 1,
        content: [{ id: 2, label: 'Roble (Quercus robur)', genusId: 10, genusLabel: 'Robles (Quercus)' }],
        totalElements: 25,
        totalPages: 2,
        first: false,
        last: true,
      })

    const masters = mountMasters()
    await masters.reloadAll()
    expect(masters.speciesPage.value).toBe(0)
    expect(masters.hasSpeciesNext.value).toBe(true)

    await masters.goNextSpeciesPage()
    await nextTick()

    expect(masters.speciesPage.value).toBe(1)
    expect(fetchAdminSpeciesListMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 1, size: 20, unpaged: false }),
    )
    expect(masters.speciesList.value[0]?.label).toBe('Roble (Quercus robur)')
  })

  it('openCreateSpecies abre modal en modo alta', () => {
    const masters = mountMasters()
    masters.openCreateSpecies()
    expect(masters.showSpeciesModal.value).toBe(true)
    expect(masters.editingSpeciesId.value).toBeNull()
  })

  it('closeSpeciesModal cierra y resetea formulario', () => {
    const masters = mountMasters()
    masters.openCreateSpecies()
    masters.formScientificName.value = 'Quercus'
    masters.closeSpeciesModal()
    expect(masters.showSpeciesModal.value).toBe(false)
    expect(masters.formScientificName.value).toBe('')
  })

  it('submitSpecies crea especie y cierra modal', async () => {
    createAdminSpeciesMock.mockResolvedValueOnce({
      speciesId: 2,
      genusId: 10,
      scientificName: 'Pinus pinea',
      commonName: null,
      label: 'Pinus pinea',
    })
    const masters = mountMasters()
    await masters.reloadAll()
    masters.openCreateSpecies()
    masters.formGenusId.value = 10
    masters.formScientificName.value = 'Pinus pinea'
    await masters.submitSpecies()
    await nextTick()
    expect(createAdminSpeciesMock).toHaveBeenCalled()
    expect(masters.showSpeciesModal.value).toBe(false)
    expect(masters.statusMessage.value).toContain('creada')
  })

  it('goPreviousSpeciesPage retrocede cuando hay página anterior', async () => {
    fetchAdminSpeciesListMock
      .mockResolvedValueOnce({
        ...emptyPage,
        content: [{ id: 1, label: 'Encina (Quercus ilex)', genusId: 10, genusLabel: 'Robles (Quercus)' }],
        totalElements: 25,
        totalPages: 2,
        last: false,
      })
      .mockResolvedValueOnce({
        ...emptyPage,
        page: 1,
        content: [{ id: 2, label: 'Roble (Quercus robur)', genusId: 10, genusLabel: 'Robles (Quercus)' }],
        totalElements: 25,
        totalPages: 2,
        first: false,
        last: true,
      })
      .mockResolvedValueOnce({
        ...emptyPage,
        content: [{ id: 1, label: 'Encina (Quercus ilex)', genusId: 10, genusLabel: 'Robles (Quercus)' }],
        totalElements: 25,
        totalPages: 2,
        first: true,
        last: false,
      })

    const masters = mountMasters()
    await masters.reloadAll()
    await masters.goNextSpeciesPage()
    await nextTick()
    expect(masters.speciesPage.value).toBe(1)

    await masters.goPreviousSpeciesPage()
    await nextTick()
    expect(masters.speciesPage.value).toBe(0)
  })
})
