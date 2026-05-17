import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { HttpError, NetworkError } from '@/services/http/apiClient'
import { registerPublicSubscriptionByEmail } from '@/services/notifications/publicSubscription'
import { classifyPublicSubscriptionConflictDetail } from '@/services/notifications/subscriptionConflictDetail'

type SubscriptionMessagesT = (key: string, values?: Record<string, string | number>) => string

function mapHttpErrorToMessage(error: HttpError, t: SubscriptionMessagesT): string {
  if (error.status === 409) {
    const kind = classifyPublicSubscriptionConflictDetail(error.problem?.detail)
    if (kind === 'already_active') {
      return t('subscriptionNew.errors.conflictAlreadyActive')
    }
    if (kind === 'cancelled') {
      return t('subscriptionNew.errors.conflictCancelled')
    }
    const detail409 = error.problem?.detail?.trim()
    return detail409 && detail409.length > 0 ? detail409 : t('subscriptionNew.errors.conflictGeneric')
  }
  if (error.status === 400) {
    const detail400 = error.problem?.detail?.trim()
    return detail400 && detail400.length > 0 ? detail400 : t('subscriptionNew.errors.badRequest')
  }
  return t('subscriptionNew.errors.serviceError', { status: error.status })
}

function mapSubmitError(error: unknown, t: SubscriptionMessagesT): string {
  if (error instanceof HttpError) {
    return mapHttpErrorToMessage(error, t)
  }
  if (error instanceof NetworkError) {
    return t('subscriptionNew.errors.network')
  }
  return t('subscriptionNew.errors.unexpected')
}

export function usePublicSubscriptionForm() {
  const { t } = useI18n()
  const email = ref('')
  const isSubmitting = ref(false)
  const successEmail = ref<string | null>(null)
  const errorMessage = ref<string | null>(null)

  function clearStatus(): void {
    successEmail.value = null
    errorMessage.value = null
  }

  async function submit(): Promise<void> {
    clearStatus()
    const trimmed = email.value.trim()
    if (!trimmed) {
      errorMessage.value = t('subscriptionNew.errors.emailRequired')
      return
    }

    isSubmitting.value = true
    try {
      const body = await registerPublicSubscriptionByEmail(trimmed)
      successEmail.value = body.email
    } catch (error: unknown) {
      errorMessage.value = mapSubmitError(error, t)
    } finally {
      isSubmitting.value = false
    }
  }

  function resetForm(): void {
    email.value = ''
    clearStatus()
  }

  return {
    email,
    isSubmitting,
    successEmail,
    errorMessage,
    submit,
    resetForm,
    clearStatus,
  }
}
