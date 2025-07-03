<template>
  <div class="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
    <h2 class="text-lg font-semibold mb-4">Prueba de Notificaciones</h2>
    <div class="flex flex-col space-y-2">
      <button 
        @click="showSuccess" 
        class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Mostrar Éxito
      </button>
      <button 
        @click="showError" 
        class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Mostrar Error
      </button>
      <button 
        @click="showInfo" 
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Mostrar Info
      </button>
      <button 
        @click="showWarning" 
        class="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
      >
        Mostrar Advertencia
      </button>
    </div>
  </div>
</template>

<script setup>
import { useToast } from '../composables/useToast';

// Obtenemos el objeto toast tipado
const toast = useToast();

// Funciones para mostrar diferentes tipos de notificaciones
function showSuccess() {
  toast.success('Operación completada', 'La acción se realizó correctamente');
}

function showError() {
  toast.error('Error', 'Ocurrió un problema al procesar la solicitud');
}

function showInfo() {
  toast.info('Información', 'Este es un mensaje informativo');
}

function showWarning() {
  toast.warning('Advertencia', 'Tenga cuidado con esta acción');
}
</script>
