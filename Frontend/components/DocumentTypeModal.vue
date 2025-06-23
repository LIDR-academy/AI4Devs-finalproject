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
                {{ isEditing ? 'Editar Tipo de Documento' : 'Nuevo Tipo de Documento' }}
              </h3>
              
              <!-- Formulario -->
              <form @submit.prevent="saveDocumentType" class="mt-4 space-y-4">
                <!-- Nombre -->
                <div>
                  <label for="nombre" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nombre <span class="text-red-600">*</span>
                  </label>
                  <input
                    id="nombre"
                    v-model="form.nombre"
                    type="text"
                    required
                    maxlength="100"
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    :class="{ 'border-red-500': errors.nombre }"
                  />
                  <p v-if="errors.nombre" class="mt-1 text-sm text-red-600">{{ errors.nombre }}</p>
                  <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {{ form.nombre.length }}/100 caracteres
                  </p>
                </div>
                
                <!-- Descripción -->
                <div>
                  <label for="descripcion" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Descripción <span class="text-red-600">*</span>
                  </label>
                  <textarea
                    id="descripcion"
                    v-model="form.descripcion"
                    rows="3"
                    required
                    maxlength="1000"
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    :class="{ 'border-red-500': errors.descripcion }"
                  ></textarea>
                  <p v-if="errors.descripcion" class="mt-1 text-sm text-red-600">{{ errors.descripcion }}</p>
                  <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {{ form.descripcion.length }}/1000 caracteres
                  </p>
                </div>
                
                <!-- Extensiones permitidas -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Extensiones Permitidas <span class="text-red-600">*</span>
                  </label>
                  <div class="relative mt-1">
                    <!-- Campo de entrada para nuevas extensiones -->
                    <div 
                      class="flex flex-wrap gap-2 p-2 min-h-[42px] border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 dark:bg-gray-700"
                      :class="{ 'border-red-500': errors.extensionesPermitidas }"
                      @click="focusExtensionInput"
                    >
                      <!-- Etiquetas de extensiones seleccionadas -->
                      <div 
                        v-for="(ext, index) in selectedExtensions" 
                        :key="index"
                        class="flex items-center bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 px-2 py-1 rounded-md text-sm"
                      >
                        <span>{{ ext }}</span>
                        <button 
                          type="button" 
                          @click.stop="removeExtension(index)" 
                          class="ml-1 text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200 focus:outline-none"
                        >
                          <span class="sr-only">Eliminar</span>
                          <span aria-hidden="true">&times;</span>
                        </button>
                      </div>
                      
                      <!-- Input para escribir nuevas extensiones -->
                      <input
                        ref="extensionInput"
                        v-model="newExtension"
                        type="text"
                        placeholder="Añadir extensión (ej: pdf)"
                        class="flex-grow min-w-[120px] bg-transparent border-0 p-0 focus:ring-0 focus:outline-none dark:text-white"
                        @keydown.enter.prevent="addExtension"
                        @keydown.tab="addExtension"
                        @keydown="(e) => { if (e.key === ',') { e.preventDefault(); addExtension(); } }"
                        @keydown.space.prevent="addExtension"
                        @keydown.delete="handleDelete"
                        @keydown.backspace="handleBackspace"
                      />
                    </div>
                    
                    <!-- Sugerencias de extensiones comunes -->
                    <div class="mt-2 flex flex-wrap gap-1">
                      <span class="text-xs text-gray-500 dark:text-gray-400 mr-1">Comunes:</span>
                      <button 
                        v-for="ext in commonExtensions" 
                        :key="ext"
                        type="button"
                        @click="addSuggestedExtension(ext)"
                        class="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        :class="{ 'opacity-50 cursor-not-allowed': selectedExtensions.includes(ext) }"
                        :disabled="selectedExtensions.includes(ext)"
                      >
                        {{ ext }}
                      </button>
                    </div>
                  </div>
                  
                  <p v-if="errors.extensionesPermitidas" class="mt-1 text-sm text-red-600">{{ errors.extensionesPermitidas }}</p>
                  <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {{ selectedExtensions.length }} extensiones seleccionadas
                  </p>
                  
                  <!-- Campo oculto para mantener compatibilidad con el backend -->
                  <input type="hidden" v-model="form.extensionesPermitidas" />
                </div>
                
                <!-- Tamaño máximo -->
                <div>
                  <label for="tamanoMaximo" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tamaño Máximo (MB)
                  </label>
                  <div class="relative">
                    <input
                      id="tamanoMaximo"
                      v-model="tamanoMaximoDisplay"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Sin límite"
                      class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                      :class="{ 'border-red-500': errors.tamanoMaximoMB }"
                    />
                    <button 
                      v-if="tamanoMaximoDisplay"
                      type="button" 
                      @click="clearTamanoMaximo"
                      class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
                    >
                      <span class="sr-only">Limpiar</span>
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                  <p v-if="errors.tamanoMaximoMB" class="mt-1 text-sm text-red-600">{{ errors.tamanoMaximoMB }}</p>
                  <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Deje este campo vacío si no desea establecer un límite de tamaño
                  </p>
                </div>
                
                <!-- Estado -->
                <div class="flex items-center">
                  <input
                    id="activo"
                    v-model="form.activo"
                    type="checkbox"
                    class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label for="activo" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Activo
                  </label>
                </div>
              </form>
            </div>
          </div>
        </div>
        
        <!-- Mensaje de error de conexión -->
        <div v-if="localConnectionError || props.connectionError" class="bg-red-50 dark:bg-red-900 p-4 mb-3">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <!-- Ícono de error -->
              <svg class="h-5 w-5 text-red-600 dark:text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800 dark:text-red-200">
                Error de conexión
              </h3>
              <div class="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>
                  No se pudo conectar con el servidor. Por favor, verifica:
                </p>
                <ul class="list-disc pl-5 mt-1 space-y-1">
                  <li>Que el servidor backend esté en ejecución</li>
                  <li>Que tu conexión a internet esté funcionando</li>
                  <li>Que no haya problemas con el firewall o la red</li>
                </ul>
              </div>
              <div class="mt-3">
                <button 
                  type="button" 
                  @click="retryConnection"
                  :disabled="loading"
                  class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                >
                  <span v-if="loading" class="inline-block mr-2">
                    <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                  Reintentar conexión
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Botones de acción -->
        <div class="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            @click="saveDocumentType"
            :disabled="loading"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
          >
            <span v-if="loading" class="inline-block mr-2">
              <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ isEditing ? 'Actualizar' : 'Crear' }}
          </button>
          <button
            type="button"
            @click="closeModal"
            :disabled="loading"
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useToast } from 'vue-toastification';
import { documentTypeService } from '~/services/documentTypeService';

