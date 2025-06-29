<template>
  <div v-if="modelValue" class="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-50">
    <div class="mx-4 w-full max-w-md bg-white rounded-lg shadow-xl dark:bg-gray-800">
      <div class="p-6">
        <h2 class="mb-4 text-xl font-bold text-gray-900 dark:text-white">
          {{ isEditing ? 'Editar Puesto' : 'Nuevo Puesto' }}
        </h2>
        
        <form @submit.prevent="submitForm">
          <div class="mb-4">
            <label for="puestoNombre" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Nombre
            </label>
            <input
              id="puestoNombre"
              v-model="formData.puestoNombre"
              type="text"
              class="px-4 py-2 w-full text-gray-900 bg-white rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
              :class="{ 'border-red-500': formErrors.puestoNombre }"
            />
            <p v-if="formErrors.puestoNombre" class="mt-1 text-sm text-red-600 dark:text-red-400">
              {{ formErrors.puestoNombre }}
            </p>
          </div>
          
          <div class="mb-4">
            <label for="puestoDescripcion" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Descripción
            </label>
            <textarea
              id="puestoDescripcion"
              v-model="formData.puestoDescripcion"
              rows="3"
              class="px-4 py-2 w-full text-gray-900 bg-white rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
              :class="{ 'border-red-500': formErrors.puestoDescripcion }"
            ></textarea>
            <p v-if="formErrors.puestoDescripcion" class="mt-1 text-sm text-red-600 dark:text-red-400">
              {{ formErrors.puestoDescripcion }}
            </p>
          </div>
          
          <div class="mb-6">
            <label class="inline-flex items-center">
              <input
                type="checkbox"
                v-model="formData.puestoActivo"
                class="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <span class="ml-2 text-gray-900 dark:text-white">Activo</span>
            </label>
          </div>
          
          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 text-gray-700 rounded-lg border border-gray-300 transition-colors dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="flex items-center px-4 py-2 text-white rounded-lg transition-colors bg-primary-600 hover:bg-primary-700"
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
import { ref, computed, watch } from "vue";
import { useToast } from "~/composables/useToast";

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  puesto: {
    type: Object,
    default: () => ({
      puestoNombre: "",
      puestoDescripcion: "",
      puestoActivo: true
    })
  },
  isEditing: {
    type: Boolean,
    default: false
  }
});

// Emits
const emit = defineEmits(['update:modelValue', 'submit']);

// Composable para notificaciones toast
const toast = useToast();

// Estado para formulario
const formData = ref({
  puestoNombre: "",
  puestoDescripcion: "",
  puestoActivo: true,
});
const formErrors = ref({});
const isSubmitting = ref(false);

// Observar cambios en el puesto para actualizar el formulario
watch(
  () => props.puesto,
  (newPuesto) => {
    if (newPuesto) {
      // Crear una copia profunda para evitar modificar el objeto original
      formData.value = JSON.parse(JSON.stringify(newPuesto));
      console.log('Formulario actualizado con datos:', formData.value);
    } else {
      // Si no hay puesto, reiniciar el formulario
      formData.value = {
        puestoNombre: "",
        puestoDescripcion: "",
        puestoActivo: true
      };
    }
    // Limpiar errores al cambiar los datos
    formErrors.value = {};
  },
  { immediate: true, deep: true }
);

// Métodos
const closeModal = () => {
  emit('update:modelValue', false);
};

const validateForm = () => {
  const errors = {};

  // Validar nombre
  if (!formData.value.puestoNombre || formData.value.puestoNombre.trim() === '') {
    errors.puestoNombre = "El nombre es obligatorio";
  } else if (formData.value.puestoNombre.length > 50) {
    errors.puestoNombre = "El nombre no puede exceder los 50 caracteres";
  }

  // Validar descripción
  if (!formData.value.puestoDescripcion || formData.value.puestoDescripcion.trim() === '') {
    errors.puestoDescripcion = "La descripción es obligatoria";
  } else if (formData.value.puestoDescripcion.length > 500) {
    errors.puestoDescripcion = "La descripción no puede exceder los 500 caracteres";
  }

  // Actualizar errores y devolver resultado
  formErrors.value = errors;
  const esValido = Object.keys(errors).length === 0;
  
  if (!esValido) {
    console.warn('Formulario inválido. Errores:', errors);
  }
  
  return esValido;
};

const submitForm = async () => {
  if (!validateForm()) return;

  isSubmitting.value = true;
  
  try {
    // Crear una copia profunda de los datos para evitar problemas de reactividad
    const datosFormulario = JSON.parse(JSON.stringify(formData.value));
    
    // Asegurar que los tipos de datos sean correctos antes de enviar
    if (datosFormulario.puestoId) {
      datosFormulario.puestoId = Number(datosFormulario.puestoId);
    }
    
    // Asegurar que puestoActivo sea booleano
    datosFormulario.puestoActivo = Boolean(datosFormulario.puestoActivo);
    
    console.log('Enviando datos del formulario:', datosFormulario);
    
    // Emitir evento con los datos del formulario
    emit('submit', datosFormulario);
    
    // Cerrar modal después de éxito
    closeModal();
  } catch (err) {
    console.error("Error al procesar formulario:", err);
  } finally {
    isSubmitting.value = false;
  }
};
</script>
