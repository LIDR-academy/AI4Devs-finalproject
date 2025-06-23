<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
    <div class="max-w-md w-full">
      <!-- Logo and Title -->
      <div class="text-center mb-8">
        <div class="mx-auto w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mb-4">
          <span class="text-white font-bold text-2xl">BGA</span>
        </div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">BGA Business</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-2">Sistema de Gestión Integral</p>
      </div>

      <!-- Login Form -->
      <div class="card p-8">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Correo Electrónico
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="input-field"
              placeholder="tu@email.com"
              :disabled="loading"
            >
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Contraseña
            </label>
            <div class="relative">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="input-field pr-10"
                placeholder="••••••••"
                :disabled="loading"
              >
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <EyeIcon v-if="!showPassword" class="w-5 h-5" />
                <EyeSlashIcon v-else class="w-5 h-5" />
              </button>
            </div>
          </div>

          <div class="flex items-center justify-between">
            <label class="flex items-center">
              <input
                v-model="form.rememberMe"
                type="checkbox"
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                :disabled="loading"
              >
              <span class="ml-2 text-sm text-gray-600 dark:text-gray-400">
                Recordarme
              </span>
            </label>
            <a href="#" class="text-sm text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full btn-primary flex items-center justify-center py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div v-if="loading" class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            {{ loading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
          </button>
        </form>

        <!-- Demo Credentials -->
        <div class="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Credenciales de demostración:</p>
          <div class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <p><strong>Email:</strong> admin@bga.com</p>
            <p><strong>Contraseña:</strong> admin123</p>
          </div>
          <button
            @click="fillDemoCredentials"
            class="mt-2 text-sm text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
          >
            Usar credenciales de demo
          </button>
        </div>
      </div>

      <!-- Footer -->
      <div class="text-center mt-8">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          © 2024 BGA Consultoría Estratégica. Todos los derechos reservados.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
// Importaciones
import { ref, reactive, onMounted } from 'vue'
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '../stores/auth'
import { useToast } from 'vue-toastification'

definePageMeta({
  layout: 'auth'
})

const authStore = useAuthStore()
const toast = useToast()

// Reactive state
const loading = ref(false)
const showPassword = ref(false)
const form = reactive({
  email: '',
  password: '',
  rememberMe: false
})

// Cargar email guardado si existe y rememberMe está activado
onMounted(() => {
  if (typeof window !== 'undefined') {
    form.rememberMe = localStorage.getItem('remember_me') === 'true'
    
    if (localStorage.getItem('remember_me') === 'true') {
      const savedEmail = localStorage.getItem('saved_email')
      if (savedEmail) {
        form.email = savedEmail
      }
    }
  }
})

// Methods
const handleLogin = async () => {
  loading.value = true
  
  // Guardar preferencia de recordar usuario
  if (typeof window !== 'undefined') {
    if (form.rememberMe) {
      localStorage.setItem('remember_me', 'true')
      localStorage.setItem('saved_email', form.email)
    } else {
      localStorage.removeItem('remember_me')
      localStorage.removeItem('saved_email')
    }
  }
  
  try {
    // Llamar al método de login del store de autenticación
    const result = await authStore.login(form.email, form.password, form.rememberMe)
    
    if (result && result.success) {
      // Mostrar mensaje de éxito con toast
      toast.success('¡Bienvenido! Has iniciado sesión correctamente')
      
      // Obtener la ruta de redirección de los parámetros de consulta
      const route = useRoute()
      const redirectPath = route.query.redirect?.toString() || '/'
      
      // Redirigir al usuario a la página que intentaba acceder o a la página principal
      await navigateTo(redirectPath)
    } else {
      // Mostrar mensaje de error con toast
      toast.error(result.error || 'Credenciales inválidas')
      console.error('Error de autenticación:', result.error || 'Credenciales inválidas')
    }
  } catch (error) {
    console.error('Error de login:', error)
    
    // Analizar el tipo de error y mostrar un mensaje apropiado
    if (error?.response?.status === 401) {
      toast.error('Credenciales inválidas. Por favor, verifica tu email y contraseña.')
    } else if (error?.response?.status === 400) {
      // Si el backend devuelve un mensaje específico en el error
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.Message || 
                          'Datos de inicio de sesión incorrectos'
      toast.error(errorMessage)
    } else if (error?.response?.status === 500) {
      toast.error('Error en el servidor. Por favor, intenta más tarde.')
    } else if (error?.message?.includes('Network Error')) {
      toast.error('No se pudo conectar con el servidor. Verifica tu conexión a internet.')
    } else {
      toast.error(error?.message || 'Ocurrió un error inesperado al iniciar sesión')
    }
  } finally {
    loading.value = false
  }
}

const fillDemoCredentials = () => {
  form.email = 'admin@bga.com'
  form.password = 'admin123'
}

// Redirigir si el usuario ya está autenticado
onMounted(() => {
  if (authStore.isAuthenticated) {
    // Obtener la ruta de redirección de los parámetros de consulta
    const route = useRoute()
    const redirectPath = route.query.redirect?.toString() || '/'
    
    // Redirigir al usuario a la página que intentaba acceder o a la página principal
    navigateTo(redirectPath)
  }
})
</script>