// Props
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  documentType: {
    type: Object,
    default: () => ({
      nombre: '',
      descripcion: '',
      extensionesPermitidas: '',
      tamanoMaximoMB: null,
      activo: true
    })
  },
  isEditing: {
    type: Boolean,
    default: false
  },
  connectionError: {
    type: Boolean,
    default: false
  }
});

// Emits
const emit = defineEmits(['close', 'saved', 'connectionError']);

// Toast para notificaciones
const toast = useToast();

// Estado de conexión local
const localConnectionError = ref(false);

// Estado del formulario
const form = ref({
  id: null,
  nombre: '',
  descripcion: '',
  extensionesPermitidas: '',
  tamanoMaximoMB: null,
  activo: true
});

// Propiedad computada para manejar el campo de tamaño máximo
const tamanoMaximoDisplay = computed({
  get() {
    // Si el valor es null, undefined o cadena vacía, devolvemos una cadena vacía
    return form.value.tamanoMaximoMB === null || 
           form.value.tamanoMaximoMB === undefined || 
           form.value.tamanoMaximoMB === '' ? '' : form.value.tamanoMaximoMB;
  },
  set(value) {
    // Si el valor es una cadena vacía, establecemos null
    form.value.tamanoMaximoMB = value === '' ? null : value;
  }
});

