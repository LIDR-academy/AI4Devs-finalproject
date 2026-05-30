import { ref, type Ref } from 'vue'
import type { CreateTreeFormModel } from '@/composables/createTreeFormValidation'
import { reverseGeocodeWithOpenStreetMap } from '@/services/geocoding/openStreetMapReverseGeocoding'
import type { MasterListItem } from '@/types/catalog'

interface CoordinatesPayload {
  latitude: string
  longitude: string
}

type ReverseGeocoder = (
  latitude: string,
  longitude: string,
  provinceOptions: ReadonlyArray<MasterListItem>,
  signal?: AbortSignal,
) => Promise<{ provinceId: string; municipalityName: string } | null>

interface UseTreeLocationAutofillOptions {
  form: Pick<CreateTreeFormModel, 'latitude' | 'longitude' | 'provinceId' | 'municipality'>
  provinces: Ref<MasterListItem[]>
  reverseGeocoder?: ReverseGeocoder
}

export function useTreeLocationAutofill(options: UseTreeLocationAutofillOptions) {
  const { form, provinces, reverseGeocoder = reverseGeocodeWithOpenStreetMap } = options
  const reverseGeocodeGeneration = ref(0)

  async function applyCoordinatesAndAutofillAddress(payload: CoordinatesPayload): Promise<void> {
    form.latitude = payload.latitude
    form.longitude = payload.longitude

    const generation = ++reverseGeocodeGeneration.value
    try {
      const reverseResult = await reverseGeocoder(payload.latitude, payload.longitude, provinces.value)
      if (!reverseResult || generation !== reverseGeocodeGeneration.value) {
        return
      }
      form.provinceId = reverseResult.provinceId
      form.municipality = reverseResult.municipalityName
    } catch {
      // Fallback silencioso: mantenemos lat/lng aunque falle la geocodificacion inversa.
    }
  }

  return {
    applyCoordinatesAndAutofillAddress,
  }
}
