<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuth } from '@/composables/useAuth'
import { useTreeListPrimaryPhotos } from '@/composables/useTreeListPrimaryPhotos'
import { fetchPublicProvinceNames, fetchPublicTrees } from '@/services/catalog/catalogService'
import { HttpError, NetworkError } from '@/services/http/apiClient'
import type { PublicTreeListItem } from '@/types/catalog'

function formatSpeciesTitle(tree: PublicTreeListItem): string {
  const common = tree.nombreComun.trim()
  const scientific = tree.nombreCientifico.trim()
  if (common.length > 0) {
    return `${common} (${scientific})`
  }
  return scientific
}

const DEFAULT_PAGE_SIZE = 20
const DEFAULT_SORT = 'especie,asc'
const DEFAULT_TREE_CARD_IMAGE = '/MyTreeLibrary.png'

const { t } = useI18n()
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
  especie: '',
  municipio: '',
  provincia: '',
  estado: '' as '' | 'BORRADOR' | 'PUBLICADO',
  visibilidad: '' as '' | 'PRIVADO' | 'PUBLICO',
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

function mapError(error: unknown): string {
  if (error instanceof NetworkError) {
    return t('treesList.messages.networkError')
  }
  if (error instanceof HttpError) {
    if (error.status === 400) {
      return t('treesList.messages.badRequest')
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
      especie: filters.especie.trim() || undefined,
      municipio: filters.municipio.trim() || undefined,
      provincia: filters.provincia.trim() || undefined,
      estado: sendPrivileged && filters.estado ? filters.estado : undefined,
      visibilidad: sendPrivileged && filters.visibilidad ? filters.visibilidad : undefined,
    })
    trees.value = response.content
    totalResults.value = response.totalResults
    thumbLoadAbort.value?.abort()
    thumbLoadAbort.value = new AbortController()
    const ids = response.content.map((t) => t.treeId)
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
  filters.especie = ''
  filters.municipio = ''
  filters.provincia = ''
  filters.estado = ''
  filters.visibilidad = ''
  page.value = 0
  await loadTrees()
}

function expandPrivilegedFilters(): void {
  privilegedFiltersExpanded.value = true
}

async function collapsePrivilegedFilters(): Promise<void> {
  privilegedFiltersExpanded.value = false
  filters.estado = ''
  filters.visibilidad = ''
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
    filters.estado = ''
    filters.visibilidad = ''
    page.value = 0
    await loadTrees()
  }
})

onMounted(async () => {
  await Promise.all([loadProvinceNames(), loadTrees()])
})
</script>

