<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import PageBackLink from '@/components/layout/PageBackLink.vue'
import TreePhotoUploadPicker from '@/components/TreePhotoUploadPicker.vue'
import TreeLocationMapPreview from '@/components/TreeLocationMapPreview.vue'
import { areLatLngInValidRange } from '@/composables/createTreeFormValidation'
import { useTreeLocationAutofill } from '@/composables/useTreeLocationAutofill'
import { useCreateTreeForm } from '@/composables/useCreateTreeForm'
import type { MasterListItem } from '@/types/catalog'

const { t } = useI18n()
const {
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
} = useCreateTreeForm()

const showMapMarker = computed(() => areLatLngInValidRange(form))
interface CoordinatesPayload {
  latitude: string
  longitude: string
}

const { applyCoordinatesAndAutofillAddress } = useTreeLocationAutofill({
  form,
  provinces,
})
const SPECIES_SUGGESTIONS_BLUR_DELAY_MS = 120

function normalizeAutocompleteValue(value: string): string {
  return value
    .trim()
    .normalize('NFD')
    .replaceAll(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

const speciesAutocompleteText = ref('')
const showSpeciesSuggestions = ref(false)
const speciesHighlightIndex = ref(-1)

const normalizedSpecies = computed(() =>
  species.value.map((item) => ({
    item,
    normalizedLabel: normalizeAutocompleteValue(item.label),
  })),
)

const filteredSpecies = computed(() => {
  const normalizedInput = normalizeAutocompleteValue(speciesAutocompleteText.value)
  if (!normalizedInput) {
    return species.value
  }
  return normalizedSpecies.value
    .filter((entry) => entry.normalizedLabel.includes(normalizedInput))
    .map((entry) => entry.item)
})

function resetSpeciesSuggestions(): void {
  showSpeciesSuggestions.value = false
  speciesHighlightIndex.value = -1
}

function applySpeciesSelection(item: MasterListItem | null): void {
  form.speciesId = item ? String(item.id) : ''
}

function findSpeciesByExactLabel(inputValue: string): MasterListItem | null {
  const normalizedInput = normalizeAutocompleteValue(inputValue)
  if (!normalizedInput) {
    return null
  }
  const found = normalizedSpecies.value.find((entry) => entry.normalizedLabel === normalizedInput)
  return found?.item ?? null
}

function onSpeciesInput(event: Event): void {
  const input = event.target as HTMLInputElement
  speciesAutocompleteText.value = input.value
  applySpeciesSelection(findSpeciesByExactLabel(input.value))
  showSpeciesSuggestions.value = true
  speciesHighlightIndex.value = -1
}

function onSpeciesFocus(): void {
  showSpeciesSuggestions.value = true
}

function onSpeciesBlur(): void {
  // Permite que el click sobre una sugerencia se procese antes de ocultar la lista.
  setTimeout(() => {
    resetSpeciesSuggestions()
  }, SPECIES_SUGGESTIONS_BLUR_DELAY_MS)
}

function selectSpecies(item: { id: number; label: string }): void {
  speciesAutocompleteText.value = item.label
  applySpeciesSelection(item)
  resetSpeciesSuggestions()
}

function highlightNextSpecies(): void {
  if (filteredSpecies.value.length === 0) {
    return
  }
  showSpeciesSuggestions.value = true
  speciesHighlightIndex.value =
    speciesHighlightIndex.value >= filteredSpecies.value.length - 1
      ? 0
      : speciesHighlightIndex.value + 1
}

function highlightPreviousSpecies(): void {
  if (filteredSpecies.value.length === 0) {
    return
  }
  showSpeciesSuggestions.value = true
  speciesHighlightIndex.value =
    speciesHighlightIndex.value <= 0
      ? filteredSpecies.value.length - 1
      : speciesHighlightIndex.value - 1
}

function confirmHighlightedSpecies(): void {
  if (speciesHighlightIndex.value < 0) {
    return
  }
  const highlighted = filteredSpecies.value[speciesHighlightIndex.value]
  if (highlighted) {
    selectSpecies(highlighted)
  }
}

function dismissSpeciesSuggestions(): void {
  resetSpeciesSuggestions()
}

function onMapPickCoordinates(payload: CoordinatesPayload): void {
  void applyCoordinatesAndAutofillAddress(payload)
}

function onFirstPhotoGps(payload: CoordinatesPayload): void {
  void applyCoordinatesAndAutofillAddress(payload)
}

onMounted(async () => {
  await loadMasters()
  const selected = species.value.find((item) => String(item.id) === form.speciesId)
  speciesAutocompleteText.value = selected?.label ?? ''
})
</script>

<template>
  <div class="tree-form-page">
    <header class="page-header tree-form-page__header">
      <PageBackLink :to="{ name: 'home' }">{{ t('navigation.home') }}</PageBackLink>
      <h1 class="page-header__title">{{ t('treeForm.title') }}</h1>
      <p class="page-header__description">{{ t('treeForm.description') }}</p>
    </header>

    <p v-if="isLoadingMasters" class="status-note">{{ t('treeForm.loadingMasters') }}</p>
    <p v-if="mastersError" class="error" role="alert">{{ mastersError }}</p>

    <form
      v-if="!isLoadingMasters && hasMasters"
      class="tree-form"
      @submit.prevent="submit"
    >
      <div class="field-full tree-form-species-status-row">
        <div class="field species-field">
          <label class="form-label" for="speciesId">{{ t('treeForm.fields.species.label') }}</label>
          <div class="species-autocomplete">
            <input
              id="speciesId"
              :value="speciesAutocompleteText"
              class="form-control"
              type="text"
              required
              :placeholder="t('treeForm.fields.species.placeholder')"
              :aria-invalid="Boolean(fieldErrors.speciesId)"
              autocomplete="off"
              @input="onSpeciesInput"
              @keydown.down.prevent="highlightNextSpecies"
              @keydown.up.prevent="highlightPreviousSpecies"
              @keydown.page-down.prevent="highlightNextSpecies"
              @keydown.page-up.prevent="highlightPreviousSpecies"
              @keydown.enter.prevent="confirmHighlightedSpecies"
              @keydown.esc.prevent="dismissSpeciesSuggestions"
              @focus="onSpeciesFocus"
              @blur="onSpeciesBlur"
            />
            <ul
              v-if="showSpeciesSuggestions && filteredSpecies.length > 0"
              class="species-autocomplete-list"
            >
              <li
                v-for="(item, index) in filteredSpecies"
                :key="item.id"
                class="species-autocomplete-item"
                :class="{ 'species-autocomplete-item-active': speciesHighlightIndex === index }"
                @mousedown.prevent="selectSpecies(item)"
              >
                {{ item.label }}
              </li>
            </ul>
          </div>
          <small v-if="fieldErrors.speciesId" class="field-error">{{ fieldErrors.speciesId }}</small>
        </div>

        <div class="field">
          <label class="form-label" for="publicationState">{{
            t('treeForm.fields.publicationState.label')
          }}</label>
          <select id="publicationState" v-model="form.publicationState" class="form-control">
            <option v-for="item in publicationStateOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </option>
          </select>
        </div>

        <div class="field">
          <label class="form-label" for="publicMapVisibility">{{
            t('treeForm.fields.publicMapVisibility.label')
          }}</label>
          <select id="publicMapVisibility" v-model="form.publicMapVisibility" class="form-control">
            <option v-for="item in mapVisibilityOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </option>
          </select>
        </div>
      </div>

      <div class="field field-full">
        <TreePhotoUploadPicker v-model="selectedPhotoFiles" @first-photo-gps="onFirstPhotoGps" />
      </div>

      <div class="field field-full">
        <TreeLocationMapPreview
          :latitude="form.latitude"
          :longitude="form.longitude"
          :show-marker="showMapMarker"
          @pick-coordinates="onMapPickCoordinates"
        />
      </div>

      <div class="field-full tree-form-location-row">
        <div class="field">
          <label class="form-label" for="provinceId">{{ t('treeForm.fields.province.label') }}</label>
          <select
            id="provinceId"
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
          <label class="form-label" for="municipality">{{ t('treeForm.fields.municipality.label') }}</label>
          <input
            id="municipality"
            v-model="form.municipality"
            class="form-control"
            type="text"
            maxlength="255"
            :placeholder="t('treeForm.fields.municipality.placeholder')"
          />
        </div>
      </div>

      <div class="field field-full tree-form-field-block">
        <label class="form-label" for="description">{{ t('treeForm.fields.description.label') }}</label>
        <textarea
          id="description"
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
          <label class="form-label" for="latitude">{{ t('treeForm.fields.latitude.label') }}</label>
          <input
            id="latitude"
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
          <label class="form-label" for="longitude">{{ t('treeForm.fields.longitude.label') }}</label>
          <input
            id="longitude"
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
          <label class="form-label" for="altitude">{{ t('treeForm.fields.altitude.label') }}</label>
          <input
            id="altitude"
            v-model="form.altitude"
            class="form-control"
            type="number"
            step="any"
            :placeholder="t('treeForm.fields.altitude.placeholder')"
          />
        </div>
      </div>

      <p v-if="submitError" class="error field-full" role="alert">{{ submitError }}</p>

      <div class="field-full actions page-actions-footer">
        <RouterLink class="btn btn-secondary" :to="{ name: 'home' }">
          {{ t('navigation.home') }}
        </RouterLink>
        <button class="btn btn-primary tree-form-submit" type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? t('treeForm.submitting') : t('treeForm.submit') }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.species-autocomplete {
  position: relative;
  width: 100%;
}

.species-autocomplete > .form-control {
  display: block;
  width: 100%;
}

.species-autocomplete-list {
  position: absolute;
  z-index: 10;
  width: 100%;
  margin: 0;
  margin-top: 0.25rem;
  padding: 0.25rem 0;
  list-style: none;
  background: #fff;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  max-height: 14rem;
  overflow-y: auto;
  box-shadow: 0 8px 24px rgba(16, 24, 40, 0.12);
}

.species-autocomplete-item {
  padding: 0.45rem 0.7rem;
  cursor: pointer;
}

.species-autocomplete-item:hover {
  background: var(--bg-soft);
}

.species-autocomplete-item-active {
  background: var(--bg-soft);
}

</style>
