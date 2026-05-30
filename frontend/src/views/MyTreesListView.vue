<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import PageBackLink from '@/components/layout/PageBackLink.vue'
import { useAbortableRequest } from '@/composables/useAbortableRequest'
import { useAuth } from '@/composables/useAuth'
import { useCollaboratorCatalogErrorMapper } from '@/composables/useCollaboratorCatalogErrorMapper'
import { useTreeListPrimaryPhotos } from '@/composables/useTreeListPrimaryPhotos'
import SpeciesAutocompleteInput from '@/components/SpeciesAutocompleteInput.vue'
import { fetchSpecies } from '@/services/catalog/catalogService'
import { fetchCollaboratorTrees } from '@/services/catalog/collaboratorTreesService'
import type { CollaboratorTreeListItem, MasterListItem } from '@/types/catalog'

const { t } = useI18n()

function formatSpeciesTitle(tree: CollaboratorTreeListItem): string {
  const common = tree.commonName.trim()
  const scientific = tree.scientificName.trim()
  if (common.length > 0) {
    return `${common} (${scientific})`
  }
  return scientific
}

function publicationStateLabel(state: string): string {
  if (state === 'BORRADOR') {
    return t('treesList.filters.state.borrador')
  }
  if (state === 'PUBLICADO') {
    return t('treesList.filters.state.publicado')
  }
  return state
}

function mapVisibilityLabel(visibility: string): string {
  if (visibility === 'PRIVADO') {
    return t('treesList.filters.visibility.privado')
  }
  if (visibility === 'PUBLICO') {
    return t('treesList.filters.visibility.publico')
  }
  return visibility
}

function locationLine(tree: CollaboratorTreeListItem): string {
  const parts = [tree.municipality?.trim(), tree.province?.trim()].filter(Boolean)
  return parts.length > 0 ? parts.join(' · ') : t('common.emptyValue')
}

function filterText(value: unknown): string {
  return value == null ? '' : String(value).trim()
}

function parseOptionalInt(value: unknown): number | undefined {
  const text = filterText(value)
  if (text.length === 0) {
    return undefined
  }
  const parsed = Number.parseInt(text, 10)
  return Number.isFinite(parsed) ? parsed : undefined
}

const DEFAULT_PAGE_SIZE = 4
const DEFAULT_TREE_CARD_IMAGE = '/MyTreeLibrary.png'

const { hasRole } = useAuth()
const { toMessage } = useCollaboratorCatalogErrorMapper()
const { runWithAbort, isAbortError } = useAbortableRequest()

const isAdmin = computed(() => hasRole('ADMIN'))
const adminFiltersExpanded = ref(false)

const isLoading = ref(false)
const errorMessage = ref('')
const trees = ref<CollaboratorTreeListItem[]>([])
const totalResults = ref(0)
const page = ref(0)
const size = ref(DEFAULT_PAGE_SIZE)
const speciesOptions = ref<MasterListItem[]>([])
const speciesAutocompleteRef = ref<InstanceType<typeof SpeciesAutocompleteInput> | null>(null)

const filters = reactive({
  speciesId: '',
  createdFrom: '',
  createdTo: '',
  createdByUserId: '',
})

const { thumbUrls, loadForTreeIds } = useTreeListPrimaryPhotos()
let thumbLoadAbort: AbortController | null = null

const totalPages = computed(() => {
  if (size.value <= 0) {
    return 1
  }
  return Math.max(1, Math.ceil(totalResults.value / size.value))
})

const hasPrevious = computed(() => page.value > 0)
const hasNext = computed(() => page.value + 1 < totalPages.value)
const hasResults = computed(() => trees.value.length > 0)
const isSuccess = computed(() => !isLoading.value && !errorMessage.value)

function editRoute(treeId: number) {
  return { name: 'ejemplares-edit' as const, params: { id: treeId } }
}

function getTreeCardImageSrc(treeId: number): string {
  return thumbUrls.value[treeId] ?? DEFAULT_TREE_CARD_IMAGE
}

