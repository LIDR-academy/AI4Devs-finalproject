import { apiFetch } from '@/services/http/apiClient'

/** Alineado con OpenAPI `NotificationSubscriptionEstadoEnum` y modelo §2. */
export type EstadoSuscripcion = 'ACTIVA' | 'CANCELADA'

/** Ítem de `GET`/`PATCH` administrativo (OpenAPI `NotificationSubscriptionAdminItem`). */
export interface SubscriptionAdminItem {
  subscriptionId: number
  email: string
  estadoSuscripcion: EstadoSuscripcion
  altaEn: string
  confirmadoEn: string | null
  bajaEn: string | null
}

/** Página de listado admin (OpenAPI `NotificationSubscriptionAdminPage`). */
export interface SubscriptionAdminPage {
  content: SubscriptionAdminItem[]
  totalElements: number
  totalPages: number
  page: number
  size: number
  unpaged: boolean
  first: boolean
  last: boolean
}

export interface FetchAdminSubscriptionsQuery {
  page?: number
  size?: number
  estadoSuscripcion?: EstadoSuscripcion
  /** Coincidencia parcial en el correo (opcional); cadena vacía se omite en la petición. */
  email?: string
}

const SUBSCRIPTIONS_ADMIN_PATH = '/api/notifications/subscriptions'

/**
 * Listado paginado de suscriptores (**ADMIN**, Bearer vía {@link apiFetch}).
 * Errores: `HttpError` desde `apiClient` (mismo contrato **Problem** que el resto de la SPA).
 */
export async function fetchAdminSubscriptions(
  query: FetchAdminSubscriptionsQuery = {},
  signal?: AbortSignal,
): Promise<SubscriptionAdminPage> {
  const emailTrimmed = query.email?.trim() ?? ''
  return apiFetch<SubscriptionAdminPage>(SUBSCRIPTIONS_ADMIN_PATH, {
    query: {
      page: query.page ?? 0,
      size: query.size ?? 20,
      estadoSuscripcion: query.estadoSuscripcion,
      email: emailTrimmed === '' ? undefined : emailTrimmed,
    },
    signal,
  })
}

/**
 * Cambio de estado **ACTIVA** / **CANCELADA** (**ADMIN**). Idempotente en servidor (**200**).
 */
export async function patchAdminSubscriptionEstado(
  subscriptionId: number,
  estadoSuscripcion: EstadoSuscripcion,
  signal?: AbortSignal,
): Promise<SubscriptionAdminItem> {
  return apiFetch<SubscriptionAdminItem>(`${SUBSCRIPTIONS_ADMIN_PATH}/${subscriptionId}`, {
    method: 'PATCH',
    body: JSON.stringify({ estadoSuscripcion }),
    signal,
  })
}
