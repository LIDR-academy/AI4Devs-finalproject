<template>
  <div class="w-72 bg-white border-r border-gray-200 h-full flex flex-col">
    <div class="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
      <h3 class="font-semibold text-gray-700">Capas</h3>
      
      <button 
        @click="$emit('add-layer')" 
        class="text-primary hover:text-primary-dark p-1 rounded hover:bg-white transition"
        title="Añadir Capa"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
          <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
        </svg>
      </button>
    </div>

    <div class="flex-1 overflow-y-auto p-2 space-y-4">
      <!-- Base Layers -->
      <div>
        <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">Base</h4>
        <ul class="space-y-1">
          <li
            v-for="(layer, index) in baseLayers"
            :key="layer.id"
            class="flex items-center p-2 rounded hover:bg-gray-50 group"
          >
            <!-- Status dot -->
            <span class="mr-2 shrink-0" :title="layer.status">
              <span v-if="layer.status === 'PROCESSING'" class="block h-2 w-2 rounded-full bg-yellow-400 animate-pulse"></span>
              <span v-else-if="layer.status === 'READY'" class="block h-2 w-2 rounded-full bg-green-500"></span>
              <span v-else class="block h-2 w-2 rounded-full bg-red-500"></span>
            </span>

            <span class="text-sm text-gray-700 truncate flex-1">{{ layer.name }}</span>

            <!-- First base layer: locked (cannot be hidden) -->
            <span
              v-if="index === 0"
              class="ml-2 shrink-0 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              title="La capa base no puede ocultarse"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-gray-300">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </span>

            <!-- Other base layers: visibility toggle -->
            <button
              v-else
              class="ml-2 shrink-0 p-0.5 rounded transition-opacity"
              :class="isVisible(layer.id) ? 'opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-700' : 'opacity-100 text-gray-300 hover:text-gray-600'"
              :title="isVisible(layer.id) ? 'Ocultar capa' : 'Mostrar capa'"
              @click.stop="$emit('toggle-visibility', layer.id)"
            >
              <!-- Eye open -->
              <svg v-if="isVisible(layer.id)" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <!-- Eye slash -->
              <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            </button>
          </li>
          <li v-if="baseLayers.length === 0" class="text-xs text-gray-400 px-2 italic">Sin capa base</li>
        </ul>
      </div>

      <!-- Overlays -->
      <div>
        <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">Overlays</h4>
        <ul class="space-y-1">
          <li
            v-for="layer in overlayLayers"
            :key="layer.id"
            class="flex items-center p-2 rounded hover:bg-gray-50 group"
          >
            <!-- Status dot -->
            <span class="mr-2 shrink-0" :title="layer.status">
              <span v-if="layer.status === 'PROCESSING'" class="block h-2 w-2 rounded-full bg-yellow-400 animate-pulse"></span>
              <span v-else-if="layer.status === 'READY'" class="block h-2 w-2 rounded-full bg-green-500"></span>
              <span v-else class="block h-2 w-2 rounded-full bg-red-500"></span>
            </span>

            <span
              class="text-sm text-gray-700 truncate flex-1 transition-opacity duration-200"
              :class="{ 'opacity-35': !isVisible(layer.id) }"
            >{{ layer.name }}</span>

            <!-- Visibility toggle -->
            <button
              class="ml-2 shrink-0 p-0.5 rounded transition-opacity"
              :class="isVisible(layer.id) ? 'opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-700' : 'opacity-100 text-gray-300 hover:text-gray-600'"
              :title="isVisible(layer.id) ? 'Ocultar capa' : 'Mostrar capa'"
              @click.stop="$emit('toggle-visibility', layer.id)"
            >
              <!-- Eye open -->
              <svg v-if="isVisible(layer.id)" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <!-- Eye slash -->
              <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            </button>
          </li>
          <li v-if="overlayLayers.length === 0" class="text-xs text-gray-400 px-2 italic">Sin overlays</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Layer } from '~/types/plan'

const props = defineProps<{
  layers: Layer[]
  visibilityMap?: Record<string, boolean>
}>()

defineEmits<{
  'add-layer': []
  'toggle-visibility': [layerId: string]
}>()

const baseLayers = computed(() => props.layers.filter(l => l.type === 'BASE'))
const overlayLayers = computed(() => props.layers.filter(l => l.type === 'OVERLAY'))

/** Returns true when not explicitly set to false — default visible */
const isVisible = (layerId: string): boolean =>
  props.visibilityMap?.[layerId] !== false
</script>