function buildListQuery() {
  const speciesId = parseOptionalInt(filters.speciesId)
  const createdByUserId = isAdmin.value ? parseOptionalInt(filters.createdByUserId) : undefined

  return {
    page: page.value,
    size: size.value,
    speciesId,
    createdFrom: filterText(filters.createdFrom) || undefined,
    createdTo: filterText(filters.createdTo) || undefined,
    createdByUserId,
  }
}

async function loadTrees(): Promise<void> {
  isLoading.value = true
  errorMessage.value = ''

  try {
    await runWithAbort(async (signal) => {
      const response = await fetchCollaboratorTrees(buildListQuery(), signal)
      trees.value = response.content
      totalResults.value = response.totalResults

      thumbLoadAbort?.abort()
      thumbLoadAbort = new AbortController()
      const ids = response.content.map((item) => item.treeId)
      if (ids.length > 0) {
        void loadForTreeIds(ids, thumbLoadAbort.signal)
      } else {
        thumbLoadAbort = null
      }
    })
  } catch (error: unknown) {
    if (isAbortError(error)) {
      return
    }
    thumbLoadAbort?.abort()
    thumbLoadAbort = null
    trees.value = []
    totalResults.value = 0
    errorMessage.value = toMessage(error)
  } finally {
    isLoading.value = false
  }
}

async function loadSpeciesOptions(): Promise<void> {
  try {
    speciesOptions.value = await fetchSpecies()
  } catch {
    speciesOptions.value = []
  }
}

async function applyFilters(): Promise<void> {
  speciesAutocompleteRef.value?.commitSpeciesFromText()
  page.value = 0
  await loadTrees()
}

async function clearFilters(): Promise<void> {
  filters.speciesId = ''
  filters.createdFrom = ''
  filters.createdTo = ''
  filters.createdByUserId = ''
  adminFiltersExpanded.value = false
  page.value = 0
  await loadTrees()
}

function expandAdminFilters(): void {
  adminFiltersExpanded.value = true
}

async function collapseAdminFilters(): Promise<void> {
  adminFiltersExpanded.value = false
  filters.createdByUserId = ''
  page.value = 0
  await loadTrees()
}

async function goToPreviousPage(): Promise<void> {
  if (!hasPrevious.value) {
    return
  }
  page.value -= 1
  await loadTrees()
}

async function goToNextPage(): Promise<void> {
  if (!hasNext.value) {
    return
  }
  page.value += 1
  await loadTrees()
}

onMounted(async () => {
  await loadSpeciesOptions()
  await loadTrees()
})
</script>