// Método para limpiar el campo de tamaño máximo
const clearTamanoMaximo = () => {
  form.value.tamanoMaximoMB = null;
  errors.value.tamanoMaximoMB = null;
};

// Estado para el componente de selección de extensiones
const selectedExtensions = ref([]);
const newExtension = ref('');
const extensionInput = ref(null);

// Lista de extensiones comunes para sugerencias (solo formatos de documentos)
const commonExtensions = [
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 
  'rtf', 'odt', 'ods', 'odp', 'html', 'xml', 'json', 'md', 'tex'
];

const errors = ref({});
const loading = ref(false);

// Inicializar formulario con datos del tipo de documento
const initForm = () => {
  if (props.documentType) {
    // Hacer una copia profunda para evitar problemas de referencia
    form.value = JSON.parse(JSON.stringify({
      ...props.documentType,
      // Asegurarse de que tamanoMaximoMB sea null si no tiene valor
      tamanoMaximoMB: props.documentType.tamanoMaximoMB || null
    }));
    
    // Inicializar las extensiones seleccionadas
    if (form.value.extensionesPermitidas) {
      selectedExtensions.value = form.value.extensionesPermitidas
        .split(',')
        .map(ext => ext.trim())
        .filter(ext => ext); // Filtrar valores vacíos
    } else {
      selectedExtensions.value = [];
    }
  } else {
    form.value = {
      id: null,
      nombre: '',
      descripcion: '',
      extensionesPermitidas: '',
      tamanoMaximoMB: null,
      activo: true
    };
    selectedExtensions.value = [];
  }
  
  // Resetear el nuevo input de extensión
  newExtension.value = '';
  
  // Resetear errores
  errors.value = {};
  
  console.log('Formulario inicializado:', form.value);
};

// Watch para cambios en el tipo de documento
watch(() => props.documentType, () => {
  if (props.show) {
    initForm();
  }
}, { deep: true });

// Watch para mantener sincronizado el campo de formulario con las extensiones seleccionadas
watch(selectedExtensions, (newValue) => {
  form.value.extensionesPermitidas = newValue.join(', ');
}, { deep: true });

// Métodos para el componente de selección de extensiones
const focusExtensionInput = () => {
  if (extensionInput.value) {
    extensionInput.value.focus();
  }
};

const addExtension = () => {
  const extension = newExtension.value.trim().toLowerCase();
  if (extension && !selectedExtensions.value.includes(extension)) {
    // Validar que sea una extensión válida (sin espacios ni caracteres especiales)
    if (/^[a-z0-9]+$/.test(extension)) {
      selectedExtensions.value.push(extension);
      newExtension.value = '';
    } else {
      // Mostrar un error temporal
      const currentError = errors.value.extensionesPermitidas;
      errors.value.extensionesPermitidas = 'La extensión solo debe contener letras y números';
      setTimeout(() => {
        errors.value.extensionesPermitidas = currentError;
      }, 2000);
    }
  } else {
    newExtension.value = '';
  }
};

const removeExtension = (index) => {
  selectedExtensions.value.splice(index, 1);
};

const addSuggestedExtension = (extension) => {
  if (!selectedExtensions.value.includes(extension)) {
    selectedExtensions.value.push(extension);
  }
};

const handleDelete = () => {
  // No hacer nada especial con la tecla delete
};

const handleBackspace = (event) => {
  // Si el input está vacío y hay extensiones seleccionadas, eliminar la última
  if (newExtension.value === '' && selectedExtensions.value.length > 0) {
    selectedExtensions.value.pop();
    event.preventDefault();
  }
};

