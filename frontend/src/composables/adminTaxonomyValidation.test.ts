import { describe, expect, it } from 'vitest'
import {
  taxonomyValidationMessageKey,
  validateFamilyForm,
  validateGenusForm,
  validateSpeciesForm,
} from '@/composables/adminTaxonomyValidation'

describe('adminTaxonomyValidation', () => {
  it('validateSpeciesForm rechaza género o nombre vacíos', () => {
    expect(validateSpeciesForm('', 'Quercus ilex')).toBe('required')
    expect(validateSpeciesForm(10, '   ')).toBe('required')
    expect(validateSpeciesForm(10, 'Quercus ilex')).toBeNull()
  })

  it('validateGenusForm rechaza familia o nombre vacíos', () => {
    expect(validateGenusForm('', 'Quercus')).toBe('required')
    expect(validateGenusForm(5, '')).toBe('required')
    expect(validateGenusForm(5, 'Quercus')).toBeNull()
  })

  it('validateFamilyForm rechaza nombre vacío', () => {
    expect(validateFamilyForm('')).toBe('required')
    expect(validateFamilyForm('Pinaceae')).toBeNull()
  })

  it('taxonomyValidationMessageKey mapea required', () => {
    expect(taxonomyValidationMessageKey('required')).toBe('adminMasters.validation.required')
  })
})
