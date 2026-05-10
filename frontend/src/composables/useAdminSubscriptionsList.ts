import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  fetchAdminSubscriptions,
  patchAdminSubscriptionEstado,
  type EstadoSuscripcion,
  type SubscriptionAdminItem,
} from '@/services/notifications/adminSubscriptions'
import { HttpError, NetworkError } from '@/services/http/apiClient'

const PAGE_SIZE = 20

export function useAdminSubscriptionsList() {
  const { t } = useI18n()

  const page = ref(0)
  const size = ref(PAGE_SIZE)
  /** Valor del `<select>`: cadena vacía o literal de estado. */
  const filterEstado = ref('')
  /** Texto libre del correo (coincidencia parcial en servidor). */
  const filterEmail = ref('')

  const isLoading = ref(false)
  const errorMessage = ref('')
  const statusMessage = ref('')

  const items = ref<SubscriptionAdminItem[]>([])
  const totalElements = ref(0)
  const totalPages = ref(0)
  const first = ref(true)
  const last = ref(true)

  const patchingId = ref<number | null>(null)

  const hasPrevious = computed(() => !first.value)
  const hasNext = computed(() => !last.value)
  const hasRows = computed(() => items.value.length > 0)

  function mapLoadError(error: unknown): string {
    if (error instanceof NetworkError) {
      return t('adminSubscriptions.messages.network')
    }
    if (error instanceof HttpError) {
      if (error.status === 400) {
        return t('adminSubscriptions.messages.badRequest')
      }
      if (error.status === 401) {
        return t('adminSubscriptions.messages.unauthorized')
      }
      if (error.status === 403) {
        return t('adminSubscriptions.messages.forbidden')
      }
      if (error.status === 404) {
        return t('adminSubscriptions.messages.notFound')
      }
      if (error.status === 502 || error.status === 503) {
        return t('adminSubscriptions.messages.badGateway')
      }
      return t('adminSubscriptions.messages.serviceError', { status: error.status })
    }
    return t('adminSubscriptions.messages.unexpected')
  }

  function mapPatchError(error: unknown): string {
    if (error instanceof NetworkError) {
      return t('adminSubscriptions.messages.network')
    }
    if (error instanceof HttpError) {
      if (error.status === 400) {
        return t('adminSubscriptions.messages.badRequest')
      }
      if (error.status === 401) {
        return t('adminSubscriptions.messages.unauthorized')
      }
      if (error.status === 403) {
        return t('adminSubscriptions.messages.forbidden')
      }
      if (error.status === 404) {
        return t('adminSubscriptions.messages.patchNotFound')
      }
      return t('adminSubscriptions.messages.serviceError', { status: error.status })
    }
    return t('adminSubscriptions.messages.unexpected')
  }

  async function load(signal?: AbortSignal): Promise<void> {
    isLoading.value = true
    errorMessage.value = ''
    try {
      const emailTrimmed = filterEmail.value.trim()
      const res = await fetchAdminSubscriptions(
        {
          page: page.value,
          size: size.value,
          estadoSuscripcion:
            filterEstado.value === '' ? undefined : (filterEstado.value as EstadoSuscripcion),
          email: emailTrimmed === '' ? undefined : emailTrimmed,
        },
        signal,
      )
      items.value = res.content
      totalElements.value = Number(res.totalElements)
      totalPages.value = Math.max(0, res.totalPages)
      first.value = res.first
      last.value = res.last
    } catch (error: unknown) {
      items.value = []
      totalElements.value = 0
      totalPages.value = 0
      first.value = true
      last.value = true
      errorMessage.value = mapLoadError(error)
    } finally {
      isLoading.value = false
    }
  }

  async function applyFilter(): Promise<void> {
    statusMessage.value = ''
    page.value = 0
    await load()
  }

  async function goPrevious(): Promise<void> {
    if (!hasPrevious.value) {
      return
    }
    page.value -= 1
    await load()
  }

  async function goNext(): Promise<void> {
    if (!hasNext.value) {
      return
    }
    page.value += 1
    await load()
  }

  async function setEstado(subscriptionId: number, estado: EstadoSuscripcion): Promise<void> {
    patchingId.value = subscriptionId
    errorMessage.value = ''
    try {
      await patchAdminSubscriptionEstado(subscriptionId, estado)
      statusMessage.value = t('adminSubscriptions.messages.patchSuccess')
      await load()
    } catch (error: unknown) {
      errorMessage.value = mapPatchError(error)
    } finally {
      patchingId.value = null
    }
  }

  return {
    page,
    size,
    filterEstado,
    filterEmail,
    isLoading,
    errorMessage,
    statusMessage,
    items,
    totalElements,
    totalPages,
    first,
    last,
    patchingId,
    hasPrevious,
    hasNext,
    hasRows,
    load,
    applyFilter,
    goPrevious,
    goNext,
    setEstado,
  }
}
