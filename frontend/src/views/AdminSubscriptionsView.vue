<script setup lang="ts">
import { computed, onMounted, ref, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import MtlConfirmDialog from '@/components/MtlConfirmDialog.vue'
import { useAdminSubscriptionsList } from '@/composables/useAdminSubscriptionsList'
import type { EstadoSuscripcion, SubscriptionAdminItem } from '@/services/notifications/adminSubscriptions'

type SubscriptionConfirmKind = 'cancel' | 'reactivate'

const route = useRoute()
const { t } = useI18n()

const pageTitleKey = computed(() => {
  const metaTitle = route.meta.pageTitleKey
  return typeof metaTitle === 'string' ? metaTitle : 'adminSubscriptions.title'
})

const {
  page,
  filterEstado,
  filterEmail,
  isLoading,
  errorMessage,
  statusMessage,
  items,
  totalElements,
  totalPages,
  patchingId,
  hasPrevious,
  hasNext,
  hasRows,
  load,
  applyFilter,
  goPrevious,
  goNext,
  setEstado,
} = useAdminSubscriptionsList()

const confirmOpen = ref(false)
const confirmKind = ref<SubscriptionConfirmKind>('cancel')
const confirmRow = shallowRef<SubscriptionAdminItem | null>(null)

const confirmTitle = computed(() =>
  confirmKind.value === 'cancel'
    ? t('adminSubscriptions.modal.titleCancel')
    : t('adminSubscriptions.modal.titleReactivate'),
)

const confirmMessage = computed(() => {
  const row = confirmRow.value
  if (!row) {
    return ''
  }
  return confirmKind.value === 'cancel'
    ? t('adminSubscriptions.confirmCancel', { email: row.email })
    : t('adminSubscriptions.confirmReactivate', { email: row.email })
})

const confirmDanger = computed(() => confirmKind.value === 'cancel')

const confirmActionLabel = computed(() =>
  confirmKind.value === 'cancel'
    ? t('adminSubscriptions.modal.confirmCancel')
    : t('adminSubscriptions.modal.confirmReactivate'),
)

const isListStateOk = computed(() => !isLoading.value && !errorMessage.value)

onMounted(() => {
  void load()
})

const displayTotalPages = computed(() => Math.max(1, totalPages.value || 1))
const displayCurrentPage = computed(() => page.value + 1)

function estadoLabel(code: EstadoSuscripcion | string): string {
  if (code === 'ACTIVA') {
    return t('adminSubscriptions.estado.ACTIVA')
  }
  if (code === 'CANCELADA') {
    return t('adminSubscriptions.estado.CANCELADA')
  }
  return code
}

function formatDate(iso: string | null): string {
  if (!iso) {
    return '—'
  }
  try {
    return new Date(iso).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })
  } catch {
    return iso
  }
}

async function clearFilter(): Promise<void> {
  filterEstado.value = ''
  filterEmail.value = ''
  await applyFilter()
}

function onCancel(row: SubscriptionAdminItem): void {
  confirmRow.value = row
  confirmKind.value = 'cancel'
  confirmOpen.value = true
}

function onReactivate(row: SubscriptionAdminItem): void {
  confirmRow.value = row
  confirmKind.value = 'reactivate'
  confirmOpen.value = true
}

function onConfirmModal(): void {
  const row = confirmRow.value
  if (!row) {
    return
  }
  const kind = confirmKind.value
  confirmRow.value = null
  if (kind === 'cancel') {
    void setEstado(row.subscriptionId, 'CANCELADA')
  } else {
    void setEstado(row.subscriptionId, 'ACTIVA')
  }
}

function onDismissModal(): void {
  confirmRow.value = null
}
</script>

