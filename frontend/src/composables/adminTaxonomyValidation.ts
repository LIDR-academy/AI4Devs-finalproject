export type TaxonomyValidationIssue = 'required'

export function validateSpeciesForm(
  genusId: number | '',
  scientificName: string,
): TaxonomyValidationIssue | null {
  if (genusId === '' || !scientificName.trim()) {
    return 'required'
  }
  return null
}

export function validateGenusForm(
  familyId: number | '',
  scientificName: string,
): TaxonomyValidationIssue | null {
  if (familyId === '' || !scientificName.trim()) {
    return 'required'
  }
  return null
}

export function validateFamilyForm(scientificName: string): TaxonomyValidationIssue | null {
  if (!scientificName.trim()) {
    return 'required'
  }
  return null
}

export function taxonomyValidationMessageKey(issue: TaxonomyValidationIssue): string {
  if (issue === 'required') {
    return 'adminMasters.validation.required'
  }
  return 'adminMasters.messages.unexpectedError'
}
