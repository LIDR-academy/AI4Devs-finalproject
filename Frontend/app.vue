<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <!-- Componente de notificaciones Notivue -->
    <NotivueWrapper />
  </div>
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
