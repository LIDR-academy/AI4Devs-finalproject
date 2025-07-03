<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-4xl mx-auto">
      <!-- Encabezado del perfil -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div class="flex flex-col md:flex-row items-center md:items-start">
          <div class="w-32 h-32 mb-4 md:mb-0 md:mr-6">
            <img
              :src="
                authStore.user?.avatar ||
                'https://ui-avatars.com/api/?name=' +
                  encodeURIComponent(authStore.user?.name || 'Usuario') +
                  '&background=0ea5e9&color=fff&size=128'
              "
              :alt="authStore.user?.name || 'Usuario'"
              class="w-full h-full rounded-full object-cover border-4 border-primary-100 dark:border-primary-900"
            />
          </div>
          <div class="text-center md:text-left flex-1">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {{ authStore.user?.name || 'Usuario' }}
            </h1>
            <p class="text-gray-600 dark:text-gray-400 mb-3">
              {{ authStore.user?.position || 'Sin cargo' }}
            </p>
            <div class="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
              <span
                class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
              >
                {{ authStore.user?.role || 'Usuario' }}
              </span>
              <span
                v-if="authStore.user?.department"
                class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
              >
                {{ authStore.user?.department }}
              </span>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              <MailIcon class="inline-block w-4 h-4 mr-1" />
              {{ authStore.user?.email || 'correo@ejemplo.com' }}
            </p>
          </div>
          <div class="mt-4 md:mt-0">
            <button
              class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              @click="isEditMode = !isEditMode"
            >
              {{ isEditMode ? 'Cancelar' : 'Editar perfil' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Contenido del perfil -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Columna izquierda -->
        <div class="md:col-span-2">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Información personal
            </h2>
            
            <div v-if="isEditMode">
              <!-- Formulario de edición -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nombre completo
                  </label>
                  <input
                    v-model="userForm.name"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Cargo
                  </label>
                  <input
                    v-model="userForm.position"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Departamento
                  </label>
                  <input
                    v-model="userForm.department"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Teléfono
                  </label>
                  <input
                    v-model="userForm.phone"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              
              <div class="mt-6">
                <button
                  class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors mr-2"
                  @click="saveProfile"
                >
                  Guardar cambios
                </button>
                <button
                  class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white rounded-lg transition-colors"
                  @click="isEditMode = false"
                >
                  Cancelar
                </button>
              </div>
            </div>
            
            <div v-else>
              <!-- Vista de información -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="mb-4">
                  <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Nombre completo
                  </h3>
                  <p class="text-base text-gray-900 dark:text-white">
                    {{ authStore.user?.name || 'No especificado' }}
                  </p>
                </div>
                <div class="mb-4">
                  <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Cargo
                  </h3>
                  <p class="text-base text-gray-900 dark:text-white">
                    {{ authStore.user?.position || 'No especificado' }}
                  </p>
                </div>
                <div class="mb-4">
                  <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Departamento
                  </h3>
                  <p class="text-base text-gray-900 dark:text-white">
                    {{ authStore.user?.department || 'No especificado' }}
                  </p>
                </div>
                <div class="mb-4">
                  <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Teléfono
                  </h3>
                  <p class="text-base text-gray-900 dark:text-white">
                    {{ authStore.user?.phone || 'No especificado' }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Cambiar contraseña
            </h2>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Contraseña actual
                </label>
                <input
                  v-model="passwordForm.currentPassword"
                  type="password"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nueva contraseña
                </label>
                <input
                  v-model="passwordForm.newPassword"
                  type="password"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirmar contraseña
                </label>
                <input
                  v-model="passwordForm.confirmPassword"
                  type="password"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div class="mt-2">
                <button
                  class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                  @click="changePassword"
                  :disabled="!canChangePassword"
                >
                  Actualizar contraseña
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Columna derecha -->
        <div>
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Actividad reciente
            </h2>
            <div class="space-y-4">
              <div v-if="recentActivities.length === 0" class="text-center py-4 text-gray-500 dark:text-gray-400">
                No hay actividad reciente
              </div>
              <div 
                v-for="(activity, index) in recentActivities" 
                :key="index"
                class="flex items-start space-x-3 pb-4 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0"
              >
                <div class="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                  <component :is="getActivityIcon(activity.type)" class="w-4 h-4 text-primary-600 dark:text-primary-300" />
                </div>
                <div>
                  <p class="text-sm text-gray-900 dark:text-white">
                    {{ activity.description }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {{ formatDate(activity.date) }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Preferencias
            </h2>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-700 dark:text-gray-300">Modo oscuro</span>
                <button 
                  @click="settingsStore.toggleDarkMode()"
                  class="relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none"
                  :class="settingsStore.isDarkMode ? 'bg-primary-600' : 'bg-gray-300'"
                >
                  <span
                    class="inline-block w-4 h-4 transform bg-white rounded-full transition-transform"
                    :class="settingsStore.isDarkMode ? 'translate-x-6' : 'translate-x-1'"
                  ></span>
                </button>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-700 dark:text-gray-300">Notificaciones</span>
                <button 
                  @click="preferences.notifications = !preferences.notifications"
                  class="relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none"
                  :class="preferences.notifications ? 'bg-primary-600' : 'bg-gray-300'"
                >
                  <span
                    class="inline-block w-4 h-4 transform bg-white rounded-full transition-transform"
                    :class="preferences.notifications ? 'translate-x-6' : 'translate-x-1'"
                  ></span>
                </button>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-700 dark:text-gray-300">Emails</span>
                <button 
                  @click="preferences.emails = !preferences.emails"
                  class="relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none"
                  :class="preferences.emails ? 'bg-primary-600' : 'bg-gray-300'"
                >
                  <span
                    class="inline-block w-4 h-4 transform bg-white rounded-full transition-transform"
                    :class="preferences.emails ? 'translate-x-6' : 'translate-x-1'"
                  ></span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useToast } from '../composables/useToast';
import { useAuthStore } from '~/stores/auth';
import { useSettingsStore } from '~/stores/settings';
import {
  MagnifyingGlassIcon,
  BellIcon,
  UserIcon,
  InformationCircleIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon
} from '@heroicons/vue/24/outline';

// Definimos alias para los iconos que necesitamos
const MailIcon = ArrowRightOnRectangleIcon;
const DocumentTextIcon = InformationCircleIcon;
const ClockIcon = BellIcon;
const UserGroupIcon = UserIcon;

const authStore = useAuthStore();
const settingsStore = useSettingsStore();
const toast = useToast();

// Estado reactivo
const isEditMode = ref(false);
const userForm = ref({
  name: authStore.user?.name || '',
  position: authStore.user?.position || '',
  department: authStore.user?.department || '',
  phone: authStore.user?.phone || ''
});

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const preferences = ref({
  notifications: true,
  emails: true
});

// Actividades recientes (simuladas)
const recentActivities = ref([
  {
    type: 'document',
    description: 'Actualizó el documento "Informe Q2"',
    date: new Date(Date.now() - 3600000 * 2)
  },
  {
    type: 'task',
    description: 'Completó la tarea "Revisión de presupuesto"',
    date: new Date(Date.now() - 3600000 * 24)
  },
  {
    type: 'meeting',
    description: 'Asistió a la reunión "Planificación semanal"',
    date: new Date(Date.now() - 3600000 * 48)
  }
]);

// Computed properties
const canChangePassword = computed(() => {
  return (
    passwordForm.value.currentPassword && 
    passwordForm.value.newPassword && 
    passwordForm.value.confirmPassword &&
    passwordForm.value.newPassword === passwordForm.value.confirmPassword
  );
});

// Métodos
const saveProfile = () => {
  // Aquí iría la lógica para guardar los cambios en el perfil
  // Por ahora solo simulamos una actualización exitosa
  setTimeout(() => {
    // Actualizar el store con los nuevos datos
    authStore.user = {
      ...authStore.user,
      name: userForm.value.name,
      position: userForm.value.position,
      department: userForm.value.department,
      phone: userForm.value.phone
    };
    
    isEditMode.value = false;
    toast.success('Perfil actualizado correctamente');
  }, 500);
};

const changePassword = () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    toast.error('Las contraseñas no coinciden');
    return;
  }
  
  // Aquí iría la lógica para cambiar la contraseña
  // Por ahora solo simulamos una actualización exitosa
  setTimeout(() => {
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    toast.success('Contraseña actualizada correctamente');
  }, 500);
};

const getActivityIcon = (type) => {
  const icons = {
    document: DocumentTextIcon,
    task: ClockIcon,
    meeting: UserGroupIcon
  };
  
  return icons[type] || DocumentTextIcon;
};

const formatDate = (date) => {
  const now = new Date();
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
  
  if (diffInHours < 24) {
    return `Hace ${diffInHours} horas`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Ayer';
    if (diffInDays < 7) return `Hace ${diffInDays} días`;
    return date.toLocaleDateString();
  }
};
</script>
