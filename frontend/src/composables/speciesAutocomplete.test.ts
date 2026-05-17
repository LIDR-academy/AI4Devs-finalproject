import { describe, expect, it } from 'vitest'
import {
  filterSpeciesByLabel,
  findSpeciesByExactLabel,
  normalizeSpeciesAutocompleteValue,
} from '@/composables/speciesAutocomplete'

const species = [
  { id: 1, label: 'Encina (Quercus ilex)' },
  { id: 2, label: 'Olivo (Olea europaea)' },
]

describe('speciesAutocomplete', () => {
  it('normalizeSpeciesAutocompleteValue ignora acentos y mayúsculas', () => {
    expect(normalizeSpeciesAutocompleteValue('  Éncina ')).toBe('encina')
  })

  it('findSpeciesByExactLabel resuelve etiqueta completa', () => {
    const found = findSpeciesByExactLabel(species, 'Encina (Quercus ilex)')
    expect(found?.id).toBe(1)
  })

  it('filterSpeciesByLabel filtra por fragmento', () => {
    const filtered = filterSpeciesByLabel(species, 'olivo')
    expect(filtered).toHaveLength(1)
    expect(filtered[0]?.id).toBe(2)
  })
})
