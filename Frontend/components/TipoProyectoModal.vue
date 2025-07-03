<template>
  <div v-if="show" class="overflow-y-auto fixed inset-0 z-50" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex justify-center items-center px-4 pt-4 pb-20 min-h-screen text-center sm:block sm:p-0">
      <!-- Overlay de fondo -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="closeModal"></div>

      <!-- Centrado del modal -->
      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

      <!-- Contenido del modal -->
      <div 
        class="inline-block overflow-hidden text-left align-bottom bg-white rounded-lg shadow-xl transition-all transform dark:bg-gray-800 sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
        @click.stop
      >
        <div class="px-4 pt-5 pb-4 bg-white dark:bg-gray-800 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="mt-3 w-full text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-white" id="modal-title">
                {{ isEditing ? "Editar" : "Nuevo" }} Tipo de Proyecto
              </h3>
              
              <!-- Formulario -->
              <form @submit.prevent="submitForm" class="mt-4 space-y-4">
                <!-- Campo: Nombre -->
                <div>
                  <label for="tipoProyectoNombre" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nombre <span class="text-red-600">*</span>
                  </label>
                  <input
                    id="tipoProyectoNombre"
                    v-model="form.tipoProyectoNombre"
                    type="text"
                    required
                    maxlength="50"
                    class="block px-3 py-2 mt-1 w-full rounded-md border border-gray-300 shadow-sm dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    :class="{ 'border-red-500': errors.tipoProyectoNombre }"
                    placeholder="Ingrese el nombre del tipo de proyecto"
                  />
                  <p v-if="errors.tipoProyectoNombre" class="mt-1 text-sm text-red-600 dark:text-red-400">
                    {{ errors.tipoProyectoNombre }}
                  </p>
                  <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {{ form.tipoProyectoNombre.length }}/50 caracteres
                  </p>
                </div>

                <!-- Campo: Descripción -->
                <div>
                  <label for="tipoProyectoDescripcion" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Descripción
                  </label>
                  <textarea
                    id="tipoProyectoDescripcion"
                    v-model="form.tipoProyectoDescripcion"
                    rows="3"
                    maxlength="500"
                    class="block overflow-y-auto px-3 py-2 mt-1 w-full max-h-24 rounded-md border border-gray-300 shadow-sm resize-none dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    :class="{ 'border-red-500': errors.tipoProyectoDescripcion }"
                    placeholder="Describe el tipo de proyecto"
                  ></textarea>
                  <p v-if="errors.tipoProyectoDescripcion" class="mt-1 text-sm text-red-600 dark:text-red-400">
                    {{ errors.tipoProyectoDescripcion }}
                  </p>
                  <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {{ (form.tipoProyectoDescripcion || '').length }}/500 caracteres
                  </p>
                </div>

                <!-- Campo: Activo (Checkbox) -->
                <div>
                  <div class="flex items-center">
                    <input
                      id="tipoProyectoActivo"
                      v-model="form.tipoProyectoActivo"
                      type="checkbox"
                      class="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label for="tipoProyectoActivo" class="block ml-2 text-sm text-gray-900 dark:text-white">
                      Activo
                    </label>
                  </div>
                  <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Los tipos de proyecto inactivos no estarán disponibles para asignar a nuevos proyectos
                  </p>
                </div>

                <!-- Botones de acción -->
                <div class="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                  <button
                    type="submit"
                    :disabled="isSubmitting || connectionError"
                    class="inline-flex justify-center px-4 py-2 w-full text-base font-medium text-white rounded-md border border-transparent shadow-sm bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:col-start-2 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span v-if="isSubmitting" class="mr-2">
                      <svg
                        class="w-4 h-4 animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          class="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          stroke-width="4"
                        ></circle>
                        <path
                          class="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    </span>
                    {{ isSubmitting ? "Guardando..." : "Guardar" }}
                  </button>
                  <button
                    type="button"
                    @click="closeModal"
                    :disabled="isSubmitting"
                    class="inline-flex justify-center px-4 py-2 mt-3 w-full text-base font-medium text-gray-700 bg-white rounded-md border border-gray-300 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:col-start-1 sm:text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import { useToast } from '../composables/useToast';

// Props
const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  tipoProyecto: {
    type: Object,
    default: () => null,
  },
  isEditing: {
    type: Boolean,
    default: false,
  },
  connectionError: {
    type: Boolean,
    default: false,
  },
});

// Emits
const emit = defineEmits(["close", "submit"]);

// Toast
const toast = useToast();

// Estado del formulario
const form = reactive({
  tipoProyectoNombre: "",
  tipoProyectoDescripcion: "",
  tipoProyectoActivo: true, // Valor por defecto: true
});

