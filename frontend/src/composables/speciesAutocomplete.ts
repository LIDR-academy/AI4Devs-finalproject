import type { MasterListItem } from '@/types/catalog'

export const SPECIES_SUGGESTIONS_BLUR_DELAY_MS = 120

export function normalizeSpeciesAutocompleteValue(value: string): string {
  return value
    .trim()
    .normalize('NFD')
    .replaceAll(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

export function findSpeciesByExactLabel(
  species: MasterListItem[],
  inputValue: string,
): MasterListItem | null {
  const normalizedInput = normalizeSpeciesAutocompleteValue(inputValue)
  if (!normalizedInput) {
    return null
  }
  const found = species.find(
    (item) => normalizeSpeciesAutocompleteValue(item.label) === normalizedInput,
  )
  return found ?? null
}

export function filterSpeciesByLabel(
  species: MasterListItem[],
  inputValue: string,
): MasterListItem[] {
  const normalizedInput = normalizeSpeciesAutocompleteValue(inputValue)
  if (!normalizedInput) {
    return species
  }
  return species.filter((item) =>
    normalizeSpeciesAutocompleteValue(item.label).includes(normalizedInput),
  )
}
