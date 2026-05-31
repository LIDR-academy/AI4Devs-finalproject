import type { PublicationState, PublicMapVisibility } from '@/types/catalog'

export interface CreateTreeFormModel {
  speciesId: string
  provinceId: string
  municipality: string
  description: string
  latitude: string
  longitude: string
  altitude: string
  publicationState: PublicationState
  publicMapVisibility: PublicMapVisibility
}

export type CreateTreeField =
  | 'speciesId'
  | 'provinceId'
  | 'latitude'
  | 'longitude'
  | 'description'

export type CreateTreeValidationCode =
  | 'speciesRequired'
  | 'provinceRequired'
  | 'latitudeRequired'
  | 'latitudeRange'
  | 'longitudeRequired'
  | 'longitudeRange'
  | 'descriptionMaxLength'

export type ValidationResult = Partial<Record<CreateTreeField, CreateTreeValidationCode>>

/** True when lat/lng are present, numeric and within geographic range (same rules as validateCreateTreeForm). */
export function areLatLngInValidRange(form: Pick<CreateTreeFormModel, 'latitude' | 'longitude'>): boolean {
  const latitude = Number(form.latitude)
  const longitude = Number(form.longitude)
  if (!form.latitude || !form.longitude) {
    return false
  }
  if (Number.isNaN(latitude) || latitude < -90 || latitude > 90) {
    return false
  }
  if (Number.isNaN(longitude) || longitude < -180 || longitude > 180) {
    return false
  }
  return true
}

export function validateCreateTreeForm(form: CreateTreeFormModel): ValidationResult {
  const errors: ValidationResult = {}

  if (!form.speciesId) {
    errors.speciesId = 'speciesRequired'
  }
  if (!form.provinceId) {
    errors.provinceId = 'provinceRequired'
  }

  const latitude = Number(form.latitude)
  if (!form.latitude) {
    errors.latitude = 'latitudeRequired'
  } else if (Number.isNaN(latitude) || latitude < -90 || latitude > 90) {
    errors.latitude = 'latitudeRange'
  }

  const longitude = Number(form.longitude)
  if (!form.longitude) {
    errors.longitude = 'longitudeRequired'
  } else if (Number.isNaN(longitude) || longitude < -180 || longitude > 180) {
    errors.longitude = 'longitudeRange'
  }

  if (form.description.length > 5000) {
    errors.description = 'descriptionMaxLength'
  }

  return errors
}
