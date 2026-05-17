import { computed, reactive, ref, type ComputedRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAbortableRequest } from '@/composables/useAbortableRequest'
import {
  validateCreateTreeForm,
  type CreateTreeField,
  type CreateTreeFormModel,
  type CreateTreeValidationCode,
} from '@/composables/createTreeFormValidation'
import { useCollaboratorCatalogErrorMapper } from '@/composables/useCollaboratorCatalogErrorMapper'
import {
  deleteCollaboratorTree,
  fetchCollaboratorTreeDetail,
  updateCollaboratorTree,
} from '@/services/catalog/collaboratorTreesService'
import { fetchProvinces, fetchSpecies } from '@/services/catalog/catalogService'
import {
  TREE_PHOTO_MAX_PER_TREE,
  treePhotoValidationMessage,
  validateTreePhotoFile,
} from '@/composables/treePhotoFileValidation'
import { deleteTreePhoto, fetchTreePhotoGallery } from '@/services/media/treeGalleryService'
import {
  ObjectStorageUploadError,
  uploadPhotosForTree,
} from '@/services/media/treePhotoUploadSequence'
import type {
  CreateTreeRequest,
  MasterListItem,
  PublicationState,
  PublicMapVisibility,
} from '@/types/catalog'
import type { TreePhotoGalleryItem } from '@/types/media'

interface SelectOption<TValue extends string> {
  value: TValue
  label: string
}

type FieldErrors = Partial<Record<CreateTreeField, string>>

function filterText(value: unknown): string {
  return value == null ? '' : String(value).trim()
}

