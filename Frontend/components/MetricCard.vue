<template>
  <div class="bg-white rounded-lg shadow p-6">
    <div class="flex items-center">
      <div class="flex-shrink-0">
        <!-- Para iconos de Heroicons/Vue -->
        <component
          v-if="isVueComponent"
          :is="icon"
          class="h-8 w-8"
          :class="iconColor"
        />
        <!-- Para strings/texto -->
        <div
          v-else-if="typeof icon === 'string'"
          class="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center text-lg font-semibold"
          :class="iconColor"
        >
          {{ icon }}
        </div>
        <!-- Fallback por defecto -->
        <div
          v-else
          class="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center"
          :class="iconColor"
        >
          <span class="text-blue-600">📊</span>
        </div>
      </div>
      <div class="ml-4">
        <p class="text-sm font-medium text-gray-600">{{ title }}</p>
        <p class="text-2xl font-semibold text-gray-900">{{ value }}</p>
        <p v-if="change" class="text-sm" :class="changeColor">{{ change }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  value: {
    type: [String, Number],
    required: true,
  },
  change: {
    type: String,
    default: "",
  },
  icon: {
    type: [String, Object, Function],
    default: null,
    validator: (value) => {
      // Aceptar strings, objetos (componentes), o functions (componentes)
      return (
        value === null ||
        typeof value === "string" ||
        typeof value === "object" ||
        typeof value === "function"
      );
    },
  },
  iconColor: {
    type: String,
    default: "text-blue-500",
  },
  changeColor: {
    type: String,
    default: "text-gray-500",
  },
});

// Computed para detectar si es un componente de Vue
const isVueComponent = computed(() => {
  return (
    props.icon &&
    (typeof props.icon === "function" ||
      (typeof props.icon === "object" && props.icon.render))
  );
});
</script>
