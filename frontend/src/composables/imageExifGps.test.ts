import { describe, expect, it } from 'vitest'
import { parseExifGpsResult } from '@/composables/imageExifGps'

describe('parseExifGpsResult', () => {
  it('returns formatted coords for valid latitude/longitude', () => {
    expect(parseExifGpsResult({ latitude: 40.416775, longitude: -3.70379 })).toEqual({
      latitude: '40.416775',
      longitude: '-3.70379',
    })
  })

  it('accepts lat/lng aliases', () => {
    expect(parseExifGpsResult({ lat: 1.5, lng: -2.25 })).toEqual({
      latitude: '1.5',
      longitude: '-2.25',
    })
  })

  it('returns null for out of range', () => {
    expect(parseExifGpsResult({ latitude: 91, longitude: 0 })).toBeNull()
    expect(parseExifGpsResult({ latitude: 0, longitude: 200 })).toBeNull()
  })

  it('returns null for non-finite or missing', () => {
    expect(parseExifGpsResult(null)).toBeNull()
    expect(parseExifGpsResult({})).toBeNull()
    expect(parseExifGpsResult({ latitude: Number.NaN, longitude: 0 })).toBeNull()
  })
})
