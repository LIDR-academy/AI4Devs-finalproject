<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import TreeLocationMapPreview from '@/components/TreeLocationMapPreview.vue'
import TreePhotoFullscreenViewer from '@/components/TreePhotoFullscreenViewer.vue'
import { areLatLngInValidRange } from '@/composables/createTreeFormValidation'
import { fetchPublicTreeDetail } from '@/services/catalog/catalogService'
import { fetchTreePhotoGallery } from '@/services/media/treeGalleryService'
import { HttpError, NetworkError } from '@/services/http/apiClient'
import type { PublicTreeDetail } from '@/types/catalog'
import type { TreePhotoGalleryItem } from '@/types/media'

const route = useRoute()
const { t } = useI18n()

const isLoading = ref(false)
const errorMessage = ref('')
const notFound = ref(false)
const tree = ref<PublicTreeDetail | null>(null)
const galleryPhotos = ref<TreePhotoGalleryItem[]>([])
const selectedPhotoIndex = ref(0)
const isFullscreenOpen = ref(false)

function mapError(error: unknown): string {
  if (error instanceof NetworkError) {
    return t('treesDetail.messages.networkError')
  }
  if (error instanceof HttpError) {
    if (error.status === 404) {
      notFound.value = true
      return t('treesDetail.messages.notFound')
    }
    return t('treesDetail.messages.serviceError', { status: error.status })
  }
  return t('treesDetail.messages.unexpectedError')
}

const treeId = computed(() => {
  const rawId = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
  const parsedId = Number(rawId)
  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    return null
  }
  return parsedId
})

const speciesTitle = computed(() => {
  if (!tree.value) {
    return ''
  }
  const common = tree.value.nombreComun.trim()
  const scientific = tree.value.nombreCientifico.trim()
  if (common.length > 0) {
    return `${common} (${scientific})`
  }
  return scientific
})

const mapLatLng = computed(() => ({
  latitude: tree.value ? String(tree.value.latitud) : '',
  longitude: tree.value ? String(tree.value.longitud) : '',
}))

const showMapMarker = computed(() => areLatLngInValidRange(mapLatLng.value))
const hasGalleryPhotos = computed(() => galleryPhotos.value.length > 0)
const hasMultipleGalleryPhotos = computed(() => galleryPhotos.value.length > 1)
const isSuccess = computed(() => !isLoading.value && !errorMessage.value && tree.value !== null)
const selectedPhoto = computed(() => {
  if (!galleryPhotos.value.length) {
    return null
  }
  const index = Math.min(Math.max(selectedPhotoIndex.value, 0), galleryPhotos.value.length - 1)
  return galleryPhotos.value[index] ?? null
})
const selectedPhotoPosition = computed(() =>
  selectedPhoto.value ? selectedPhotoIndex.value + 1 : 0,
)

