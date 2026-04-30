import { useI18n } from 'vue-i18n'
import { HttpError, NetworkError } from '@/services/http/apiClient'

export function useApiErrorMapper() {
  const { t } = useI18n()

  function toMessage(error: unknown): string {
    if (error instanceof NetworkError) {
      return t('treeForm.messages.networkError')
    }

    if (error instanceof HttpError) {
      if (error.status === 401) {
        return t('treeForm.messages.unauthorized')
      }
      if (error.status === 400) {
        return error.problem?.detail ?? t('treeForm.messages.badRequest')
      }
      if (error.status === 403) {
        return error.problem?.detail ?? t('treeForm.messages.forbidden')
      }
      return error.problem?.detail ?? t('treeForm.messages.serviceError', { status: error.status })
    }

    return t('treeForm.messages.unexpectedError')
  }

  return {
    toMessage,
  }
}
