<template>
  <header
    class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4"
  >
    <div class="flex items-center justify-between">
      <!-- Left Section -->
      <div class="flex items-center space-x-4">
        <!-- Page Title -->
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ pageTitle }}
          </h1>
          <p
            v-if="pageSubtitle"
            class="text-sm text-gray-600 dark:text-gray-400"
          >
            {{ pageSubtitle }}
          </p>
        </div>
      </div>

      <!-- Center Section - Search -->
      <div class="flex-1 max-w-md mx-8">
        <div class="relative">
          <MagnifyingGlassIcon
            class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar proyectos, tareas..."
            class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            @keyup.enter="performSearch"
          />
        </div>
      </div>

      <!-- Right Section -->
      <div class="flex items-center space-x-4">

        <!-- Theme Toggle -->
        <ClientOnly>
          <button
            @click="settingsStore.toggleDarkMode()"
            class="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <SunIcon v-if="settingsStore.isDarkMode" class="w-5 h-5" />
            <MoonIcon v-else class="w-5 h-5" />
          </button>
          <template #fallback>
            <!-- Placeholder durante la hidratación -->
            <div class="p-2 w-9 h-9 rounded-lg">
              <div
                class="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"
              ></div>
            </div>
          </template>
        </ClientOnly>

        <!-- Notifications -->
        <div class="relative">
          <button
            @click="showNotifications = !showNotifications"
            class="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative"
          >
            <BellIcon class="w-5 h-5" />
            <span
              v-if="unreadNotifications > 0"
              class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
            >
              {{ unreadNotifications > 9 ? "9+" : unreadNotifications }}
            </span>
          </button>

          <!-- Notifications Dropdown -->
          <Transition name="fade">
            <div
              v-if="showNotifications"
              v-click-away="() => (showNotifications = false)"
              class="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
            >
              <div class="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  Notificaciones
                </h3>
              </div>
              <div class="max-h-96 overflow-y-auto">
                <div
                  v-for="notification in notifications"
                  :key="notification.id"
                  class="p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  @click="markAsRead(notification.id)"
                >
                  <div class="flex items-start space-x-3">
                    <div class="flex-shrink-0">
                      <div
                        class="w-2 h-2 rounded-full mt-2"
                        :class="
                          notification.read ? 'bg-gray-300' : 'bg-primary-500'
                        "
                      ></div>
                    </div>
                    <div class="flex-1">
                      <p
                        class="text-sm font-medium"
                        :class="
                          notification.read
                            ? 'text-gray-600 dark:text-gray-400'
                            : 'text-gray-900 dark:text-white'
                        "
                      >
                        {{ notification.title }}
                      </p>
                      <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {{ notification.message }}
                      </p>
                      <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {{ formatDate(notification.createdAt) }}
                      </p>
                    </div>
                  </div>
                </div>
                <div
                  v-if="notifications.length === 0"
                  class="p-4 text-center text-gray-500 dark:text-gray-400"
                >
                  No hay notificaciones
                </div>
              </div>
              <div
                v-if="notifications.length > 0"
                class="p-4 border-t border-gray-200 dark:border-gray-700"
              >
                <button
                  @click="markAllAsRead"
                  class="text-sm text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  Marcar todas como leídas
                </button>
              </div>
            </div>
          </Transition>
        </div>

        <!-- User Menu -->
        <div class="relative">
          <button
            @click="toggleUserMenu"
            class="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            ref="userMenuButton"
          >
            <div class="flex items-center space-x-3">
              <!-- Usar ClientOnly para evitar problemas de hidratación -->
              <ClientOnly>
                <img
                  :src="`https://ui-avatars.com/api/?name=${authStore.user?.name || 'Usuario'}&background=0ea5e9&color=fff`"
                  :alt="authStore.user?.name || 'Usuario'"
                  class="w-8 h-8 rounded-full"
                />
                <template #fallback>
                  <div class="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                </template>
              </ClientOnly>
              <ClientOnly>
                <p class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ authStore.user?.name || 'Usuario' }}
                </p>
                <template #fallback>
                  <p class="text-sm font-medium text-gray-900 dark:text-white">Usuario</p>
                </template>
              </ClientOnly>
            </div>
            <p class="text-xs text-gray-600 dark:text-gray-400">
              {{ authStore.user?.position }}
            </p>
            <ChevronDownIcon 
              class="w-4 h-4 text-gray-600 dark:text-gray-300" 
              :class="{ 'transform rotate-180': showUserMenu }"
            />
          </button>

          <!-- User Dropdown -->
          <Transition name="fade">
            <div
              v-if="showUserMenu"
              v-click-away="closeUserMenu"
              class="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
              ref="userMenu"
            >
              <div class="p-4 border-b border-gray-200 dark:border-gray-700">
                <ClientOnly>
                  <p class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ authStore.user?.name || 'Usuario' }}
                  </p>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    {{ authStore.user?.email || 'usuario@ejemplo.com' }}
                  </p>
                  <template #fallback>
                    <p class="text-sm font-medium text-gray-900 dark:text-white">Usuario</p>
                    <p class="text-sm text-gray-600 dark:text-gray-400">usuario@ejemplo.com</p>
                  </template>
                </ClientOnly>
              </div>
              <div class="py-2">
                <a
                  href="#"
                  class="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  @click.prevent="navigateAndCloseMenu('/profile')"
                >
                  <UserIcon class="w-4 h-4 mr-3" />
                  Mi Perfil
                </a>
                <a
                  href="#"
                  class="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  @click.prevent="navigateAndCloseMenu('/my-info')"
                >
                  <InformationCircleIcon class="w-4 h-4 mr-3" />
                  Mi Información
                </a>
                <a
                  href="#"
                  class="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  @click.prevent="navigateAndCloseMenu('/settings')"
                >
                  <CogIcon class="w-4 h-4 mr-3" />
                  Configuración
                </a>
                <a
                  href="#"
                  class="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  @click.prevent="logout"
                >
                  <ArrowRightOnRectangleIcon class="w-4 h-4 mr-3" />
                  Cerrar Sesión
                </a>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, nextTick } from "vue";
