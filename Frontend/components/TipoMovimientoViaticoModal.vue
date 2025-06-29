<template>
  <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Overlay de fondo -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="closeModal"></div>

      <!-- Centrado del modal -->
      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

      <!-- Contenido del modal -->
      <div 
        class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
        @click.stop
      >
        <div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                {{ isEditing ? "Editar" : "Nuevo" }} Tipo de Movimiento de Viático
              </h3>
              
              <!-- Formulario -->
              <form @submit.prevent="submitForm" class="mt-4 space-y-4">
                <!-- Campo: Nombre -->
                <div>
                  <label for="nombre" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nombre <span class="text-red-600">*</span>
                  </label>
                  <input
                    id="nombre"
                    v-model="form.nombre"
                    type="text"
                    required
                    maxlength="50"
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    :class="{ 'border-red-500': errors.nombre }"
                  />
                  <p v-if="errors.nombre" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ errors.nombre }}</p>
                  <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {{ form.nombre.length }}/50 caracteres
                  </p>
                </div>

                <!-- Campo: Descripción -->
                <div>
                  <label for="descripcion" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Descripción
                  </label>
                  <textarea
                    id="descripcion"
                    v-model="form.descripcion"
                    rows="3"
                    maxlength="500"
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white max-h-24 overflow-y-auto resize-none"
                    :class="{ 'border-red-500': errors.descripcion }"
                    placeholder="Describe el tipo de movimiento de viático"
                  ></textarea>
                  <p v-if="errors.descripcion" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ errors.descripcion }}</p>
                  <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {{ (form.descripcion || '').length }}/500 caracteres
                  </p>
                </div>

                <!-- Campo: Afectación (Radio buttons) -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tipo de Afectación <span class="text-red-600">*</span>
                  </label>
                  <div class="mt-2 flex space-x-6">
                    <div class="flex items-center">
                      <input
                        id="afectacion-positiva"
                        v-model="form.afectacion"
                        type="radio"
                        :value="1"
                        class="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                        required
                      />
                      <label
                        for="afectacion-positiva"
                        class="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                      >
                        Positivo (+1)
                      </label>
                    </div>
                    <div class="flex items-center">
                      <input
                        id="afectacion-negativa"
                        v-model="form.afectacion"
                        type="radio"
                        :value="-1"
                        class="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                        required
                      />
                      <label
                        for="afectacion-negativa"
                        class="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                      >
                        Negativo (-1)
                      </label>
                    </div>
                  </div>
                  <p
                    v-if="errors.afectacion"
                    class="mt-1 text-sm text-red-600 dark:text-red-400"
                  >
                    {{ errors.afectacion }}
                  </p>
                </div>

                <!-- Campo: Requiere Comprobante (Checkbox) -->
                <div>
                  <div class="flex items-center">
                    <input
                      id="requiereComprobante"
                      v-model="form.requiereComprobante"
                      type="checkbox"
                      class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                    />
                    <label
                      for="requiereComprobante"
                      class="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                    >
                      Requiere comprobante
                    </label>
                  </div>
                  <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Los movimientos que requieren comprobante necesitarán un documento adjunto
                  </p>
                </div>

                <!-- Campo: Activo (Checkbox) -->
                <div>
                  <div class="flex items-center">
                    <input
                      id="activo"
                      v-model="form.activo"
                      type="checkbox"
                      class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                    />
                    <label
                      for="activo"
                      class="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                    >
                      Activo
                    </label>
                  </div>
                  <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Los tipos de movimiento inactivos no estarán disponibles para crear nuevos movimientos
                  </p>
                </div>

                <!-- Botones de acción -->
                <div class="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                  <button
                    type="submit"
                    :disabled="isSubmitting || connectionError"
                    class="inline-flex w-full justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-primary-700 dark:hover:bg-primary-800 sm:col-start-2 sm:text-sm"
                  >
                    <span v-if="isSubmitting" class="mr-2">
                      <svg
                        class="h-4 w-4 animate-spin"
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
                    class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 sm:col-start-1 sm:mt-0 sm:text-sm"
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
import { ref, reactive, watch, computed } from "vue";
import { useToast } from "vue-toastification";

