import { createApp, nextTick } from 'vue'
import { createI18n } from 'vue-i18n'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HttpError } from '@/services/http/apiClient'
import { es } from '@/i18n/locales/es'
import { useCreateTreeForm } from '@/composables/useCreateTreeForm'

const routerPush = vi.hoisted(() => vi.fn())

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: routerPush }),
}))

vi.mock('@/services/catalog/catalogService', () => ({
  fetchSpecies: vi.fn(),
  fetchProvinces: vi.fn(),
  createTree: vi.fn(),
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
  uploadPhotosForTreeAfterCreate: vi.fn(),
}))

import { createTree, fetchProvinces, fetchSpecies } from '@/services/catalog/catalogService'
import {
  ObjectStorageUploadError,
  uploadPhotosForTreeAfterCreate,
} from '@/services/media/treePhotoUploadSequence'

function mountForm() {
  let api!: ReturnType<typeof useCreateTreeForm>
  const app = createApp({
    setup() {
      api = useCreateTreeForm()
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

function fillValidForm(form: ReturnType<typeof useCreateTreeForm>['form']): void {
  form.speciesId = '1'
  form.provinceId = '2'
  form.latitude = '40.4'
  form.longitude = '-3.7'
  form.description = 'Ejemplar de prueba'
}

describe('useCreateTreeForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(fetchSpecies).mockResolvedValue([{ id: 1, label: 'Roble (Quercus)' }])
    vi.mocked(fetchProvinces).mockResolvedValue([{ id: 2, label: 'Madrid' }])
    vi.mocked(createTree).mockResolvedValue({ treeId: 100 })
    vi.mocked(uploadPhotosForTreeAfterCreate).mockResolvedValue(undefined)
  })

  it('loadMasters rellena especies y provincias', async () => {
    const form = mountForm()
    await form.loadMasters()
    await nextTick()

    expect(form.species.value).toHaveLength(1)
    expect(form.provinces.value).toHaveLength(1)
    expect(form.mastersError.value).toBe('')
  })

  it('loadMasters con catálogo vacío muestra mensaje i18n', async () => {
    vi.mocked(fetchSpecies).mockResolvedValue([])
    vi.mocked(fetchProvinces).mockResolvedValue([])
    const form = mountForm()

    await form.loadMasters()
    await nextTick()

    expect(form.mastersError.value).toBe(es.treeForm.messages.mastersEmpty)
  })

  it('submit sin campos obligatorios no llama a createTree', async () => {
    const form = mountForm()
    await form.submit()
    await nextTick()

    expect(createTree).not.toHaveBeenCalled()
    expect(routerPush).not.toHaveBeenCalled()
    expect(Object.keys(form.fieldErrors.value).length).toBeGreaterThan(0)
  })

  it('submit válido redirige a edición con flash ok', async () => {
    const form = mountForm()
    fillValidForm(form.form)

    await form.submit()
    await nextTick()

    expect(createTree).toHaveBeenCalledWith(
      expect.objectContaining({
        speciesId: 1,
        provinceId: 2,
        latitude: 40.4,
        longitude: -3.7,
      }),
    )
    expect(routerPush).toHaveBeenCalledWith({
      name: 'ejemplares-edit',
      params: { id: '100' },
      query: { fromCreate: 'ok' },
    })
  })

  it('submit con fotos redirige con flash okPhotos', async () => {
    const form = mountForm()
    fillValidForm(form.form)
    const file = new File(['x'], 'foto.jpg', { type: 'image/jpeg' })
    form.selectedPhotoFiles.value = [file]

    await form.submit()
    await nextTick()

    expect(uploadPhotosForTreeAfterCreate).toHaveBeenCalledWith(100, [file])
    expect(routerPush).toHaveBeenCalledWith({
      name: 'ejemplares-edit',
      params: { id: '100' },
      query: { fromCreate: 'okPhotos' },
    })
    expect(form.selectedPhotoFiles.value).toHaveLength(0)
  })

  it('fallo de fotos redirige con flash photosWarning', async () => {
    vi.mocked(uploadPhotosForTreeAfterCreate).mockRejectedValue(
      new ObjectStorageUploadError(502, 'STORAGE_UPLOAD_HTTP_502'),
    )
    const form = mountForm()
    fillValidForm(form.form)
    form.selectedPhotoFiles.value = [new File(['x'], 'foto.jpg', { type: 'image/jpeg' })]

    await form.submit()
    await nextTick()

    expect(routerPush).toHaveBeenCalledWith({
      name: 'ejemplares-edit',
      params: { id: '100' },
      query: { fromCreate: 'photosWarning' },
    })
  })

  it('error HttpError en submit muestra mensaje mapeado', async () => {
    vi.mocked(createTree).mockRejectedValue(
      new HttpError(400, {
        title: 'Bad Request',
        status: 400,
        detail: 'Coordenadas inválidas',
      }),
    )
    const form = mountForm()
    fillValidForm(form.form)

    await form.submit()
    await nextTick()

    expect(form.submitError.value).toBe('Coordenadas inválidas')
    expect(routerPush).not.toHaveBeenCalled()
  })
})
