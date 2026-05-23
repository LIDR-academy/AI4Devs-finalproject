import { computed, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  createAdminFamily,
  createAdminGenus,
  createAdminSpecies,
  deleteAdminSpecies,
  fetchAdminFamilies,
  fetchAdminGenera,
  fetchAdminSpeciesDetail,
  fetchAdminSpeciesList,
  updateAdminSpecies,
  type TaxonomyGenusListItem,
  type TaxonomyMasterListItem,
  type TaxonomyMasterPage,
} from '@/services/catalog/adminTaxonomy'
import { HttpError, NetworkError } from '@/services/http/apiClient'
import {
  taxonomyValidationMessageKey,
  validateFamilyForm,
  validateGenusForm,
  validateSpeciesForm,
} from '@/composables/adminTaxonomyValidation'

const SPECIES_PAGE_SIZE = 20

export function mapAdminTaxonomyError(error: unknown, t: (key: string, params?: Record<string, unknown>) => string): string {
  if (error instanceof NetworkError) {
    return t('adminMasters.messages.network')
  }
  if (error instanceof HttpError) {
    if (error.status === 400) {
      return error.problem?.detail ?? t('adminMasters.messages.badRequest')
    }
    if (error.status === 401) {
      return t('adminMasters.messages.unauthorized')
    }
    if (error.status === 403) {
      return t('adminMasters.messages.forbidden')
    }
    if (error.status === 404) {
      return t('adminMasters.messages.notFound')
    }
    if (error.status === 409) {
      return t('adminMasters.messages.conflictDelete')
    }
    if (error.status === 502 || error.status === 503) {
      return t('adminMasters.messages.badGateway')
    }
    return t('adminMasters.messages.serviceError', { status: error.status })
  }
  return t('adminMasters.messages.unexpectedError')
}

