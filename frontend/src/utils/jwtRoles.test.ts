import { describe, expect, it } from 'vitest'
import {
  decodeJwtPayload,
  extractAppRolesFromUser,
  extractRoleSetFromUser,
  normalizeRole,
  userHasAnyAppRole,
} from '@/utils/jwtRoles'

function toBase64Url(value: string): string {
  return globalThis.btoa(value).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
}

function buildJwt(payload: Record<string, unknown>): string {
  const header = toBase64Url(JSON.stringify({ alg: 'none', typ: 'JWT' }))
  const body = toBase64Url(JSON.stringify(payload))
  return `${header}.${body}.`
}

describe('jwtRoles', () => {
  it('normalizeRole quita prefijo ROLE_ y normaliza mayúsculas', () => {
    expect(normalizeRole('role_colaborador')).toBe('COLABORADOR')
    expect(normalizeRole('ROLE_ADMIN')).toBe('ADMIN')
  })

  it('extractRoleSetFromUser lee realm_access del access_token', () => {
    const roles = extractRoleSetFromUser({
      profile: {},
      access_token: buildJwt({ realm_access: { roles: ['COLABORADOR'] } }),
    })

    expect(roles.has('COLABORADOR')).toBe(true)
  })

  it('extractAppRolesFromUser filtra solo roles de aplicación', () => {
    const roles = extractAppRolesFromUser({
      profile: {},
      access_token: buildJwt({ realm_access: { roles: ['COLABORADOR', 'offline_access'] } }),
    })

    expect(roles).toEqual(['COLABORADOR'])
  })

  it('userHasAnyAppRole devuelve true si el usuario tiene alguno de los roles requeridos', () => {
    const user = {
      profile: {},
      access_token: buildJwt({ realm_access: { roles: ['ADMIN'] } }),
    }

    expect(userHasAnyAppRole(user, ['ADMIN'])).toBe(true)
    expect(userHasAnyAppRole(user, ['COLABORADOR'])).toBe(false)
  })

  it('decodeJwtPayload devuelve null ante token malformado', () => {
    expect(decodeJwtPayload('not-a-jwt')).toBeNull()
  })
})
