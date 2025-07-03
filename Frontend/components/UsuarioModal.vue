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
                class="w-full max-w-2xl transform overflow-hidden rounded-lg bg-white p-6 shadow-xl transition-all dark:bg-gray-800"
              >
                <!-- Encabezado del modal -->
                <DialogTitle
                  as="h3"
                  class="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                >
                  {{ isEditing ? 'Editar Usuario' : 'Crear Nuevo Usuario' }}
                </DialogTitle>

                <!-- Formulario -->
                <form @submit.prevent="saveUsuario" class="mt-4">
                  <!-- Campos del formulario -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- Nombre -->
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
                        placeholder="Nombre del usuario"
                        @blur="v$.nombre.$touch()"
                      />
                      <div
                        v-if="v$.nombre.$error"
                        class="mt-1 text-sm text-red-500"
                      >
                        {{ v$.nombre.$errors[0].$message }}
                      </div>
                    </div>

                    <!-- Apellidos -->
                    <div class="mb-4">
                      <label
                        for="apellidos"
                        class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Apellidos <span class="text-red-500">*</span>
                      </label>
                      <input
                        id="apellidos"
                        v-model="form.apellidos"
                        type="text"
                        class="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        :class="{
                          'border-red-500': v$.apellidos.$error,
                        }"
                        placeholder="Apellidos del usuario"
                        @blur="v$.apellidos.$touch()"
                      />
                      <div
                        v-if="v$.apellidos.$error"
                        class="mt-1 text-sm text-red-500"
                      >
                        {{ v$.apellidos.$errors[0].$message }}
                      </div>
                    </div>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- Email -->
                    <div class="mb-4">
                      <label
                        for="email"
                        class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Email <span class="text-red-500">*</span>
                      </label>
                      <input
                        id="email"
                        v-model="form.email"
                        type="email"
                        class="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        :class="{
                          'border-red-500': v$.email.$error,
                        }"
                        placeholder="correo@ejemplo.com"
                        @blur="v$.email.$touch()"
                      />
                      <div
                        v-if="v$.email.$error"
                        class="mt-1 text-sm text-red-500"
                      >
                        {{ v$.email.$errors[0].$message }}
                      </div>
                    </div>

                    <!-- Móvil -->
                    <div class="mb-4">
                      <label
                        for="movil"
                        class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Móvil
                      </label>
                      <input
                        id="movil"
                        v-model="form.movil"
                        type="text"
                        class="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        :class="{
                          'border-red-500': v$.movil.$error,
                        }"
                        placeholder="Número de móvil"
                        @blur="v$.movil.$touch()"
                      />
                      <div
                        v-if="v$.movil.$error"
                        class="mt-1 text-sm text-red-500"
                      >
                        {{ v$.movil.$errors[0].$message }}
                      </div>
                    </div>
                  </div>

                  <!-- Contraseña (solo para creación) -->
                  <div v-if="!isEditing" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="mb-4">
                      <label
                        for="password"
                        class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Contraseña <span class="text-red-500">*</span>
                      </label>
                      <input
                        id="password"
                        v-model="form.password"
                        type="password"
                        class="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        :class="{
                          'border-red-500': v$.password.$error,
                        }"
                        placeholder="Contraseña"
                        @blur="v$.password.$touch()"
                      />
                      <div
                        v-if="v$.password.$error"
                        class="mt-1 text-sm text-red-500"
                      >
                        {{ v$.password.$errors[0].$message }}
                      </div>
                    </div>

                    <div class="mb-4">
                      <label
                        for="confirmPassword"
                        class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Confirmar Contraseña <span class="text-red-500">*</span>
                      </label>
                      <input
                        id="confirmPassword"
                        v-model="form.confirmPassword"
                        type="password"
                        class="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        :class="{
                          'border-red-500': v$.confirmPassword.$error,
                        }"
                        placeholder="Confirmar contraseña"
                        @blur="v$.confirmPassword.$touch()"
                      />
                      <div
                        v-if="v$.confirmPassword.$error"
                        class="mt-1 text-sm text-red-500"
                      >
                        {{ v$.confirmPassword.$errors[0].$message }}
                      </div>
                    </div>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- Perfil -->
                    <div class="mb-4">
                      <label
                        for="perfilId"
                        class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Perfil <span class="text-red-500">*</span>
                      </label>
                      <select
                        id="perfilId"
                        v-model="form.perfilId"
                        class="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        :class="{
                          'border-red-500': v$.perfilId.$error,
                        }"
                        @blur="v$.perfilId.$touch()"
                      >
                        <option value="" disabled>Seleccione un perfil</option>
                        <option v-for="perfil in perfiles" :key="perfil.id" :value="perfil.id">
                          {{ perfil.nombre }}
                        </option>
                      </select>
                      <div
                        v-if="v$.perfilId.$error"
                        class="mt-1 text-sm text-red-500"
                      >
                        {{ v$.perfilId.$errors[0].$message }}
                      </div>
                    </div>

                    <!-- Objeto -->
                    <div class="mb-4">
                      <label
                        for="objetoId"
                        class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Objeto <span class="text-red-500">*</span>
                      </label>
                      <select
                        id="objetoId"
                        v-model="form.objetoId"
                        class="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        :class="{
                          'border-red-500': v$.objetoId.$error,
                        }"
                        @blur="v$.objetoId.$touch()"
                      >
                        <option value="" disabled>Seleccione un objeto</option>
                        <option v-for="objeto in objetos" :key="objeto.id" :value="objeto.id">
                          {{ objeto.nombre }}
                        </option>
                      </select>
                      <div
                        v-if="v$.objetoId.$error"
                        class="mt-1 text-sm text-red-500"
                      >
                        {{ v$.objetoId.$errors[0].$message }}
                      </div>
                    </div>
                  </div>

                  <!-- Empleado (opcional) -->
                  <div class="mb-4">
                    <label
                      for="empleadoId"
                      class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Empleado
                    </label>
                    <select
                      id="empleadoId"
                      v-model="form.empleadoId"
                      class="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    >
                      <option :value="null">Ninguno</option>
                      <option v-for="empleado in empleados" :key="empleado.id" :value="empleado.id">
                        {{ empleado.nombre }} {{ empleado.apellidos }}
                      </option>
                    </select>
                  </div>

                  <!-- Estado (solo para edición) -->
                  <div v-if="isEditing" class="mb-4">
                    <div class="flex items-center">
                      <input
                        id="activo"
                        v-model="form.activo"
                        type="checkbox"
                        class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
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
import { required, email, maxLength, helpers } from "@vuelidate/validators";
import { useUsuariosStore } from "../stores/usuarios";
import { usePerfilesStore } from "../stores/perfiles";
import { useToast } from '../composables/useToast';

