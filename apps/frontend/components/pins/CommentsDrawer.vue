<template>
  <!-- Backdrop -->
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-40 bg-black bg-opacity-30 transition-opacity"
      @click="close"
    ></div>

    <!-- Drawer -->
    <div
      v-if="modelValue"
      class="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300"
      :class="{ 'translate-x-full': !modelValue }"
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b border-gray-200">
        <div>
          <h3 class="text-lg font-semibold text-gray-900">
            Comentarios
          </h3>
          <p class="text-xs text-gray-500 mt-1">
            {{ pin ? formatDate(pin.createdAt) : '' }}
            <span v-if="pin?.status === 'RESOLVED'" class="ml-2 text-green-600">✓ Resuelto</span>
          </p>
        </div>
        <button
          class="text-gray-400 hover:text-gray-600 focus:outline-none"
          @click="close"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Comments List -->
      <div class="flex-1 overflow-y-auto p-4 space-y-4">
        <div
          v-for="comment in pin?.comments"
          :key="comment.id"
          class="bg-gray-50 rounded-lg p-3"
        >
          <div class="flex items-start justify-between mb-2">
            <span class="text-sm font-semibold text-gray-900">
              {{ getAuthorName(comment) }}
            </span>
            <span class="text-xs text-gray-500">
              {{ formatTime(comment.createdAt) }}
            </span>
          </div>
          <p class="text-sm text-gray-700 whitespace-pre-wrap">
            {{ comment.content }}
          </p>
        </div>

        <div v-if="!pin?.comments?.length" class="text-center text-gray-400 py-8">
          No hay comentarios aún
        </div>
      </div>

      <!-- Input Area -->
      <div class="border-t border-gray-200 p-4 space-y-3">
        <textarea
          v-model="newComment"
          placeholder="Escribe una respuesta..."
          rows="3"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-sm"
        ></textarea>

        <div class="flex gap-2">
          <UiButton
            variant="primary"
            class="flex-1"
            :loading="loading"
            :disabled="!newComment.trim()"
            @click="handleAddComment"
          >
            Enviar
          </UiButton>

          <!-- Botón resolver (solo no-guest) -->
          <UiButton
            v-if="canResolve"
            variant="outline"
            :disabled="loading"
            @click="handleToggleStatus"
          >
            {{ pin?.status === 'RESOLVED' ? 'Reabrir' : 'Resolver' }}
          </UiButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { Pin, Comment } from '~/types/pin';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface Props {
  modelValue: boolean;
  pin: Pin | null;
  loading?: boolean;
  canResolve?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  canResolve: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'add-comment': [content: string];
  'toggle-status': [];
}>();

const newComment = ref('');

const close = () => {
  emit('update:modelValue', false);
};

const handleAddComment = () => {
  if (!newComment.value.trim()) return;
  
  emit('add-comment', newComment.value.trim());
  newComment.value = '';
};

const handleToggleStatus = () => {
  emit('toggle-status');
};

const getAuthorName = (comment: Comment) => {
  return comment.guestName || comment.authorId || 'Usuario';
};

const formatDate = (dateString: string) => {
  return format(new Date(dateString), "d 'de' MMMM, yyyy", { locale: es });
};

const formatTime = (dateString: string) => {
  return formatDistanceToNow(new Date(dateString), { 
    addSuffix: true, 
    locale: es 
  });
};

// Reset al cerrar
watch(() => props.modelValue, (newVal) => {
  if (!newVal) {
    newComment.value = '';
  }
});
</script>
