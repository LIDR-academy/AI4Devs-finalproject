export interface ReverseGeocodingResult {
  provinceId: string
  municipalityName: string
}

interface NominatimAddress {
  state?: string
  state_district?: string
  province?: string
  county?: string
  municipality?: string
  city?: string
  town?: string
  village?: string
  hamlet?: string
  suburb?: string
}

interface NominatimReverseResponse {
  address?: NominatimAddress
}

interface ProvinceOption {
  id: number
  label: string
}

function normalizeLocationName(value: string): string {
  return value
    .normalize('NFD')
    .replaceAll(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replaceAll(/[^\w\s-]/g, '')
    .replaceAll(/\s+/g, ' ')
    .trim()
}

function normalizeProvinceOptionLabel(value: string): string {
  return normalizeLocationName(
    value
      // Las provincias del maestro vienen como "Nombre (codigo)" y para match nos basta el nombre.
      .replaceAll(/\s*\([^()]*\)\s*$/g, '')
      .trim(),
  )
}

const provinceAliases: Record<string, string> = {
  'comunidad de madrid': 'madrid',
  'comunidad foral de navarra': 'navarra',
  'comunitat valenciana': 'valencia',
  'provincia de valencia': 'valencia',
  'islas baleares': 'illes balears',
  'balearic islands': 'illes balears',
  'la coruna': 'a coruna',
  coruna: 'a coruna',
  vizcaya: 'bizkaia',
  guipuzcoa: 'gipuzkoa',
  araba: 'alava',
}

function toComparableProvinceName(rawName: string): string {
  const normalized = normalizeLocationName(rawName)
  return provinceAliases[normalized] ?? normalized
}

function pickProvinceName(address: NominatimAddress): string | null {
  return address.province ?? address.state_district ?? address.state ?? null
}

function pickMunicipalityName(address: NominatimAddress): string | null {
  return (
    address.municipality ??
    address.city ??
    address.town ??
    address.village ??
    address.hamlet ??
    address.suburb ??
    address.county ??
    null
  )
}

function findMatchingProvince(
  provinceNameFromOsm: string,
  provinceOptions: ReadonlyArray<ProvinceOption>,
): ProvinceOption | null {
  const normalizedProvince = toComparableProvinceName(provinceNameFromOsm)
  const matchingProvince = provinceOptions.find((candidate) => {
    const normalizedCandidate = toComparableProvinceName(normalizeProvinceOptionLabel(candidate.label))
    return (
      normalizedCandidate === normalizedProvince ||
      normalizedProvince.includes(normalizedCandidate) ||
      normalizedCandidate.includes(normalizedProvince)
    )
  })
  return matchingProvince ?? null
}

export async function reverseGeocodeWithOpenStreetMap(
  latitude: string,
  longitude: string,
  provinceOptions: ReadonlyArray<ProvinceOption>,
  signal?: AbortSignal,
): Promise<ReverseGeocodingResult | null> {
  const params = new URLSearchParams({
    format: 'jsonv2',
    lat: latitude,
    lon: longitude,
    addressdetails: '1',
    'accept-language': 'es',
  })

  const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`, {
    method: 'GET',
    signal,
  })
  if (!response.ok) {
    return null
  }

  const body = (await response.json()) as NominatimReverseResponse
  const address = body.address
  if (!address) {
    return null
  }

  const provinceName = pickProvinceName(address)
  const municipalityName = pickMunicipalityName(address)
  if (!provinceName || !municipalityName) {
    return null
  }

  const matchingProvince = findMatchingProvince(provinceName, provinceOptions)
  if (!matchingProvince) {
    return null
  }

  return {
    provinceId: String(matchingProvince.id),
    municipalityName,
  }
}
