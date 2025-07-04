<template>
  <!-- Componente nativo de Notivue con slot personalizable -->
  <Notivue v-slot="item">
    <Notification :item="item" :theme="materialTheme" />
  </Notivue>
</template>

<script setup>
// Importamos los componentes necesarios de Notivue
import { Notivue, Notification, materialTheme } from 'notivue'

// El componente Notivue se encarga automáticamente del posicionamiento, 
// animaciones y gestión de notificaciones según la configuración del plugin
</script>