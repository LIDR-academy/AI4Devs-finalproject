<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

// Vite no resuelve las URLs por defecto de Leaflet; fijamos assets explícitos.
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: () => string })._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
})

const props = withDefaults(
  defineProps<{
    latitude: string
    longitude: string
    showMarker: boolean
    /** Solo visualización: sin doble clic para elegir coordenadas (p. ej. detalle de consulta). */
    readOnly?: boolean
  }>(),
  { readOnly: false },
)

const emit = defineEmits<{
  pickCoordinates: [payload: { latitude: string; longitude: string }]
}>()

const { t } = useI18n()
const openStreetMapLabel = t('treeForm.map.openStreetMapLabel')
const mapAriaLabel = computed(() =>
  props.readOnly ? t('treesDetail.map.ariaReadOnly') : t('treeForm.map.ariaLabel'),
)

/** Vista inicial del mapa (Madrid) cuando aún no hay marcador. */
const DEFAULT_CENTER: L.LatLngExpression = [40.4063, -3.65588]
const DEFAULT_ZOOM = 16

function formatCoordForForm(value: number): string {
  return String(Number(value.toFixed(6)))
}

const mapContainer = ref<HTMLElement | null>(null)
let map: L.Map | null = null
let marker: L.Marker | null = null

function parseCoords(): { lat: number; lng: number } | null {
  const lat = Number(props.latitude)
  const lng = Number(props.longitude)
  if (!props.latitude || !props.longitude || Number.isNaN(lat) || Number.isNaN(lng)) {
    return null
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return null
  }
  return { lat, lng }
}

function syncMap(): void {
  if (!map) {
    return
  }

  if (props.showMarker) {
    const coords = parseCoords()
    if (coords) {
      if (marker) {
        marker.setLatLng([coords.lat, coords.lng])
      } else {
        marker = L.marker([coords.lat, coords.lng]).addTo(map)
      }
      map.setView([coords.lat, coords.lng], DEFAULT_ZOOM)
      return
    }
  }

  if (marker) {
    marker.remove()
    marker = null
  }
  map.setView(DEFAULT_CENTER, DEFAULT_ZOOM)
}

onMounted(() => {
  if (!mapContainer.value) {
    return
  }

  map = L.map(mapContainer.value, {
    scrollWheelZoom: false,
  }).setView(DEFAULT_CENTER, DEFAULT_ZOOM)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: `&copy; <a href="https://www.openstreetmap.org/copyright">${openStreetMapLabel}</a>`,
    maxZoom: 19,
  }).addTo(map)

  map.doubleClickZoom.disable()
  if (!props.readOnly) {
    map.on('dblclick', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng
      emit('pickCoordinates', {
        latitude: formatCoordForForm(lat),
        longitude: formatCoordForForm(lng),
      })
    })
  }

  syncMap()
})

watch(
  () => [props.latitude, props.longitude, props.showMarker] as const,
  () => {
    syncMap()
  },
)

onBeforeUnmount(() => {
  if (marker) {
    marker.remove()
    marker = null
  }
  if (map) {
    map.remove()
    map = null
  }
})
</script>

<template>
  <div class="map-preview-stack">
    <div
      ref="mapContainer"
      class="map-preview"
      role="application"
      :aria-label="mapAriaLabel"
    />
    <p class="map-attribution muted">
      {{ t('treeForm.map.attributionPrefix') }}
      <a
        href="https://www.openstreetmap.org/copyright"
        target="_blank"
        rel="noopener noreferrer"
      >{{ openStreetMapLabel }}</a>
      {{ t('treeForm.map.attributionSuffix') }}
    </p>
  </div>
</template>
