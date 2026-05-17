import { beforeEach, describe, expect, it, vi } from 'vitest'
import { computed } from 'vue'
import { useEditTreeForm } from '@/composables/useEditTreeForm'

const fetchSpeciesMock = vi.hoisted(() => vi.fn())
const fetchProvincesMock = vi.hoisted(() => vi.fn())
const fetchCollaboratorTreeDetailMock = vi.hoisted(() => vi.fn())
const fetchTreePhotoGalleryMock = vi.hoisted(() => vi.fn())
const deleteTreePhotoMock = vi.hoisted(() => vi.fn())
const uploadPhotosForTreeMock = vi.hoisted(() => vi.fn())
const updateCollaboratorTreeMock = vi.hoisted(() => vi.fn())
const deleteCollaboratorTreeMock = vi.hoisted(() => vi.fn())
const pushMock = vi.hoisted(() => vi.fn())

vi.mock('@/services/catalog/catalogService', () => ({
  fetchSpecies: fetchSpeciesMock,
  fetchProvinces: fetchProvincesMock,
}))

vi.mock('@/services/catalog/collaboratorTreesService', () => ({
  fetchCollaboratorTreeDetail: fetchCollaboratorTreeDetailMock,
  updateCollaboratorTree: updateCollaboratorTreeMock,
  deleteCollaboratorTree: deleteCollaboratorTreeMock,
}))

vi.mock('@/services/media/treeGalleryService', () => ({
  fetchTreePhotoGallery: fetchTreePhotoGalleryMock,
  deleteTreePhoto: deleteTreePhotoMock,
}))

