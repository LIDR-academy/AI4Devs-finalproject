<template>
  <UiModal :model-value="true" @update:model-value="() => {}">
    <template #title>
      Bienvenido al Proyecto
    </template>
    
    <div class="space-y-4">
      <p class="text-sm text-gray-600">
        Para continuar, ingresa tu nombre o alias para identificar tus comentarios.
      </p>
      
      <UiInput
        v-model="name"
        label="Nombre o Alias"
        placeholder="Ej: Juan Pérez"
        :error-message="errorMessage"
        @keyup.enter="handleSubmit"
      />
    </div>

    <template #footer>
      <button
        type="button"
        :disabled="!isValid"
        class="inline-flex w-full justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto"
        @click="handleSubmit"
      >
        Continuar
      </button>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  submit: [name: string]
}>();

const name = ref('');
const errorMessage = ref('');

const isValid = computed(() => name.value.trim().length >= 2);

const handleSubmit = () => {
  if (!isValid.value) {
    errorMessage.value = 'Por favor ingresa un nombre válido (mínimo 2 caracteres)';
    return;
  }
  
  errorMessage.value = '';
  emit('submit', name.value.trim());
};
</script>
