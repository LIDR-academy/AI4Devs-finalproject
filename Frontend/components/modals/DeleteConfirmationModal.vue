<template>
  <div v-if="modelValue" class="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-50">
    <div class="mx-4 w-full max-w-md bg-white rounded-lg shadow-xl dark:bg-gray-800">
      <div class="p-6">
        <h2 class="mb-4 text-xl font-bold text-gray-900 dark:text-white">
          Confirmar eliminación
        </h2>
        <p class="mb-6 text-gray-700 dark:text-gray-300">
          ¿Está seguro que desea eliminar el puesto "{{ itemName }}"? Esta acción no se puede deshacer.
        </p>
        
        <div class="flex justify-end space-x-3">
          <button
            type="button"
            @click="closeModal"
            class="px-4 py-2 text-gray-700 rounded-lg border border-gray-300 transition-colors dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancelar
          </button>
          <button
            type="button"
            @click="confirmDelete"
            :disabled="isDeleting"
            class="flex items-center px-4 py-2 text-white bg-red-600 rounded-lg transition-colors hover:bg-red-700"
          >
            <span v-if="isDeleting" class="inline-block mr-2 w-4 h-4 rounded-full border-b-2 border-white animate-spin"></span>
            Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  itemName: {
    type: String,
    default: ""
  },
  isDeleting: {
    type: Boolean,
    default: false
  }
});

// Emits
const emit = defineEmits(['update:modelValue', 'confirm']);

// Métodos
const closeModal = () => {
  emit('update:modelValue', false);
};

const confirmDelete = () => {
  emit('confirm');
};
</script>
