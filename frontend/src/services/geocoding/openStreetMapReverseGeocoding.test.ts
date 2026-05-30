import { describe, expect, it, vi } from 'vitest'
import { reverseGeocodeWithOpenStreetMap } from '@/services/geocoding/openStreetMapReverseGeocoding'

describe('openStreetMapReverseGeocoding', () => {
  it('maps nominatim province and municipality to form values', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          address: {
            province: 'A Coruna',
            municipality: 'A Coruna',
          },
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    )

    const result = await reverseGeocodeWithOpenStreetMap('43.3623', '-8.4115', [
      { id: 15, label: 'A Coruna (15)' },
      { id: 28, label: 'Madrid' },
    ])

    expect(result).toEqual({
      provinceId: '15',
      municipalityName: 'A Coruna',
    })
  })

  it('returns null when province cannot be matched against catalog options', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          address: {
            province: 'Valencia',
            city: 'Valencia',
          },
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    )

    const result = await reverseGeocodeWithOpenStreetMap('39.4699', '-0.3763', [
      { id: 28, label: 'Madrid' },
    ])

    expect(result).toBeNull()
  })

  it('matches autonomous community aliases to province combo values', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          address: {
            state: 'Comunidad de Madrid',
            city: 'Madrid',
          },
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    )

    const result = await reverseGeocodeWithOpenStreetMap('40.4168', '-3.7038', [
      { id: 28, label: 'Madrid (28)' },
    ])

    expect(result).toEqual({
      provinceId: '28',
      municipalityName: 'Madrid',
    })
  })

  it('matches basque province alias from OSM to catalog naming', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          address: {
            province: 'Araba',
            municipality: 'Vitoria-Gasteiz',
          },
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    )

    const result = await reverseGeocodeWithOpenStreetMap('42.8467', '-2.6716', [
      { id: 1, label: 'Alava (01)' },
    ])

    expect(result).toEqual({
      provinceId: '1',
      municipalityName: 'Vitoria-Gasteiz',
    })
  })
})
