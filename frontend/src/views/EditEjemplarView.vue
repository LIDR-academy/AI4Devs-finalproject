<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import MtlConfirmDialog from '@/components/MtlConfirmDialog.vue'
import SpeciesAutocompleteInput from '@/components/SpeciesAutocompleteInput.vue'
import TreeLocationMapPreview from '@/components/TreeLocationMapPreview.vue'
import TreePhotoFullscreenViewer from '@/components/TreePhotoFullscreenViewer.vue'
import { areLatLngInValidRange } from '@/composables/createTreeFormValidation'
import { useEditEjemplarForm } from '@/composables/useEditEjemplarForm'
import { useTreeLocationAutofill } from '@/composables/useTreeLocationAutofill'

const route = useRoute()
const { t } = useI18n()

const ejemplarId = computed(() => {
  const rawId = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
  const parsedId = Number(rawId)
  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    return null
  }
  return parsedId
})

const {
  form,
  species,
  provinces,
  galleryPhotos,
  publicationStateOptions,
  mapVisibilityOptions,
  isLoading,
  loadError,
  isReady,
  isSubmitting,
  isDeleting,
  fieldErrors,
  submitError,
  deleteError,
  galleryPhotoError,
  isDeletingPhoto,
  isUploadingPhoto,
  canAddGalleryPhoto,
  initialize,
  submit,
  addGalleryPhoto,
  removeGalleryPhoto,
  removeEjemplar,
} = useEditEjemplarForm(ejemplarId)

const showMapMarker = computed(() => areLatLngInValidRange(form))
const deleteConfirmOpen = ref(false)
const deletePhotoConfirmOpen = ref(false)

const { applyCoordinatesAndAutofillAddress } = useTreeLocationAutofill({
  form,
  provinces,
})

const speciesAutocompleteRef = ref<InstanceType<typeof SpeciesAutocompleteInput> | null>(null)

const hasGalleryPhotos = computed(() => galleryPhotos.value.length > 0)
const hasMultipleGalleryPhotos = computed(() => galleryPhotos.value.length > 1)
const selectedPhotoIndex = ref(0)
const isFullscreenOpen = ref(false)

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

const photoFileInputRef = ref<HTMLInputElement | null>(null)
const PHOTO_ACCEPT_MIME = 'image/jpeg,image/png,image/webp'

const galleryAltText = computed(() => {
  const selected = species.value.find((item) => String(item.id) === form.speciesId)
  return selected?.label ?? t('treeEdit.galleryFallbackAlt')
})

interface CoordinatesPayload {
  latitude: string
  longitude: string
}

function onMapPickCoordinates(payload: CoordinatesPayload): void {
  void applyCoordinatesAndAutofillAddress(payload)
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

function openDeleteConfirm(): void {
  deleteConfirmOpen.value = true
}

async function onConfirmDelete(): Promise<void> {
  await removeEjemplar()
}

function openDeletePhotoConfirm(): void {
  if (!selectedPhoto.value || isDeletingPhoto.value || isUploadingPhoto.value) {
    return
  }
  deletePhotoConfirmOpen.value = true
}

async function onConfirmDeletePhoto(): Promise<void> {
  const photo = selectedPhoto.value
  if (!photo) {
    return
  }
  const deletedIndex = selectedPhotoIndex.value
  const ok = await removeGalleryPhoto(photo.id)
  if (!ok) {
    return
  }
  if (galleryPhotos.value.length === 0) {
    selectedPhotoIndex.value = 0
    return
  }
  selectedPhotoIndex.value = Math.min(deletedIndex, galleryPhotos.value.length - 1)
}

function openPhotoFilePicker(): void {
  if (!canAddGalleryPhoto.value) {
    return
  }
  photoFileInputRef.value?.click()
}

async function onPhotoFileSelected(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) {
    return
  }

  const previousCount = galleryPhotos.value.length
  const ok = await addGalleryPhoto(file)
  if (!ok) {
    return
  }
  if (galleryPhotos.value.length > previousCount) {
    selectedPhotoIndex.value = galleryPhotos.value.length - 1
  }
}

