<script setup lang="ts">
/**
 * Iconos decorativos del panel inicio (trazo, color heredado vía currentColor).
 */
defineProps<{
  name: 'shield' | 'tree' | 'list' | 'table' | 'mail' | 'compass' | 'key'
}>()
</script>

<template>
  <svg
    class="home-dashboard-icon"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <g stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <template v-if="name === 'shield'">
        <path d="M12 3 20 6v6c0 4.5-3 8-8 9-5-1-8-4.5-8-9V6l8-3Z" />
        <path d="m9 12 2 2 4-4" />
      </template>
      <template v-else-if="name === 'tree'">
        <path d="M12 3v4M9 7l3-4 3 4M8 11h8M10 11v10M14 11v10M7 21h10" />
      </template>
      <template v-else-if="name === 'list'">
        <path d="M8 6h13M8 12h13M8 18h13M3 6h.5M3 12h.5M3 18h.5" />
      </template>
      <template v-else-if="name === 'table'">
        <path d="M3 5h18v14H3zM3 10h18M10 5v14" />
      </template>
      <template v-else-if="name === 'mail'">
        <path d="M4 6h16v12H4zM4 8l8 5 8-5" />
      </template>
      <template v-else-if="name === 'compass'">
        <circle cx="12" cy="12" r="9" />
        <path d="m12 7 2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" />
      </template>
      <template v-else-if="name === 'key'">
        <path d="M7 14a2.5 2.5 0 1 1 3-3.2L15 15v3h-3v-2l-1-1" />
        <circle cx="7.5" cy="9.5" r="1.5" />
      </template>
    </g>
  </svg>
</template>
