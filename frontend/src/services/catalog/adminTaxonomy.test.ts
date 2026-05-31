import { describe, expect, it, vi } from 'vitest'
import {
  createAdminFamily,
  createAdminGenus,
  createAdminSpecies,
  deleteAdminSpecies,
  fetchAdminFamilies,
  fetchAdminGenera,
  fetchAdminSpeciesDetail,
  fetchAdminSpeciesList,
  updateAdminSpecies,
} from '@/services/catalog/adminTaxonomy'

const apiFetchMock = vi.hoisted(() => vi.fn())

vi.mock('@/services/http/apiClient', () => ({
  apiFetch: apiFetchMock,
}))

describe('adminTaxonomy', () => {
  it('fetchAdminFamilies pide listado unpaged', async () => {
    const page = { content: [], totalElements: 0, totalPages: 0, page: 0, size: 100, unpaged: true, first: true, last: true }
    apiFetchMock.mockResolvedValueOnce(page)

    const result = await fetchAdminFamilies()

    expect(result).toEqual(page)
    expect(apiFetchMock).toHaveBeenCalledWith('/api/catalog/families', {
      query: { unpaged: true, page: 0, size: 100 },
      signal: undefined,
    })
  })

  it('fetchAdminGenera reenvía familyId cuando se indica', async () => {
    apiFetchMock.mockResolvedValueOnce({ content: [] })

    await fetchAdminGenera(7)

    expect(apiFetchMock).toHaveBeenCalledWith('/api/catalog/genera', {
      query: { unpaged: true, page: 0, size: 100, familyId: 7 },
      signal: undefined,
    })
  })

  it('fetchAdminSpeciesList pide especies paginadas por defecto', async () => {
    apiFetchMock.mockResolvedValueOnce({ content: [] })

    await fetchAdminSpeciesList()

    expect(apiFetchMock).toHaveBeenCalledWith('/api/catalog/species', {
      query: { unpaged: false, page: 0, size: 20 },
      signal: undefined,
    })
  })

  it('fetchAdminSpeciesList reenvía page y size', async () => {
    apiFetchMock.mockResolvedValueOnce({ content: [] })

    await fetchAdminSpeciesList({ page: 2, size: 10, signal: undefined })

    expect(apiFetchMock).toHaveBeenCalledWith('/api/catalog/species', {
      query: { unpaged: false, page: 2, size: 10 },
      signal: undefined,
    })
  })

  it('fetchAdminSpeciesList reenvía genusId y speciesId cuando se indican', async () => {
    apiFetchMock.mockResolvedValueOnce({ content: [] })

    await fetchAdminSpeciesList({ genusId: 10, speciesId: 3, signal: undefined })

    expect(apiFetchMock).toHaveBeenCalledWith('/api/catalog/species', {
      query: { unpaged: false, page: 0, size: 20, genusId: 10, speciesId: 3 },
      signal: undefined,
    })
  })

  it('fetchAdminSpeciesDetail usa speciesId en la ruta', async () => {
    const item = {
      speciesId: 2,
      genusId: 1,
      scientificName: 'Quercus ilex',
      commonName: 'Encina',
      label: 'Encina (Quercus ilex)',
    }
    apiFetchMock.mockResolvedValueOnce(item)

    const out = await fetchAdminSpeciesDetail(2)

    expect(out).toEqual(item)
    expect(apiFetchMock).toHaveBeenCalledWith('/api/catalog/species/2', { signal: undefined })
  })

  it('createAdminSpecies envía POST con cuerpo JSON', async () => {
    const body = { genusId: 3, scientificName: 'Pinus pinea', commonName: 'Pino piñonero' }
    apiFetchMock.mockResolvedValueOnce({ speciesId: 9, ...body, label: 'Pino piñonero (Pinus pinea)' })

    await createAdminSpecies(body)

    expect(apiFetchMock).toHaveBeenCalledWith('/api/catalog/species', {
      method: 'POST',
      body: JSON.stringify(body),
      signal: undefined,
    })
  })

  it('updateAdminSpecies envía PUT', async () => {
    const body = { genusId: 3, scientificName: 'Pinus pinea' }
    apiFetchMock.mockResolvedValueOnce({ speciesId: 9, ...body, commonName: null, label: 'Pinus pinea' })

    await updateAdminSpecies(9, body)

    expect(apiFetchMock).toHaveBeenCalledWith('/api/catalog/species/9', {
      method: 'PUT',
      body: JSON.stringify(body),
      signal: undefined,
    })
  })

  it('deleteAdminSpecies envía DELETE', async () => {
    apiFetchMock.mockResolvedValueOnce(undefined)

    await deleteAdminSpecies(5)

    expect(apiFetchMock).toHaveBeenCalledWith('/api/catalog/species/5', {
      method: 'DELETE',
      signal: undefined,
    })
  })

  it('createAdminFamily y createAdminGenus usan POST', async () => {
    apiFetchMock.mockResolvedValueOnce({ familyId: 1, scientificName: 'Fagaceae', commonName: null, label: 'Fagaceae' })
    await createAdminFamily({ scientificName: 'Fagaceae' })
    expect(apiFetchMock).toHaveBeenLastCalledWith('/api/catalog/families', {
      method: 'POST',
      body: JSON.stringify({ scientificName: 'Fagaceae' }),
      signal: undefined,
    })

    apiFetchMock.mockResolvedValueOnce({
      genusId: 2,
      familyId: 1,
      scientificName: 'Quercus',
      commonName: null,
      label: 'Quercus',
    })
    await createAdminGenus({ familyId: 1, scientificName: 'Quercus' })
    expect(apiFetchMock).toHaveBeenLastCalledWith('/api/catalog/genera', {
      method: 'POST',
      body: JSON.stringify({ familyId: 1, scientificName: 'Quercus' }),
      signal: undefined,
    })
  })
})
