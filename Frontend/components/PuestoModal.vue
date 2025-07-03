<!--
  PuestoModal.vue
  Componente modal para crear y editar puestos
  Incluye validación de formularios y manejo de estados
-->
<template>
  <div v-if="modelValue" class="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-50">
    <div class="mx-4 w-full max-w-md bg-white rounded-lg shadow-xl dark:bg-gray-800">
      <div class="p-6">
        <h2 class="mb-4 text-xl font-bold text-gray-900 dark:text-white">
          {{ isEditing ? 'Editar Puesto' : 'Nuevo Puesto' }}
        </h2>
        
        <!-- Formulario -->
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Campo: Nombre -->
          <div>
            <label for="nombre" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Nombre <span class="text-red-500">*</span>
            </label>
            <input
              id="nombre"
              v-model="form.puestoNombre"
              type="text"
              class="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              :class="{ 'border-red-500': errors.puestoNombre }"
              placeholder="Nombre del puesto"
              maxlength="100"
              @blur="validateField('puestoNombre')"
            />
            <p v-if="errors.puestoNombre" class="mt-1 text-sm text-red-500">
              {{ errors.puestoNombre }}
            </p>
          </div>
          
          <!-- Campo: Descripción -->
          <div>
            <label for="descripcion" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Descripción
            </label>
            <textarea
              id="descripcion"
              v-model="form.puestoDescripcion"
              rows="3"
              class="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              :class="{ 'border-red-500': errors.puestoDescripcion }"
              placeholder="Descripción del puesto"
              maxlength="500"
              @blur="validateField('puestoDescripcion')"
            ></textarea>
            <p v-if="errors.puestoDescripcion" class="mt-1 text-sm text-red-500">
              {{ errors.puestoDescripcion }}
            </p>
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {{ form.puestoDescripcion ? form.puestoDescripcion.length : 0 }}/500 caracteres
            </p>
          </div>
          
          <!-- Campo: Activo -->
          <div class="flex items-center">
            <input
              id="activo"
              v-model="form.puestoActivo"
              type="checkbox"
              class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label for="activo" class="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Activo
            </label>
          </div>
          
          <!-- Botones -->
          <div class="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 text-gray-700 rounded-lg border border-gray-300 transition-colors dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="isSubmitting || !isFormValid"
              class="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isSubmitting" class="inline-block mr-2 w-4 h-4 rounded-full border-b-2 border-white animate-spin"></span>
              {{ isEditing ? 'Actualizar' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useToast } from '../composables/useToast';
import { usePuestosStore } from '../stores/puestos';

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  puestoId: {
    type: Number,
    default: null
  }
});

// Emits
const emit = defineEmits(['update:modelValue', 'saved']);

// Composables
const toast = useToast();
const puestosStore = usePuestosStore();

// Estado
const isSubmitting = ref(false);
const isEditing = computed(() => !!props.puestoId);

// Formulario
const form = ref({
  puestoId: null,
  puestoNombre: '',
  puestoDescripcion: '',
  puestoActivo: true
});

// Errores de validación
const errors = ref({
  puestoNombre: '',
  puestoDescripcion: ''
});

// Resetear formulario
const resetForm = () => {
  form.value = {
    puestoId: null,
    puestoNombre: '',
    puestoDescripcion: '',
    puestoActivo: true
  };
  
  errors.value = {
    puestoNombre: '',
    puestoDescripcion: ''
  };
};

// Validación del formulario
const isFormValid = computed(() => {
  return !!form.value.puestoNombre && !errors.value.puestoNombre && !errors.value.puestoDescripcion;
});

// Cargar datos si estamos editando
watch(() => props.puestoId, async (newId) => {
  if (newId) {
    try {
      const puesto = await puestosStore.fetchPuestoById(newId);
      if (puesto) {
        form.value = { ...puesto };
      }
    } catch (error) {
      toast.error('Error al cargar los datos del puesto');
      console.error('Error al cargar puesto:', error);
    }
  } else {
    // Reset form para nuevo puesto
    resetForm();
  }
}, { immediate: true });

// Observar cambios en el modelValue (visibilidad del modal)
watch(() => props.modelValue, async (isVisible) => {
  // Cuando el modal se abre
  if (isVisible && props.puestoId) {
    try {
      // Cargar los datos del puesto nuevamente
      const puesto = await puestosStore.fetchPuestoById(props.puestoId);
      if (puesto) {
        form.value = { ...puesto };
      }
    } catch (error) {
      toast.error('Error al cargar los datos del puesto');
      console.error('Error al cargar puesto:', error);
    }
  }
});

// Validar campo específico
const validateField = (field) => {
  errors.value[field] = '';
  
  if (field === 'puestoNombre') {
    if (!form.value.puestoNombre) {
      errors.value.puestoNombre = 'El nombre es obligatorio';
    } else if (form.value.puestoNombre.length > 100) {
      errors.value.puestoNombre = 'El nombre no puede exceder los 100 caracteres';
    }
  }
  
  if (field === 'puestoDescripcion') {
    if (form.value.puestoDescripcion && form.value.puestoDescripcion.length > 500) {
      errors.value.puestoDescripcion = 'La descripción no puede exceder los 500 caracteres';
    }
  }
};

// Validar todo el formulario
const validateForm = () => {
  validateField('puestoNombre');
  validateField('puestoDescripcion');
  
  return !errors.value.puestoNombre && !errors.value.puestoDescripcion;
};

// Manejar envío del formulario
const handleSubmit = async () => {
  if (!validateForm() || isSubmitting.value) return;
  
  isSubmitting.value = true;
  
  try {
    let resultado;
    const operacion = isEditing.value ? 'actualización' : 'creación';
    console.log(`Iniciando ${operacion} de puesto:`, form.value);
    
    if (isEditing.value) {
      // Actualizar puesto existente
      resultado = await puestosStore.updatePuesto(props.puestoId, form.value);
      console.log('Puesto actualizado correctamente:', resultado);
    } else {
      // Crear nuevo puesto
      resultado = await puestosStore.createPuesto(form.value);
      console.log('Puesto creado correctamente:', resultado);
    }
    
    // Emitir evento de guardado exitoso con el resultado
    console.log('Emitiendo evento saved con resultado:', resultado);
    emit('saved', resultado);
    
    // Esperar un momento antes de cerrar el modal para asegurar que el evento se procese
    setTimeout(() => {
      // Cerrar modal
      closeModal();
    }, 100);
  } catch (error) {
    console.error('Error al guardar puesto:', error);
    // El toast de error ya se muestra en el store
  } finally {
    isSubmitting.value = false;
  }
};

// Cerrar modal
const closeModal = () => {
  emit('update:modelValue', false);
  resetForm();
};


</script>