function parseRequiredInt(value: unknown): number | undefined {
  const parsed = Number.parseInt(filterText(value), 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined
}

function buildPayload(form: CreateTreeFormModel): CreateTreeRequest | null {
  const speciesId = parseRequiredInt(form.speciesId)
  const provinceId = parseRequiredInt(form.provinceId)
  const latitude = Number(filterText(form.latitude))
  const longitude = Number(filterText(form.longitude))
  const municipalityTrimmed = filterText(form.municipality)
  const altitudeTrimmed = filterText(form.altitude)
  const altitudeParsed = altitudeTrimmed === '' ? Number.NaN : Number(altitudeTrimmed)

  if (speciesId === undefined || provinceId === undefined) {
    return null
  }

  return {
    speciesId,
    provinceId,
    municipality: municipalityTrimmed === '' ? undefined : municipalityTrimmed,
    description: filterText(form.description) || undefined,
    latitude,
    longitude,
    altitude: Number.isFinite(altitudeParsed) ? Math.trunc(altitudeParsed) : undefined,
    publicationState: form.publicationState,
    publicMapVisibility: form.publicMapVisibility,
  }
}

export function useEditTreeForm(treeId: ComputedRef<number | null>) {
  const { t } = useI18n()
  const router = useRouter()
  const { toMessage } = useCollaboratorCatalogErrorMapper()
  const { runWithAbort, isAbortError: isRequestAbortError } = useAbortableRequest()

  const species = ref<MasterListItem[]>([])
  const provinces = ref<MasterListItem[]>([])
  const galleryPhotos = ref<TreePhotoGalleryItem[]>([])
  const isLoading = ref(false)
  const loadError = ref('')
  const isSubmitting = ref(false)
  const isDeleting = ref(false)
  const isDeletingPhoto = ref(false)
  const isUploadingPhoto = ref(false)
  const submitError = ref('')
  const deleteError = ref('')
  const galleryPhotoError = ref('')

  const fieldErrors = ref<FieldErrors>({})

  const form = reactive<CreateTreeFormModel>({
    speciesId: '',
    provinceId: '',
    municipality: '',
    description: '',
    latitude: '',
    longitude: '',
    altitude: '',
    publicationState: 'BORRADOR',
    publicMapVisibility: 'PRIVADO',
  })

  const publicationStateOptions = computed<SelectOption<PublicationState>[]>(() => [
    { value: 'BORRADOR', label: t('treeForm.fields.publicationState.options.BORRADOR') },
    { value: 'PUBLICADO', label: t('treeForm.fields.publicationState.options.PUBLICADO') },
  ])

  const mapVisibilityOptions = computed<SelectOption<PublicMapVisibility>[]>(() => [
    { value: 'PRIVADO', label: t('treeForm.fields.publicMapVisibility.options.PRIVADO') },
    { value: 'PUBLICO', label: t('treeForm.fields.publicMapVisibility.options.PUBLICO') },
  ])

  const hasMasters = computed(() => species.value.length > 0 && provinces.value.length > 0)
  const isReady = computed(() => !isLoading.value && !loadError.value && hasMasters.value)
  const canAddGalleryPhoto = computed(
    () =>
      galleryPhotos.value.length < TREE_PHOTO_MAX_PER_TREE &&
      !isUploadingPhoto.value &&
      !isDeletingPhoto.value,
  )

  function photoValidationMessages() {
    return {
      maxPhotos: (max: number) => t('treeForm.photos.validation.maxPhotos', { max }),
      invalidMime: (allowed: string) =>
        t('treeForm.photos.validation.invalidMime', { allowed }),
      maxFileSize: (maxMb: number) => t('treeForm.photos.validation.maxFileSize', { maxMb }),
    }
  }

  function validationCodeToMessage(code: CreateTreeValidationCode): string {
    return t(`treeForm.validation.${code}`)
  }

  function validateForm(): boolean {
    const validationResult = validateCreateTreeForm(form)
    const errors: FieldErrors = {}

    for (const [field, code] of Object.entries(validationResult)) {
      if (!code) {
        continue
      }
      errors[field as CreateTreeField] = validationCodeToMessage(code)
    }

    fieldErrors.value = errors
    return Object.keys(validationResult).length === 0
  }

  function applyDetailToForm(detail: Awaited<ReturnType<typeof fetchCollaboratorTreeDetail>>): void {
    form.speciesId = String(detail.speciesId)
    form.provinceId = String(detail.provinceId)
    form.municipality = detail.municipality ?? ''
    form.description = detail.description ?? ''
    form.latitude = String(detail.latitude)
    form.longitude = String(detail.longitude)
    form.altitude = detail.altitude != null ? String(detail.altitude) : ''
    form.publicationState = detail.publicationState
    form.publicMapVisibility = detail.publicMapVisibility
  }

  function resolveSpeciesLabel(speciesId: number, fallback?: string): string {
    const fromMasters = species.value.find((item) => item.id === speciesId)
    return fromMasters?.label ?? fallback ?? ''
  }

  async function loadMasters(): Promise<void> {
    const [speciesResult, provincesResult] = await runWithAbort((signal) =>
      Promise.all([fetchSpecies(signal), fetchProvinces(signal)]),
    )
    species.value = speciesResult
    provinces.value = provincesResult
    if (!species.value.length || !provinces.value.length) {
      throw new Error('MASTERS_EMPTY')
    }
  }

  async function loadTree(): Promise<string> {
    const id = treeId.value
    if (!id) {
      loadError.value = t('treeEdit.messages.invalidId')
      return ''
    }

    const [detail, photos] = await runWithAbort((signal) =>
      Promise.all([fetchCollaboratorTreeDetail(id, signal), fetchTreePhotoGallery(id, signal)]),
    )
    applyDetailToForm(detail)
    galleryPhotos.value = photos
    return resolveSpeciesLabel(detail.speciesId, detail.speciesLabel)
  }

  async function initialize(): Promise<string> {
    const id = treeId.value
    if (!id) {
      loadError.value = t('treeEdit.messages.invalidId')
      return ''
    }

    isLoading.value = true
    loadError.value = ''
    galleryPhotos.value = []

    try {
      await loadMasters()
      const speciesLabel = await loadTree()
      return speciesLabel
    } catch (error: unknown) {
      if (isRequestAbortError(error)) {
        return ''
      }
      if (error instanceof Error && error.message === 'MASTERS_EMPTY') {
        loadError.value = t('treeForm.messages.mastersEmpty')
      } else {
        loadError.value = toMessage(error)
      }
      return ''
    } finally {
      isLoading.value = false
    }
  }

  async function submit(): Promise<boolean> {
    const id = treeId.value
    if (!id) {
      submitError.value = t('treeEdit.messages.invalidId')
      return false
    }

    submitError.value = ''
    fieldErrors.value = {}

    if (!validateForm()) {
      return false
    }

    const payload = buildPayload(form)
    if (!payload) {
      fieldErrors.value = { speciesId: validationCodeToMessage('speciesRequired') }
      return false
    }

    isSubmitting.value = true
    try {
      await runWithAbort((signal) => updateCollaboratorTree(id, payload, signal))
      await router.push({ name: 'my-trees' })
      return true
    } catch (error: unknown) {
      if (isRequestAbortError(error)) {
        return false
      }
      submitError.value = toMessage(error)
      return false
    } finally {
      isSubmitting.value = false
    }
  }

  async function addGalleryPhoto(file: File): Promise<boolean> {
    const id = treeId.value
    if (!id) {
      galleryPhotoError.value = t('treeEdit.messages.invalidId')
      return false
    }

    const validationCode = validateTreePhotoFile(
      file,
      galleryPhotos.value.length,
      photoValidationMessages(),
    )
    if (validationCode) {
      galleryPhotoError.value = treePhotoValidationMessage(validationCode, photoValidationMessages())
      return false
    }

    galleryPhotoError.value = ''
    isUploadingPhoto.value = true
    try {
      await runWithAbort(async (signal) => {
        await uploadPhotosForTree(id, [file], {
          startOrden: galleryPhotos.value.length,
          signal,
        })
        galleryPhotos.value = await fetchTreePhotoGallery(id, signal)
      })
      return true
    } catch (error: unknown) {
      if (isRequestAbortError(error)) {
        return false
      }
      if (error instanceof ObjectStorageUploadError) {
        galleryPhotoError.value = t('treeForm.messages.photoStorageUploadFailed', {
          status: error.status,
        })
      } else {
        galleryPhotoError.value = toMessage(error)
      }
      return false
    } finally {
      isUploadingPhoto.value = false
    }
  }

  async function removeGalleryPhoto(photoId: number): Promise<boolean> {
    const id = treeId.value
    if (!id) {
      galleryPhotoError.value = t('treeEdit.messages.invalidId')
      return false
    }

    galleryPhotoError.value = ''
    isDeletingPhoto.value = true
    try {
      await runWithAbort(async (signal) => {
        await deleteTreePhoto(photoId, signal)
        galleryPhotos.value = await fetchTreePhotoGallery(id, signal)
      })
      return true
    } catch (error: unknown) {
      if (isRequestAbortError(error)) {
        return false
      }
      galleryPhotoError.value = toMessage(error)
      return false
    } finally {
      isDeletingPhoto.value = false
    }
  }

  async function removeTree(): Promise<boolean> {
    const id = treeId.value
    if (!id) {
      deleteError.value = t('treeEdit.messages.invalidId')
      return false
    }

    deleteError.value = ''
    isDeleting.value = true
    try {
      await runWithAbort((signal) => deleteCollaboratorTree(id, signal))
      await router.push({ name: 'my-trees' })
      return true
    } catch (error: unknown) {
      if (isRequestAbortError(error)) {
        return false
      }
      deleteError.value = toMessage(error)
      return false
    } finally {
      isDeleting.value = false
    }
  }

  return {
    form,
    species,
    provinces,
    galleryPhotos,
    publicationStateOptions,
    mapVisibilityOptions,
    isLoading,
    loadError,
    hasMasters,
    isReady,
    isSubmitting,
    isDeleting,
    isDeletingPhoto,
    isUploadingPhoto,
    canAddGalleryPhoto,
    fieldErrors,
    submitError,
    deleteError,
    galleryPhotoError,
    initialize,
    submit,
    addGalleryPhoto,
    removeGalleryPhoto,
    removeTree,
  }
}