vi.mock('@/services/media/treePhotoUploadSequence', () => ({
  ObjectStorageUploadError: class ObjectStorageUploadError extends Error {
    readonly status: number
    constructor(status: number, message: string) {
      super(message)
      this.status = status
    }
  },
  uploadPhotosForTree: uploadPhotosForTreeMock,
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: pushMock }),
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('@/composables/useCollaboratorCatalogErrorMapper', () => ({
  useCollaboratorCatalogErrorMapper: () => ({
    toMessage: () => 'mapped-error',
  }),
}))

vi.mock('@/composables/useAbortableRequest', () => ({
  isAbortError: () => false,
  useAbortableRequest: () => ({
    runWithAbort: async <T>(runner: (signal: AbortSignal) => Promise<T>) =>
      runner(new AbortController().signal),
    isAbortError: () => false,
  }),
}))

const detailFixture = {
  treeId: 42,
  speciesId: 1,
  provinceId: 28,
  latitude: 40.4,
  longitude: -3.7,
  municipality: 'Madrid',
  description: 'Ejemplo',
  altitude: 650,
  publicationState: 'BORRADOR',
  publicMapVisibility: 'PRIVADO',
  createdByUserId: 7,
  speciesLabel: 'Encina (Quercus ilex)',
}

describe('useEditTreeForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fetchSpeciesMock.mockResolvedValue([{ id: 1, label: 'Encina (Quercus ilex)' }])
    fetchProvincesMock.mockResolvedValue([{ id: 28, label: 'Madrid (28)' }])
    fetchCollaboratorTreeDetailMock.mockResolvedValue(detailFixture)
    fetchTreePhotoGalleryMock.mockResolvedValue([])
    updateCollaboratorTreeMock.mockResolvedValue(detailFixture)
    deleteCollaboratorTreeMock.mockResolvedValue(undefined)
    deleteTreePhotoMock.mockResolvedValue(undefined)
    uploadPhotosForTreeMock.mockResolvedValue(undefined)
    pushMock.mockResolvedValue(undefined)
  })

  it('loads detail and gallery into the form', async () => {
    const treeId = computed(() => 42)
    const { form, galleryPhotos, initialize } = useEditTreeForm(treeId)

    const label = await initialize()

    expect(label).toBe('Encina (Quercus ilex)')
    expect(form.speciesId).toBe('1')
    expect(form.provinceId).toBe('28')
    expect(form.latitude).toBe('40.4')
    expect(form.longitude).toBe('-3.7')
    expect(form.municipality).toBe('Madrid')
    expect(galleryPhotos.value).toEqual([])
  })

  it('submits PUT and navigates to my-trees', async () => {
    const treeId = computed(() => 42)
    const { initialize, submit } = useEditTreeForm(treeId)
    await initialize()

    const ok = await submit()

    expect(ok).toBe(true)
    expect(updateCollaboratorTreeMock).toHaveBeenCalledWith(
      42,
      expect.objectContaining({
        speciesId: 1,
        provinceId: 28,
        latitude: 40.4,
        longitude: -3.7,
        publicationState: 'BORRADOR',
        publicMapVisibility: 'PRIVADO',
      }),
      expect.any(AbortSignal),
    )
    expect(pushMock).toHaveBeenCalledWith({ name: 'my-trees' })
  })

  it('does not submit when validation fails', async () => {
    const treeId = computed(() => 42)
    const { form: editForm, initialize, submit } = useEditTreeForm(treeId)
    await initialize()
    editForm.latitude = ''

    const ok = await submit()

    expect(ok).toBe(false)
    expect(updateCollaboratorTreeMock).not.toHaveBeenCalled()
  })

  it('addGalleryPhoto uploads with startOrden and reloads gallery', async () => {
    fetchTreePhotoGalleryMock
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          id: 3,
          url: 'http://x/3.jpg',
          esPrincipal: true,
          orden: 0,
          mimeType: 'image/jpeg',
          ancho: null,
          alto: null,
          categoria: 'PUBLIC',
        },
      ])

    const treeId = computed(() => 42)
    const { initialize, addGalleryPhoto, galleryPhotos } = useEditTreeForm(treeId)
    await initialize()
    expect(galleryPhotos.value).toHaveLength(0)

    const file = new File(['photo'], 'new.jpg', { type: 'image/jpeg' })
    const ok = await addGalleryPhoto(file)

    expect(ok).toBe(true)
    expect(uploadPhotosForTreeMock).toHaveBeenCalledWith(42, [file], {
      startOrden: 0,
      signal: expect.any(AbortSignal),
    })
    expect(galleryPhotos.value).toHaveLength(1)
    expect(galleryPhotos.value[0]?.id).toBe(3)
  })

  it('removeGalleryPhoto deletes photo and reloads gallery', async () => {
    fetchTreePhotoGalleryMock
      .mockResolvedValueOnce([
        { id: 1, url: 'http://x/1.jpg', esPrincipal: true, orden: 0, mimeType: 'image/jpeg', ancho: null, alto: null, categoria: 'PUBLIC' },
        { id: 2, url: 'http://x/2.jpg', esPrincipal: false, orden: 1, mimeType: 'image/jpeg', ancho: null, alto: null, categoria: 'PUBLIC' },
      ])
      .mockResolvedValueOnce([
        { id: 2, url: 'http://x/2.jpg', esPrincipal: true, orden: 0, mimeType: 'image/jpeg', ancho: null, alto: null, categoria: 'PUBLIC' },
      ])

    const treeId = computed(() => 42)
    const { initialize, removeGalleryPhoto, galleryPhotos } = useEditTreeForm(treeId)
    await initialize()
    expect(galleryPhotos.value).toHaveLength(2)

    const ok = await removeGalleryPhoto(1)

    expect(ok).toBe(true)
    expect(deleteTreePhotoMock).toHaveBeenCalledWith(1, expect.any(AbortSignal))
    expect(galleryPhotos.value).toHaveLength(1)
    expect(galleryPhotos.value[0]?.id).toBe(2)
    expect(galleryPhotos.value[0]?.esPrincipal).toBe(true)
  })

  it('deletes tree and navigates to my-trees', async () => {
    const treeId = computed(() => 42)
    const { initialize, removeTree } = useEditTreeForm(treeId)
    await initialize()

    const ok = await removeTree()

    expect(ok).toBe(true)
    expect(deleteCollaboratorTreeMock).toHaveBeenCalledWith(42, expect.any(AbortSignal))
    expect(pushMock).toHaveBeenCalledWith({ name: 'my-trees' })
  })
})
