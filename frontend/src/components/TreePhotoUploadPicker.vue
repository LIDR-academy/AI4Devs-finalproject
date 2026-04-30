<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useId, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { readGpsFromImageFile } from '@/composables/imageExifGps'

interface SelectedPhotoItem {
  id: string
  file: File
  previewUrl: string
}

const DEFAULT_MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024
const DEFAULT_MAX_PHOTOS = 10

const props = withDefaults(
  defineProps<{
    modelValue: File[]
    maxPhotos?: number
    maxFileSizeBytes?: number
    allowedMimeTypes?: string[]
  }>(),
  {
    maxPhotos: DEFAULT_MAX_PHOTOS,
    maxFileSizeBytes: DEFAULT_MAX_FILE_SIZE_BYTES,
    allowedMimeTypes: () => ['image/jpeg', 'image/png', 'image/webp'],
  },
)

const emit = defineEmits<{
  (event: 'update:modelValue', value: File[]): void
  (event: 'first-photo-gps', payload: { latitude: string; longitude: string }): void
}>()

const { t } = useI18n()
const fileInputId = useId()
const selectedPhotos = ref<SelectedPhotoItem[]>([])
const validationMessages = ref<string[]>([])
const exifNotice = ref('')
let exifReadGeneration = 0

async function tryApplyExifFromFirstPhoto(items: SelectedPhotoItem[]): Promise<void> {
  const first = items[0]?.file
  if (!first) {
    exifNotice.value = ''
    return
  }
  const generation = ++exifReadGeneration
  const coords = await readGpsFromImageFile(first)
  if (generation !== exifReadGeneration) {
    return
  }
  if (coords) {
    exifNotice.value = t('treeForm.photos.exifApplied')
    emit('first-photo-gps', coords)
  } else {
    exifNotice.value = ''
  }
}

const acceptMimeAttribute = computed(() => props.allowedMimeTypes.join(','))
const maxFileSizeMb = computed(() => Math.round(props.maxFileSizeBytes / (1024 * 1024)))
const selectedCount = computed(() => selectedPhotos.value.length)

watch(
  () => props.modelValue,
  (newModelValue) => {
    const nextMap = new Map(
      selectedPhotos.value.map((item) => [buildPhotoId(item.file), item]),
    )
    const nextItems: SelectedPhotoItem[] = []
    for (const file of newModelValue) {
      const existing = nextMap.get(buildPhotoId(file))
      if (existing) {
        nextItems.push(existing)
        continue
      }
      nextItems.push({
        id: buildPhotoId(file),
        file,
        previewUrl: URL.createObjectURL(file),
      })
    }
    for (const oldItem of selectedPhotos.value) {
      if (!nextItems.some((nextItem) => nextItem.id === oldItem.id)) {
        URL.revokeObjectURL(oldItem.previewUrl)
      }
    }
    selectedPhotos.value = nextItems
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  for (const photo of selectedPhotos.value) {
    URL.revokeObjectURL(photo.previewUrl)
  }
})

function buildPhotoId(file: File): string {
  return `${file.name}-${file.size}-${file.lastModified}`
}

function formatBytes(bytes: number): string {
  const mb = bytes / (1024 * 1024)
  return `${mb.toFixed(2)} MB`
}

function removePhotoById(photoId: string): void {
  const current = [...selectedPhotos.value]
  const index = current.findIndex((item) => item.id === photoId)
  if (index < 0) {
    return
  }
  const [removed] = current.splice(index, 1)
  URL.revokeObjectURL(removed.previewUrl)
  selectedPhotos.value = current
  emit(
    'update:modelValue',
    current.map((item) => item.file),
  )
  void tryApplyExifFromFirstPhoto(current)
}

function onFilesSelected(event: Event): void {
  const input = event.target as HTMLInputElement
  const files = input.files ? Array.from(input.files) : []
  if (!files.length) {
    return
  }

  const next = [...selectedPhotos.value]
  const messages: string[] = []
  for (const file of files) {
    if (next.length >= props.maxPhotos) {
      messages.push(t('treeForm.photos.validation.maxPhotos', { max: props.maxPhotos }))
      break
    }
    if (!props.allowedMimeTypes.includes(file.type)) {
      messages.push(
        t('treeForm.photos.validation.invalidMime', {
          fileName: file.name,
          allowed: props.allowedMimeTypes.join(', '),
        }),
      )
      continue
    }
    if (file.size > props.maxFileSizeBytes) {
      messages.push(
        t('treeForm.photos.validation.maxFileSize', {
          fileName: file.name,
          maxMb: maxFileSizeMb.value,
        }),
      )
      continue
    }
    const photoId = buildPhotoId(file)
    if (next.some((item) => item.id === photoId)) {
      continue
    }
    next.push({
      id: photoId,
      file,
      previewUrl: URL.createObjectURL(file),
    })
  }

  selectedPhotos.value = next
  validationMessages.value = messages
  emit(
    'update:modelValue',
    next.map((item) => item.file),
  )

  // Permite elegir de nuevo los mismos ficheros sin remontar el input (evita el texto nativo "sin archivo").
  input.value = ''
  void tryApplyExifFromFirstPhoto(next)
}
</script>

