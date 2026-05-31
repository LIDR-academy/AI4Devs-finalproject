import { computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import {
  treeEditRouteAfterCreate,
  type TreeCreateFlashValue,
} from '@/composables/treeCreateRedirect'
import { useApiErrorMapper } from '@/composables/useApiErrorMapper'
import { isAbortError, useAbortableRequest } from '@/composables/useAbortableRequest'
import {
  validateCreateTreeForm,
  type CreateTreeField,
  type CreateTreeFormModel,
  type CreateTreeValidationCode,
} from '@/composables/createTreeFormValidation'
import { createTree, fetchProvinces, fetchSpecies } from '@/services/catalog/catalogService'
import { uploadPhotosForTreeAfterCreate } from '@/services/media/treePhotoUploadSequence'
import type {
  MasterListItem,
  PublicationState,
  PublicMapVisibility,
} from '@/types/catalog'

interface SelectOption<TValue extends string> {
  value: TValue
  label: string
}

type FieldErrors = Partial<Record<CreateTreeField, string>>

export function useCreateTreeForm() {
  const { t } = useI18n()
  const router = useRouter()
  const { toMessage } = useApiErrorMapper()
  const species = ref<MasterListItem[]>([])
  const provinces = ref<MasterListItem[]>([])
  const isLoadingMasters = ref(false)
  const mastersError = ref('')

  const isSubmitting = ref(false)
  const submitError = ref('')
  const selectedPhotoFiles = ref<File[]>([])
  const fieldErrors = ref<FieldErrors>({})
  const { runWithAbort } = useAbortableRequest()
  const publicationStateOptions = computed<SelectOption<PublicationState>[]>(() => [
    { value: 'BORRADOR', label: t('treeForm.fields.publicationState.options.BORRADOR') },
    { value: 'PUBLICADO', label: t('treeForm.fields.publicationState.options.PUBLICADO') },
  ])
  const mapVisibilityOptions = computed<SelectOption<PublicMapVisibility>[]>(() => [
    { value: 'PRIVADO', label: t('treeForm.fields.publicMapVisibility.options.PRIVADO') },
    { value: 'PUBLICO', label: t('treeForm.fields.publicMapVisibility.options.PUBLICO') },
  ])

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

  const hasMasters = computed(() => species.value.length > 0 && provinces.value.length > 0)

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

  async function loadMasters(): Promise<void> {
    isLoadingMasters.value = true
    mastersError.value = ''
    try {
      const [speciesResult, provincesResult] = await runWithAbort((signal) =>
        Promise.all([fetchSpecies(signal), fetchProvinces(signal)]),
      )
      species.value = speciesResult
      provinces.value = provincesResult
      if (!species.value.length || !provinces.value.length) {
        mastersError.value = t('treeForm.messages.mastersEmpty')
      }
    } catch (error: unknown) {
      if (isAbortError(error)) {
        return
      }
      mastersError.value = toMessage(error)
    } finally {
      isLoadingMasters.value = false
    }
  }

  async function submit(): Promise<void> {
    submitError.value = ''
    fieldErrors.value = {}

    if (!validateForm()) {
      return
    }

    isSubmitting.value = true

    try {
      const municipalityTrimmed = form.municipality.trim()
      const altitudeTrimmed = form.altitude.trim()
      const altitudeParsed = altitudeTrimmed === '' ? Number.NaN : Number(altitudeTrimmed)

      const response = await createTree({
        speciesId: Number(form.speciesId),
        provinceId: Number(form.provinceId),
        municipality: municipalityTrimmed === '' ? undefined : municipalityTrimmed,
        description: form.description.trim() || undefined,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        altitude: Number.isFinite(altitudeParsed) ? Math.trunc(altitudeParsed) : undefined,
        publicationState: form.publicationState,
        publicMapVisibility: form.publicMapVisibility,
      })
      const treeId = response.treeId
      const files = selectedPhotoFiles.value
      let flash: TreeCreateFlashValue = 'ok'
      if (files.length > 0) {
        try {
          await uploadPhotosForTreeAfterCreate(treeId, files)
          flash = 'okPhotos'
          selectedPhotoFiles.value = []
        } catch {
          flash = 'photosWarning'
        }
      }
      await router.push(treeEditRouteAfterCreate(treeId, flash))
    } catch (error: unknown) {
      submitError.value = toMessage(error)
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    form,
    species,
    provinces,
    publicationStateOptions,
    mapVisibilityOptions,
    isLoadingMasters,
    mastersError,
    hasMasters,
    isSubmitting,
    fieldErrors,
    submitError,
    selectedPhotoFiles,
    loadMasters,
    submit,
  }
}
