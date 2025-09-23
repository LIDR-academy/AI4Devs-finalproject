<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

/*
Pruebas responsivas rápidas:
- En navegador, abre herramientas y cambia entre 320px, 768px, 1024px, 1440px.
- En Vuetify, verifica densidad y comportamiento de v-app-bar fijo y v-tabs.
- Navega por /, /shop, /subscribe, /about para validar tabs activas.
*/
</script>

<template>
  <v-app>
    <AppHeader />
    <v-main class="pt-16">
      <router-view />
    </v-main>
    <AppFooter />
  </v-app>
</template>

<style scoped></style>