<template>
  <div class="catalog-page">
    <header class="page-header">
      <PageBackLink :to="{ name: 'home' }">{{ t('navigation.home') }}</PageBackLink>
      <h1 class="page-header__title">{{ t('myTrees.title') }}</h1>
      <p class="page-header__description">{{ t('myTrees.description') }}</p>
    </header>

    <section class="catalog-toolbar" :aria-label="t('myTrees.filters.apply')">
      <form class="catalog-toolbar__form" @submit.prevent="applyFilters">
        <div class="catalog-toolbar__panel">
          <div class="catalog-toolbar__fields">
            <div class="filter-field">
              <label class="form-label" for="my-trees-filter-species">{{
                t('myTrees.filters.species.label')
              }}</label>
              <SpeciesAutocompleteInput
                ref="speciesAutocompleteRef"
                input-id="my-trees-filter-species"
                v-model="filters.speciesId"
                :species="speciesOptions"
                input-class="form-control"
                :placeholder="t('myTrees.filters.species.placeholder')"
              />
            </div>

            <div class="filter-field">
              <label class="form-label" for="my-trees-filter-created-from">{{
                t('myTrees.filters.createdFrom.label')
              }}</label>
              <input
                id="my-trees-filter-created-from"
                v-model="filters.createdFrom"
                class="form-control"
                type="date"
              />
            </div>

            <div class="filter-field">
              <label class="form-label" for="my-trees-filter-created-to">{{
                t('myTrees.filters.createdTo.label')
              }}</label>
              <input
                id="my-trees-filter-created-to"
                v-model="filters.createdTo"
                class="form-control"
                type="date"
              />
            </div>
          </div>

          <div
            v-show="isAdmin && adminFiltersExpanded"
            class="catalog-toolbar__fields catalog-toolbar__fields--privileged"
          >
            <div class="filter-field">
              <label class="form-label" for="my-trees-filter-creator">{{
                t('myTrees.filters.createdByUserId.label')
              }}</label>
              <input
                id="my-trees-filter-creator"
                v-model="filters.createdByUserId"
                class="form-control"
                type="number"
                min="1"
                step="1"
                inputmode="numeric"
                :placeholder="t('myTrees.filters.createdByUserId.placeholder')"
              />
            </div>
          </div>

          <div class="catalog-toolbar__actions">
            <button class="btn btn-secondary btn-sm" type="button" :disabled="isLoading" @click="clearFilters">
              {{ t('myTrees.filters.clear') }}
            </button>
            <button
              v-if="isAdmin && !adminFiltersExpanded"
              class="btn btn-secondary btn-sm"
              type="button"
              :disabled="isLoading"
              @click="expandAdminFilters"
            >
              {{ t('myTrees.filters.moreFilters') }}
            </button>
            <button
              v-if="isAdmin && adminFiltersExpanded"
              class="btn btn-secondary btn-sm"
              type="button"
              :disabled="isLoading"
              @click="collapseAdminFilters"
            >
              {{ t('myTrees.filters.fewerFilters') }}
            </button>
            <button class="btn btn-primary btn-sm catalog-toolbar__submit" type="submit" :disabled="isLoading">
              {{ t('myTrees.filters.apply') }}
            </button>
          </div>
        </div>
      </form>
    </section>

    <p v-if="isLoading" class="status-note">{{ t('myTrees.loading') }}</p>
    <p v-else-if="errorMessage" class="error" role="alert">{{ errorMessage }}</p>

    <template v-else-if="isSuccess">
      <p class="catalog-results-count muted">
        {{ t('myTrees.resultsCount', { count: totalResults }) }}
      </p>

      <p v-if="!hasResults" class="status-note">{{ t('myTrees.empty') }}</p>

      <div v-else class="catalog-grid">
        <article v-for="tree in trees" :key="tree.treeId" class="catalog-card">
          <RouterLink class="catalog-card__thumb-link" :to="editRoute(tree.treeId)">
            <img
              class="catalog-card__thumb"
              :src="getTreeCardImageSrc(tree.treeId)"
              :alt="formatSpeciesTitle(tree)"
              width="160"
              height="140"
              loading="lazy"
            />
          </RouterLink>
          <div class="catalog-card__body">
            <h2 class="catalog-card__title">
              <RouterLink class="catalog-card__title-link" :to="editRoute(tree.treeId)">
                {{ formatSpeciesTitle(tree) }}
              </RouterLink>
            </h2>
            <p class="catalog-card__location">{{ locationLine(tree) }}</p>
            <div class="catalog-card__badges">
              <span class="mtl-badge">{{ publicationStateLabel(tree.publicationState) }}</span>
              <span class="mtl-badge mtl-badge--muted">{{
                mapVisibilityLabel(tree.publicMapVisibility)
              }}</span>
            </div>
            <RouterLink class="catalog-card__detail-link" :to="editRoute(tree.treeId)">
              {{ t('myTrees.edit') }}
            </RouterLink>
          </div>
        </article>
      </div>

      <nav class="catalog-pagination" :aria-label="t('myTrees.pagination.navLabel')">
        <button
          class="btn btn-secondary btn-sm"
          type="button"
          :disabled="!hasPrevious || isLoading"
          @click="goToPreviousPage"
        >
          {{ t('myTrees.pagination.previous') }}
        </button>
        <span class="catalog-pagination__status">
          {{ t('myTrees.pagination.pageStatus', { current: page + 1, total: totalPages }) }}
        </span>
        <button
          class="btn btn-secondary btn-sm"
          type="button"
          :disabled="!hasNext || isLoading"
          @click="goToNextPage"
        >
          {{ t('myTrees.pagination.next') }}
        </button>
      </nav>
    </template>
  </div>
</template>
