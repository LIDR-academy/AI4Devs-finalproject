<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import VueZoomable from 'vue-zoomable'
import 'vue-zoomable/dist/style.css'
import type { TreePhotoGalleryItem } from '@/types/media'

const props = defineProps<{
  photos: TreePhotoGalleryItem[]
  initialIndex?: number
  title: string
}>()

const emit = defineEmits<{
  close: []
}>()

const { t } = useI18n()

const MIN_ZOOM = 1
const MAX_ZOOM = 6
const INITIAL_PAN = { x: 0, y: 0 }

const selectedIndex = ref(clampIndex(props.initialIndex ?? 0))
const zoomLevel = ref<number>(MIN_ZOOM)
const panPosition = ref<{ x: number; y: number }>({ ...INITIAL_PAN })

const hasMultiplePhotos = computed(() => props.photos.length > 1)

const selectedPhoto = computed(() => {
  if (!props.photos.length) {
    return null
  }
  return props.photos[selectedIndex.value] ?? null
})

const selectedPhotoPosition = computed(() => selectedIndex.value + 1)
const zoomPercent = computed(() => Math.round(zoomLevel.value * 100))

function clampIndex(rawIndex: number): number {
  if (!props.photos.length) {
    return 0
  }
  if (rawIndex < 0) {
    return 0
  }
  if (rawIndex >= props.photos.length) {
    return props.photos.length - 1
  }
  return rawIndex
}

function showPreviousPhoto(): void {
  if (!hasMultiplePhotos.value) {
    return
  }
  selectedIndex.value =
    (selectedIndex.value - 1 + props.photos.length) % props.photos.length
}

function showNextPhoto(): void {
  if (!hasMultiplePhotos.value) {
    return
  }
  selectedIndex.value = (selectedIndex.value + 1) % props.photos.length
}

function resetZoom(): void {
  zoomLevel.value = MIN_ZOOM
  panPosition.value = { ...INITIAL_PAN }
}

function close(): void {
  emit('close')
}

function handleKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    close()
    return
  }
  if (event.key === 'ArrowLeft') {
    showPreviousPhoto()
    return
  }
  if (event.key === 'ArrowRight') {
    showNextPhoto()
    return
  }
  if (event.key === '0') {
    resetZoom()
  }
}

watch(selectedIndex, () => {
  resetZoom()
})

onMounted(() => {
  globalThis.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  globalThis.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <dialog
    open
    class="tree-photo-viewer-overlay"
    :aria-label="t('treesDetail.gallery.fullscreenTitle')"
    @click.self="close"
  >
    <div class="tree-photo-viewer-content">
      <header class="tree-photo-viewer-header">
        <p class="tree-photo-viewer-title">{{ title }}</p>
        <button
          type="button"
          class="btn btn-secondary btn-sm"
          @click="close"
        >
          {{ t('treesDetail.gallery.close') }}
        </button>
      </header>

      <div v-if="selectedPhoto" class="tree-photo-viewer-stage">
        <VueZoomable
          :key="selectedIndex"
          v-model:zoom="zoomLevel"
          v-model:pan="panPosition"
          class="tree-photo-viewer-zoomable"
          selector=".tree-photo-viewer-image"
          :min-zoom="MIN_ZOOM"
          :max-zoom="MAX_ZOOM"
          :enable-control-button="false"
          zoom-origin="pointer"
        >
          <div class="tree-photo-viewer-frame">
            <img
              class="tree-photo-viewer-image"
              :src="selectedPhoto.url"
              :alt="title"
              draggable="false"
            />
          </div>
        </VueZoomable>
      </div>

      <div class="tree-photo-viewer-toolbar">
        <span class="muted tree-photo-viewer-zoom-indicator">{{
          t('treesDetail.gallery.zoomLevel', { percent: zoomPercent })
        }}</span>
        <button
          type="button"
          class="btn btn-secondary btn-sm"
          :disabled="zoomLevel === MIN_ZOOM"
          @click="resetZoom"
        >
          {{ t('treesDetail.gallery.zoomReset') }}
        </button>
      </div>

      <div v-if="hasMultiplePhotos" class="tree-photo-viewer-controls">
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
            total: photos.length,
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

      <p class="muted tree-photo-viewer-help">
        {{ t('treesDetail.gallery.help') }}
      </p>
    </div>
  </dialog>
</template>
