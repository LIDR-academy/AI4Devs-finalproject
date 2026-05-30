import { describe, expect, it } from 'vitest'
import { buildMtlFormFieldA11y } from '@/composables/useMtlFormFieldA11y'

describe('useMtlFormFieldA11y', () => {
  it('buildMtlFormFieldA11y devuelve attrs vacíos sin error', () => {
    expect(buildMtlFormFieldA11y('', 'err-1')).toEqual({})
  })

  it('buildMtlFormFieldA11y enlaza error con aria-invalid y aria-describedby', () => {
    expect(buildMtlFormFieldA11y('Campo obligatorio', 'err-1')).toEqual({
      'aria-invalid': true,
      'aria-describedby': 'err-1',
    })
  })
})