// Validar formulario
const validateForm = () => {
  errors.value = {};
  
  // Validar nombre
  if (!form.value.nombre.trim()) {
    errors.value.nombre = 'El nombre es obligatorio';
  } else if (form.value.nombre.length > 100) {
    errors.value.nombre = 'El nombre no puede exceder los 100 caracteres';
  }
  
  // Validar descripción (opcional pero con límite de caracteres)
  if (form.value.descripcion && form.value.descripcion.length > 1000) {
    errors.value.descripcion = 'La descripción no puede exceder los 1000 caracteres';
  }
  
  // Validar extensiones permitidas
  if (selectedExtensions.value.length === 0) {
    errors.value.extensionesPermitidas = 'Debe especificar al menos una extensión permitida';
  } else {
    // Actualizar el campo de formulario con las extensiones seleccionadas
    form.value.extensionesPermitidas = selectedExtensions.value.join(', ');
    
    if (form.value.extensionesPermitidas.length > 1000) {
      errors.value.extensionesPermitidas = 'Las extensiones no pueden exceder los 1000 caracteres';
    }
  }
  
  // Validar tamaño máximo (opcional, puede ser null)
  if (form.value.tamanoMaximoMB !== null && form.value.tamanoMaximoMB !== '') {
    const tamano = parseFloat(form.value.tamanoMaximoMB);
    if (isNaN(tamano)) {
      form.value.tamanoMaximoMB = null; // Convertir valores no numéricos a null
    } else if (tamano < 0) {
      errors.value.tamanoMaximoMB = 'El tamaño máximo debe ser un número positivo';
    } else {
      // Asegurarse de que sea un número con máximo 2 decimales
      form.value.tamanoMaximoMB = parseFloat(tamano.toFixed(2));
    }
  } else {
    // Asegurarse de que valores vacíos sean null
    form.value.tamanoMaximoMB = null;
  }
  
  console.log('Validación del formulario:', { errores: errors.value, hayErrores: Object.keys(errors.value).length > 0 });
  return Object.keys(errors.value).length === 0;
};

// Guardar tipo de documento
const saveDocumentType = async () => {
  if (!validateForm()) {
    toast.error('Por favor, corrija los errores del formulario');
    return;
  }
  
  loading.value = true;
  // Resetear el estado de error de conexión local
  localConnectionError.value = false;
  
  try {
    // Preparar datos para guardar
    const documentTypeData = {
      ...form.value,
      // Asegurarse de que tamanoMaximoMB sea null si está vacío o es inválido
      tamanoMaximoMB: form.value.tamanoMaximoMB === null || 
                      form.value.tamanoMaximoMB === '' || 
                      isNaN(parseFloat(form.value.tamanoMaximoMB))
        ? null 
        : parseFloat(form.value.tamanoMaximoMB)
    };
    
    console.log('Datos a guardar:', documentTypeData);
    
    let result;
    let success = false;
    
    // Guardar copia de los datos originales por si fallan las llamadas a la API
    const datosOriginales = { ...documentTypeData };
    
    try {
      // Establecer un timeout para la operación
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Tiempo de espera agotado')), 10000);
      });
      
      if (props.isEditing) {
        console.log(`Actualizando tipo de documento con ID ${documentTypeData.id}`);
        result = await Promise.race([
          documentTypeService.update(documentTypeData.id, documentTypeData),
          timeoutPromise
        ]);
        console.log('Resultado de la actualización:', result);
        success = true;
      } else {
        console.log('Creando nuevo tipo de documento');
        result = await Promise.race([
          documentTypeService.create(documentTypeData),
          timeoutPromise
        ]);
        console.log('Resultado de la creación:', result);
        success = true;
      }
    } catch (apiError) {
      console.error('Error en llamada a la API:', apiError);
      
      // Detectar errores de conexión
      const errorMessage = apiError.message?.toLowerCase() || '';
      const isConnectionError = 
        errorMessage.includes('failed to fetch') || 
        errorMessage.includes('network') ||
        errorMessage.includes('connection') ||
        errorMessage.includes('refused') ||
        errorMessage.includes('tiempo de espera') ||
        apiError.code === 'ERR_CONNECTION_REFUSED' ||
        apiError.code === 'ECONNREFUSED';
      
      if (isConnectionError) {
        console.warn('Error de conexión detectado');
        localConnectionError.value = true;
        emit('connectionError', true);
        throw new Error('No se pudo conectar con el servidor. Por favor, verifique su conexión.');
      }
      
      // Si es un error de autenticación, no intentamos recuperarnos
      if (apiError.response && apiError.response.status === 401) {
        throw apiError; // Propagar el error de autenticación
      }
      
      // Para otros errores, intentamos usar los datos originales
      console.warn('Usando datos originales como respuesta debido al error');
      result = datosOriginales;
    }
    
    // Asegurarnos de tener un resultado válido para emitir
    if (result) {
      // Si no tiene ID pero estamos editando, asegurarnos de incluirlo
      if (props.isEditing && !result.id && documentTypeData.id) {
        result.id = documentTypeData.id;
      }
      
      console.log('Emitiendo evento saved con datos:', result);
      
      // Crear una copia profunda para evitar problemas de reactividad
      const resultadoFinal = JSON.parse(JSON.stringify(result));
      
      // Mostrar mensaje de éxito antes de cerrar el modal
      if (success) {
        const mensaje = props.isEditing 
          ? 'Tipo de documento actualizado correctamente' 
          : 'Tipo de documento creado correctamente';
        toast.success(mensaje);
      }
      
      // Emitir el evento antes de cerrar el modal
      emit('saved', resultadoFinal);
      
      // Forzar el cierre del modal llamando directamente a emit('close')
      console.log('Cerrando modal después de guardar');
      emit('close');
      
    } else {
      console.error('No se pudo obtener un resultado válido después de guardar');
      toast.error('Error al procesar los datos. Por favor, inténtelo de nuevo.');
    }
  } catch (error) {
    console.error('Error al guardar tipo de documento:', error);
    
    // Si es un error de conexión, no cerramos el modal automáticamente
    if (localConnectionError.value) {
      toast.error('Error de conexión. Por favor, verifica que el servidor esté disponible e inténtalo de nuevo.');
    } else {
      toast.error(error.message || 'Error al guardar el tipo de documento');
      // Forzar el cierre del modal para errores que no son de conexión
      console.log('Cerrando modal después de error');
      emit('close');
    }
  } finally {
    loading.value = false;
  }
};

