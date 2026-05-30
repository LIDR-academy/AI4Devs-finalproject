<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import MtlConfirmDialog from '@/components/MtlConfirmDialog.vue'
import MtlFormDialog from '@/components/MtlFormDialog.vue'
import PageBackLink from '@/components/layout/PageBackLink.vue'
import { useAdminTaxonomyMasters } from '@/composables/useAdminTaxonomyMasters'

const route = useRoute()
const { t } = useI18n()

const pageTitleKey = computed(() => {
  const metaTitle = route.meta.pageTitleKey
  return typeof metaTitle === 'string' ? metaTitle : 'adminMasters.title'
})

const {
  isLoading,
  isSpeciesListLoading,
  errorMessage,
  statusMessage,
  speciesList,
  generaList,
  familiesList,
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
  speciesPage,
  reloadAll,
  goPreviousSpeciesPage,
  goNextSpeciesPage,
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
} = useAdminTaxonomyMasters()

const displayTotalPages = computed(() => Math.max(1, speciesTotalPages.value || 1))
const displayCurrentPage = computed(() => speciesPage.value + 1)
const isSpeciesListReady = computed(() => !isSpeciesListLoading.value)

const speciesModalTitle = computed(() =>
  editingSpeciesId.value != null
    ? t('adminMasters.form.editTitle')
    : t('adminMasters.form.createTitle'),
)

onMounted(() => {
  void reloadAll()
})
</script>

