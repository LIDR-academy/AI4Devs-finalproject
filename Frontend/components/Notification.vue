<!--
  components/Notification.vue
  Componente personalizado para mostrar notificaciones con Notivue
-->
<template>
  <div v-if="isValidItem" class="notification" :class="notificationClasses" data-testid="notification">
    <!-- Icono según el tipo de notificación -->
    <div class="notification__icon">
      <svg v-if="notificationType === 'success'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
        class="w-6 h-6">
        <path fill-rule="evenodd"
          d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
          clip-rule="evenodd" />
      </svg>
      <svg v-else-if="notificationType === 'error'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
        class="w-6 h-6">
        <path fill-rule="evenodd"
          d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z"
          clip-rule="evenodd" />
      </svg>
      <svg v-else-if="notificationType === 'info'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
        class="w-6 h-6">
        <path fill-rule="evenodd"
          d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z"
          clip-rule="evenodd" />
      </svg>
      <svg v-else-if="notificationType === 'warning'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
        fill="currentColor" class="w-6 h-6">
        <path fill-rule="evenodd"
          d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
          clip-rule="evenodd" />
      </svg>
    </div>

    <!-- Contenido de la notificación -->
    <div class="notification__content">
      <p class="notification__message" v-if="!allowHtml && notificationContent">{{ notificationContent }}</p>
      <p class="notification__message" v-else-if="allowHtml && notificationContent" v-html="notificationContent"></p>
      <p class="notification__message" v-else>Notificación</p>
    </div>

    <!-- Botón de cierre -->
    <button v-if="close" @click="handleClose" class="notification__close" aria-label="Cerrar notificación">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
        <path fill-rule="evenodd"
          d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
          clip-rule="evenodd" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
/**
 * Componente Notification.vue
 * Componente personalizado para mostrar notificaciones
 */
import { computed, defineExpose } from 'vue';

const props = defineProps({
  item: {
    type: Object,
    required: true,
    default: () => ({})
  },
  close: {
    type: Function,
    required: false,
    default: null
  },
  allowHtml: {
    type: Boolean,
    default: false
  }
});

// Verificar si el item es válido
const isValidItem = computed(() => {
  try {
    return props.item && typeof props.item === 'object' && props.item.type !== undefined;
  } catch (error) {
    console.error('Error validando item de notificación:', error);
    return false;
  }
});

// Obtener el tipo de notificación de forma segura
const notificationType = computed(() => {
  try {
    if (!isValidItem.value) return 'info';
    return props.item?.type || 'info';
  } catch (error) {
    console.error('Error obteniendo tipo de notificación:', error);
    return 'info';
  }
});

// Obtener el contenido de la notificación de forma segura
const notificationContent = computed(() => {
  try {
    if (!isValidItem.value) return '';
    return props.item?.content || '';
  } catch (error) {
    console.error('Error obteniendo contenido de notificación:', error);
    return '';
  }
});

// Clases dinámicas para la notificación
const notificationClasses = computed(() => {
  return {
    'notification--success': notificationType.value === 'success',
    'notification--error': notificationType.value === 'error',
    'notification--info': notificationType.value === 'info',
    'notification--warning': notificationType.value === 'warning'
  };
});

// Manejador seguro para el cierre
const handleClose = () => {
  if (typeof props.close === 'function') {
    props.close();
  }
};

// Exponemos propiedades y métodos para que sean accesibles externamente
defineExpose({
  handleClose,
  notificationType,
  notificationContent,
  isValidItem
});
</script>

<style scoped>
/* Estilo Material Design para las notificaciones */
.notification {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  border-radius: 0.25rem;
  margin-bottom: 0.75rem;
  position: relative;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  width: 100%;
  min-height: 48px;
  border: none;
}

/* Colores sólidos para cada tipo de notificación */
.notification--success {
  background-color: #4caf50;
  /* Verde */
}

.notification--error {
  background-color: #f44336;
  /* Rojo */
}

.notification--info {
  background-color: #2196f3;
  /* Azul */
}

.notification--warning {
  background-color: #ffeb3b;
  /* Amarillo */
  color: #333;
  /* Texto oscuro para mejor contraste en fondo amarillo */
}

.notification__icon {
  flex-shrink: 0;
  margin-right: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

/* Todos los iconos son blancos o negros según el fondo */
.notification--success .notification__icon,
.notification--error .notification__icon,
.notification--info .notification__icon {
  color: white;
}

.notification--warning .notification__icon {
  color: #333;
}

.notification__content {
  flex-grow: 1;
  padding-right: 1.5rem;
}

.notification__message {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 500;
}

.notification__close {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  right: 0.5rem;
  color: inherit;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
  width: 24px;
  height: 24px;
}

.notification__close:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.notification--warning .notification__close:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

/* Modo oscuro - no necesario para Material Design plano pero lo mantenemos por compatibilidad */
.dark .notification--warning {
  color: #333;
}

.dark .notification__close:hover {
  background-color: rgba(255, 255, 255, 0.2);
}
</style>
