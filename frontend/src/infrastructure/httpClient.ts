export type ApiGetResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; message: string }

export async function apiGet<T>(path: string): Promise<ApiGetResult<T>> {
  try {
    const res = await fetch('/api' + path)
    const body = (await res.json()) as T | { error?: string }

    if (!res.ok) {
      const message =
        typeof body === 'object' &&
        body !== null &&
        'error' in body &&
        typeof body.error === 'string'
          ? body.error
          : 'Error en la petición'
      return { ok: false, status: res.status, message }
    }

    return { ok: true, data: body as T }
  } catch {
    return {
      ok: false,
      status: 0,
      message: 'Sin conexión con el servidor (¿npm run dev:api?)',
    }
  }
}
