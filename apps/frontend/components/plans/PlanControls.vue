<template>
  <div class="flex flex-col gap-2 p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg text-gray-800">
    <button 
      class="p-2 hover:bg-gray-100 rounded transition-colors group" 
      title="Zoom In (+)"
      @click="$emit('zoom-in')"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 group-hover:scale-110 transition-transform"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
    </button>
    
    <div 
      class="text-xs font-mono text-center py-1 cursor-pointer hover:text-blue-600 select-none"
      title="Reset View (R)"
      @click="$emit('reset')"
    >
      {{ Math.round(zoomLevel * 100) }}%
    </div>

    <button 
      class="p-2 hover:bg-gray-100 rounded transition-colors group" 
      title="Zoom Out (-)"
      @click="$emit('zoom-out')"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 group-hover:scale-110 transition-transform"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
    </button>

    <button 
      class="p-2 hover:bg-gray-100 rounded transition-colors group border-t border-gray-200 mt-1" 
      title="Fit to Screen"
      @click="$emit('fit')"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 group-hover:scale-110 transition-transform"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  zoomLevel: number
}>()

defineEmits<{
  (e: 'zoom-in'): void
  (e: 'zoom-out'): void
  (e: 'reset'): void
  (e: 'fit'): void
}>()
</script>
