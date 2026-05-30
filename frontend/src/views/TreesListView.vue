<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import PageBackLink from '@/components/layout/PageBackLink.vue'
import { useAuth } from '@/composables/useAuth'
import { useTreeListPrimaryPhotos } from '@/composables/useTreeListPrimaryPhotos'
import { fetchPublicProvinceNames, fetchPublicTrees } from '@/services/catalog/catalogService'
import { HttpError, NetworkError } from '@/services/http/apiClient'
import type { PublicTreeListItem } from '@/types/catalog'

const { t } = useI18n()

function formatSpeciesTitle(tree: PublicTreeListItem): string {
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

function locationLine(tree: PublicTreeListItem): string {
  const parts = [tree.municipality?.trim(), tree.province?.trim()].filter(Boolean)
  return parts.length > 0 ? parts.join(' · ') : t('common.emptyValue')
}

const DEFAULT_PAGE_SIZE = 4
const DEFAULT_SORT = 'species,asc'
const DEFAULT_TREE_CARD_IMAGE = '/MyTreeLibrary.png'

const { hasRole } = useAuth()

const canUsePrivilegedTreeFilters = computed(
  () => hasRole('COLABORADOR') || hasRole('ADMIN'),
)
const privilegedFiltersExpanded = ref(false)

const isLoading = ref(false)
const errorMessage = ref('')
const trees = ref<PublicTreeListItem[]>([])
const totalResults = ref(0)
const page = ref(0)
const size = ref(DEFAULT_PAGE_SIZE)

const filters = reactive({
  species: '',
  municipality: '',
  province: '',
  publicationState: '' as '' | 'BORRADOR' | 'PUBLICADO',
  publicMapVisibility: '' as '' | 'PRIVADO' | 'PUBLICO',
})

const provinceOptions = ref<string[]>([])

const { thumbUrls, loadForTreeIds } = useTreeListPrimaryPhotos()
const thumbLoadAbort = ref<AbortController | null>(null)

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

function isCatalogDownstreamMessage(error: HttpError): boolean {
  if (error.status === 502 || error.status === 503) {
    return true
  }
  if (error.status !== 500) {
    return false
  }
  const raw = error.problem as Record<string, unknown> | undefined
  const blob = [error.problem?.detail, raw?.message].filter((v) => typeof v === 'string').join(' ')
  return blob.includes('Connection refused')
}

function mapError(error: unknown): string {
  if (error instanceof NetworkError) {
    return t('treesList.messages.networkError')
  }
  if (error instanceof HttpError) {
    if (error.status === 400) {
      return t('treesList.messages.badRequest')
    }
    if (isCatalogDownstreamMessage(error)) {
      return t('treesList.messages.badGateway')
    }
    return t('treesList.messages.serviceError', { status: error.status })
  }
  return t('treesList.messages.unexpectedError')
}

function getTreeCardImageSrc(treeId: number): string {
  return thumbUrls.value[treeId] ?? DEFAULT_TREE_CARD_IMAGE
}

async function loadTrees(): Promise<void> {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const sendPrivileged =
      canUsePrivilegedTreeFilters.value && privilegedFiltersExpanded.value
    const response = await fetchPublicTrees({
      page: page.value,
      size: size.value,
      sort: DEFAULT_SORT,
      species: filters.species.trim() || undefined,
      municipality: filters.municipality.trim() || undefined,
      province: filters.province.trim() || undefined,
      publicationState:
        sendPrivileged && filters.publicationState ? filters.publicationState : undefined,
      publicMapVisibility:
        sendPrivileged && filters.publicMapVisibility ? filters.publicMapVisibility : undefined,
    })
    trees.value = response.content
    totalResults.value = response.totalResults
    thumbLoadAbort.value?.abort()
    thumbLoadAbort.value = new AbortController()
    const ids = response.content.map((tree) => tree.treeId)
    if (ids.length > 0) {
      void loadForTreeIds(ids, thumbLoadAbort.value.signal)
    }
  } catch (error: unknown) {
    thumbLoadAbort.value?.abort()
    trees.value = []
    totalResults.value = 0
    errorMessage.value = mapError(error)
  } finally {
    isLoading.value = false
  }
}

async function applyFilters() {
  page.value = 0
  await loadTrees()
}

async function clearFilters() {
  filters.species = ''
  filters.municipality = ''
  filters.province = ''
  filters.publicationState = ''
  filters.publicMapVisibility = ''
  page.value = 0
  await loadTrees()
}

function expandPrivilegedFilters(): void {
  privilegedFiltersExpanded.value = true
}

async function collapsePrivilegedFilters(): Promise<void> {
  privilegedFiltersExpanded.value = false
  filters.publicationState = ''
  filters.publicMapVisibility = ''
  page.value = 0
  await loadTrees()
}

async function goToPreviousPage() {
  if (!hasPrevious.value) {
    return
  }
  page.value -= 1
  await loadTrees()
}

async function goToNextPage() {
  if (!hasNext.value) {
    return
  }
  page.value += 1
  await loadTrees()
}

async function loadProvinceNames(): Promise<void> {
  try {
    provinceOptions.value = await fetchPublicProvinceNames()
  } catch {
    provinceOptions.value = []
  }
}

watch(canUsePrivilegedTreeFilters, async (can) => {
  if (!can && privilegedFiltersExpanded.value) {
    privilegedFiltersExpanded.value = false
    filters.publicationState = ''
    filters.publicMapVisibility = ''
    page.value = 0
    await loadTrees()
  }
})

onMounted(async () => {
  await Promise.all([loadProvinceNames(), loadTrees()])
})
</script>