<template>
  <section class="photo-upload-block">
    <h3 class="photo-upload-title">{{ t('treeForm.photos.title') }}</h3>
    <p class="photo-upload-help">
      {{
        t('treeForm.photos.help', {
          maxPhotos: maxPhotos,
          maxMb: maxFileSizeMb,
          allowed: allowedMimeTypes.join(', '),
        })
      }}
    </p>

    <div class="photo-file-toolbar">
      <input
        :id="fileInputId"
        class="photo-file-input-native"
        type="file"
        multiple
        :accept="acceptMimeAttribute"
        :aria-label="t('treeForm.photos.inputAriaLabel')"
        @change="onFilesSelected"
      />
      <label class="btn btn-secondary photo-file-choose-label" :for="fileInputId">
        {{ t('treeForm.photos.chooseFiles') }}
      </label>
      <span v-if="selectedCount > 0" class="photo-file-summary" aria-live="polite">
        {{ t('treeForm.photos.selectedCount', { count: selectedCount, max: maxPhotos }) }}
      </span>
    </div>

    <ul v-if="validationMessages.length" class="photo-upload-errors" role="alert">
      <li v-for="message in validationMessages" :key="message">{{ message }}</li>
    </ul>

    <p v-if="exifNotice" class="status-note" aria-live="polite">{{ exifNotice }}</p>

    <p v-if="!selectedPhotos.length" class="status-note">{{ t('treeForm.photos.empty') }}</p>

    <ul v-else class="photo-preview-list">
      <li v-for="(photo, index) in selectedPhotos" :key="photo.id" class="photo-preview-item">
        <img
          :src="photo.previewUrl"
          alt=""
          class="photo-preview-image"
        />
        <div class="photo-preview-meta">
          <p class="photo-preview-name">{{ photo.file.name }}</p>
          <p class="photo-preview-size">{{ formatBytes(photo.file.size) }}</p>
          <span v-if="index === 0" class="photo-main-badge">
            {{ t('treeForm.photos.mainBadge') }}
          </span>
        </div>
        <button class="btn btn-secondary" type="button" @click="removePhotoById(photo.id)">
          {{ t('treeForm.photos.remove') }}
        </button>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.photo-upload-block {
  border: 1px solid var(--color-border, #d6d9de);
  border-radius: 8px;
  padding: 0.75rem;
}

.photo-upload-title {
  margin: 0 0 0.35rem;
}

.photo-upload-help {
  margin: 0 0 0.65rem;
  font-size: 0.92rem;
}

.photo-file-toolbar {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.65rem;
  margin-bottom: 0.35rem;
}

/* Oculta el widget nativo (texto "ningún archivo seleccionado" / lista de nombres); el <label> actúa como control visible. */
.photo-file-input-native {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.photo-file-choose-label {
  margin: 0;
  cursor: pointer;
}

.photo-file-summary {
  font-size: 0.92rem;
  color: var(--muted, #5c667a);
}

.photo-upload-errors {
  margin: 0.65rem 0;
  color: #b42318;
}

.photo-preview-list {
  list-style: none;
  margin: 0.75rem 0 0;
  padding: 0;
  display: grid;
  gap: 0.75rem;
}

.photo-preview-item {
  display: grid;
  grid-template-columns: 88px 1fr auto;
  gap: 0.75rem;
  align-items: center;
}

.photo-preview-image {
  width: 88px;
  height: 88px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #d6d9de;
}

.photo-preview-name,
.photo-preview-size {
  margin: 0;
}

.photo-preview-name {
  font-weight: 600;
}

.photo-preview-size {
  font-size: 0.9rem;
  opacity: 0.8;
}

.photo-main-badge {
  display: inline-block;
  margin-top: 0.35rem;
  font-size: 0.78rem;
  font-weight: 600;
  background: #eef4ff;
  border: 1px solid #b2c8ff;
  border-radius: 999px;
  padding: 0.1rem 0.5rem;
}
</style>