// Estado de errores
const errors = reactive({
  tipoProyectoNombre: "",
  tipoProyectoDescripcion: "",
});

// Estado de envío
const isSubmitting = ref(false);

// Limpiar errores
const clearErrors = () => {
  errors.tipoProyectoNombre = "";
  errors.tipoProyectoDescripcion = "";
};

// Reiniciar el formulario
const resetForm = () => {
  // Reiniciar campos del formulario
  form.tipoProyectoNombre = "";
  form.tipoProyectoDescripcion = "";
  form.tipoProyectoActivo = true;
  
  // Limpiar errores
  clearErrors();
  
  // Reiniciar estado de botones
  isSubmitting.value = false;
};

// Observar cambios en el modal y en el tipo de proyecto para actualizar el formulario
watch(
  () => props.show,
  (showModal, oldValue) => {
    // Cuando el modal se cierra, reiniciar el formulario
    if (!showModal && oldValue === true) {
      console.log('Modal cerrado, reiniciando formulario');
      resetForm();
      return;
    }
    
    // Cuando el modal se abre
    if (showModal) {
      // Forzar reinicio del formulario primero
      resetForm();
      
      // Luego, si estamos editando y hay un tipo de proyecto, cargar sus valores
      if (props.isEditing && props.tipoProyecto) {
        console.log('Cargando datos para edición:', props.tipoProyecto);
        // Usar setTimeout para asegurar que se ejecute después de que Vue haya actualizado el DOM
        setTimeout(() => {
          form.tipoProyectoNombre = props.tipoProyecto.nombre || props.tipoProyecto.tipoProyectoNombre || "";
          form.tipoProyectoDescripcion = props.tipoProyecto.descripcion || props.tipoProyecto.tipoProyectoDescripcion || "";
          form.tipoProyectoActivo = props.tipoProyecto.activo !== undefined ? props.tipoProyecto.activo : 
                                   (props.tipoProyecto.tipoProyectoActivo !== undefined ? props.tipoProyecto.tipoProyectoActivo : true);
        }, 50);
      } else {
        console.log('Reiniciando formulario para nueva entrada');
      }
    }
  },
  { immediate: true }
);

// Validar el formulario
const validateForm = () => {
  let isValid = true;
  clearErrors();

  // Validar el nombre
  if (!form.tipoProyectoNombre || !form.tipoProyectoNombre.trim()) {
    errors.tipoProyectoNombre = "El nombre es obligatorio";
    isValid = false;
  } else if (form.tipoProyectoNombre.length > 50) {
    errors.tipoProyectoNombre = "El nombre no puede exceder los 50 caracteres";
    isValid = false;
  } else if (!/^[a-zA-Z0-9\s\-_áéíóúÁÉÍÓÚñÑ.,]+$/.test(form.tipoProyectoNombre)) {
    errors.tipoProyectoNombre = "El nombre contiene caracteres no permitidos";
    isValid = false;
  }

  // Validar la descripción (opcional)
  if (form.tipoProyectoDescripcion && form.tipoProyectoDescripcion.length > 500) {
    errors.tipoProyectoDescripcion = "La descripción no puede exceder los 500 caracteres";
    isValid = false;
  }

  return isValid;
};

// Cerrar el modal
const closeModal = () => {
  // Limpiar el formulario al cerrar
  resetForm();
  
  // Emitir evento para cerrar el modal
  emit("close");
};

// Enviar el formulario
const submitForm = async () => {
  // Validar el formulario
  if (!validateForm()) {
    toast.error("Por favor, corrija los errores en el formulario");
    return;
  }

  try {
    // Indicar que se está enviando el formulario
    isSubmitting.value = true;

    // Preparar los datos a enviar
    const tipoProyecto = {
      // Usar id en lugar de tipoProyectoId para compatibilidad con el servicio
      ...(props.isEditing && (props.tipoProyecto?.id || props.tipoProyecto?.tipoProyectoId) ? 
          { id: props.tipoProyecto?.id || props.tipoProyecto?.tipoProyectoId } : {}),
      // Mapear los campos al formato esperado por el servicio
      nombre: form.tipoProyectoNombre.trim(),
      descripcion: form.tipoProyectoDescripcion.trim() || null, // Enviar null si está vacío
      activo: form.tipoProyectoActivo,
    };

    // Emitir evento de envío con los datos del formulario
    emit("submit", tipoProyecto);
    
    // Limpiar el formulario después de enviar correctamente
    // Esto asegura que si se abre el modal nuevamente, no tenga datos antiguos
    resetForm();
  } catch (error) {
    console.error("Error al enviar el formulario:", error);
    toast.error("Ocurrió un error al procesar el formulario");
    isSubmitting.value = false;
  }
};
</script>
