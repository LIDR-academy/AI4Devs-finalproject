<template>
  <div
    v-if="pins.length > 0"
    class="absolute top-4 left-4 z-30 bg-white rounded-lg shadow-lg p-3 space-y-2 max-w-xs"
  >
    <div class="flex items-center justify-between">
      <h4 class="text-sm font-semibold text-gray-700">
        Pines ({{ currentIndex + 1 }}/{{ pins.length }})
      </h4>
      <button
        class="text-gray-400 hover:text-gray-600 text-xs"
        @click="$emit('toggle-list')"
      >
        {{ showList ? 'Ocultar' : 'Mostrar' }}
      </button>
    </div>

    <!-- Navegación -->
    <div class="flex gap-2">
      <button
        class="flex-1 px-3 py-1.5 text-xs font-medium border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="currentIndex <= 0"
        @click="$emit('navigate', 'prev')"
      >
        ← Anterior
      </button>
      <button
        class="flex-1 px-3 py-1.5 text-xs font-medium border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="currentIndex >= pins.length - 1"
        @click="$emit('navigate', 'next')"
      >
        Siguiente →
      </button>
    </div>

    <!-- Lista expandible -->
    <div v-if="showList" class="max-h-60 overflow-y-auto space-y-1 pt-2 border-t">
      <button
        v-for="(pin, index) in pins"
        :key="pin.id"
        class="w-full text-left px-3 py-2 text-xs rounded hover:bg-gray-50 transition-colors"
        :class="{
          'bg-blue-50 border border-blue-200': index === currentIndex,
          'border border-transparent': index !== currentIndex,
        }"
        @click="$emit('select', pin.id)"
      >
        <div class="flex items-center justify-between">
          <span class="font-medium">Pin #{{ index + 1 }}</span>
          <span
            class="text-xs px-2 py-0.5 rounded"
            :class="{
              'bg-orange-100 text-orange-700': pin.status === 'OPEN',
              'bg-gray-100 text-gray-600': pin.status === 'RESOLVED',
            }"
          >
            {{ pin.status === 'RESOLVED' ? 'Resuelto' : 'Abierto' }}
          </span>
        </div>
        <p class="text-gray-600 truncate mt-1">
          {{ getFirstComment(pin) }}
        </p>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Pin } from '~/types/pin';

interface Props {
  pins: Pin[];
  currentIndex: number;
  showList?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showList: false,
});

defineEmits<{
  navigate: [direction: 'prev' | 'next'];
  select: [pinId: string];
  'toggle-list': [];
}>();

const getFirstComment = (pin: Pin) => {
  const firstComment = pin.comments?.[0];
  return firstComment?.content || 'Sin comentarios';
};
</script>
