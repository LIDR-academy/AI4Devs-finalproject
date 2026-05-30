import { computed, createApp, nextTick } from 'vue'
import { createI18n } from 'vue-i18n'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HttpError } from '@/services/http/apiClient'
import { es } from '@/i18n/locales/es'
import { useEditTreeForm } from '@/composables/useEditTreeForm'

const routerPush = vi.hoisted(() => vi.fn())

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: routerPush }),
}))

vi.mock('@/services/catalog/catalogService', () => ({
  fetchSpecies: vi.fn(),
  fetchProvinces: vi.fn(),
}))

vi.mock('@/services/catalog/collaboratorTreesService', () => ({
  fetchCollaboratorTreeDetail: vi.fn(),
  updateCollaboratorTree: vi.fn(),
  deleteCollaboratorTree: vi.fn(),
}))

vi.mock('@/services/media/treeGalleryService', () => ({
  fetchTreePhotoGallery: vi.fn(),
  deleteTreePhoto: vi.fn(),
}))

vi.mock('@/services/media/treePhotoUploadSequence', () => ({
  ObjectStorageUploadError: class ObjectStorageUploadError extends Error {
    readonly status: number
    constructor(status: number, message: string) {
      super(message)
      this.name = 'ObjectStorageUploadError'
      this.status = status
    }
  },
  uploadPhotosForTree: vi.fn(),
}))

import { fetchProvinces, fetchSpecies } from '@/services/catalog/catalogService'
import {
  deleteCollaboratorTree,
  fetchCollaboratorTreeDetail,
  updateCollaboratorTree,
} from '@/services/catalog/collaboratorTreesService'
import { fetchTreePhotoGallery } from '@/services/media/treeGalleryService'

const detailFixture = {
  treeId: 42,
  speciesId: 1,
  speciesLabel: 'Roble (Quercus robur)',
  provinceId: 2,
  provinceLabel: 'Madrid',
  municipality: 'Centro',
  description: 'Descripción',
  latitude: 40.4,
  longitude: -3.7,
  altitude: 650,
  publicationState: 'BORRADOR' as const,
  publicMapVisibility: 'PRIVADO' as const,
  createdByUserId: 9,
  createdAt: '2024-01-01T00:00:00Z',
  modifiedAt: '2024-01-02T00:00:00Z',
}

function mountForm(treeId: number | null) {
  let api!: ReturnType<typeof useEditTreeForm>
  const idRef = computed(() => treeId)
  const app = createApp({
    setup() {
      api = useEditTreeForm(idRef)
      return () => null
    },
  })
  app.use(
    createI18n({
      legacy: false,
      locale: 'es',
      messages: { es },
    }),
  )
  app.mount(document.createElement('div'))
  return api
}

describe('useEditTreeForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    routerPush.mockReset()
    vi.mocked(fetchSpecies).mockResolvedValue([{ id: 1, label: 'Roble (Quercus robur)' }])
    vi.mocked(fetchProvinces).mockResolvedValue([{ id: 2, label: 'Madrid' }])
    vi.mocked(fetchCollaboratorTreeDetail).mockResolvedValue(detailFixture)
    vi.mocked(fetchTreePhotoGallery).mockResolvedValue([])
    vi.mocked(updateCollaboratorTree).mockResolvedValue(detailFixture)
    vi.mocked(deleteCollaboratorTree).mockResolvedValue(undefined)
  })

  it('initialize con id inválido expone loadError', async () => {
    const form = mountForm(null)
    const label = await form.initialize()
    await nextTick()

    expect(label).toBe('')
    expect(form.loadError.value).toBe(es.treeEdit.messages.invalidId)
  })

  it('initialize carga detalle y rellena el formulario', async () => {
    const form = mountForm(42)
    const label = await form.initialize()
    await nextTick()

    expect(label).toBe('Roble (Quercus robur)')
    expect(form.form.latitude).toBe('40.4')
    expect(form.form.longitude).toBe('-3.7')
    expect(form.loadError.value).toBe('')
  })

  it('submit válido actualiza y navega a mis-ejemplares', async () => {
    const form = mountForm(42)
    await form.initialize()
    await nextTick()

    const ok = await form.submit()
    await nextTick()

    expect(ok).toBe(true)
    expect(updateCollaboratorTree).toHaveBeenCalledWith(
      42,
      expect.objectContaining({ speciesId: 1, provinceId: 2 }),
      expect.any(AbortSignal),
    )
    expect(routerPush).toHaveBeenCalledWith({ name: 'mis-ejemplares' })
  })

  it('submit con validación fallida no llama al servicio', async () => {
    const form = mountForm(42)
    await form.initialize()
    form.form.latitude = ''
    await nextTick()

    const ok = await form.submit()
    await nextTick()

    expect(ok).toBe(false)
    expect(updateCollaboratorTree).not.toHaveBeenCalled()
  })

  it('removeTree borra y navega a mis-ejemplares', async () => {
    const form = mountForm(42)
    await form.initialize()
    await nextTick()

    const ok = await form.removeTree()
    await nextTick()

    expect(ok).toBe(true)
    expect(deleteCollaboratorTree).toHaveBeenCalledWith(42, expect.any(AbortSignal))
    expect(routerPush).toHaveBeenCalledWith({ name: 'mis-ejemplares' })
  })

  it('submit con HttpError expone mensaje mapeado', async () => {
    vi.mocked(updateCollaboratorTree).mockRejectedValue(
      new HttpError(403, {
        title: 'Forbidden',
        status: 403,
        detail: 'No tiene permiso para modificar esta ficha.',
      }),
    )
    const form = mountForm(42)
    await form.initialize()
    await nextTick()

    const ok = await form.submit()
    await nextTick()

    expect(ok).toBe(false)
    expect(form.submitError.value).toBe('No tiene permiso para modificar esta ficha.')
  })
})