async function loadTreeDetail(): Promise<void> {
  if (!treeId.value) {
    notFound.value = true
    errorMessage.value = t('treesDetail.messages.notFound')
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  notFound.value = false
  tree.value = null
  galleryPhotos.value = []
  selectedPhotoIndex.value = 0

  try {
    const [treeDetail, photos] = await Promise.all([
      fetchPublicTreeDetail(treeId.value),
      fetchTreePhotoGallery(treeId.value),
    ])
    tree.value = treeDetail
    galleryPhotos.value = photos
  } catch (error: unknown) {
    errorMessage.value = mapError(error)
  } finally {
    isLoading.value = false
  }
}

function showPreviousPhoto(): void {
  if (!hasMultipleGalleryPhotos.value) {
    return
  }
  selectedPhotoIndex.value =
    (selectedPhotoIndex.value - 1 + galleryPhotos.value.length) % galleryPhotos.value.length
}

function showNextPhoto(): void {
  if (!hasMultipleGalleryPhotos.value) {
    return
  }
  selectedPhotoIndex.value = (selectedPhotoIndex.value + 1) % galleryPhotos.value.length
}

function openFullscreen(): void {
  if (!hasGalleryPhotos.value) {
    return
  }
  isFullscreenOpen.value = true
}

function closeFullscreen(): void {
  isFullscreenOpen.value = false
}

onMounted(async () => {
  await loadTreeDetail()
})
</script>

<template>
  <section class="card tree-detail-card">
    <div class="tree-detail-top-actions">
      <RouterLink class="btn btn-secondary btn-sm" :to="{ name: 'trees-list' }">
        {{ t('treesDetail.backToList') }}
      </RouterLink>
    </div>
    <h2>{{ tree ? speciesTitle : t('treesDetail.title') }}</h2>

    <p v-if="isLoading" class="status-note">{{ t('treesDetail.loading') }}</p>
    <p v-else-if="errorMessage" class="error" role="alert">{{ errorMessage }}</p>

    <template v-else-if="isSuccess && tree">
      <div class="tree-detail-visual-grid">
        <section class="tree-detail-gallery-block" aria-labelledby="tree-detail-gallery-heading">
          <p id="tree-detail-gallery-heading" class="form-label">{{ t('treesDetail.gallery.title') }}</p>
          <div class="tree-detail-gallery-frame">
            <button
              v-if="selectedPhoto"
              type="button"
              class="tree-detail-gallery-open-btn"
              :aria-label="t('treesDetail.gallery.openViewer')"
              @click="openFullscreen"
              @keydown.enter.prevent="openFullscreen"
              @keydown.space.prevent="openFullscreen"
            >
              <img
                class="tree-detail-gallery-image"
                :src="selectedPhoto.url"
                :alt="speciesTitle"
                draggable="false"
                @dblclick="openFullscreen"
              />
            </button>
            <output v-else class="muted tree-detail-gallery-empty">{{
              t('treesDetail.gallery.noPhotos')
            }}</output>
          </div>
          <div v-if="hasMultipleGalleryPhotos" class="tree-detail-gallery-controls">
            <button
              type="button"
              class="btn btn-secondary btn-sm"
              @click="showPreviousPhoto"
            >
              {{ t('treesDetail.gallery.previous') }}
            </button>
            <span class="muted">{{
              t('treesDetail.gallery.position', {
                current: selectedPhotoPosition,
                total: galleryPhotos.length,
              })
            }}</span>
            <button
              type="button"
              class="btn btn-secondary btn-sm"
              @click="showNextPhoto"
            >
              {{ t('treesDetail.gallery.next') }}
            </button>
          </div>
        </section>
        <section class="tree-detail-map-block" aria-labelledby="tree-detail-map-heading">
          <p id="tree-detail-map-heading" class="form-label">{{ t('treesDetail.map.title') }}</p>
          <TreeLocationMapPreview
            v-if="showMapMarker"
            :latitude="mapLatLng.latitude"
            :longitude="mapLatLng.longitude"
            :show-marker="true"
            :read-only="true"
          />
          <output v-else class="muted tree-detail-map-unavailable">{{
            t('treesDetail.map.noLocation')
          }}</output>
        </section>
      </div>

      <form class="tree-form tree-detail-form" @submit.prevent>
        <div class="field">
          <label class="form-label" for="tree-detail-province">{{ t('treesDetail.fields.province') }}</label>
          <input
            id="tree-detail-province"
            class="form-control"
            type="text"
            :value="tree.provincia || '-'"
            readonly
          />
        </div>

        <div class="field">
          <label class="form-label" for="tree-detail-municipality">{{ t('treesDetail.fields.municipality') }}</label>
          <input
            id="tree-detail-municipality"
            class="form-control"
            type="text"
            :value="tree.municipio || '-'"
            readonly
          />
        </div>

        <div class="field field-full">
          <label class="form-label" for="tree-detail-description">{{ t('treesDetail.fields.description') }}</label>
          <textarea
            id="tree-detail-description"
            class="form-control form-textarea"
            rows="2"
            :value="tree.descripcion || '-'"
            readonly
          />
        </div>

        <div class="field-full tree-geo-row">
          <div class="field">
            <label class="form-label" for="tree-detail-latitude">{{ t('treesDetail.fields.latitude') }}</label>
            <input id="tree-detail-latitude" class="form-control" type="text" :value="tree.latitud" readonly />
          </div>

          <div class="field">
            <label class="form-label" for="tree-detail-longitude">{{ t('treesDetail.fields.longitude') }}</label>
            <input id="tree-detail-longitude" class="form-control" type="text" :value="tree.longitud" readonly />
          </div>

          <div class="field">
            <label class="form-label" for="tree-detail-altitude">{{ t('treesDetail.fields.altitude') }}</label>
            <input
              id="tree-detail-altitude"
              class="form-control"
              type="text"
              :value="tree.altura ?? '-'"
              readonly
            />
          </div>
        </div>

        <div class="field">
          <label class="form-label" for="tree-detail-state">{{ t('treesDetail.fields.state') }}</label>
          <input id="tree-detail-state" class="form-control" type="text" :value="tree.estado" readonly />
        </div>

        <div class="field">
          <label class="form-label" for="tree-detail-visibility">{{ t('treesDetail.fields.visibility') }}</label>
          <input id="tree-detail-visibility" class="form-control" type="text" :value="tree.visibilidad" readonly />
        </div>

        <div class="field-full actions">
          <RouterLink class="btn btn-secondary" :to="{ name: 'trees-list' }">
            {{ t('treesDetail.backToList') }}
          </RouterLink>
          <span class="muted tree-detail-id">{{ t('treesDetail.treeId', { id: tree.treeId }) }}</span>
        </div>
      </form>

      <TreePhotoFullscreenViewer
        v-if="isFullscreenOpen && hasGalleryPhotos"
        :photos="galleryPhotos"
        :initial-index="selectedPhotoIndex"
        :title="speciesTitle"
        @close="closeFullscreen"
      />
    </template>

    <p v-if="notFound" class="status-note">
      {{ t('treesDetail.notFoundHint') }}
    </p>
  </section>
</template>
