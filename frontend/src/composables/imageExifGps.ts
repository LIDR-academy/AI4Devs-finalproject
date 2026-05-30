export interface FormattedGpsCoords {
  latitude: string
  longitude: string
}

/**
 * Normaliza el objeto GPS típico de `exifr` (u otras variantes) a strings listos para el formulario.
 * Devuelve null si no hay coordenadas finitas en rango WGS84.
 */
export function parseExifGpsResult(gps: unknown): FormattedGpsCoords | null {
  if (!gps || typeof gps !== 'object') {
    return null
  }
  const record = gps as Record<string, unknown>
  const latRaw = record.latitude ?? record.Latitude ?? record.lat
  const lonRaw = record.longitude ?? record.Longitude ?? record.lng ?? record.lon
  const lat = typeof latRaw === 'number' ? latRaw : Number(latRaw)
  const lon = typeof lonRaw === 'number' ? lonRaw : Number(lonRaw)
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return null
  }
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return null
  }
  return {
    latitude: String(Number(lat.toFixed(6))),
    longitude: String(Number(lon.toFixed(6))),
  }
}

/** Lee GPS desde un fichero de imagen; fallos o ausencia de EXIF → null (no bloquea la subida). */
export async function readGpsFromImageFile(file: File): Promise<FormattedGpsCoords | null> {
  try {
    const { default: exifr } = await import('exifr')
    const gps = await exifr.gps(file)
    return parseExifGpsResult(gps)
  } catch {
    return null
  }
}
