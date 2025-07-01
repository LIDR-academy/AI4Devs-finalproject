<template>
  <div>
    <TransitionRoot appear :show="modelValue" as="template">
      <Dialog as="div" @close="closeModal" class="relative z-50">
        <!-- Overlay de fondo oscuro -->
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black bg-opacity-50" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as="template"
              enter="duration-300 ease-out"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="duration-200 ease-in"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <DialogPanel
                class="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 shadow-xl transition-all dark:bg-gray-800"
              >
                <!-- Encabezado del modal -->
                <DialogTitle
                  as="h3"
                  class="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                >
                  {{ isEditing ? 'Editar Perfil' : 'Crear Nuevo Perfil' }}
                </DialogTitle>

                <!-- Formulario -->
                <form @submit.prevent="savePerfil" class="mt-4">
                  <!-- Campo: Nombre -->
                  <div class="mb-4">
                    <label
                      for="nombre"
                      class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Nombre <span class="text-red-500">*</span>
                    </label>
                    <input
                      id="nombre"
                      v-model="form.nombre"
                      type="text"
                      class="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      :class="{
                        'border-red-500': v$.nombre.$error,
                      }"
                      placeholder="Nombre del perfil"
                      @blur="v$.nombre.$touch()"
                    />
                    <div
                      v-if="v$.nombre.$error"
                      class="mt-1 text-sm text-red-500"
                    >
                      {{ v$.nombre.$errors[0].$message }}
                    </div>
                  </div>

                  <!-- Campo: Descripción -->
                  <div class="mb-4">
                    <label
                      for="descripcion"
                      class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Descripción
                    </label>
                    <textarea
                      id="descripcion"
                      v-model="form.descripcion"
                      rows="3"
                      class="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      :class="{
                        'border-red-500': v$.descripcion.$error,
                      }"
                      placeholder="Descripción del perfil"
                      @blur="v$.descripcion.$touch()"
                    ></textarea>
                    <div
                      v-if="v$.descripcion.$error"
                      class="mt-1 text-sm text-red-500"
                    >
                      {{ v$.descripcion.$errors[0].$message }}
                    </div>
                  </div>

                  <!-- Campo: Estado (solo para edición) -->
                  <div v-if="isEditing" class="mb-4">
                    <label
                      for="activo"
                      class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Estado
                    </label>
                    <div class="flex items-center">
                      <input
                        id="activo"
                        v-model="form.activo"
                        type="checkbox"
                        class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <label
                        for="activo"
                        class="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Activo
                      </label>
                    </div>
                  </div>

                  <!-- Botones de acción -->
                  <div class="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      @click="closeModal"
                      class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                      :disabled="isLoading"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:hover:bg-blue-800"
                      :disabled="isLoading"
                    >
                      <span v-if="isLoading" class="flex items-center">
                        <svg
                          class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                        Guardando...
                      </span>
                      <span v-else>Guardar</span>
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from "@headlessui/vue";
import { useVuelidate } from "@vuelidate/core";
import { usePerfilesStore } from "../stores/perfiles";

// Definir validadores simples para evitar problemas de compatibilidad
const requiredValidator = (value) => !!value;
const maxLength100Validator = (value) => !value || value.length <= 100;
const maxLength500Validator = (value) => !value || value.length <= 500;

// Props y emits
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  perfilId: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(["update:modelValue", "saved"]);

// Store y estado
const perfilesStore = usePerfilesStore();
const isLoading = ref(false);
const isEditing = computed(() => props.perfilId !== 0);

// Formulario
const form = ref({
  nombre: "",
  descripcion: "",
  activo: true,
  objetoId: 1, // Valor por defecto
});

// Validaciones
const rules = {
  nombre: {
    required: { $validator: requiredValidator, $message: "El nombre es obligatorio" },
    maxLength: { $validator: maxLength100Validator, $message: "El nombre no puede exceder los 100 caracteres" }
  },
  descripcion: {
    maxLength: { $validator: maxLength500Validator, $message: "La descripción no puede exceder los 500 caracteres" }
  },
};

const v$ = useVuelidate(rules, form);

// Cargar datos del perfil si estamos en modo edición
async function loadPerfilData() {
  console.log('loadPerfilData - Iniciando carga de datos para perfilId:', props.perfilId);
  if (props.perfilId !== 0) {
    try {
      isLoading.value = true;
      
      // Primero verificamos si el perfil está en el store
      console.log('loadPerfilData - Buscando perfil en el store');
      const perfilEnStore = perfilesStore.perfiles.find(p => p.id === props.perfilId);
      
      let perfilData;
      if (perfilEnStore) {
        console.log('loadPerfilData - Perfil encontrado en el store:', perfilEnStore);
        perfilData = perfilEnStore;
      } else {
        console.log('loadPerfilData - Perfil no encontrado en el store, solicitando al servicio');
        perfilData = await perfilesStore.fetchPerfilById(props.perfilId);
        console.log('loadPerfilData - Datos recibidos del servicio:', perfilData);
      }
      
      if (!perfilData) {
        console.error('loadPerfilData - No se pudo obtener datos del perfil');
        toast.error('No se pudo cargar la información del perfil');
        return;
      }
      
      // Asignar datos al formulario
      console.log('loadPerfilData - Asignando datos al formulario:', perfilData);
      form.value = {
        nombre: perfilData.nombre || '',
        descripcion: perfilData.descripcion || "",
        activo: perfilData.activo !== undefined ? perfilData.activo : true,
        objetoId: perfilData.objetoId || 1,
      };
      console.log('loadPerfilData - Formulario actualizado:', form.value);
    } catch (error) {
      console.error("Error al cargar datos del perfil:", error);
      toast.error('Error al cargar datos del perfil');
    } finally {
      isLoading.value = false;
      console.log('loadPerfilData - Finalizado, isLoading:', isLoading.value);
    }
  } else {
    console.log('loadPerfilData - No hay ID de perfil, modo creación');
    resetForm();
  }
}

// Guardar perfil
async function savePerfil() {
  const isValid = await v$.value.$validate();
  if (!isValid) return;

  try {
    isLoading.value = true;

    if (isEditing.value) {
      // Actualizar perfil existente
      await perfilesStore.updatePerfil(props.perfilId, {
        id: props.perfilId,
        nombre: form.value.nombre,
        descripcion: form.value.descripcion,
        activo: form.value.activo,
        objetoId: form.value.objetoId,
      });
    } else {
      // Crear nuevo perfil
      await perfilesStore.createPerfil({
        nombre: form.value.nombre,
        descripcion: form.value.descripcion,
        activo: true, // Siempre activo al crear
        objetoId: form.value.objetoId,
      });
    }

    // Emitir evento de guardado exitoso
    emit("saved", {
      id: props.perfilId,
      nombre: form.value.nombre,
      descripcion: form.value.descripcion,
      activo: form.value.activo,
    });

    // Cerrar modal
    closeModal();
  } catch (error) {
    console.error("Error al guardar el perfil:", error);
  } finally {
    isLoading.value = false;
  }
}

// Cerrar modal y resetear formulario
function closeModal() {
  emit("update:modelValue", false);
  resetForm();
}

// Resetear formulario
function resetForm() {
  form.value = {
    nombre: "",
    descripcion: "",
    activo: true,
    objetoId: 1,
  };
  v$.value.$reset();
}

// Observar cambios en el modal y perfilId
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal && props.perfilId !== 0) {
      loadPerfilData();
    } else if (newVal) {
      resetForm();
    }
  }
);

// Inicializar
onMounted(() => {
  if (props.modelValue && props.perfilId !== 0) {
    loadPerfilData();
  }
});
</script>