<template>
  <div class="catalog-page admin-masters-page">
    <header class="page-header">
      <PageBackLink :to="{ name: 'home' }">{{ t('navigation.home') }}</PageBackLink>
      <h1 class="page-header__title">{{ t(pageTitleKey) }}</h1>
      <p class="page-header__description">{{ t('adminMasters.description') }}</p>
    </header>

    <p v-if="isLoading" class="status-note">{{ t('adminMasters.loading') }}</p>
    <p v-if="errorMessage" class="error" role="alert">{{ errorMessage }}</p>
    <output v-if="statusMessage" class="success tree-form-page__flash" aria-live="polite">{{
      statusMessage
    }}</output>

    <div v-if="!isLoading" class="admin-masters-layout">
      <h2 class="tree-detail-panel__title admin-masters-section-title">{{ t('adminMasters.listTitle') }}</h2>

      <p v-if="isSpeciesListLoading" class="status-note">{{ t('adminMasters.loadingSpecies') }}</p>

      <template v-else-if="isSpeciesListReady">
        <div class="mtl-admin-list-toolbar">
          <p class="catalog-results-count muted">
            {{ t('adminMasters.resultsCount', { count: speciesTotalElements }) }}
          </p>
          <div class="mtl-admin-list-toolbar__actions">
            <button
              type="button"
              class="btn btn-primary btn-sm"
              @click="openCreateSpecies"
            >
              {{ t('adminMasters.actions.create') }}
            </button>
          </div>
        </div>

        <p v-if="!hasSpeciesRows && !errorMessage" class="status-note">{{ t('adminMasters.emptyList') }}</p>

        <div v-else-if="hasSpeciesRows" class="catalog-toolbar__panel admin-masters-table-panel">
          <div class="mtl-admin-table-wrap">
            <table class="mtl-admin-table" :aria-label="t('adminMasters.listTitle')">
              <thead>
                <tr>
                  <th scope="col">{{ t('adminMasters.columns.species') }}</th>
                  <th scope="col">{{ t('adminMasters.columns.actions') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in speciesList" :key="item.id">
                  <td>{{ item.label }}</td>
                  <td class="mtl-admin-table__actions">
                    <button
                      type="button"
                      class="btn btn-primary btn-sm"
                      :disabled="editingSpeciesIdLoading === item.id || isDeleting"
                      @click="startEdit(item)"
                    >
                      {{ t('adminMasters.actions.edit') }}
                    </button>
                    <button
                      type="button"
                      class="btn btn-danger btn-sm"
                      :disabled="isDeleting"
                      @click="askDelete(item)"
                    >
                      {{ t('adminMasters.actions.delete') }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <nav
          v-if="hasSpeciesRows"
          class="catalog-pagination"
          :aria-label="t('adminMasters.pagination.navLabel')"
        >
          <button
            class="btn btn-secondary btn-sm"
            type="button"
            :disabled="!hasSpeciesPrevious || isSpeciesListLoading"
            @click="goPreviousSpeciesPage()"
          >
            {{ t('adminMasters.pagination.previous') }}
          </button>
          <span class="catalog-pagination__status">
            {{
              t('adminMasters.pagination.pageStatus', {
                current: displayCurrentPage,
                total: displayTotalPages,
              })
            }}
          </span>
          <button
            class="btn btn-secondary btn-sm"
            type="button"
            :disabled="!hasSpeciesNext || isSpeciesListLoading"
            @click="goNextSpeciesPage()"
          >
            {{ t('adminMasters.pagination.next') }}
          </button>
        </nav>
      </template>
    </div>

    <MtlFormDialog
      v-model:open="showSpeciesModal"
      stack="species"
      form-id="admin-masters-form"
      :title="speciesModalTitle"
      :cancel-label="t('adminMasters.actions.back')"
      :submit-label="t('adminMasters.actions.save')"
      :form-error="speciesFormError"
      :submit-disabled="isSavingSpecies"
      @cancel="closeSpeciesModal"
      @submit="submitSpecies"
    >
      <template #default="{ fieldA11y }">
        <div class="field">
          <label class="form-label" for="admin-species-genus">{{ t('adminMasters.form.genus') }}</label>
          <div class="admin-masters-combo-row">
            <select
              id="admin-species-genus"
              v-model="formGenusId"
              v-bind="fieldA11y"
              class="form-control"
              required
            >
              <option disabled value="">{{ t('adminMasters.form.selectGenus') }}</option>
              <option v-for="g in generaList" :key="g.id" :value="g.id">{{ g.label }}</option>
            </select>
            <button
              type="button"
              class="btn btn-secondary btn-sm"
              :title="t('adminMasters.form.addGenus')"
              :aria-label="t('adminMasters.form.addGenus')"
              @click="openGenusModal"
            >
              +
            </button>
          </div>
        </div>

        <div class="field">
          <label class="form-label" for="admin-species-scientific">{{ t('adminMasters.form.scientificName') }}</label>
          <input
            id="admin-species-scientific"
            v-model="formScientificName"
            v-bind="fieldA11y"
            class="form-control"
            type="text"
            maxlength="255"
            required
          />
        </div>

        <div class="field">
          <label class="form-label" for="admin-species-common">{{ t('adminMasters.form.commonName') }}</label>
          <input
            id="admin-species-common"
            v-model="formCommonName"
            v-bind="fieldA11y"
            class="form-control"
            type="text"
            maxlength="255"
          />
        </div>
      </template>
    </MtlFormDialog>

    <MtlFormDialog
      v-model:open="showGenusModal"
      stack="genus"
      :title="t('adminMasters.modals.genusTitle')"
      :cancel-label="t('adminMasters.actions.cancel')"
      :submit-label="t('adminMasters.actions.create')"
      :form-error="genusFormError"
      :submit-disabled="isSavingGenus"
      @cancel="closeGenusModal"
      @submit="submitGenusModal"
    >
      <template #default="{ fieldA11y }">
        <div class="field">
          <label class="form-label" for="admin-genus-family">{{ t('adminMasters.form.family') }}</label>
          <div class="admin-masters-combo-row">
            <select
              id="admin-genus-family"
              v-model="genusModalFamilyId"
              v-bind="fieldA11y"
              class="form-control"
              required
            >
              <option disabled value="">{{ t('adminMasters.form.selectFamily') }}</option>
              <option v-for="f in familiesList" :key="f.id" :value="f.id">{{ f.label }}</option>
            </select>
            <button
              type="button"
              class="btn btn-secondary btn-sm"
              :title="t('adminMasters.form.addFamily')"
              :aria-label="t('adminMasters.form.addFamily')"
              @click="openFamilyModal"
            >
              +
            </button>
          </div>
        </div>

        <div class="field">
          <label class="form-label" for="admin-genus-scientific">{{ t('adminMasters.form.scientificName') }}</label>
          <input
            id="admin-genus-scientific"
            v-model="genusModalScientific"
            v-bind="fieldA11y"
            class="form-control"
            type="text"
            maxlength="255"
            required
          />
        </div>

        <div class="field">
          <label class="form-label" for="admin-genus-common">{{ t('adminMasters.form.commonName') }}</label>
          <input
            id="admin-genus-common"
            v-model="genusModalCommon"
            v-bind="fieldA11y"
            class="form-control"
            type="text"
            maxlength="255"
          />
        </div>
      </template>
    </MtlFormDialog>

    <MtlFormDialog
      v-model:open="showFamilyModal"
      stack="family"
      :title="t('adminMasters.modals.familyTitle')"
      :cancel-label="t('adminMasters.actions.cancel')"
      :submit-label="t('adminMasters.actions.create')"
      :form-error="familyFormError"
      :submit-disabled="isSavingFamily"
      @cancel="closeFamilyModal"
      @submit="submitFamilyModal"
    >
      <template #default="{ fieldA11y }">
        <div class="field">
          <label class="form-label" for="admin-family-scientific">{{ t('adminMasters.form.scientificName') }}</label>
          <input
            id="admin-family-scientific"
            v-model="familyModalScientific"
            v-bind="fieldA11y"
            class="form-control"
            type="text"
            maxlength="255"
            required
          />
        </div>

        <div class="field">
          <label class="form-label" for="admin-family-common">{{ t('adminMasters.form.commonName') }}</label>
          <input
            id="admin-family-common"
            v-model="familyModalCommon"
            v-bind="fieldA11y"
            class="form-control"
            type="text"
            maxlength="255"
          />
        </div>
      </template>
    </MtlFormDialog>

    <MtlConfirmDialog
      v-model:open="confirmDeleteOpen"
      :title="t('adminMasters.modal.deleteTitle')"
      :message="t('adminMasters.modal.deleteMessage', { label: deleteTarget?.label ?? '' })"
      :cancel-label="t('common.cancel')"
      :confirm-label="t('adminMasters.actions.delete')"
      :confirm-danger="true"
      @confirm="confirmDelete"
    />
  </div>
</template>