async function onSubmit(): Promise<void> {
  speciesAutocompleteRef.value?.commitSpeciesFromText()
  await submit()
}

onMounted(async () => {
  await initialize()
})
</script>

<template>
  <section class="card form-card tree-edit-card">
    <h2 v-if="ejemplarId">{{ t('treeEdit.title', { id: ejemplarId }) }}</h2>
    <h2 v-else>{{ t('treeEdit.titleInvalid') }}</h2>

    <p v-if="isLoading" class="status-note">{{ t('treeEdit.loading') }}</p>
    <p v-else-if="loadError" class="error" role="alert">{{ loadError }}</p>

    <form v-else-if="isReady" class="tree-form" @submit.prevent="onSubmit">
      <div class="field species-field">
        <label class="form-label" for="edit-speciesId">{{ t('treeForm.fields.species.label') }}</label>
        <SpeciesAutocompleteInput
          ref="speciesAutocompleteRef"
          input-id="edit-speciesId"
          v-model="form.speciesId"
          :species="species"
          required
          :aria-invalid="Boolean(fieldErrors.speciesId)"
          :placeholder="t('treeForm.fields.species.placeholder')"
        />
        <small v-if="fieldErrors.speciesId" class="field-error">{{ fieldErrors.speciesId }}</small>
      </div>

      <div class="field state-visibility-inline">
        <div class="field">
          <label class="form-label" for="edit-publicationState">{{
            t('treeForm.fields.publicationState.label')
          }}</label>
          <select id="edit-publicationState" v-model="form.publicationState" class="form-control">
            <option v-for="item in publicationStateOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </option>
          </select>
        </div>

        <div class="field">
          <label class="form-label" for="edit-publicMapVisibility">{{
            t('treeForm.fields.publicMapVisibility.label')
          }}</label>
          <select id="edit-publicMapVisibility" v-model="form.publicMapVisibility" class="form-control">
            <option v-for="item in mapVisibilityOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </option>
          </select>
        </div>
      </div>

      <div class="field-full tree-detail-visual-grid tree-edit-visual-grid">
        <section class="tree-detail-gallery-block" aria-labelledby="tree-edit-gallery-heading">
          <p id="tree-edit-gallery-heading" class="form-label">{{ t('treesDetail.gallery.title') }}</p>
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
                :alt="galleryAltText"
                draggable="false"
                @dblclick="openFullscreen"
              />
            </button>
            <output v-else class="muted tree-detail-gallery-empty">{{
              t('treesDetail.gallery.noPhotos')
            }}</output>
          </div>
          <div class="tree-detail-gallery-controls">
            <button
              v-if="hasMultipleGalleryPhotos"
              type="button"
              class="btn btn-secondary btn-sm"
              :disabled="isDeletingPhoto || isUploadingPhoto"
              @click="showPreviousPhoto"
            >
              {{ t('treesDetail.gallery.previous') }}
            </button>
            <span v-else class="tree-detail-gallery-controls-spacer" aria-hidden="true" />
            <div class="tree-detail-gallery-position">
              <span v-if="hasGalleryPhotos" class="muted">{{
                t('treesDetail.gallery.position', {
                  current: selectedPhotoPosition,
                  total: galleryPhotos.length,
                })
              }}</span>
              <span v-else class="muted">{{ t('treeEdit.gallery.noPhotosHint') }}</span>
              <div class="tree-detail-gallery-actions">
                <button
                  type="button"
                  class="btn btn-secondary btn-sm tree-gallery-icon-btn"
                  :aria-label="t('treeEdit.gallery.deletePhoto')"
                  :disabled="!selectedPhoto || isDeletingPhoto || isUploadingPhoto"
                  @click="openDeletePhotoConfirm"
                >
                  <svg
                    class="tree-gallery-action-icon"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path d="M3 6h18" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                  <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
                <button
                  type="button"
                  class="btn btn-secondary btn-sm tree-gallery-icon-btn"
                  :aria-label="t('treeEdit.gallery.addPhoto')"
                  :disabled="!canAddGalleryPhoto"
                  @click="openPhotoFilePicker"
                >
                  <svg
                    class="tree-gallery-action-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M12 5v14" />
                    <path d="M5 12h14" />
                  </svg>
                </button>
              </div>
              <input
                ref="photoFileInputRef"
                class="tree-gallery-file-input"
                type="file"
                :accept="PHOTO_ACCEPT_MIME"
                :aria-label="t('treeEdit.gallery.addPhoto')"
                @change="onPhotoFileSelected"
              />
            </div>
            <button
              v-if="hasMultipleGalleryPhotos"
              type="button"
              class="btn btn-secondary btn-sm"
              :disabled="isDeletingPhoto || isUploadingPhoto"
              @click="showNextPhoto"
            >
              {{ t('treesDetail.gallery.next') }}
            </button>
            <span v-else class="tree-detail-gallery-controls-spacer" aria-hidden="true" />
          </div>
          <p v-if="galleryPhotoError" class="error tree-edit-gallery-error" role="alert">
            {{ galleryPhotoError }}
          </p>
        </section>

        <section class="tree-detail-map-block" aria-labelledby="tree-edit-map-heading">
          <p id="tree-edit-map-heading" class="form-label">{{ t('treesDetail.map.title') }}</p>
          <TreeLocationMapPreview
            :latitude="form.latitude"
            :longitude="form.longitude"
            :show-marker="showMapMarker"
            @pick-coordinates="onMapPickCoordinates"
          />
        </section>
      </div>

      <div class="field-full tree-edit-location-row">
        <div class="field">
          <label class="form-label" for="edit-provinceId">{{ t('treeForm.fields.province.label') }}</label>
          <select
            id="edit-provinceId"
            v-model="form.provinceId"
            class="form-control"
            required
            :aria-invalid="Boolean(fieldErrors.provinceId)"
          >
            <option disabled value="">{{ t('treeForm.fields.province.placeholder') }}</option>
            <option v-for="item in provinces" :key="item.id" :value="String(item.id)">
              {{ item.label }}
            </option>
          </select>
          <small v-if="fieldErrors.provinceId" class="field-error">{{ fieldErrors.provinceId }}</small>
        </div>

        <div class="field">
          <label class="form-label" for="edit-municipality">{{ t('treeForm.fields.municipality.label') }}</label>
          <input
            id="edit-municipality"
            v-model="form.municipality"
            class="form-control"
            type="text"
            maxlength="255"
            :placeholder="t('treeForm.fields.municipality.placeholder')"
          />
        </div>
      </div>

      <div class="field field-full">
        <label class="form-label" for="edit-description">{{ t('treeForm.fields.description.label') }}</label>
        <textarea
          id="edit-description"
          v-model="form.description"
          class="form-control form-textarea"
          rows="2"
          :placeholder="t('treeForm.fields.description.placeholder')"
          :aria-invalid="Boolean(fieldErrors.description)"
          maxlength="5000"
        />
        <small v-if="fieldErrors.description" class="field-error">{{ fieldErrors.description }}</small>
      </div>

      <div class="field-full tree-geo-row">
        <div class="field">
          <label class="form-label" for="edit-latitude">{{ t('treeForm.fields.latitude.label') }}</label>
          <input
            id="edit-latitude"
            v-model="form.latitude"
            class="form-control"
            type="number"
            step="any"
            min="-90"
            max="90"
            required
            :placeholder="t('treeForm.fields.latitude.placeholder')"
            :aria-invalid="Boolean(fieldErrors.latitude)"
          />
          <small v-if="fieldErrors.latitude" class="field-error">{{ fieldErrors.latitude }}</small>
        </div>

        <div class="field">
          <label class="form-label" for="edit-longitude">{{ t('treeForm.fields.longitude.label') }}</label>
          <input
            id="edit-longitude"
            v-model="form.longitude"
            class="form-control"
            type="number"
            step="any"
            min="-180"
            max="180"
            required
            :placeholder="t('treeForm.fields.longitude.placeholder')"
            :aria-invalid="Boolean(fieldErrors.longitude)"
          />
          <small v-if="fieldErrors.longitude" class="field-error">{{ fieldErrors.longitude }}</small>
        </div>

        <div class="field">
          <label class="form-label" for="edit-altitude">{{ t('treeForm.fields.altitude.label') }}</label>
          <input
            id="edit-altitude"
            v-model="form.altitude"
            class="form-control"
            type="number"
            step="any"
            :placeholder="t('treeForm.fields.altitude.placeholder')"
          />
        </div>
      </div>

      <div class="field-full actions tree-edit-actions">
        <RouterLink class="btn btn-secondary" :to="{ name: 'mis-ejemplares' }">
          {{ t('treeEdit.backToList') }}
        </RouterLink>
        <div class="tree-edit-primary-actions">
          <button
            type="button"
            class="btn btn-danger tree-edit-action-btn"
            :disabled="isSubmitting || isDeleting"
            @click="openDeleteConfirm"
          >
            {{ isDeleting ? t('treeEdit.deleting') : t('treeEdit.delete') }}
          </button>
          <button
            class="btn btn-primary tree-edit-action-btn"
            type="submit"
            :disabled="isSubmitting || isDeleting"
          >
            {{ isSubmitting ? t('treeEdit.saving') : t('treeEdit.save') }}
          </button>
        </div>
      </div>
    </form>

    <p v-if="submitError" class="error" role="alert">{{ submitError }}</p>
    <p v-if="deleteError" class="error" role="alert">{{ deleteError }}</p>

    <TreePhotoFullscreenViewer
      v-if="isFullscreenOpen && hasGalleryPhotos"
      :photos="galleryPhotos"
      :initial-index="selectedPhotoIndex"
      :title="galleryAltText"
      @close="closeFullscreen"
    />

    <MtlConfirmDialog
      v-model:open="deleteConfirmOpen"
      :title="t('treeEdit.deleteConfirm.title')"
      :message="t('treeEdit.deleteConfirm.message')"
      :cancel-label="t('treeEdit.deleteConfirm.cancel')"
      :confirm-label="t('treeEdit.deleteConfirm.confirm')"
      :confirm-danger="true"
      @confirm="onConfirmDelete"
    />

    <MtlConfirmDialog
      v-model:open="deletePhotoConfirmOpen"
      :title="t('treeEdit.gallery.deleteConfirm.title')"
      :message="t('treeEdit.gallery.deleteConfirm.message')"
      :cancel-label="t('treeEdit.gallery.deleteConfirm.cancel')"
      :confirm-label="t('treeEdit.gallery.deleteConfirm.confirm')"
      :confirm-danger="true"
      @confirm="onConfirmDeletePhoto"
    />
  </section>
</template>

<style scoped>
.species-field {
  grid-column: span 1;
}

.state-visibility-inline {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-4);
}

.tree-edit-visual-grid {
  width: 100%;
}

.tree-edit-visual-grid :deep(.tree-location-map-preview) {
  flex: 1;
  min-height: var(--tree-detail-media-h);
}

.tree-edit-location-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-4);
}

.tree-edit-actions {
  justify-content: space-between;
  align-items: center;
}

.tree-edit-actions .tree-form-submit {
  margin-left: 0;
}

.tree-edit-primary-actions {
  display: flex;
  gap: var(--space-3);
  margin-left: auto;
}

.tree-edit-action-btn {
  min-width: 9.5rem;
}

@media (max-width: 720px) {
  .species-field {
    grid-column: 1 / -1;
  }

  .state-visibility-inline {
    grid-template-columns: 1fr;
    gap: var(--space-3);
  }

  .tree-edit-location-row {
    grid-template-columns: 1fr;
    gap: var(--space-3);
  }

  .tree-edit-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .tree-edit-primary-actions {
    margin-left: 0;
    width: 100%;
  }

  .tree-edit-primary-actions .tree-edit-action-btn {
    flex: 1;
    min-width: 0;
  }
}
</style>
