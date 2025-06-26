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
                {{ isEditing ? 'Editar Tipo de KPI' : 'Nuevo Tipo de KPI' }}
              </h3>
              
              <!-- Formulario -->
              <form @submit.prevent="saveTipoKPI" class="mt-4 space-y-4">
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
                    maxlength="50"
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    :class="{ 'border-red-500': errors.nombre }"
                  />
                  <p v-if="errors.nombre" class="mt-1 text-sm text-red-600">{{ errors.nombre }}</p>
                  <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {{ form.nombre.length }}/50 caracteres
                  </p>
                </div>
                
                <!-- Descripción -->
                <div>
                  <label for="descripcion" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Descripción
                  </label>
                  <textarea
                    id="descripcion"
                    v-model="form.descripcion"
                    rows="3"
                    maxlength="1000"
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    :class="{ 'border-red-500': errors.descripcion }"
                    placeholder="Describe qué mide este KPI"
                  ></textarea>
                  <p v-if="errors.descripcion" class="mt-1 text-sm text-red-600">{{ errors.descripcion }}</p>
                  <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {{ (form.descripcion || '').length }}/1000 caracteres
                  </p>
                </div>
                
                <!-- Tipo de Medida -->
                <div>
                  <label for="tipoMedida" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tipo de Medida <span class="text-red-600">*</span>
                  </label>
                  <select
                    id="tipoMedida"
                    v-model="selectedTipoMedida"
                    required
                    @change="onTipoMedidaChange"
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    :class="{ 'border-red-500': errors.tipoMedida }"
                  >
                    <option value="">Seleccionar tipo de medida...</option>
                    <option 
                      v-for="option in tipoMedidaOptions" 
                      :key="option.value" 
                      :value="option.value"
                    >
                      {{ option.label }}
                    </option>
                  </select>
                  <p v-if="errors.tipoMedida" class="mt-1 text-sm text-red-600">{{ errors.tipoMedida }}</p>
                  
                  <!-- Preview del formato -->
                  <div v-if="selectedOption" class="mt-2 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-md">
                    <div class="text-xs text-blue-700 dark:text-blue-300">
                      <div class="flex justify-between items-center mb-1">
                        <span class="font-medium">Unidad:</span> 
                        <span class="font-mono">{{ selectedOption.unidad }}</span>
                      </div>
                      <div class="flex justify-between items-center mb-1">
                        <span class="font-medium">Formato:</span> 
                        <span class="font-mono">{{ selectedOption.formato }}</span>
                      </div>
                      <div class="flex justify-between items-center">
                        <span class="font-medium">Ejemplo:</span> 
                        <span class="font-mono text-green-600 dark:text-green-400">{{ selectedOption.ejemplo }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Unidad Personalizada (solo si es tipo Personalizado) -->
                <div v-if="selectedTipoMedida === 'personalizado'">
                  <label for="unidadPersonalizada" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Unidad Personalizada <span class="text-red-600">*</span>
                  </label>
                  <input
                    id="unidadPersonalizada"
                    v-model="form.unidadPersonalizada"
                    type="text"
                    :required="selectedTipoMedida === 'personalizado'"
                    maxlength="50"
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    :class="{ 'border-red-500': errors.unidadPersonalizada }"
                    placeholder="Ej: m², kg/h, usuarios/mes, etc."
                  />
                  <p v-if="errors.unidadPersonalizada" class="mt-1 text-sm text-red-600">{{ errors.unidadPersonalizada }}</p>
                  
                  <label for="formatoPersonalizado" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mt-3">
                    Formato Personalizado <span class="text-red-600">*</span>
                  </label>
                  <input
                    id="formatoPersonalizado"
                    v-model="form.formatoPersonalizado"
                    type="text"
                    :required="selectedTipoMedida === 'personalizado'"
                    maxlength="50"
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    :class="{ 'border-red-500': errors.formatoPersonalizado }"
                    placeholder="Ej: decimal, entero, texto, etc."
                  />
                  <p v-if="errors.formatoPersonalizado" class="mt-1 text-sm text-red-600">{{ errors.formatoPersonalizado }}</p>
                </div>
                
                <!-- Estado activo -->
                <div>
                  <div class="flex items-center">
                    <input
                      id="activo"
                      v-model="form.activo"
                      type="checkbox"
                      class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700"
                    />
                    <label for="activo" class="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                      Tipo de KPI activo
                    </label>
                  </div>
                  <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Los tipos de KPI inactivos no estarán disponibles para crear nuevos KPIs
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
        
        <!-- Indicador de error de conexión -->
        <div v-if="connectionError" class="px-4 py-3 bg-red-50 dark:bg-red-900/30 border-t border-red-200 dark:border-red-700">
          <p class="text-sm text-red-600 dark:text-red-300 text-center">
            <span class="font-medium">Error de conexión:</span> No se puede guardar en este momento. Verifica la conexión con el servidor.
          </p>
        </div>
        
        <!-- Botones de acción -->
        <div class="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            type="submit"
            @click="saveTipoKPI"
            :disabled="saving || connectionError"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg v-if="saving" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ saving ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear') }}
          </button>
          <button
            type="button"
            @click="closeModal"
            :disabled="saving"
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useToast } from 'vue-toastification'
import { tipoKPIService } from '~/services/tipoKPIService.ts'

