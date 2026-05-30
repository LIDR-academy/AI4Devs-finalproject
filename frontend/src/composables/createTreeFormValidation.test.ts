import { describe, expect, it } from 'vitest'
import type { CreateTreeFormModel } from '@/composables/createTreeFormValidation'
import { areLatLngInValidRange, validateCreateTreeForm } from '@/composables/createTreeFormValidation'

function buildValidForm(overrides: Partial<CreateTreeFormModel> = {}): CreateTreeFormModel {
  return {
    speciesId: '1',
    provinceId: '28',
    municipality: 'Madrid',
    description: 'Arbol singular en parque urbano',
    latitude: '40.4063',
    longitude: '-3.65588',
    altitude: '650',
    publicationState: 'BORRADOR',
    publicMapVisibility: 'PRIVADO',
    ...overrides,
  }
}

describe('areLatLngInValidRange', () => {
  it('returns true for coordinates in range', () => {
    expect(areLatLngInValidRange({ latitude: '40.4063', longitude: '-3.65588' })).toBe(true)
  })

  it('returns false when empty or out of range', () => {
    expect(areLatLngInValidRange({ latitude: '', longitude: '-3' })).toBe(false)
    expect(areLatLngInValidRange({ latitude: '91', longitude: '0' })).toBe(false)
    expect(areLatLngInValidRange({ latitude: '0', longitude: '200' })).toBe(false)
    expect(areLatLngInValidRange({ latitude: 'foo', longitude: '0' })).toBe(false)
  })
})

describe('validateCreateTreeForm', () => {
  it('returns no errors for a valid form', () => {
    const result = validateCreateTreeForm(buildValidForm())
    expect(result).toEqual({})
  })

  it('returns expected validation errors for invalid data', () => {
    const result = validateCreateTreeForm(
      buildValidForm({
        speciesId: '',
        provinceId: '',
        latitude: '120',
        longitude: 'foo',
        description: 'x'.repeat(5001),
      }),
    )

    expect(result).toEqual({
      speciesId: 'speciesRequired',
      provinceId: 'provinceRequired',
      latitude: 'latitudeRange',
      longitude: 'longitudeRange',
      description: 'descriptionMaxLength',
    })
  })
})