// Cerrar modal
const closeModal = () => {
  if (loading.value) return;
  emit('close');
};

// Función para reintentar la conexión
const retryConnection = async () => {
  if (loading.value) return;
  
  loading.value = true;
  localConnectionError.value = false;
  
  try {
    // Intentar una operación simple para verificar la conexión
    // Si estamos editando, intentamos obtener el tipo de documento actual
    // Si estamos creando uno nuevo, simplemente intentamos obtener la lista
    if (props.isEditing && form.value.id) {
      console.log(`Intentando reconectar: obteniendo tipo de documento con ID ${form.value.id}`);
      await documentTypeService.getById(form.value.id);
    } else {
      console.log('Intentando reconectar: obteniendo lista de tipos de documento');
      await documentTypeService.getAll();
    }
    
    // Si llegamos aquí, la conexión fue exitosa
    toast.success('Conexión restablecida correctamente');
    emit('connectionError', false); // Notificar al componente padre que la conexión se restableció
    
    // Continuar con la operación original
    saveDocumentType();
  } catch (error) {
    console.error('Error al reintentar conexión:', error);
    
    // Verificar si sigue siendo un error de conexión
    const errorMessage = error.message?.toLowerCase() || '';
    const isConnectionError = 
      errorMessage.includes('failed to fetch') || 
      errorMessage.includes('network') ||
      errorMessage.includes('connection') ||
      errorMessage.includes('refused') ||
      error.code === 'ERR_CONNECTION_REFUSED' ||
      error.code === 'ECONNREFUSED';
    
    if (isConnectionError) {
      localConnectionError.value = true;
      toast.error('No se pudo restablecer la conexión. Por favor, verifica que el servidor esté disponible.');
    } else {
      // Si el error no es de conexión, podría ser otro tipo de error
      toast.error(error.message || 'Error al intentar reconectar');
    }
  } finally {
    loading.value = false;
  }
};
</script>