// Props
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  tipoKpi: {
    type: Object,
    default: null
  },
  isEditing: {
    type: Boolean,
    default: false
  },
  connectionError: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['close', 'saved', 'connection-error'])

// Toast para notificaciones
const toast = useToast()

// Opciones predefinidas para tipos de medida
const tipoMedidaOptions = [
  { 
    value: 'porcentaje', 
    label: 'Porcentaje (%)', 
    unidad: '%', 
    formato: 'porcentaje', 
    ejemplo: '75.5%' 
  },
  { 
    value: 'moneda_euros', 
    label: 'Moneda (€)', 
    unidad: '€', 
    formato: 'moneda', 
    ejemplo: '€1,250.00' 
  },
  { 
    value: 'tiempo_dias', 
    label: 'Tiempo - Días', 
    unidad: 'días', 
    formato: 'entero', 
    ejemplo: '15 días' 
  },
  { 
    value: 'tiempo_horas', 
    label: 'Tiempo - Horas', 
    unidad: 'horas', 
    formato: 'decimal', 
    ejemplo: '8.5 horas' 
  },
  { 
    value: 'numero_entero', 
    label: 'Número Entero', 
    unidad: '', 
    formato: 'entero', 
    ejemplo: '123' 
  },
  { 
    value: 'numero_decimal', 
    label: 'Número Decimal', 
    unidad: '', 
    formato: 'decimal', 
    ejemplo: '123.45' 
  },
  { 
    value: 'texto', 
    label: 'Texto', 
    unidad: '', 
    formato: 'texto', 
    ejemplo: 'Excelente' 
  },
  { 
    value: 'personalizado', 
    label: 'Personalizado...', 
    unidad: '', 
    formato: '', 
    ejemplo: 'Definir formato' 
  }
]

// Estado del formulario
const form = ref({
  nombre: '',
  descripcion: '',
  unidad: '',
  formato: '',
  unidadPersonalizada: '',
  formatoPersonalizado: '',
  activo: true
})

// Estado para el select
const selectedTipoMedida = ref('')
const selectedOption = ref(null)

// Estado de validación
const errors = ref({})

// Estado de guardado
const saving = ref(false)

// Función para manejar el cambio de tipo de medida
const onTipoMedidaChange = () => {
  const option = tipoMedidaOptions.find(opt => opt.value === selectedTipoMedida.value)
  selectedOption.value = option
  
  if (option && option.value !== 'personalizado') {
    // Rellenar automáticamente unidad y formato para tipos predefinidos
    form.value.unidad = option.unidad
    form.value.formato = option.formato
    // Limpiar campos personalizados
    form.value.unidadPersonalizada = ''
    form.value.formatoPersonalizado = ''
  } else if (option && option.value === 'personalizado') {
    // Limpiar campos predefinidos para tipo personalizado
    form.value.unidad = ''
    form.value.formato = ''
  }
}

// Resetear formulario
const resetForm = () => {
  form.value = {
    nombre: '',
    descripcion: '',
    unidad: '',
    formato: '',
    unidadPersonalizada: '',
    formatoPersonalizado: '',
    activo: true
  }
  selectedTipoMedida.value = ''
  selectedOption.value = null
  errors.value = {}
}

// Función para detectar automáticamente el tipo de medida basado en unidad y formato
const detectTipoMedida = (unidad, formato) => {
  // Buscar coincidencia exacta en las opciones predefinidas
  const option = tipoMedidaOptions.find(opt => 
    opt.unidad === (unidad || '') && opt.formato === (formato || '') && opt.value !== 'personalizado'
  )
  
  if (option) {
    return option.value
  }
  
  // Si no hay coincidencia exacta pero hay datos, es personalizado
  if (unidad || formato) {
    return 'personalizado'
  }
  
  return ''
}

// Observar cambios en tipoKpi para actualizar el formulario
watch(() => props.tipoKpi, (newValue) => {
  if (newValue) {
    form.value = {
      nombre: newValue.nombre || '',
      descripcion: newValue.descripcion || '',
      unidad: newValue.unidad || '',
      formato: newValue.formato || '',
      unidadPersonalizada: '',
      formatoPersonalizado: '',
      activo: newValue.activo !== undefined ? newValue.activo : true
    }
    
    // Detectar automáticamente el tipo de medida
    const tipoDetectado = detectTipoMedida(newValue.unidad, newValue.formato)
    selectedTipoMedida.value = tipoDetectado
    
    if (tipoDetectado === 'personalizado') {
      // Para datos personalizados, rellenar los campos personalizados
      form.value.unidadPersonalizada = newValue.unidad || ''
      form.value.formatoPersonalizado = newValue.formato || ''
      selectedOption.value = tipoMedidaOptions.find(opt => opt.value === 'personalizado')
    } else if (tipoDetectado) {
      // Para tipos predefinidos, establecer la opción seleccionada
      selectedOption.value = tipoMedidaOptions.find(opt => opt.value === tipoDetectado)
    } else {
      selectedOption.value = null
    }
  } else {
    resetForm()
  }
}, { immediate: true })

