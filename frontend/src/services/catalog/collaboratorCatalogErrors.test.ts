import { describe, expect, it } from 'vitest'
import { HttpError, NetworkError } from '@/services/http/apiClient'
import { mapCollaboratorCatalogError } from '@/services/catalog/collaboratorCatalogErrors'

const messages = {
  networkError: 'NET',
  unauthorized: 'AUTH',
  badRequest: 'BAD',
  forbidden: 'FORBIDDEN',
  notFound: 'NOT_FOUND',
  badGateway: 'GATEWAY',
  serviceError: 'SERVICE',
  unexpectedError: 'UNEXPECTED',
}

describe('mapCollaboratorCatalogError', () => {
  it('mapea NetworkError', () => {
    expect(mapCollaboratorCatalogError(new NetworkError(), messages)).toBe('NET')
  })

  it('usa detail de Problem en 400', () => {
    expect(
      mapCollaboratorCatalogError(
        new HttpError(400, { title: 'Bad Request', status: 400, detail: 'createdFrom inválido' }),
        messages,
      ),
    ).toBe('createdFrom inválido')
  })

  it('mapea 403 y 404 con fallback', () => {
    expect(mapCollaboratorCatalogError(new HttpError(403, { title: 'Forbidden', status: 403 }), messages)).toBe(
      'FORBIDDEN',
    )
    expect(mapCollaboratorCatalogError(new HttpError(404, { title: 'Not Found', status: 404 }), messages)).toBe(
      'NOT_FOUND',
    )
  })

  it('detecta catálogo no disponible en 502', () => {
    expect(mapCollaboratorCatalogError(new HttpError(502, { title: 'Bad Gateway', status: 502 }), messages)).toBe(
      'GATEWAY',
    )
  })
})
