import { computed, inject, type ComputedRef, type InjectionKey } from 'vue'

export type MtlFormFieldA11y = {
  'aria-invalid'?: true
  'aria-describedby'?: string
}

export const MTL_FORM_FIELD_A11Y_KEY: InjectionKey<ComputedRef<MtlFormFieldA11y>> =
  Symbol('mtlFormFieldA11y')

export function useMtlFormFieldA11y(): ComputedRef<MtlFormFieldA11y> {
  return inject(
    MTL_FORM_FIELD_A11Y_KEY,
    computed((): MtlFormFieldA11y => ({})),
  )
}

export function buildMtlFormFieldA11y(formError: string, errorId: string): MtlFormFieldA11y {
  if (!formError) {
    return {}
  }
  return {
    'aria-invalid': true,
    'aria-describedby': errorId,
  }
}