<template>
  <section class="card trees-list-card">
    <div class="trees-list-header">
      <div class="trees-list-heading">
        <h2>{{ t('treesList.title') }}</h2>
      </div>

      <form class="trees-list-filters" @submit.prevent="applyFilters">
        <div class="trees-filter-panel">
          <div class="trees-filter-grid">
            <div class="filter-field">
              <label class="form-label trees-filter-label" for="trees-filter-species">{{
                t('treesList.filters.species.label')
              }}</label>
              <input
                id="trees-filter-species"
                v-model="filters.especie"
                class="form-control trees-filter-control"
                type="text"
                autocomplete="off"
                :placeholder="t('treesList.filters.species.placeholder')"
              />
            </div>

            <div class="filter-field">
              <label class="form-label trees-filter-label" for="trees-filter-municipality">{{
                t('treesList.filters.municipality.label')
              }}</label>
              <input
                id="trees-filter-municipality"
                v-model="filters.municipio"
                class="form-control trees-filter-control"
                type="text"
                autocomplete="off"
                :placeholder="t('treesList.filters.municipality.placeholder')"
              />
            </div>

            <div class="filter-field">
              <label class="form-label trees-filter-label" for="trees-filter-province">{{
                t('treesList.filters.province.label')
              }}</label>
              <select id="trees-filter-province" v-model="filters.provincia" class="form-control trees-filter-control">
                <option value="">{{ t('treesList.filters.province.all') }}</option>
                <option v-for="province in provinceOptions" :key="province" :value="province">
                  {{ province }}
                </option>
              </select>
            </div>
          </div>

          <div
            v-show="canUsePrivilegedTreeFilters && privilegedFiltersExpanded"
            class="trees-filter-grid trees-filter-grid--privileged"
          >
            <div class="filter-field">
              <label class="form-label trees-filter-label" for="trees-filter-state">{{
                t('treesList.filters.state.label')
              }}</label>
              <select id="trees-filter-state" v-model="filters.estado" class="form-control trees-filter-control">
                <option value="">{{ t('treesList.filters.state.all') }}</option>
                <option value="BORRADOR">{{ t('treesList.filters.state.borrador') }}</option>
                <option value="PUBLICADO">{{ t('treesList.filters.state.publicado') }}</option>
              </select>
            </div>
            <div class="filter-field">
              <label class="form-label trees-filter-label" for="trees-filter-visibility">{{
                t('treesList.filters.visibility.label')
              }}</label>
              <select
                id="trees-filter-visibility"
                v-model="filters.visibilidad"
                class="form-control trees-filter-control"
              >
                <option value="">{{ t('treesList.filters.visibility.all') }}</option>
                <option value="PRIVADO">{{ t('treesList.filters.visibility.privado') }}</option>
                <option value="PUBLICO">{{ t('treesList.filters.visibility.publico') }}</option>
              </select>
            </div>
          </div>

          <div class="trees-filter-actions">
            <button
              class="btn btn-secondary btn-sm trees-filter-btn"
              type="button"
              :disabled="isLoading"
              @click="clearFilters"
            >
              {{ t('treesList.filters.clear') }}
            </button>
            <button
              v-if="canUsePrivilegedTreeFilters && !privilegedFiltersExpanded"
              class="btn btn-secondary btn-sm trees-filter-btn"
              type="button"
              :disabled="isLoading"
              @click="expandPrivilegedFilters"
            >
              {{ t('treesList.filters.moreFilters') }}
            </button>
            <button
              v-if="canUsePrivilegedTreeFilters && privilegedFiltersExpanded"
              class="btn btn-secondary btn-sm trees-filter-btn"
              type="button"
              :disabled="isLoading"
              @click="collapsePrivilegedFilters"
            >
              {{ t('treesList.filters.fewerFilters') }}
            </button>
            <button
              class="btn btn-primary btn-sm trees-filter-btn trees-filter-btn-submit"
              type="submit"
              :disabled="isLoading"
            >
              {{ t('treesList.filters.apply') }}
            </button>
          </div>
        </div>
      </form>
    </div>

    <p v-if="isLoading" class="status-note">{{ t('treesList.loading') }}</p>
    <p v-else-if="errorMessage" class="error">{{ errorMessage }}</p>

    <template v-else-if="isSuccess">
      <p class="trees-list-results-count muted">
        {{ t('treesList.resultsCount', { count: totalResults }) }}
      </p>

      <p v-if="!hasResults" class="status-note">{{ t('treesList.empty') }}</p>

      <div v-else class="trees-grid">
        <article v-for="tree in trees" :key="tree.treeId" class="tree-card">
          <div class="tree-card-thumb">
            <RouterLink class="tree-card-thumb-link" :to="`/trees/${tree.treeId}`">
              <div class="tree-card-thumb-media">
                <img
                  class="tree-card-thumb-img"
                  :src="getTreeCardImageSrc(tree.treeId)"
                  :alt="formatSpeciesTitle(tree)"
                  width="132"
                  height="156"
                  loading="lazy"
                />
              </div>
            </RouterLink>
          </div>
          <div class="tree-card-main">
            <div class="tree-card-body">
              <h3 class="tree-card-title">{{ formatSpeciesTitle(tree) }}</h3>
              <dl class="tree-card-meta">
                <div>
                  <dt>{{ t('treesList.fields.province') }}</dt>
                  <dd>{{ tree.provincia || '-' }}</dd>
                </div>
                <div>
                  <dt>{{ t('treesList.fields.municipality') }}</dt>
                  <dd>{{ tree.municipio || '-' }}</dd>
                </div>
                <div>
                  <dt>{{ t('treesList.fields.state') }}</dt>
                  <dd>{{ tree.estado }}</dd>
                </div>
                <div>
                  <dt>{{ t('treesList.fields.visibility') }}</dt>
                  <dd>{{ tree.visibilidad }}</dd>
                </div>
              </dl>
            </div>
            <div class="tree-card-footer">
              <RouterLink class="btn btn-secondary btn-sm" :to="`/trees/${tree.treeId}`">
                {{ t('treesList.viewDetail') }}
              </RouterLink>
            </div>
          </div>
        </article>
      </div>

      <nav class="trees-pagination" :aria-label="t('treesList.pagination.navLabel')">
        <button
          class="btn trees-pagination-btn trees-pagination-btn--prev"
          type="button"
          :disabled="!hasPrevious || isLoading"
          @click="goToPreviousPage"
        >
          {{ t('treesList.pagination.previous') }}
        </button>
        <span class="trees-pagination-status">
          {{ t('treesList.pagination.pageStatus', { current: page + 1, total: totalPages }) }}
        </span>
        <button
          class="btn trees-pagination-btn trees-pagination-btn--next"
          type="button"
          :disabled="!hasNext || isLoading"
          @click="goToNextPage"
        >
          {{ t('treesList.pagination.next') }}
        </button>
      </nav>
    </template>
  </section>
</template>
