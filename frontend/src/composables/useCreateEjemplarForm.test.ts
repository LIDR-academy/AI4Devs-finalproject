import { createApp, nextTick } from 'vue'
import { createI18n } from 'vue-i18n'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HttpError } from '@/services/http/apiClient'
import { es } from '@/i18n/locales/es'
import { useCreateEjemplarForm } from '@/composables/useCreateEjemplarForm'

vi.mock('@/services/catalog/catalogService', () => ({
  fetchSpecies: vi.fn(),
  fetchProvinces: vi.fn(),
  createEjemplar: vi.fn(),
}))

vi.mock('@/services/media/ejemplarPhotoUploadSequence', () => ({
  ObjectStorageUploadError: class ObjectStorageUploadError extends Error {
    readonly status: number
    constructor(status: number, message: string) {
      super(message)
      this.name = 'ObjectStorageUploadError'
      this.status = status
    }
  },
  uploadPhotosForEjemplarAfterCreate: vi.fn(),
}))

import { createEjemplar, fetchProvinces, fetchSpecies } from '@/services/catalog/catalogService'
import {
  ObjectStorageUploadError,
  uploadPhotosForEjemplarAfterCreate,
} from '@/services/media/ejemplarPhotoUploadSequence'

function mountForm() {
  let api!: ReturnType<typeof useCreateEjemplarForm>
  const app = createApp({
    setup() {
      api = useCreateEjemplarForm()
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

function fillValidForm(form: ReturnType<typeof useCreateEjemplarForm>['form']): void {
  form.speciesId = '1'
  form.provinceId = '2'
  form.latitude = '40.4'
  form.longitude = '-3.7'
  form.description = 'Ejemplar de prueba'
}

describe('useCreateEjemplarForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(fetchSpecies).mockResolvedValue([{ id: 1, label: 'Roble (Quercus)' }])
    vi.mocked(fetchProvinces).mockResolvedValue([{ id: 2, label: 'Madrid' }])
    vi.mocked(createEjemplar).mockResolvedValue({ ejemplarId: 100 })
    vi.mocked(uploadPhotosForEjemplarAfterCreate).mockResolvedValue(undefined)
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

  it('submit sin campos obligatorios no llama a createEjemplar', async () => {
    const form = mountForm()
    await form.submit()
    await nextTick()

    expect(createEjemplar).not.toHaveBeenCalled()
    expect(Object.keys(form.fieldErrors.value).length).toBeGreaterThan(0)
  })

  it('submit válido crea ejemplar y muestra éxito', async () => {
    const form = mountForm()
    fillValidForm(form.form)

    await form.submit()
    await nextTick()

    expect(createEjemplar).toHaveBeenCalledWith(
      expect.objectContaining({
        speciesId: 1,
        provinceId: 2,
        latitude: 40.4,
        longitude: -3.7,
      }),
    )
    expect(form.submitSuccess.value).toContain('100')
  })

  it('submit con fotos sube archivos tras crear', async () => {
    const form = mountForm()
    fillValidForm(form.form)
    const file = new File(['x'], 'foto.jpg', { type: 'image/jpeg' })
    form.selectedPhotoFiles.value = [file]

    await form.submit()
    await nextTick()

    expect(uploadPhotosForEjemplarAfterCreate).toHaveBeenCalledWith(100, [file])
    expect(form.submitSuccess.value).toContain('100')
    expect(form.submitSuccess.value).toContain('fotografías')
  })

  it('fallo de almacenamiento de fotos deja éxito parcial y error de fotos', async () => {
    vi.mocked(uploadPhotosForEjemplarAfterCreate).mockRejectedValue(
      new ObjectStorageUploadError(502, 'STORAGE_UPLOAD_HTTP_502'),
    )
    const form = mountForm()
    fillValidForm(form.form)
    form.selectedPhotoFiles.value = [new File(['x'], 'foto.jpg', { type: 'image/jpeg' })]

    await form.submit()
    await nextTick()

    expect(form.submitSuccess.value).toContain('100')
    expect(form.photosUploadError.value).toContain('502')
  })

  it('error HttpError en submit muestra mensaje mapeado', async () => {
    vi.mocked(createEjemplar).mockRejectedValue(
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
  })
})
