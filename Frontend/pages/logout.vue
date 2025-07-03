<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
    <div class="max-w-md w-full text-center">
      <div class="card p-8">
        <div class="mx-auto w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mb-4">
          <span class="text-white font-bold text-2xl">BGA</span>
        </div>
        
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Cerrando sesión...</h1>
        
        <div v-if="loading" class="flex justify-center my-6">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
        </div>
        
        <p class="text-gray-600 dark:text-gray-400 mb-6">{{ message }}</p>
        
        <div v-if="!loading" class="flex flex-col space-y-4">
          <button 
            @click="goToLogin" 
            class="btn-primary py-2 px-4"
          >
            Volver al inicio de sesión
          </button>
          
          <button 
            @click="clearAllData" 
            class="btn-outline py-2 px-4"
          >
            Eliminar datos guardados
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Importaciones
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useToast } from '../composables/useToast';

// Definir metadatos de la página
definePageMeta({
  layout: 'auth'
})

const authStore = useAuthStore()
const toast = useToast()
const loading = ref(true)
const message = ref('Cerrando tu sesión...')

// Función para ir a la página de login
const goToLogin = () => {
  navigateTo('/login')
}

// Función para eliminar todos los datos, incluidos los de "Recordarme"
const clearAllData = () => {
  // Verificar que estamos en el navegador antes de acceder a localStorage
  if (typeof window !== 'undefined') {
    // Eliminar datos de "Recordarme"
    localStorage.removeItem('remember_me')
    localStorage.removeItem('saved_email')
    
    toast.success('Todos los datos han sido eliminados')
    message.value = 'Se han eliminado todos los datos guardados'
  }
}

// Al montar el componente, realizar el logout
onMounted(async () => {
  try {
    let rememberMe = false
    let savedEmail = null
    
    // Verificar que estamos en el navegador antes de acceder a localStorage
    if (typeof window !== 'undefined') {
      // Verificar si hay datos de "Recordarme" antes de cerrar sesión
      rememberMe = localStorage.getItem('remember_me') === 'true'
      savedEmail = localStorage.getItem('saved_email')
    }
    
    // Realizar el logout en el store de autenticación
    // El nuevo método es tolerante a fallos y siempre devuelve un objeto
    const result = await authStore.logout()
    
    // Si rememberMe estaba activo, restaurar los datos de acceso
    if (rememberMe && savedEmail && typeof window !== 'undefined') {
      localStorage.setItem('remember_me', 'true')
      localStorage.setItem('saved_email', savedEmail)
      message.value = 'Has cerrado sesión. Tus datos de acceso se han guardado.'
    } else {
      message.value = 'Has cerrado sesión correctamente.'
    }
    
    toast.success('Has cerrado sesión correctamente')
  } catch (error) {
    console.error('Error crítico al cerrar sesión:', error)
    // A pesar del error, consideramos que el logout fue exitoso localmente
    // ya que el store ya habrá limpiado los datos de sesión
    toast.warning('Hubo un problema con el servidor, pero tu sesión se ha cerrado localmente')
    message.value = 'Tu sesión se ha cerrado localmente. El servidor podría no estar disponible.'
  } finally {
    loading.value = false
  }
})
</script>