<template>
  <section class="card trees-list-card admin-subscriptions">
    <div class="trees-list-header">
      <div class="trees-list-heading">
        <h2>{{ t(pageTitleKey) }}</h2>
        <p class="muted">{{ t('adminSubscriptions.intro') }}</p>
      </div>

      <form class="trees-list-filters" @submit.prevent="applyFilter">
        <div class="trees-filter-panel">
          <div class="trees-filter-grid admin-subscriptions-filter-grid">
            <div class="filter-field">
              <label class="form-label trees-filter-label" for="admin-sub-filter-email">{{
                t('adminSubscriptions.filters.email.label')
              }}</label>
              <input
                id="admin-sub-filter-email"
                v-model="filterEmail"
                class="form-control trees-filter-control"
                type="search"
                autocomplete="off"
                :placeholder="t('adminSubscriptions.filters.email.placeholder')"
              />
            </div>
            <div class="filter-field">
              <label class="form-label trees-filter-label" for="admin-sub-filter-estado">{{
                t('adminSubscriptions.filters.estado.label')
              }}</label>
              <select
                id="admin-sub-filter-estado"
                v-model="filterEstado"
                class="form-control trees-filter-control"
              >
                <option value="">{{ t('adminSubscriptions.filters.estado.all') }}</option>
                <option value="ACTIVA">{{ t('adminSubscriptions.filters.estado.activa') }}</option>
                <option value="CANCELADA">{{ t('adminSubscriptions.filters.estado.cancelada') }}</option>
              </select>
            </div>
          </div>

          <div class="trees-filter-actions">
            <button
              type="button"
              class="btn btn-secondary btn-sm trees-filter-btn"
              :disabled="isLoading"
              @click="clearFilter"
            >
              {{ t('adminSubscriptions.filters.clear') }}
            </button>
            <button
              type="submit"
              class="btn btn-primary btn-sm trees-filter-btn trees-filter-btn-submit"
              :disabled="isLoading"
            >
              {{ t('adminSubscriptions.filters.apply') }}
            </button>
          </div>
        </div>
      </form>
    </div>

    <output v-if="statusMessage" class="success field-full" aria-live="polite">{{ statusMessage }}</output>

    <p v-if="isLoading" class="status-note">{{ t('adminSubscriptions.loading') }}</p>
    <p v-else-if="errorMessage" class="error" role="alert">{{ errorMessage }}</p>

    <template v-else-if="isListStateOk">
      <p class="trees-list-results-count muted">
        {{ t('adminSubscriptions.resultsCount', { count: totalElements }) }}
      </p>

      <p v-if="!hasRows" class="status-note">{{ t('adminSubscriptions.empty') }}</p>

      <div v-else class="mtl-admin-table-wrap">
        <table class="mtl-admin-table" :aria-label="t('adminSubscriptions.title')">
          <thead>
            <tr>
              <th scope="col">{{ t('adminSubscriptions.fields.email') }}</th>
              <th scope="col">{{ t('adminSubscriptions.fields.estado') }}</th>
              <th scope="col">{{ t('adminSubscriptions.fields.altaEn') }}</th>
              <th scope="col">{{ t('adminSubscriptions.fields.confirmadoEn') }}</th>
              <th scope="col">{{ t('adminSubscriptions.fields.bajaEn') }}</th>
              <th scope="col">{{ t('adminSubscriptions.fields.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in items" :key="row.subscriptionId">
              <td>{{ row.email }}</td>
              <td>{{ estadoLabel(row.estadoSuscripcion) }}</td>
              <td>{{ formatDate(row.altaEn) }}</td>
              <td>{{ formatDate(row.confirmadoEn) }}</td>
              <td>{{ formatDate(row.bajaEn) }}</td>
              <td class="mtl-admin-table__actions">
                <button
                  v-if="row.estadoSuscripcion === 'ACTIVA'"
                  type="button"
                  class="btn btn-danger btn-sm trees-filter-btn"
                  :disabled="patchingId !== null"
                  @click="onCancel(row)"
                >
                  {{ t('adminSubscriptions.actions.cancel') }}
                </button>
                <button
                  v-else
                  type="button"
                  class="btn btn-primary btn-sm trees-filter-btn"
                  :disabled="patchingId !== null"
                  @click="onReactivate(row)"
                >
                  {{ t('adminSubscriptions.actions.reactivate') }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <nav v-if="hasRows" class="trees-pagination" :aria-label="t('adminSubscriptions.pagination.navLabel')">
        <button
          class="btn trees-pagination-btn trees-pagination-btn--prev"
          type="button"
          :disabled="!hasPrevious || isLoading"
          @click="goPrevious()"
        >
          {{ t('adminSubscriptions.pagination.previous') }}
        </button>
        <span class="trees-pagination-status">
          {{
            t('adminSubscriptions.pagination.pageStatus', {
              current: displayCurrentPage,
              total: displayTotalPages,
            })
          }}
        </span>
        <button
          class="btn trees-pagination-btn trees-pagination-btn--next"
          type="button"
          :disabled="!hasNext || isLoading"
          @click="goNext()"
        >
          {{ t('adminSubscriptions.pagination.next') }}
        </button>
      </nav>
    </template>

    <MtlConfirmDialog
      v-model:open="confirmOpen"
      :title="confirmTitle"
      :message="confirmMessage"
      :cancel-label="t('common.cancel')"
      :confirm-label="confirmActionLabel"
      :confirm-danger="confirmDanger"
      @confirm="onConfirmModal"
      @cancel="onDismissModal"
    />
  </section>
</template>

<style scoped>
/* Correo y estado: mitad del ancho disponible cada uno (sobrescribe la rejilla de 3 columnas del listado de árboles). */
.trees-filter-grid.admin-subscriptions-filter-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
</style>
