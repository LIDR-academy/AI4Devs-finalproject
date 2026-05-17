import { describe, expect, it, vi } from 'vitest'
import {
  deleteCollaboratorTree,
  fetchCollaboratorTreeDetail,
  fetchCollaboratorTrees,
  updateCollaboratorTree,
} from '@/services/catalog/collaboratorTreesService'

const apiFetchMock = vi.hoisted(() => vi.fn())

vi.mock('@/services/http/apiClient', () => ({
  apiFetch: apiFetchMock,
}))

describe('collaboratorTreesService', () => {
  it('fetchCollaboratorTrees envía filtros y paginación por defecto', async () => {
    apiFetchMock.mockResolvedValueOnce({ content: [], totalResults: 0, page: 0, size: 20, sort: 'modificado_en,desc' })

    await fetchCollaboratorTrees({
      speciesId: 10,
      createdFrom: '2024-01-01',
      createdTo: '2024-12-31',
      createdByUserId: 7,
    })

    expect(apiFetchMock).toHaveBeenCalledWith('/api/catalog/trees', {
      query: {
        page: 0,
        size: 20,
        sort: 'modificado_en,desc',
        speciesId: 10,
        createdFrom: '2024-01-01',
        createdTo: '2024-12-31',
        createdByUserId: 7,
      },
      signal: undefined,
    })
  })

  it('fetchCollaboratorTrees propaga AbortSignal', async () => {
    const controller = new AbortController()
    apiFetchMock.mockResolvedValueOnce({ content: [], totalResults: 0, page: 0, size: 20, sort: 'modificado_en,desc' })

    await fetchCollaboratorTrees({ page: 1, size: 10, sort: 'creado_en,asc' }, controller.signal)

    expect(apiFetchMock).toHaveBeenCalledWith('/api/catalog/trees', {
      query: {
        page: 1,
        size: 10,
        sort: 'creado_en,asc',
        speciesId: undefined,
        createdFrom: undefined,
        createdTo: undefined,
        createdByUserId: undefined,
      },
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
      speciesId: 11,
      provinceId: 29,
      latitude: 40.4,
      longitude: -3.7,
      publicationState: 'PUBLICADO' as const,
      publicMapVisibility: 'PUBLICO' as const,
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
    apiFetchMock.mockResolvedValueOnce(undefined)

    await deleteCollaboratorTree(99)

    expect(apiFetchMock).toHaveBeenCalledWith('/api/catalog/trees/99', {
      method: 'DELETE',
      signal: undefined,
    })
  })
})
