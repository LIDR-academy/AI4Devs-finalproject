<template>
  <div class="overflow-x-auto">
    <table class="table table-zebra w-full">
      <!-- Cabecera de la tabla -->
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Descripción</th>
          <th>Extensiones</th>
          <th>Tamaño Máximo</th>
          <th>Activo</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <!-- Filas de datos -->
        <tr v-for="item in tiposDocumento" :key="item.id" class="hover">
          <td>{{ item.id }}</td>
          <td>{{ item.nombre }}</td>
          <td>{{ item.descripcion }}</td>
          <td>{{ item.extensionesPermitidas }}</td>
          <td>{{ item.tamanoMaximoMB }} MB</td>
          <td>
            <div class="badge" :class="item.activo ? 'badge-success' : 'badge-error'">
              {{ item.activo ? 'Activo' : 'Inactivo' }}
            </div>
          </td>
          <td>
            <div class="flex gap-2">
              <button class="btn btn-sm btn-info" @click="editarItem(item)">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <button class="btn btn-sm btn-error" @click="confirmarEliminar(item)">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </td>
        </tr>
        
        <!-- Mensaje cuando no hay datos -->
        <tr v-if="tiposDocumento.length === 0">
          <td colspan="7" class="text-center py-4">
            <div class="flex flex-col items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="mt-2 text-gray-500">No se encontraron tipos de documento</p>
              <button class="btn btn-primary btn-sm mt-4" @click="recargarDatos">Recargar datos</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Modal de confirmación para eliminar -->
  <input type="checkbox" id="modal-eliminar" class="modal-toggle" v-model="modalEliminarVisible" />
  <div class="modal" :class="{ 'modal-open': modalEliminarVisible }">
    <div class="modal-box">
      <h3 class="font-bold text-lg">Confirmar eliminación</h3>
      <p class="py-4">¿Estás seguro de que deseas eliminar el tipo de documento "{{ itemSeleccionado?.nombre }}"?</p>
      <div class="modal-action">
        <button class="btn btn-error" @click="eliminarItem">Eliminar</button>
        <button class="btn" @click="modalEliminarVisible = false">Cancelar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useToast } from 'vue-toastification';

// Propiedades
const props = defineProps({
  tiposDocumento: {
    type: Array,
    default: () => []
  }
});

// Emits
const emit = defineEmits(['editar', 'eliminar', 'recargar']);

// Estado
const modalEliminarVisible = ref(false);
const itemSeleccionado = ref(null);
const toast = useToast();

// Métodos
const editarItem = (item) => {
  emit('editar', item);
};

const confirmarEliminar = (item) => {
  itemSeleccionado.value = item;
  modalEliminarVisible.value = true;
};

const eliminarItem = async () => {
  try {
    emit('eliminar', itemSeleccionado.value);
    modalEliminarVisible.value = false;
    toast.success(`Tipo de documento "${itemSeleccionado.value.nombre}" eliminado correctamente`);
  } catch (error) {
    toast.error('Error al eliminar el tipo de documento');
    console.error('Error al eliminar:', error);
  }
};

const recargarDatos = () => {
  emit('recargar');
};
</script>