// Props
const props = defineProps({
  modelValue: Boolean,
  usuarioId: {
    type: Number,
    default: 0,
  },
});

// Emits
const emit = defineEmits(["update:modelValue", "saved"]);

// Stores
const usuariosStore = useUsuariosStore();
const perfilesStore = usePerfilesStore();
const toast = useToast();

// Estado
const isLoading = ref(false);
const perfiles = ref([]);
const empleados = ref([]);
const objetos = ref([]);

// Formulario
const form = ref({
  nombre: "",
  apellidos: "",
  email: "",
  movil: "",
  password: "",
  confirmPassword: "",
  perfilId: "",
  empleadoId: null,
  objetoId: "",
  activo: true,
});

// Computed
const isEditing = computed(() => props.usuarioId !== 0);

// Validadores personalizados
const requiredValidator = (value) => !!value && value.toString().trim() !== "";
const maxLength200Validator = (value) => !value || value.length <= 200;
const maxLength300Validator = (value) => !value || value.length <= 300;
const maxLength150Validator = (value) => !value || value.length <= 150;
const maxLength20Validator = (value) => !value || value.length <= 20;
const emailValidator = (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const sameAsPassword = (value) => value === form.value.password;

// Reglas de validación
const rules = {
  nombre: {
    required: helpers.withMessage("El nombre es obligatorio", requiredValidator),
    maxLength: helpers.withMessage("El nombre no puede exceder los 200 caracteres", maxLength200Validator)
  },
  apellidos: {
    required: helpers.withMessage("Los apellidos son obligatorios", requiredValidator),
    maxLength: helpers.withMessage("Los apellidos no pueden exceder los 300 caracteres", maxLength300Validator)
  },
  email: {
    required: helpers.withMessage("El correo electrónico es obligatorio", requiredValidator),
    email: helpers.withMessage("El formato del correo electrónico no es válido", emailValidator),
    maxLength: helpers.withMessage("El correo electrónico no puede exceder los 150 caracteres", maxLength150Validator)
  },
  movil: {
    maxLength: helpers.withMessage("El número móvil no puede exceder los 20 caracteres", maxLength20Validator)
  },
  password: {
    required: helpers.withMessage(
      "La contraseña es obligatoria",
      (value) => isEditing.value || requiredValidator(value)
    ),
  },
  confirmPassword: {
    required: helpers.withMessage(
      "La confirmación de contraseña es obligatoria",
      (value) => isEditing.value || requiredValidator(value)
    ),
    sameAsPassword: helpers.withMessage(
      "Las contraseñas no coinciden",
      (value) => isEditing.value || sameAsPassword(value)
    )
  },
  perfilId: {
    required: helpers.withMessage("El perfil es obligatorio", requiredValidator),
  },
  objetoId: {
    required: helpers.withMessage("El objeto es obligatorio", requiredValidator),
  },
};

const v$ = useVuelidate(rules, form);

// Cargar datos necesarios
async function loadData() {
  try {
    // Cargar perfiles
    if (perfilesStore.perfiles.length === 0) {
      await perfilesStore.fetchPerfiles();
    }
    perfiles.value = perfilesStore.perfiles;

    // Aquí cargaríamos los empleados y objetos si tuviéramos esos stores
    // Por ahora usamos datos de ejemplo
    empleados.value = [
      { id: 1, nombre: "Juan", apellidos: "Pérez" },
      { id: 2, nombre: "María", apellidos: "González" },
      { id: 3, nombre: "Carlos", apellidos: "Rodríguez" },
    ];

    objetos.value = [
      { id: 1, nombre: "Sistema" },
      { id: 2, nombre: "Administración" },
      { id: 3, nombre: "Ventas" },
    ];
  } catch (error) {
    console.error("Error al cargar datos:", error);
    toast.error("Error al cargar datos necesarios");
  }
}

// Cargar datos del usuario si estamos en modo edición
async function loadUsuarioData() {
  if (props.usuarioId !== 0) {
    try {
      isLoading.value = true;
      
      // Obtener usuario
      const usuario = await usuariosStore.fetchUsuarioById(props.usuarioId);
      
      if (!usuario) {
        toast.error("No se pudo cargar la información del usuario");
        closeModal();
        return;
      }
      
      // Asignar datos al formulario
      form.value = {
        nombre: usuario.nombre || "",
        apellidos: usuario.apellidos || "",
        email: usuario.email || "",
        movil: usuario.movil || "",
        password: "", // No cargamos la contraseña por seguridad
        confirmPassword: "",
        perfilId: usuario.perfilId || "",
        empleadoId: usuario.empleadoId || null,
        objetoId: usuario.objetoId || "",
        activo: usuario.activo !== undefined ? usuario.activo : true,
      };
    } catch (error) {
      console.error("Error al cargar datos del usuario:", error);
      toast.error("Error al cargar datos del usuario");
      closeModal();
    } finally {
      isLoading.value = false;
    }
  } else {
    resetForm();
  }
}

// Resetear formulario
function resetForm() {
  form.value = {
    nombre: "",
    apellidos: "",
    email: "",
    movil: "",
    password: "",
    confirmPassword: "",
    perfilId: "",
    empleadoId: null,
    objetoId: "",
    activo: true,
  };
  
  if (v$.value) {
    v$.value.$reset();
  }
}

// Cerrar modal
function closeModal() {
  emit("update:modelValue", false);
  resetForm();
}

// Guardar usuario
async function saveUsuario() {
  const isValid = await v$.value.$validate();
  if (!isValid) return;

  try {
    isLoading.value = true;

    let result;
    if (isEditing.value) {
      // Actualizar usuario existente
      const updateData = {
        id: props.usuarioId,
        nombre: form.value.nombre,
        apellidos: form.value.apellidos,
        email: form.value.email,
        movil: form.value.movil,
        perfilId: parseInt(form.value.perfilId),
        empleadoId: form.value.empleadoId ? parseInt(form.value.empleadoId) : null,
        objetoId: parseInt(form.value.objetoId),
        activo: form.value.activo,
      };
      
      result = await usuariosStore.updateUsuario(props.usuarioId, updateData);
    } else {
      // Crear nuevo usuario
      const createData = {
        nombre: form.value.nombre,
        apellidos: form.value.apellidos,
        email: form.value.email,
        movil: form.value.movil,
        password: form.value.password,
        perfilId: parseInt(form.value.perfilId),
        empleadoId: form.value.empleadoId ? parseInt(form.value.empleadoId) : null,
        objetoId: parseInt(form.value.objetoId),
        activo: true,
      };
      
      result = await usuariosStore.createUsuario(createData);
    }

    if (result) {
      emit("saved", result);
      closeModal();
    }
  } catch (error) {
    console.error("Error al guardar usuario:", error);
  } finally {
    isLoading.value = false;
  }
}

// Observar cambios en el modal y usuarioId
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      loadData();
      if (props.usuarioId !== 0) {
        loadUsuarioData();
      } else {
        resetForm();
      }
    }
  }
);

// Observar cambios en usuarioId
watch(
  () => props.usuarioId,
  (newVal, oldVal) => {
    if (props.modelValue && newVal !== oldVal) {
      if (newVal !== 0) {
        loadUsuarioData();
      } else {
        resetForm();
      }
    }
  }
);

// Inicializar al montar
onMounted(() => {
  if (props.modelValue) {
    loadData();
    if (props.usuarioId !== 0) {
      loadUsuarioData();
    }
  }
});
</script>
