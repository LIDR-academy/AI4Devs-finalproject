import { reactive, ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { useTreeLocationAutofill } from '@/composables/useTreeLocationAutofill'
import type { CreateTreeFormModel } from '@/composables/createTreeFormValidation'

function createForm(): CreateTreeFormModel {
  return reactive({
    speciesId: '',
    provinceId: '',
    municipality: '',
    description: '',
    latitude: '',
    longitude: '',
    altitude: '',
    publicationState: 'BORRADOR',
    publicMapVisibility: 'PRIVADO',
  })
}

describe('useTreeLocationAutofill', () => {
  it('updates coordinates and fills province/municipality when reverse geocoding succeeds', async () => {
    const form = createForm()
    const provinces = ref([{ id: 28, label: 'Madrid (28)' }])
    const reverseGeocoder = vi.fn(async () => ({
      provinceId: '28',
      municipalityName: 'Madrid',
    }))
    const { applyCoordinatesAndAutofillAddress } = useTreeLocationAutofill({
      form,
      provinces,
      reverseGeocoder,
    })

    await applyCoordinatesAndAutofillAddress({ latitude: '40.4', longitude: '-3.7' })

    expect(form.latitude).toBe('40.4')
    expect(form.longitude).toBe('-3.7')
    expect(form.provinceId).toBe('28')
    expect(form.municipality).toBe('Madrid')
  })

  it('keeps manual province/municipality when reverse geocoding fails', async () => {
    const form = createForm()
    form.provinceId = '15'
    form.municipality = 'A Coruna'
    const provinces = ref([{ id: 15, label: 'A Coruna (15)' }])
    const reverseGeocoder = vi.fn(async () => null)
    const { applyCoordinatesAndAutofillAddress } = useTreeLocationAutofill({
      form,
      provinces,
      reverseGeocoder,
    })

    await applyCoordinatesAndAutofillAddress({ latitude: '43.3', longitude: '-8.4' })

    expect(form.latitude).toBe('43.3')
    expect(form.longitude).toBe('-8.4')
    expect(form.provinceId).toBe('15')
    expect(form.municipality).toBe('A Coruna')
  })
})
