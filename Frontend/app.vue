<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
// Global app configuration
useHead({
  titleTemplate: '%s | BGA Business System',
  meta: [
    { name: 'description', content: 'Sistema de Gestión Integral para BGA - Consultoría Estratégica' }
  ]
})
</script>
