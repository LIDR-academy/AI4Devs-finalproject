<template>
  <button
    class="pin-marker absolute z-20 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1"
    :class="pinClasses"
    :style="pinPosition"
    :aria-label="`Pin ${pin.status === 'RESOLVED' ? 'resuelto' : 'abierto'}`"
    @click="$emit('click', pin.id)"
  >
    <!-- Icono de pin -->
    <svg
      class="w-6 h-6"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
      />
    </svg>

    <!-- Badge de comentarios (opcional) -->
    <span
      v-if="commentCount > 0"
      class="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-semibold"
    >
      {{ commentCount > 9 ? '9+' : commentCount }}
    </span>
  </button>
</template>

<script setup lang="ts">
import type { Pin } from '~/types/pin';

interface Props {
  pin: Pin;
  scale?: number;
}

const props = withDefaults(defineProps<Props>(), {
  scale: 1,
});

defineEmits<{
  click: [pinId: string];
}>();

// Posición absoluta en porcentaje, con contra-escala para tamaño visual constante.
// transform-origin: 50% 100% ancla la escala en la punta inferior-central del pin,
// garantizando que la posición sea correcta a cualquier nivel de zoom.
const pinPosition = computed(() => ({
  left: `${props.pin.xCoord * 100}%`,
  top: `${props.pin.yCoord * 100}%`,
  transform: `translate(-50%, -100%) scale(${1 / props.scale})`,
  transformOrigin: '50% 100%',
}));

// Clases dinámicas según estado
const pinClasses = computed(() => ({
  'text-orange-500 hover:text-orange-600': props.pin.status === 'OPEN',
  'text-gray-400 hover:text-gray-500 opacity-60': props.pin.status === 'RESOLVED',
}));

// Contador de comentarios
const commentCount = computed(() => props.pin.comments?.length || 0);
</script>

<style scoped>
.pin-marker {
  cursor: pointer;
}
</style>