export function useAdminTaxonomyMasters() {
  const { t } = useI18n()

  const isLoading = ref(false)
  const errorMessage = ref('')
  const statusMessage = ref('')

  const speciesList = ref<TaxonomyMasterListItem[]>([])
  const generaList = ref<TaxonomyGenusListItem[]>([])
  const familiesList = ref<TaxonomyMasterListItem[]>([])

  const speciesPage = ref(0)
  const speciesTotalElements = ref(0)
  const speciesTotalPages = ref(0)
  const speciesFirst = ref(true)
  const speciesLast = ref(true)
  const isSpeciesListLoading = ref(false)

  const hasSpeciesPrevious = computed(() => !speciesFirst.value)
  const hasSpeciesNext = computed(() => !speciesLast.value)
  const hasSpeciesRows = computed(() => speciesList.value.length > 0)

  const editingSpeciesId = ref<number | null>(null)
  const formGenusId = ref<number | ''>('')
  const formScientificName = ref('')
  const formCommonName = ref('')

  const showSpeciesModal = ref(false)
  const showGenusModal = ref(false)
  const showFamilyModal = ref(false)
  const speciesFormError = ref('')
  const genusFormError = ref('')
  const familyFormError = ref('')
  const genusModalFamilyId = ref<number | ''>('')
  const genusModalScientific = ref('')
  const genusModalCommon = ref('')
  const familyModalScientific = ref('')
  const familyModalCommon = ref('')

  const confirmDeleteOpen = ref(false)
  const deleteTarget = ref<TaxonomyMasterListItem | null>(null)
  const isSavingSpecies = ref(false)
  const isSavingGenus = ref(false)
  const isSavingFamily = ref(false)
  const isDeleting = ref(false)
  const editingSpeciesIdLoading = ref<number | null>(null)

  let requestAbort: AbortController | null = null

  function nextSignal(): AbortSignal {
    requestAbort?.abort()
    requestAbort = new AbortController()
    return requestAbort.signal
  }

  function mapError(error: unknown): string {
    return mapAdminTaxonomyError(error, t)
  }

  function applySpeciesPageResponse(res: TaxonomyMasterPage<TaxonomyMasterListItem>): void {
    speciesList.value = res.content
    speciesTotalElements.value = Number(res.totalElements)
    speciesTotalPages.value = Math.max(0, res.totalPages)
    speciesFirst.value = res.first
    speciesLast.value = res.last
  }

  function resetSpeciesPageState(): void {
    speciesList.value = []
    speciesTotalElements.value = 0
    speciesTotalPages.value = 0
    speciesFirst.value = true
    speciesLast.value = true
  }

  async function loadSpeciesList(): Promise<void> {
    const signal = nextSignal()
    isSpeciesListLoading.value = true
    errorMessage.value = ''
    try {
      const res = await fetchAdminSpeciesList({
        page: speciesPage.value,
        size: SPECIES_PAGE_SIZE,
        unpaged: false,
        signal,
      })
      applySpeciesPageResponse(res)
    } catch (e) {
      resetSpeciesPageState()
      errorMessage.value = mapError(e)
    } finally {
      isSpeciesListLoading.value = false
    }
  }

  async function goPreviousSpeciesPage(): Promise<void> {
    if (!hasSpeciesPrevious.value || isSpeciesListLoading.value) {
      return
    }
    speciesPage.value -= 1
    await loadSpeciesList()
  }

  async function goNextSpeciesPage(): Promise<void> {
    if (!hasSpeciesNext.value || isSpeciesListLoading.value) {
      return
    }
    speciesPage.value += 1
    await loadSpeciesList()
  }

  async function reloadDropdowns(signal?: AbortSignal): Promise<void> {
    const sig = signal ?? nextSignal()
    const [generaPage, familiesPage] = await Promise.all([
      fetchAdminGenera(undefined, true, sig),
      fetchAdminFamilies(true, sig),
    ])
    generaList.value = generaPage.content
    familiesList.value = familiesPage.content
  }

  function closeSpeciesModal(): void {
    showSpeciesModal.value = false
    speciesFormError.value = ''
    resetForm()
  }

  function openCreateSpecies(): void {
    resetForm()
    speciesFormError.value = ''
    statusMessage.value = ''
    showSpeciesModal.value = true
  }

  async function reloadAll(): Promise<void> {
    const signal = nextSignal()
    isLoading.value = true
    errorMessage.value = ''
    try {
      const [generaPage, familiesPage, speciesPageRes] = await Promise.all([
        fetchAdminGenera(undefined, true, signal),
        fetchAdminFamilies(true, signal),
        fetchAdminSpeciesList({
          page: speciesPage.value,
          size: SPECIES_PAGE_SIZE,
          unpaged: false,
          signal,
        }),
      ])
      generaList.value = generaPage.content
      familiesList.value = familiesPage.content
      applySpeciesPageResponse(speciesPageRes)
    } catch (e) {
      resetSpeciesPageState()
      generaList.value = []
      familiesList.value = []
      errorMessage.value = mapError(e)
    } finally {
      isLoading.value = false
    }
  }

  function resetForm(): void {
    editingSpeciesId.value = null
    formGenusId.value = ''
    formScientificName.value = ''
    formCommonName.value = ''
  }

  async function startEdit(item: TaxonomyMasterListItem): Promise<void> {
    if (editingSpeciesIdLoading.value != null) {
      return
    }
    errorMessage.value = ''
    statusMessage.value = ''
    editingSpeciesIdLoading.value = item.id
    const signal = nextSignal()
    try {
      const detail = await fetchAdminSpeciesDetail(item.id, signal)
      editingSpeciesId.value = detail.speciesId
      formGenusId.value = detail.genusId
      formScientificName.value = detail.scientificName
      formCommonName.value = detail.commonName ?? ''
      speciesFormError.value = ''
      showSpeciesModal.value = true
    } catch (e) {
      errorMessage.value = mapError(e)
    } finally {
      editingSpeciesIdLoading.value = null
    }
  }

  async function submitSpecies(): Promise<void> {
    const validationIssue = validateSpeciesForm(formGenusId.value, formScientificName.value)
    if (validationIssue) {
      speciesFormError.value = t(taxonomyValidationMessageKey(validationIssue))
      return
    }
    isSavingSpecies.value = true
    speciesFormError.value = ''
    statusMessage.value = ''
    const signal = nextSignal()
    const body = {
      genusId: Number(formGenusId.value),
      scientificName: formScientificName.value.trim(),
      commonName: formCommonName.value.trim() || undefined,
    }
    try {
      if (editingSpeciesId.value != null) {
        await updateAdminSpecies(editingSpeciesId.value, body, signal)
        statusMessage.value = t('adminMasters.messages.updated')
      } else {
        await createAdminSpecies(body, signal)
        statusMessage.value = t('adminMasters.messages.created')
      }
      closeSpeciesModal()
      await loadSpeciesList()
    } catch (e) {
      speciesFormError.value = mapError(e)
    } finally {
      isSavingSpecies.value = false
    }
  }

  function askDelete(item: TaxonomyMasterListItem): void {
    deleteTarget.value = item
    confirmDeleteOpen.value = true
  }

  async function confirmDelete(): Promise<void> {
    const item = deleteTarget.value
    if (!item) {
      return
    }
    confirmDeleteOpen.value = false
    isDeleting.value = true
    errorMessage.value = ''
    const signal = nextSignal()
    try {
      await deleteAdminSpecies(item.id, signal)
      statusMessage.value = t('adminMasters.messages.deleted')
      if (editingSpeciesId.value === item.id) {
        closeSpeciesModal()
      }
      if (speciesList.value.length === 1 && speciesPage.value > 0) {
        speciesPage.value -= 1
      }
      await loadSpeciesList()
    } catch (e) {
      errorMessage.value = mapError(e)
    } finally {
      isDeleting.value = false
      deleteTarget.value = null
    }
  }

  function openGenusModal(): void {
    genusModalFamilyId.value = ''
    genusModalScientific.value = ''
    genusModalCommon.value = ''
    genusFormError.value = ''
    showGenusModal.value = true
  }

  function closeGenusModal(): void {
    showGenusModal.value = false
    genusFormError.value = ''
  }

  async function submitGenusModal(): Promise<void> {
    const validationIssue = validateGenusForm(genusModalFamilyId.value, genusModalScientific.value)
    if (validationIssue) {
      genusFormError.value = t(taxonomyValidationMessageKey(validationIssue))
      return
    }
    isSavingGenus.value = true
    genusFormError.value = ''
    const signal = nextSignal()
    try {
      const created = await createAdminGenus(
        {
          familyId: Number(genusModalFamilyId.value),
          scientificName: genusModalScientific.value.trim(),
          commonName: genusModalCommon.value.trim() || undefined,
        },
        signal,
      )
      showGenusModal.value = false
      await reloadDropdowns(signal)
      formGenusId.value = created.genusId
      statusMessage.value = t('adminMasters.messages.genusCreated')
    } catch (e) {
      genusFormError.value = mapError(e)
    } finally {
      isSavingGenus.value = false
    }
  }

  function openFamilyModal(): void {
    familyModalScientific.value = ''
    familyModalCommon.value = ''
    familyFormError.value = ''
    showFamilyModal.value = true
  }

  function closeFamilyModal(): void {
    showFamilyModal.value = false
    familyFormError.value = ''
  }

  async function submitFamilyModal(): Promise<void> {
    const validationIssue = validateFamilyForm(familyModalScientific.value)
    if (validationIssue) {
      familyFormError.value = t(taxonomyValidationMessageKey(validationIssue))
      return
    }
    isSavingFamily.value = true
    familyFormError.value = ''
    const signal = nextSignal()
    try {
      const created = await createAdminFamily(
        {
          scientificName: familyModalScientific.value.trim(),
          commonName: familyModalCommon.value.trim() || undefined,
        },
        signal,
      )
      showFamilyModal.value = false
      await reloadDropdowns(signal)
      genusModalFamilyId.value = created.familyId
      statusMessage.value = t('adminMasters.messages.familyCreated')
    } catch (e) {
      familyFormError.value = mapError(e)
    } finally {
      isSavingFamily.value = false
    }
  }

  onUnmounted(() => {
    requestAbort?.abort()
  })

  return {
    isLoading,
    isSpeciesListLoading,
    errorMessage,
    statusMessage,
    speciesList,
    generaList,
    familiesList,
    speciesPage,
    speciesTotalElements,
    speciesTotalPages,
    hasSpeciesPrevious,
    hasSpeciesNext,
    hasSpeciesRows,
    editingSpeciesId,
    editingSpeciesIdLoading,
    formGenusId,
    formScientificName,
    formCommonName,
    showSpeciesModal,
    showGenusModal,
    showFamilyModal,
    speciesFormError,
    genusFormError,
    familyFormError,
    genusModalFamilyId,
    genusModalScientific,
    genusModalCommon,
    familyModalScientific,
    familyModalCommon,
    confirmDeleteOpen,
    deleteTarget,
    isSavingSpecies,
    isSavingGenus,
    isSavingFamily,
    isDeleting,
    reloadAll,
    loadSpeciesList,
    goPreviousSpeciesPage,
    goNextSpeciesPage,
    resetForm,
    openCreateSpecies,
    closeSpeciesModal,
    startEdit,
    submitSpecies,
    askDelete,
    confirmDelete,
    openGenusModal,
    closeGenusModal,
    submitGenusModal,
    openFamilyModal,
    closeFamilyModal,
    submitFamilyModal,
  }
}