// Props
const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  tipoMovimientoViatico: {
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
  nombre: "",
  descripcion: "",
  afectacion: 1, // Valor por defecto: Positivo
  requiereComprobante: true, // Valor por defecto: true
  activo: true, // Valor por defecto: true
});

// Estado de errores
const errors = reactive({
  nombre: "",
  descripcion: "",
  afectacion: "",
});

// Estado de envío
const isSubmitting = ref(false);

// Limpiar errores
const clearErrors = () => {
  errors.nombre = "";
  errors.descripcion = "";
  errors.afectacion = "";
};

// Reiniciar el formulario
const resetForm = () => {
  form.nombre = "";
  form.descripcion = "";
  form.afectacion = 1;
  form.requiereComprobante = true;
  form.activo = true;
  
  // Limpiar errores
  clearErrors();
};

// Observar cambios en el tipo de movimiento de viático para actualizar el formulario
watch(
  () => props.tipoMovimientoViatico,
  (newVal) => {
    if (newVal) {
      // Reiniciar el formulario con los valores del tipo de movimiento de viático
      form.nombre = newVal.nombre || "";
      form.descripcion = newVal.descripcion || "";
      form.afectacion = newVal.afectacion !== undefined ? newVal.afectacion : 1;
      form.requiereComprobante = newVal.requiereComprobante !== undefined ? newVal.requiereComprobante : true;
      form.activo = newVal.activo !== undefined ? newVal.activo : true;
    } else {
      // Reiniciar el formulario con valores por defecto
      resetForm();
    }
  },
  { immediate: true }
);

// Validar el formulario
const validateForm = () => {
  let isValid = true;
  clearErrors();

  // Validar el nombre
  if (!form.nombre || !form.nombre.trim()) {
    errors.nombre = "El nombre es obligatorio";
    isValid = false;
  } else if (form.nombre.length > 50) {
    errors.nombre = "El nombre no puede exceder los 50 caracteres";
    isValid = false;
  } else if (!/^[a-zA-Z0-9\s\-_áéíóúÁÉÍÓÚñÑ.,]+$/.test(form.nombre)) {
    errors.nombre = "El nombre contiene caracteres no permitidos";
    isValid = false;
  }

  // Validar la descripción (opcional)
  if (form.descripcion && form.descripcion.length > 500) {
    errors.descripcion = "La descripción no puede exceder los 500 caracteres";
    isValid = false;
  }

  // Validar afectación (requerido, solo valores 1 o -1)
  if (![1, -1].includes(form.afectacion)) {
    errors.afectacion = "La afectación debe ser Positivo (1) o Negativo (-1)";
    isValid = false;
  }

  return isValid;
};

// Cerrar el modal
const closeModal = () => {
  if (isSubmitting.value) return;
  
  // Reiniciar el formulario
  resetForm();
  
  // Emitir evento de cierre
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
    const tipoMovimientoViatico = {
      ...(props.isEditing && props.tipoMovimientoViatico?.id ? { id: props.tipoMovimientoViatico.id } : {}),
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim() || null, // Enviar null si está vacío
      afectacion: form.afectacion,
      requiereComprobante: form.requiereComprobante,
      activo: form.activo,
    };

    // Emitir evento de envío con los datos del formulario
    emit("submit", tipoMovimientoViatico);

    // Reiniciar el formulario
    resetForm();
  } catch (error) {
    console.error("Error al enviar el formulario:", error);
    toast.error("Ocurrió un error al procesar el formulario");
  } finally {
    // Indicar que se terminó de enviar el formulario
    isSubmitting.value = false;
  }
};
</script>