// Validar formulario
const validateForm = () => {
  errors.value = {}
  
  if (!form.value.nombre.trim()) {
    errors.value.nombre = 'El nombre es obligatorio'
    return false
  }
  
  if (form.value.nombre.length > 50) {
    errors.value.nombre = 'El nombre no puede exceder los 50 caracteres'
    return false
  }
  
  if (form.value.descripcion && form.value.descripcion.length > 1000) {
    errors.value.descripcion = 'La descripción no puede exceder los 1000 caracteres'
    return false
  }
  
  if (!selectedTipoMedida.value) {
    errors.value.tipoMedida = 'El tipo de medida es obligatorio'
    return false
  }
  
  if (selectedTipoMedida.value === 'personalizado') {
    if (!form.value.unidadPersonalizada || !form.value.unidadPersonalizada.trim()) {
      errors.value.unidadPersonalizada = 'La unidad personalizada es obligatoria'
      return false
    }
    
    if (form.value.unidadPersonalizada.length > 50) {
      errors.value.unidadPersonalizada = 'La unidad personalizada no puede exceder los 50 caracteres'
      return false
    }
    
    if (!form.value.formatoPersonalizado || !form.value.formatoPersonalizado.trim()) {
      errors.value.formatoPersonalizado = 'El formato personalizado es obligatorio'
      return false
    }
    
    if (form.value.formatoPersonalizado.length > 50) {
      errors.value.formatoPersonalizado = 'El formato personalizado no puede exceder los 50 caracteres'
      return false
    }
  }
  
  return true
}

// Guardar tipo de KPI
const saveTipoKPI = async () => {
  if (!validateForm()) {
    return
  }
  
  try {
    saving.value = true
    
    let savedTipoKPI
    
    // Preparar los datos según el tipo de medida seleccionado
    let unidadFinal, formatoFinal
    
    if (selectedTipoMedida.value === 'personalizado') {
      unidadFinal = form.value.unidadPersonalizada?.trim() || null
      formatoFinal = form.value.formatoPersonalizado?.trim() || null
    } else {
      unidadFinal = form.value.unidad?.trim() || null
      formatoFinal = form.value.formato?.trim() || null
    }
    
    if (props.isEditing && props.tipoKpi?.id) {
      // Para edición, incluir el ID en el objeto que se envía
      const tipoKPIData = {
        id: props.tipoKpi.id,
        nombre: form.value.nombre.trim(),
        descripcion: form.value.descripcion?.trim() || null,
        unidad: unidadFinal,
        formato: formatoFinal,
        activo: form.value.activo
      }
      console.log(`Actualizando tipo de KPI con ID ${props.tipoKpi.id}:`, tipoKPIData)
      savedTipoKPI = await tipoKPIService.update(props.tipoKpi.id, tipoKPIData)
    } else {
      // Para creación, no incluir ID
      const tipoKPIData = {
        nombre: form.value.nombre.trim(),
        descripcion: form.value.descripcion?.trim() || null,
        unidad: unidadFinal,
        formato: formatoFinal,
        activo: form.value.activo
      }
      console.log('Creando nuevo tipo de KPI:', tipoKPIData)
      savedTipoKPI = await tipoKPIService.create(tipoKPIData)
    }
    
    // Emitir evento de guardado exitoso con los datos
    console.log('Emitiendo evento saved con datos:', savedTipoKPI)
    emit('saved', savedTipoKPI)
    
    // Resetear formulario pero no cerrar modal aquí - se cerrará desde la página principal
    resetForm()
    
  } catch (error) {
    console.error('Error al guardar tipo de KPI:', error)
    
    // Manejar errores de conexión
    if (error.message && (
      error.message.includes('Failed to fetch') ||
      error.message.includes('NetworkError') ||
      error.message.includes('Network Error') ||
      error.message.includes('ERR_CONNECTION_REFUSED')
    )) {
      console.warn('Error de conexión detectado en modal')
      emit('connection-error', true)
      toast.error('No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.')
    } else if (error.response && error.response.status === 401) {
      // Error de autenticación será manejado por el interceptor global
      console.warn('Error de autenticación en modal de tipo de KPI')
    } else {
      // Otros errores
      const errorMessage = error.message || `Error al ${props.isEditing ? 'actualizar' : 'crear'} el tipo de KPI`
      toast.error(errorMessage)
      
      // Si hay errores de validación del servidor, mostrarlos
      if (error.response && error.response.data && error.response.data.errors) {
        errors.value = error.response.data.errors
      }
    }
  } finally {
    saving.value = false
  }
}

// Cerrar modal
const closeModal = () => {
  if (!saving.value) {
    resetForm()
    emit('close')
  }
}
</script>