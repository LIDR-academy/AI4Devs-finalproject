import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  deleteCollaboratorTree,
  fetchCollaboratorTreeDetail,
  fetchCollaboratorTrees,
  updateCollaboratorTree,
} from '@/services/catalog/collaboratorTreesService'
import { apiFetch } from '@/services/http/apiClient'

vi.mock('@/services/http/apiClient', () => ({
  apiFetch: vi.fn(),
}))

const apiFetchMock = vi.mocked(apiFetch)

describe('collaboratorTreesService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetchCollaboratorTrees envía filtros y paginación por defecto', async () => {
    apiFetchMock.mockResolvedValue({ content: [], totalResults: 0, page: 0, size: 20, sort: '' })

    await fetchCollaboratorTrees({
      speciesId: 3,
      createdFrom: '2024-01-01',
      createdTo: '2024-12-31',
      createdByUserId: 9,
    })

    expect(apiFetchMock).toHaveBeenCalledWith('/api/catalog/trees', {
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

  it('fetchCollaboratorTrees propaga AbortSignal', async () => {
    const controller = new AbortController()
    apiFetchMock.mockResolvedValue({ content: [], totalResults: 0, page: 1, size: 10, sort: '' })

    await fetchCollaboratorTrees({ page: 1, size: 10, sort: 'creado_en,asc' }, controller.signal)

    expect(apiFetchMock).toHaveBeenCalledWith('/api/catalog/trees', {
      query: expect.objectContaining({ page: 1, size: 10, sort: 'creado_en,asc' }),
      signal: controller.signal,
    })
  })

  it('fetchCollaboratorTreeDetail consulta por id', async () => {
    apiFetchMock.mockResolvedValueOnce({ treeId: 42 })

    await fetchCollaboratorTreeDetail(42)

    expect(apiFetchMock).toHaveBeenCalledWith('/api/catalog/trees/42', {
      signal: undefined,
    })
  })

  it('updateCollaboratorTree envía PUT con cuerpo JSON', async () => {
    const payload = {
      speciesId: 1,
      provinceId: 28,
      latitude: 40.4,
      longitude: -3.7,
      publicationState: 'BORRADOR' as const,
      publicMapVisibility: 'PRIVADO' as const,
    }
    apiFetchMock.mockResolvedValueOnce({ treeId: 42, ...payload, createdByUserId: 5 })

    await updateCollaboratorTree(42, payload)

    expect(apiFetchMock).toHaveBeenCalledWith('/api/catalog/trees/42', {
      method: 'PUT',
      body: JSON.stringify(payload),
      signal: undefined,
    })
  })

  it('deleteCollaboratorTree envía DELETE', async () => {
    apiFetchMock.mockResolvedValue(undefined)

    await deleteCollaboratorTree(99)

    expect(apiFetchMock).toHaveBeenCalledWith('/api/catalog/trees/99', {
      method: 'DELETE',
      signal: undefined,
    })
  })
})
