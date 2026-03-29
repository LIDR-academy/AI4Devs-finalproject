<script setup lang="ts">
import { ref } from 'vue';
import { useProjectStore } from '~/stores/project';

const props = defineProps<{
  modelValue: boolean
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'success'): void;
}>();

const projectStore = useProjectStore();
const form = ref({
  title: '',
  description: ''
});
const isSubmitting = ref(false);
const errorMessage = ref('');

const closeModal = () => {
  emit('update:modelValue', false);
  form.value = { title: '', description: '' };
  errorMessage.value = '';
};

const handleSubmit = async () => {
  if (!form.value.title.trim()) {
    errorMessage.value = 'El título es obligatorio';
    return;
  }

  isSubmitting.value = true;
  errorMessage.value = '';

  try {
    await projectStore.createProject({
      title: form.value.title,
      description: form.value.description
    });
    emit('success');
    closeModal();
  } catch (e: any) {
    errorMessage.value = e.message || 'Error al crear proyecto';
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/60">
    <div class="bg-accent rounded-lg shadow-xl w-full max-w-md overflow-hidden">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-secondary/20 flex justify-between items-center bg-background">
        <h3 class="text-lg font-medium text-text">Nuevo Proyecto</h3>
        <button 
          @click="closeModal" 
          class="text-secondary hover:text-text focus:outline-none"
        >
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Body -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
        <div v-if="errorMessage" class="bg-red-50 text-red-700 p-3 rounded text-sm">
          {{ errorMessage }}
        </div>

        <div>
          <label class="block text-sm font-medium text-text mb-1">Título</label>
          <input 
            v-model="form.title" 
            type="text" 
            class="w-full px-3 py-2 border border-secondary/30 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="Mi nuevo proyecto"
            required
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-text mb-1">Descripción</label>
          <textarea 
            v-model="form.description" 
            class="w-full px-3 py-2 border border-secondary/30 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            rows="3"
            placeholder="Descripción opcional..."
          ></textarea>
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <button 
            type="button" 
            @click="closeModal" 
            class="px-4 py-2 text-sm font-medium text-text bg-white border border-secondary/30 rounded-md hover:bg-background focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            :disabled="isSubmitting"
            class="px-4 py-2 text-sm font-medium text-accent bg-primary border border-transparent rounded-md hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isSubmitting ? 'Creando...' : 'Crear Proyecto' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
