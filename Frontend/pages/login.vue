<template>
  <div class="flex justify-center items-center p-4 min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800">
    <div class="w-full max-w-md">
      <!-- Logo and Title -->
      <div class="mb-8 text-center">
        <div class="flex justify-center items-center mx-auto mb-4 w-16 h-16 bg-gradient-to-br rounded-xl from-primary-500 to-primary-600">
          <span class="text-2xl font-bold text-white">CC</span>
        </div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">ConsultCore3.1</h1>
        <p class="mt-2 text-gray-600 dark:text-gray-400">Sistema de Gestión Integral</p>
      </div>

      <!-- Login Form -->
      <div class="p-8 card">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <div>
            <label for="email" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
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
            <label for="password" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Contraseña
            </label>
            <div class="relative">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="pr-10 input-field"
                placeholder="••••••••"
                :disabled="loading"
              >
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 text-gray-400 transform -translate-y-1/2 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <EyeIcon v-if="!showPassword" class="w-5 h-5" />
                <EyeSlashIcon v-else class="w-5 h-5" />
              </button>
            </div>
          </div>

          <div class="flex justify-between items-center">
            <label class="flex items-center">
              <input
                v-model="form.rememberMe"
                type="checkbox"
                class="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
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
            class="flex justify-center items-center py-3 w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div v-if="loading" class="mr-2 w-5 h-5 rounded-full border-b-2 border-white animate-spin"></div>
            {{ loading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
          </button>
        </form>

        <!-- Demo Credentials -->
        <div class="p-4 mt-6 bg-gray-50 rounded-lg dark:bg-gray-700">
          <p class="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Credenciales de demostración:</p>
          <div class="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <p><strong>Email:</strong> admin@rrdeveloper.com</p>
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
      <div class="mt-8 text-center">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          © 2024 RRDeveloper. Todos los derechos reservados.
        </p>
        <p class="mt-1 text-xs text-gray-500 dark:text-gray-500">
          Desarrollado por RRDeveloper
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Importaciones
import { ref, reactive, onMounted } from 'vue'
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '../stores/auth'
import { useToast } from '../composables/useToast';

// Obtener la configuración de runtime
const config = useRuntimeConfig()

// Ahora puedes acceder a las variables de entorno correctamente
console.log("Valor de API URL:", config.public.apiUrl);
console.log("Configuración completa:", config.public);

definePageMeta({
  layout: 'auth'
})

const authStore = useAuthStore()
const toast = useToast()

// Interfaces TypeScript
interface LoginForm {
  email: string
  password: string
  rememberMe: boolean
}

// Reactive state
const loading = ref<boolean>(false)
const showPassword = ref<boolean>(false)
const form = reactive<LoginForm>({
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
const handleLogin = async (): Promise<void> => {
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
    
    // Verificar el resultado del login
    if (result.success) {
      // Si llegamos aquí, el login fue exitoso
      toast.success('¡Bienvenido!')
      
      // Obtener la ruta de redirección de los parámetros de consulta
      const route = useRoute()
      const redirectPath = route.query.redirect?.toString() || '/'
      
      // Redirigir al usuario a la página que intentaba acceder o a la página principal
      await navigateTo(redirectPath)
    } else {
      // Mostrar mensaje de error del store
      const errorMessage = result.error || 'Credenciales inválidas';
      console.error('Error de autenticación:', errorMessage);
      
      // Mostrar mensaje de error al usuario
      if (errorMessage.includes('Usuario o contraseña incorrectos')) {
        toast.error('Usuario o contraseña incorrectos. Por favor, verifica tus credenciales.');
      } else {
        toast.error(errorMessage);
      }
    }
  } catch (error: any) {
    console.error('Error inesperado durante el login:', error);
    
    // Manejar diferentes tipos de errores
    if (error?.response?.data) {
      // Error con respuesta del servidor
      const errorData = error.response.data;
      const serverMessage = errorData.message || errorData.Message || JSON.stringify(errorData);
      console.log('Error del servidor:', serverMessage);
      
      if (serverMessage.includes('Usuario o contraseña incorrectos')) {
        toast.error('Usuario o contraseña incorrectos. Por favor, verifica tus credenciales.');
      } else {
        toast.error(serverMessage || 'Error en el servidor. Por favor, inténtalo de nuevo más tarde.');
      }
    } else if (error?.message) {
      // Error con mensaje
      console.log('Mensaje de error:', error.message);
      
      if (error.message.includes('Network Error')) {
        toast.error('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
      } else {
        toast.error(error.message);
      }
    } else {
      // Error genérico
      console.log('Error desconocido:', error);
      toast.error('Ocurrió un error inesperado al iniciar sesión. Por favor, inténtalo de nuevo.');
    }
  } finally {
    loading.value = false
  }
}

const fillDemoCredentials = (): void => {
  form.email = 'admin@rrdeveloper.com'
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
