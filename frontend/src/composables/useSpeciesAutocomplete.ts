import { computed, ref, type Ref } from 'vue'
import type { MasterListItem } from '@/types/catalog'
import {
  SPECIES_SUGGESTIONS_BLUR_DELAY_MS,
  filterSpeciesByLabel,
  findSpeciesByExactLabel,
} from '@/composables/speciesAutocomplete'

export function useSpeciesAutocomplete(
  species: Ref<MasterListItem[]>,
  speciesId: Ref<string>,
) {
  const speciesAutocompleteText = ref('')
  const showSpeciesSuggestions = ref(false)
  const speciesHighlightIndex = ref(-1)

  const filteredSpecies = computed(() =>
    filterSpeciesByLabel(species.value, speciesAutocompleteText.value),
  )

  function resetSpeciesSuggestions(): void {
    showSpeciesSuggestions.value = false
    speciesHighlightIndex.value = -1
  }

  function applySpeciesSelection(item: MasterListItem | null): void {
    speciesId.value = item ? String(item.id) : ''
  }

  function syncTextFromSpeciesId(): void {
    if (!speciesId.value) {
      speciesAutocompleteText.value = ''
      return
    }
    const selected = species.value.find((item) => String(item.id) === speciesId.value)
    speciesAutocompleteText.value = selected?.label ?? ''
  }

  function onSpeciesInput(event: Event): void {
    const input = event.target as HTMLInputElement
    speciesAutocompleteText.value = input.value
    applySpeciesSelection(findSpeciesByExactLabel(species.value, input.value))
    showSpeciesSuggestions.value = true
    speciesHighlightIndex.value = -1
  }

  function onSpeciesFocus(): void {
    showSpeciesSuggestions.value = true
  }

  function onSpeciesBlur(): void {
    setTimeout(() => {
      resetSpeciesSuggestions()
    }, SPECIES_SUGGESTIONS_BLUR_DELAY_MS)
  }

  function selectSpecies(item: MasterListItem): void {
    speciesAutocompleteText.value = item.label
    applySpeciesSelection(item)
    resetSpeciesSuggestions()
  }

  function highlightNextSpecies(): void {
    if (filteredSpecies.value.length === 0) {
      return
    }
    showSpeciesSuggestions.value = true
    speciesHighlightIndex.value =
      speciesHighlightIndex.value >= filteredSpecies.value.length - 1
        ? 0
        : speciesHighlightIndex.value + 1
  }

  function highlightPreviousSpecies(): void {
    if (filteredSpecies.value.length === 0) {
      return
    }
    showSpeciesSuggestions.value = true
    speciesHighlightIndex.value =
      speciesHighlightIndex.value <= 0
        ? filteredSpecies.value.length - 1
        : speciesHighlightIndex.value - 1
  }

  function confirmHighlightedSpecies(): void {
    if (speciesHighlightIndex.value < 0) {
      return
    }
    const highlighted = filteredSpecies.value[speciesHighlightIndex.value]
    if (highlighted) {
      selectSpecies(highlighted)
    }
  }

  function dismissSpeciesSuggestions(): void {
    resetSpeciesSuggestions()
  }

  function commitSpeciesFromText(): void {
    applySpeciesSelection(findSpeciesByExactLabel(species.value, speciesAutocompleteText.value))
  }

  return {
    speciesAutocompleteText,
    showSpeciesSuggestions,
    speciesHighlightIndex,
    filteredSpecies,
    onSpeciesInput,
    onSpeciesFocus,
    onSpeciesBlur,
    selectSpecies,
    highlightNextSpecies,
    highlightPreviousSpecies,
    confirmHighlightedSpecies,
    dismissSpeciesSuggestions,
    syncTextFromSpeciesId,
    commitSpeciesFromText,
  }
}
