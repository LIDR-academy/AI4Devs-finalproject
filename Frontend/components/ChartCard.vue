<template>
  <div class="bg-white rounded-lg shadow p-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ title }}</h3>
    <div class="h-64">
      <canvas ref="chartCanvas"></canvas>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  data: {
    type: Object,
    default: () => ({}),
  },
  type: {
    type: String,
    default: "line",
  },
});

const chartCanvas = ref(null);

onMounted(() => {
  // Aquí integrarías Chart.js cuando esté listo
  console.log("Chart component mounted:", props.title);
});
</script>
