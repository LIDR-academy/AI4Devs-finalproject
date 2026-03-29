<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  type?: 'button' | 'submit' | 'reset';
  loading?: boolean;
  disabled?: boolean;
  testId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  type: 'button',
  loading: false,
  disabled: false,
});
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :data-testid="testId"
    :class="[
      'relative flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed',
      variant === 'primary' && 'bg-primary text-accent hover:bg-primary/80 focus:ring-primary',
      variant === 'secondary' && 'bg-secondary text-primary hover:bg-secondary/80 focus:ring-secondary',
      variant === 'outline' && 'border-2 border-secondary/30 text-text hover:border-primary hover:text-primary bg-transparent',
      variant === 'ghost' && 'bg-transparent text-secondary hover:text-primary hover:bg-accent',
    ]"
  >
    <svg 
      v-if="loading" 
      class="animate-spin -ml-1 mr-2 h-4 w-4 text-current" 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <slot />
  </button>
</template>
