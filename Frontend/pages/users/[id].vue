<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Perfil de Usuario: {{ userId }}</h1>
    <p class="text-gray-600">Página de detalle del usuario en desarrollo</p>
    <NuxtLink
      to="/users"
      class="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded"
    >
      ← Volver a Usuarios
    </NuxtLink>
  </div>
</template>

<script setup>
const route = useRoute();
const userId = route.params.id;

definePageMeta({
  title: "Detalle del Usuario",
});
</script>
