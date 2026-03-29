<script setup lang="ts">
import { useField } from 'vee-validate';

const props = defineProps<{
  name?: string;
  label?: string;
  type?: string;
  placeholder?: string;
  modelValue?: string | number;
  errorMessage?: string;
  disabled?: boolean;
  rows?: number;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string | number];
  'keyup.enter': [];
}>();

// Si hay name, usar vee-validate
const { value: fieldValue, errorMessage: fieldError } = props.name 
  ? useField(() => props.name!, undefined, { syncVModel: true })
  : { value: ref(props.modelValue), errorMessage: ref(props.errorMessage) };

// Computed para manejar v-model manualmente si no hay vee-validate
const localValue = computed({
  get: () => props.name ? fieldValue.value : props.modelValue,
  set: (val) => {
    if (props.name) {
      fieldValue.value = val;
    } else {
      emit('update:modelValue', val as string | number);
    }
  }
});

const displayError = computed(() => props.errorMessage || fieldError.value);
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label v-if="label" :for="name" class="text-sm font-medium text-text">
      {{ label }}
    </label>
    
    <textarea
      v-if="type === 'textarea'"
      :id="name"
      v-model="localValue"
      :placeholder="placeholder"
      :rows="rows || 3"
      :disabled="disabled"
      :data-testid="name ? `input-${name}` : undefined"
      :class="[
        'px-4 py-2 rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 resize-none',
        displayError
          ? 'border-red-500 text-red-900 placeholder-red-300 focus:ring-red-500' 
          : 'border-secondary/30 text-text placeholder-secondary/60',
        disabled && 'opacity-50 cursor-not-allowed'
      ]"
    />
    
    <input
      v-else
      :id="name"
      v-model="localValue"
      :type="type || 'text'"
      :placeholder="placeholder"
      :disabled="disabled"
      :data-testid="name ? `input-${name}` : undefined"
      :class="[
        'px-4 py-2 rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200',
        displayError
          ? 'border-red-500 text-red-900 placeholder-red-300 focus:ring-red-500' 
          : 'border-secondary/30 text-text placeholder-secondary/60',
        disabled && 'opacity-50 cursor-not-allowed'
      ]"
      @keyup.enter="$emit('keyup.enter')"
    />
    
    <span v-if="displayError" class="text-xs text-red-500 mt-0.5" :data-testid="name ? `input-error-${name}` : undefined">
      {{ displayError }}
    </span>
  </div>
</template>
