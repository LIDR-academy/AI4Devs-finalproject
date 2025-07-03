<template>
  <!-- Sistema de notificaciones personalizado -->
  <ClientOnly>
    <div class="notifications-container">
      <TransitionGroup name="notification">
        <div 
          v-for="notification in notifications.list" 
          :key="notification.id"
          class="notification" 
          :class="'notification--' + notification.type"
        >
          <div class="notification__content">{{ notification.content }}</div>
          <button class="notification__close" @click="notifications.remove(notification.id)">&times;</button>
        </div>
      </TransitionGroup>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
/**
 * components/NotivueWrapper.vue
 * Componente wrapper para el sistema de notificaciones personalizado
 * Utiliza ClientOnly para evitar errores de hidratación en SSR
 */
import { onMounted, inject } from 'vue';

// Inyectamos el sistema de notificaciones desde el plugin
const notifications = inject('notifications', { 
  list: [], 
  add: () => 0,
  remove: (id: number) => {},
  clear: () => {}
});

onMounted(() => {
  console.log('NotivueWrapper montado - Usando sistema de notificaciones personalizado');
});
</script>

<style scoped>
.notifications-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  width: 350px;
  max-width: 90%;
}

.notification {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  margin-bottom: 0.75rem;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  width: 100%;
  min-height: 48px;
}

.notification--success { background-color: #4caf50; }
.notification--error { background-color: #f44336; }
.notification--info { background-color: #2196f3; }
.notification--warning { 
  background-color: #ffeb3b; 
  color: #333;
}

.notification__content {
  flex: 1;
}

.notification__close {
  background: transparent;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: 1.25rem;
  margin-left: 0.5rem;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

/* Animaciones para las notificaciones */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
