import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  deleteCollaboratorEjemplar,
  fetchCollaboratorEjemplarDetail,
  fetchCollaboratorEjemplares,
  updateCollaboratorEjemplar,
} from '@/services/catalog/collaboratorEjemplaresService'
import { apiFetch } from '@/services/http/apiClient'

vi.mock('@/services/http/apiClient', () => ({
  apiFetch: vi.fn(),
}))

const apiFetchMock = vi.mocked(apiFetch)

describe('collaboratorEjemplaresService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetchCollaboratorEjemplares envía filtros y paginación por defecto', async () => {
    apiFetchMock.mockResolvedValue({ content: [], totalResults: 0, page: 0, size: 20, sort: '' })

    await fetchCollaboratorEjemplares({
      speciesId: 3,
      createdFrom: '2024-01-01',
      createdTo: '2024-12-31',
      createdByUserId: 9,
    })

    expect(apiFetchMock).toHaveBeenCalledWith('/api/catalog/ejemplares', {
      query: {
        page: 0,
        size: 20,
        sort: 'modificado_en,desc',
        speciesId: 3,
        createdFrom: '2024-01-01',
        createdTo: '2024-12-31',
        createdByUserId: 9,
      },
      signal: undefined,
    })
  })

  it('fetchCollaboratorEjemplares propaga AbortSignal', async () => {
    const controller = new AbortController()
    apiFetchMock.mockResolvedValue({ content: [], totalResults: 0, page: 1, size: 10, sort: '' })

    await fetchCollaboratorEjemplares({ page: 1, size: 10, sort: 'creado_en,asc' }, controller.signal)

    expect(apiFetchMock).toHaveBeenCalledWith('/api/catalog/ejemplares', {
      query: expect.objectContaining({ page: 1, size: 10, sort: 'creado_en,asc' }),
      signal: controller.signal,
    })
  })

  it('fetchCollaboratorEjemplarDetail consulta por id', async () => {
    apiFetchMock.mockResolvedValueOnce({ ejemplarId: 42 })

    await fetchCollaboratorEjemplarDetail(42)

    expect(apiFetchMock).toHaveBeenCalledWith('/api/catalog/ejemplares/42', {
      signal: undefined,
    })
  })

  it('updateCollaboratorEjemplar envía PUT con cuerpo JSON', async () => {
    const payload = {
      speciesId: 1,
      provinceId: 28,
      latitude: 40.4,
      longitude: -3.7,
      publicationState: 'BORRADOR' as const,
      publicMapVisibility: 'PRIVADO' as const,
    }
    apiFetchMock.mockResolvedValueOnce({ ejemplarId: 42, ...payload, createdByUserId: 5 })

    await updateCollaboratorEjemplar(42, payload)

    expect(apiFetchMock).toHaveBeenCalledWith('/api/catalog/ejemplares/42', {
      method: 'PUT',
      body: JSON.stringify(payload),
      signal: undefined,
    })
  })

  it('deleteCollaboratorEjemplar envía DELETE', async () => {
    apiFetchMock.mockResolvedValue(undefined)

    await deleteCollaboratorEjemplar(99)

    expect(apiFetchMock).toHaveBeenCalledWith('/api/catalog/ejemplares/99', {
      method: 'DELETE',
      signal: undefined,
    })
  })
})