import { useRoute, navigateTo } from "nuxt/app";
import { useAuthStore } from "~/stores/auth";
import { useSettingsStore } from "~/stores/settings";

// Icons
import {
  MagnifyingGlassIcon,
  BellIcon,
  SunIcon,
  MoonIcon,
  UserIcon,
  InformationCircleIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon
} from "@heroicons/vue/24/outline";

// Stores
const authStore = useAuthStore();
const settingsStore = useSettingsStore();
const route = useRoute();

// Referencias para el menú de usuario
const userMenuButton = ref(null);
const userMenu = ref(null);

// Reactive state
const searchQuery = ref("");
const showNotifications = ref(false);
const showUserMenu = ref(false);
const showCatalogMenu = ref(false);

// Computed properties
const pageTitle = computed(() => {
  const titles = {
    "/": "Dashboard",
    "/projects": "Proyectos",
    "/tasks": "Tareas",
    "/kpis": "KPIs",
    "/reports": "Reportes",
    "/finance": "Finanzas",
    "/documents": "Documentos",
    "/users": "Usuarios",
    "/settings": "Configuración",
    "/profile": "Mi Perfil",
    "/my-info": "Mi Información",
  };

  return titles[route.path] || "Dashboard";
});

const pageSubtitle = computed(() => {
  const subtitles = {
    "/": "Resumen general del sistema",
    "/projects": "Gestión de proyectos",
    "/tasks": "Administración de tareas",
    "/kpis": "Indicadores de rendimiento",
    "/reports": "Reportes y análisis",
    "/finance": "Gestión financiera",
    "/documents": "Documentos del proyecto",
    "/users": "Administración de usuarios",
    "/settings": "Configuración del sistema",
  };

  return subtitles[route.path] || "";
});

// Mock notifications
const notifications = ref([
  {
    id: "1",
    title: "Nuevo proyecto asignado",
    message: 'Se te ha asignado el proyecto "Optimización ABC"',
    createdAt: new Date().toISOString(),
    read: false,
  },
  {
    id: "2",
    title: "Tarea vencida",
    message: 'La tarea "Análisis de procesos" está vencida',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    read: false,
  },
  {
    id: "3",
    title: "Informe semanal listo",
    message: "El informe semanal del proyecto ABC está disponible",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    read: true,
  },
]);

const unreadNotifications = computed(
  () => notifications.value.filter((n) => !n.read).length
);

// Methods
const performSearch = () => {
  if (searchQuery.value.trim()) {
    navigateTo(`/search?q=${encodeURIComponent(searchQuery.value)}`);
  }
};

const markAsRead = (notificationId) => {
  const notification = notifications.value.find((n) => n.id === notificationId);
  if (notification) {
    notification.read = true;
  }
};

const markAllAsRead = () => {
  notifications.value.forEach((n) => (n.read = true));
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  );

  if (diffInHours < 1) return "Hace unos minutos";
  if (diffInHours < 24) return `Hace ${diffInHours} horas`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `Hace ${diffInDays} días`;

  return date.toLocaleDateString();
};

// Métodos para el menú de usuario
const navigateAndCloseMenu = (path) => {
  closeUserMenu();
  navigateTo(path);
};



const toggleUserMenu = (event) => {
  // Prevenir comportamiento predeterminado y propagación
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  
  // Cerrar otros menús si están abiertos
  if (showCatalogMenu.value) closeCatalogMenu();
  if (showNotifications.value) showNotifications.value = false;
  
  // Alternar estado del menú
  showUserMenu.value = !showUserMenu.value;
  
  // Si abrimos el menú, añadir un listener para cerrarlo al hacer clic fuera
  if (showUserMenu.value) {
    // Usar nextTick para asegurar que el DOM se ha actualizado
    nextTick(() => {
      // Añadir listener solo después de que el DOM se haya actualizado
      document.addEventListener('click', documentClickHandler);
    });
  } else {
    // Si cerramos el menú, eliminar el listener
    document.removeEventListener('click', documentClickHandler);
  }
};

const closeUserMenu = () => {
  showUserMenu.value = false;
  // Eliminar el listener cuando cerramos el menú
  document.removeEventListener('click', documentClickHandler);
};

const closeCatalogMenu = () => {
  showCatalogMenu.value = false;
};

const documentClickHandler = (event) => {
  // Si el menú está abierto y el clic no fue dentro del menú ni en el botón
  if (showUserMenu.value && 
      userMenu.value && 
      userMenuButton.value && 
      !userMenu.value.contains(event.target) && 
      !userMenuButton.value.contains(event.target)) {
    closeUserMenu();
  }
};

const logout = async () => {
  closeUserMenu();
  await authStore.logout();
};

// Click away directive
const vClickAway = {
  mounted(el, binding) {
    // Aseguramos que el handler se ejecute en el siguiente tick para evitar conflictos con el evento click
    el._clickOutsideHandler = (event) => {
      // Verificamos que el elemento que recibió el click no sea el botón que activa el menú
      // ni esté contenido dentro del menú
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event);
      }
    };
    
    // Usamos setTimeout para asegurar que este listener se registre después del click que abre el menú
    setTimeout(() => {
      document.addEventListener("click", el._clickOutsideHandler);
    }, 0);
  },
  unmounted(el) {
    document.removeEventListener("click", el._clickOutsideHandler);
  },
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
