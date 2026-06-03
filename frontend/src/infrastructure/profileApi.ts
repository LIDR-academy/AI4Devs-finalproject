import { apiGet } from './httpClient'

/** Contrato JSON de GET /api/profile (alineado con el backend). */
export interface ProfileUserDto {
  id: number
  name: string | null
  email: string
}

export type ProfileApiResult = { ok: true; user: ProfileUserDto } | { ok: false; error: string }

export async function fetchUserProfile(): Promise<ProfileApiResult> {
  const result = await apiGet<ProfileUserDto>('/profile')

  if (result.ok) {
    return { ok: true, user: result.data }
  }

  return { ok: false, error: result.message }
}