<template>
  <div class="catalog-page">
    <header class="page-header">
      <PageBackLink :to="{ name: 'home' }">{{ t('navigation.home') }}</PageBackLink>
      <h1 class="page-header__title">{{ t('treesList.title') }}</h1>
      <p class="page-header__description">{{ t('treesList.description') }}</p>
    </header>

    <section class="catalog-toolbar" :aria-label="t('treesList.filters.apply')">
      <form class="catalog-toolbar__form" @submit.prevent="applyFilters">
        <div class="catalog-toolbar__panel">
          <div class="catalog-toolbar__fields">
            <div class="filter-field">
              <label class="form-label" for="trees-filter-species">{{
                t('treesList.filters.species.label')
              }}</label>
              <input
                id="trees-filter-species"
                v-model="filters.species"
                class="form-control"
                type="text"
                autocomplete="off"
                :placeholder="t('treesList.filters.species.placeholder')"
              />
            </div>

            <div class="filter-field">
              <label class="form-label" for="trees-filter-municipality">{{
                t('treesList.filters.municipality.label')
              }}</label>
              <input
                id="trees-filter-municipality"
                v-model="filters.municipality"
                class="form-control"
                type="text"
                autocomplete="off"
                :placeholder="t('treesList.filters.municipality.placeholder')"
              />
            </div>

            <div class="filter-field">
              <label class="form-label" for="trees-filter-province">{{
                t('treesList.filters.province.label')
              }}</label>
              <select id="trees-filter-province" v-model="filters.province" class="form-control">
                <option value="">{{ t('treesList.filters.province.all') }}</option>
                <option v-for="province in provinceOptions" :key="province" :value="province">
                  {{ province }}
                </option>
              </select>
            </div>
          </div>

          <div
            v-show="canUsePrivilegedTreeFilters && privilegedFiltersExpanded"
            class="catalog-toolbar__fields catalog-toolbar__fields--privileged"
          >
            <div class="filter-field">
              <label class="form-label" for="trees-filter-state">{{
                t('treesList.filters.state.label')
              }}</label>
              <select id="trees-filter-state" v-model="filters.publicationState" class="form-control">
                <option value="">{{ t('treesList.filters.state.all') }}</option>
                <option value="BORRADOR">{{ t('treesList.filters.state.borrador') }}</option>
                <option value="PUBLICADO">{{ t('treesList.filters.state.publicado') }}</option>
              </select>
            </div>
            <div class="filter-field">
              <label class="form-label" for="trees-filter-visibility">{{
                t('treesList.filters.visibility.label')
              }}</label>
              <select id="trees-filter-visibility" v-model="filters.publicMapVisibility" class="form-control">
                <option value="">{{ t('treesList.filters.visibility.all') }}</option>
                <option value="PRIVADO">{{ t('treesList.filters.visibility.privado') }}</option>
                <option value="PUBLICO">{{ t('treesList.filters.visibility.publico') }}</option>
              </select>
            </div>
          </div>

          <div class="catalog-toolbar__actions">
            <button class="btn btn-secondary btn-sm" type="button" :disabled="isLoading" @click="clearFilters">
              {{ t('treesList.filters.clear') }}
            </button>
            <button
              v-if="canUsePrivilegedTreeFilters && !privilegedFiltersExpanded"
              class="btn btn-secondary btn-sm"
              type="button"
              :disabled="isLoading"
              @click="expandPrivilegedFilters"
            >
              {{ t('treesList.filters.moreFilters') }}
            </button>
            <button
              v-if="canUsePrivilegedTreeFilters && privilegedFiltersExpanded"
              class="btn btn-secondary btn-sm"
              type="button"
              :disabled="isLoading"
              @click="collapsePrivilegedFilters"
            >
              {{ t('treesList.filters.fewerFilters') }}
            </button>
            <button class="btn btn-primary-soft btn-sm catalog-toolbar__submit" type="submit" :disabled="isLoading">
              {{ t('treesList.filters.apply') }}
            </button>
          </div>
        </div>
      </form>
    </section>

    <p v-if="isLoading" class="status-note">{{ t('treesList.loading') }}</p>
    <p v-else-if="errorMessage" class="error" role="alert">{{ errorMessage }}</p>

    <template v-else-if="isSuccess">
      <p class="catalog-results-count muted">
        {{ t('treesList.resultsCount', { count: totalResults }) }}
      </p>

      <p v-if="!hasResults" class="status-note">{{ t('treesList.empty') }}</p>

      <div v-else class="catalog-grid">
        <article v-for="tree in trees" :key="tree.treeId" class="catalog-card">
          <RouterLink class="catalog-card__thumb-link" :to="`/ejemplares/${tree.treeId}`">
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
              <RouterLink class="catalog-card__title-link" :to="`/ejemplares/${tree.treeId}`">
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
            <RouterLink class="catalog-card__detail-link" :to="`/ejemplares/${tree.treeId}`">
              {{ t('treesList.viewDetail') }}
            </RouterLink>
          </div>
        </article>
      </div>

      <nav class="catalog-pagination" :aria-label="t('treesList.pagination.navLabel')">
        <button
          class="btn btn-secondary btn-sm catalog-pagination__btn"
          type="button"
          :disabled="!hasPrevious || isLoading"
          @click="goToPreviousPage"
        >
          {{ t('treesList.pagination.previous') }}
        </button>
        <span class="catalog-pagination__status">
          {{ t('treesList.pagination.pageStatus', { current: page + 1, total: totalPages }) }}
        </span>
        <button
          class="btn btn-secondary btn-sm catalog-pagination__btn"
          type="button"
          :disabled="!hasNext || isLoading"
          @click="goToNextPage"
        >
          {{ t('treesList.pagination.next') }}
        </button>
      </nav>
    </template>
  </div>
</template>
