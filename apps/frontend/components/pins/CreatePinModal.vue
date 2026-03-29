<template>
  <UiModal v-model="localShow" @update:modelValue="handleClose">
    <template #title>
      Nuevo Comentario
    </template>

    <div class="space-y-4">
      <p class="text-sm text-gray-600">
        Escribe tu comentario sobre este punto del plano:
      </p>

      <UiInput
        v-model="content"
        label="Comentario"
        placeholder="Ej: ¿Esta pared puede moverse 20cm a la izquierda?"
        :error-message="contentError"
        type="textarea"
        rows="4"
      />

      <div class="text-xs text-gray-500">
        Coordenadas: X: {{ Math.round(coords.x * 100) }}%, Y: {{ Math.round(coords.y * 100) }}%
      </div>
    </div>

    <template #footer>
      <div class="flex gap-2 justify-end w-full">
        <UiButton variant="outline" @click="handleClose">
          Cancelar
        </UiButton>
        <UiButton
          variant="primary"
          :loading="loading"
          :disabled="!isValid"
          @click="handleSubmit"
        >
          Crear Pin
        </UiButton>
      </div>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean;
  coords: { x: number; y: number }; // Coordenadas relativas 0-1
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  submit: [content: string];
}>();

const localShow = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const content = ref('');
const contentError = ref('');

const isValid = computed(() => {
  return content.value.trim().length >= 3;
});

const validate = () => {
  contentError.value = '';
  
  if (content.value.trim().length < 3) {
    contentError.value = 'El comentario debe tener al menos 3 caracteres';
    return false;
  }

  return true;
};

const handleSubmit = () => {
  if (!validate()) return;
  
  emit('submit', content.value.trim());
};

const handleClose = () => {
  content.value = '';
  contentError.value = '';
  emit('update:modelValue', false);
};

// Reset al abrir
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    content.value = '';
    contentError.value = '';
  }
});
</script>
