import { useI18n } from 'vue-i18n'
import {
  mapCollaboratorCatalogError,
  type CollaboratorCatalogErrorMessages,
} from '@/services/catalog/collaboratorCatalogErrors'

export function useCollaboratorCatalogErrorMapper() {
  const { t } = useI18n()

  const messages: CollaboratorCatalogErrorMessages = {
    networkError: t('collaboratorCatalog.messages.networkError'),
    unauthorized: t('collaboratorCatalog.messages.unauthorized'),
    badRequest: t('collaboratorCatalog.messages.badRequest'),
    forbidden: t('collaboratorCatalog.messages.forbidden'),
    notFound: t('collaboratorCatalog.messages.notFound'),
    badGateway: t('collaboratorCatalog.messages.badGateway'),
    serviceError: t('collaboratorCatalog.messages.serviceError'),
    unexpectedError: t('collaboratorCatalog.messages.unexpectedError'),
  }

  function toMessage(error: unknown): string {
    return mapCollaboratorCatalogError(error, messages)
  }

  return { toMessage }
}
