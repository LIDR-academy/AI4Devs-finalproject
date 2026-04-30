<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import TreePhotoUploadPicker from '@/components/TreePhotoUploadPicker.vue'
import TreeLocationMapPreview from '@/components/TreeLocationMapPreview.vue'
import { areLatLngInValidRange } from '@/composables/createTreeFormValidation'
import { useCreateTreeForm } from '@/composables/useCreateTreeForm'

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
  submitSuccess,
  photosUploadError,
  selectedPhotoFiles,
  loadMasters,
  submit,
} = useCreateTreeForm()

const showMapMarker = computed(() => areLatLngInValidRange(form))

function onMapPickCoordinates(payload: { latitude: string; longitude: string }): void {
  form.latitude = payload.latitude
  form.longitude = payload.longitude
}

function onFirstPhotoGps(payload: { latitude: string; longitude: string }): void {
  form.latitude = payload.latitude
  form.longitude = payload.longitude
}

onMounted(async () => {
  await loadMasters()
})
</script>

<template>
  <section class="card form-card">
    <h2>{{ t('treeForm.title') }}</h2>

    <p v-if="isLoadingMasters" class="status-note">{{ t('treeForm.loadingMasters') }}</p>
    <p v-if="mastersError" class="error" role="alert">{{ mastersError }}</p>

    <form
      v-if="!isLoadingMasters && hasMasters"
      class="tree-form"
      @submit.prevent="submit"
    >
      <div class="field field-full">
        <label class="form-label" for="speciesId">{{ t('treeForm.fields.species.label') }}</label>
        <select
          id="speciesId"
          v-model="form.speciesId"
          class="form-control"
          required
          :aria-invalid="Boolean(fieldErrors.speciesId)"
        >
          <option disabled value="">{{ t('treeForm.fields.species.placeholder') }}</option>
          <option v-for="item in species" :key="item.id" :value="String(item.id)">
            {{ item.label }}
          </option>
        </select>
        <small v-if="fieldErrors.speciesId" class="field-error">{{ fieldErrors.speciesId }}</small>
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

      <div class="field field-full">
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

      <div class="field">
        <label class="form-label" for="publicationState">{{ t('treeForm.fields.publicationState.label') }}</label>
        <select id="publicationState" v-model="form.publicationState" class="form-control">
          <option v-for="item in publicationStateOptions" :key="item.value" :value="item.value">
            {{ item.label }}
          </option>
        </select>
      </div>

      <div class="field">
        <label class="form-label" for="publicMapVisibility">{{ t('treeForm.fields.publicMapVisibility.label') }}</label>
        <select id="publicMapVisibility" v-model="form.publicMapVisibility" class="form-control">
          <option v-for="item in mapVisibilityOptions" :key="item.value" :value="item.value">
            {{ item.label }}
          </option>
        </select>
      </div>

      <div class="field-full actions">
        <RouterLink class="btn btn-secondary" :to="{ name: 'home' }">
          {{ t('treeForm.backHome') }}
        </RouterLink>
        <button class="btn btn-primary tree-form-submit" type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? t('treeForm.submitting') : t('treeForm.submit') }}
        </button>
      </div>
    </form>

    <p v-if="submitError" class="error" role="alert">{{ submitError }}</p>
    <p v-if="photosUploadError" class="error" role="alert">{{ photosUploadError }}</p>
    <output v-if="submitSuccess" class="success" aria-live="polite">{{ submitSuccess }}</output>
  </section>
</template>
