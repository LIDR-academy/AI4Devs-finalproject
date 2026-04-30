import { authService } from '@/services/auth/oidc'
import { appConfig } from '@/services/config'
import type { ProblemDetails } from '@/types/api'

type QueryPrimitive = string | number | boolean
type QueryValue = QueryPrimitive | null | undefined | Array<QueryPrimitive | null | undefined>

export interface ApiFetchOptions extends RequestInit {
  query?: Record<string, QueryValue>
}

export class HttpError extends Error {
  status: number
  problem?: ProblemDetails

  constructor(status: number, problem?: ProblemDetails, message?: string) {
    super(message ?? `HTTP_ERROR_${status}`)
    this.name = 'HttpError'
    this.status = status
    this.problem = problem
  }
}

export class NetworkError extends Error {
  constructor(message = 'NETWORK_ERROR') {
    super(message)
    this.name = 'NetworkError'
  }
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

function appendArrayQueryParam(searchParams: URLSearchParams, key: string, values: Array<QueryPrimitive | null | undefined>): void {
  searchParams.delete(key)
  for (const value of values) {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value))
    }
  }
}

function applyQueryParams(searchParams: URLSearchParams, query: Record<string, QueryValue>): void {
  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value)) {
      appendArrayQueryParam(searchParams, key, value)
      continue
    }

    if (value === undefined || value === null) {
      searchParams.delete(key)
      continue
    }

    searchParams.set(key, String(value))
  }
}

function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  const [pathWithoutQuery, existingQuery = ''] = path.split('?')
  const searchParams = new URLSearchParams(existingQuery)

  if (query) {
    applyQueryParams(searchParams, query)
  }

  const queryString = searchParams.toString()
  const querySuffix = queryString ? `?${queryString}` : ''
  return `${appConfig.api.gatewayBaseUrl}${pathWithoutQuery}${querySuffix}`
}

function buildHeaders(init: ApiFetchOptions, token: string | null): Headers {
  const headers = new Headers(init.headers)
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json')
  }
  if (init.body !== undefined && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  return headers
}

async function parseProblem(response: Response): Promise<ProblemDetails | undefined> {
  try {
    return (await response.json()) as ProblemDetails
  } catch {
    return undefined
  }
}

async function requestWithAuthRetry<T>(path: string, init: ApiFetchOptions, hasRetried401: boolean): Promise<T> {
  const user = await authService.getUser()
  const token = authService.getAccessToken(user)
  const headers = buildHeaders(init, token)
  const { query, ...requestInit } = init
  const url = buildUrl(path, query)

  let response: Response
  try {
    response = await fetch(url, {
      ...requestInit,
      headers,
    })
  } catch (error) {
    if (isAbortError(error)) {
      throw error
    }
    throw new NetworkError()
  }

  if (response.status === 401 && !hasRetried401) {
    try {
      await authService.signinSilent()
      return requestWithAuthRetry<T>(path, init, true)
    } catch {
      const returnPath = `${globalThis.location.pathname}${globalThis.location.search}`
      await authService.login(returnPath)
    }
  }

  if (response.ok) {
    if (response.status === 204) {
      return undefined as T
    }
    try {
      return (await response.json()) as T
    } catch {
      throw new HttpError(response.status, undefined, 'INVALID_JSON_RESPONSE')
    }
  }

  const problem = await parseProblem(response)
  throw new HttpError(response.status, problem)
}

export async function apiFetch<T>(
  path: string,
  init: ApiFetchOptions = {},
): Promise<T> {
  return requestWithAuthRetry<T>(path, init, false)
}

async function requestWithAuthRetryBlob(
  path: string,
  init: ApiFetchOptions,
  hasRetried401: boolean,
): Promise<Blob | null> {
  const user = await authService.getUser()
  const token = authService.getAccessToken(user)
  const headers = buildHeaders(init, token)
  headers.set('Accept', '*/*')
  const { query, ...requestInit } = init
  const url = buildUrl(path, query)

  let response: Response
  try {
    response = await fetch(url, {
      ...requestInit,
      headers,
    })
  } catch (error) {
    if (isAbortError(error)) {
      throw error
    }
    throw new NetworkError()
  }

  if (response.status === 401 && !hasRetried401) {
    try {
      await authService.signinSilent()
      return requestWithAuthRetryBlob(path, init, true)
    } catch {
      const returnPath = `${globalThis.location.pathname}${globalThis.location.search}`
      await authService.login(returnPath)
    }
  }

  if (response.status === 404) {
    return null
  }

  if (response.ok) {
    return response.blob()
  }

  const problem = await parseProblem(response)
  throw new HttpError(response.status, problem)
}

/**
 * GET binario con la misma política de token y reintento silencioso que {@link apiFetch}.
 * Un 404 se traduce en `null` (p. ej. sin foto principal).
 */
export async function apiFetchBlob(path: string, init: ApiFetchOptions = {}): Promise<Blob | null> {
  return requestWithAuthRetryBlob(path, init, false)
}
