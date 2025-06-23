<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Usuarios
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Gestiona los usuarios del sistema
        </p>
      </div>
      <div class="flex items-center space-x-3">
        <button @click="exportUsers" class="btn-secondary">
          <ArrowDownTrayIcon class="w-4 h-4 mr-2" />
          Exportar
        </button>
        <button @click="showCreateModal = true" class="btn-primary">
          <PlusIcon class="w-4 h-4 mr-2" />
          Nuevo Usuario
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <MetricCard
        title="Total Usuarios"
        :value="users.length"
        :icon="UsersIcon"
        color="blue"
      />

      <MetricCard
        title="Activos"
        :value="activeUsers"
        :icon="CheckCircleIcon"
        color="green"
      />

      <MetricCard
        title="Inactivos"
        :value="inactiveUsers"
        :icon="XCircleIcon"
        color="red"
      />

      <MetricCard
        title="Nuevos (30 días)"
        :value="newUsers"
        :icon="UserPlusIcon"
        color="purple"
      />
    </div>

    <!-- Filters -->
    <div class="card p-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Estado
          </label>
          <select v-model="filters.status" class="input-field">
            <option value="all">Todos</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
            <option value="pending">Pendientes</option>
          </select>
        </div>

        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Rol
          </label>
          <select v-model="filters.role" class="input-field">
            <option value="all">Todos</option>
            <option value="admin">Administrador</option>
            <option value="manager">Gerente</option>
            <option value="consultant">Consultor</option>
            <option value="client">Cliente</option>
          </select>
        </div>

        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Departamento
          </label>
          <select v-model="filters.department" class="input-field">
            <option value="all">Todos</option>
            <option value="operations">Operaciones</option>
            <option value="finance">Finanzas</option>
            <option value="hr">Recursos Humanos</option>
            <option value="it">Tecnología</option>
          </select>
        </div>

        <div class="flex items-end">
          <button @click="clearFilters" class="btn-secondary w-full">
            Limpiar Filtros
          </button>
        </div>
      </div>
    </div>

    <!-- Users Table -->
    <div class="card">
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Lista de Usuarios ({{ filteredUsers.length }})
          </h3>
          <div class="flex items-center space-x-2">
            <div class="relative">
              <MagnifyingGlassIcon
                class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
              />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Buscar usuarios..."
                class="pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Usuario
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Rol
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Departamento
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Estado
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Último Acceso
              </th>
              <th
                class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Acciones
              </th>
            </tr>
          </thead>
          <tbody
            class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700"
          >
            <tr
              v-for="user in filteredUsers"
              :key="user.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <img
                    :src="user.avatar"
                    :alt="user.name"
                    class="w-10 h-10 rounded-full"
                  />
                  <div class="ml-4">
                    <div
                      class="text-sm font-medium text-gray-900 dark:text-white"
                    >
                      {{ user.name }}
                    </div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                      {{ user.email }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="getRoleClass(user.role)"
                >
                  {{ getRoleLabel(user.role) }}
                </span>
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white"
              >
                {{ getDepartmentLabel(user.department) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="getStatusClass(user.status)"
                >
                  {{ getStatusLabel(user.status) }}
                </span>
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"
              >
                {{ formatLastLogin(user.lastLogin) }}
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
              >
                <div class="flex items-center justify-end space-x-2">
                  <button
                    @click="viewUser(user)"
                    class="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                    title="Ver perfil"
                  >
                    <EyeIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="editUser(user)"
                    class="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                    title="Editar"
                  >
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="toggleUserStatus(user)"
                    class="text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400"
                    :title="user.status === 'active' ? 'Desactivar' : 'Activar'"
                  >
                    <PowerIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="confirmDeleteUser(user)"
                    class="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                    title="Eliminar"
                  >
                    <TrashIcon class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-700 dark:text-gray-300">
            Mostrando {{ (currentPage - 1) * itemsPerPage + 1 }} -
            {{ Math.min(currentPage * itemsPerPage, filteredUsers.length) }} de
            {{ filteredUsers.length }} usuarios
          </div>
          <div class="flex items-center space-x-2">
            <button
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="btn-secondary text-sm"
              :class="{ 'opacity-50 cursor-not-allowed': currentPage === 1 }"
            >
              Anterior
            </button>
            <span class="text-sm text-gray-700 dark:text-gray-300">
              Página {{ currentPage }} de {{ totalPages }}
            </span>
            <button
              @click="currentPage++"
              :disabled="currentPage === totalPages"
              class="btn-secondary text-sm"
              :class="{
                'opacity-50 cursor-not-allowed': currentPage === totalPages,
              }"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit User Modal -->
    <div
      v-if="showCreateModal || showEditModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="card p-6 m-4 max-w-md w-full">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {{ showCreateModal ? "Crear Nuevo Usuario" : "Editar Usuario" }}
        </h3>

        <form @submit.prevent="saveUser" class="space-y-4">
          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Nombre Completo
            </label>
            <input
              v-model="userForm.name"
              type="text"
              required
              class="input-field"
              placeholder="Nombre completo"
            />
          </div>

          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Email
            </label>
            <input
              v-model="userForm.email"
              type="email"
              required
              class="input-field"
              placeholder="email@empresa.com"
            />
          </div>

          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Rol
            </label>
            <select v-model="userForm.role" required class="input-field">
              <option value="">Seleccionar rol</option>
              <option value="admin">Administrador</option>
              <option value="manager">Gerente</option>
              <option value="consultant">Consultor</option>
              <option value="client">Cliente</option>
            </select>
          </div>

          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Departamento
            </label>
            <select v-model="userForm.department" required class="input-field">
              <option value="">Seleccionar departamento</option>
              <option value="operations">Operaciones</option>
              <option value="finance">Finanzas</option>
              <option value="hr">Recursos Humanos</option>
              <option value="it">Tecnología</option>
            </select>
          </div>

          <div class="flex items-center justify-end space-x-3 pt-4">
            <button type="button" @click="closeModal" class="btn-secondary">
              Cancelar
            </button>
            <button type="submit" class="btn-primary">
              {{ showCreateModal ? "Crear Usuario" : "Guardar Cambios" }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="card p-6 m-4 max-w-md w-full">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Confirmar Eliminación
        </h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          ¿Estás seguro de que deseas eliminar al usuario "{{
            userToDelete?.name
          }}"? Esta acción no se puede deshacer.
        </p>
        <div class="flex items-center justify-end space-x-3">
          <button @click="showDeleteModal = false" class="btn-secondary">
            Cancelar
          </button>
          <button @click="deleteUser" class="btn-danger">Eliminar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  UsersIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserPlusIcon,
  PlusIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PowerIcon,
} from "@heroicons/vue/24/outline";

// Reactive state
const searchQuery = ref("");
const currentPage = ref(1);
const itemsPerPage = ref(10);
const showCreateModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const userToDelete = ref(null);
const editingUser = ref(null);

// Filters
const filters = reactive({
  status: "all",
  role: "all",
  department: "all",
});

// User form
const userForm = reactive({
  name: "",
  email: "",
  role: "",
  department: "",
  status: "active",
});

// Mock users data
const users = ref([
  {
    id: "1",
    name: "Juan Pérez García",
    email: "juan.perez@bga.com",
    role: "admin",
    department: "operations",
    status: "active",
    avatar:
      "https://ui-avatars.com/api/?name=Juan+Perez&background=0ea5e9&color=fff",
    lastLogin: new Date(Date.now() - 3600000).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    id: "2",
    name: "María González López",
    email: "maria.gonzalez@bga.com",
    role: "manager",
    department: "finance",
    status: "active",
    avatar:
      "https://ui-avatars.com/api/?name=Maria+Gonzalez&background=34d399&color=fff",
    lastLogin: new Date(Date.now() - 7200000).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
  },
  {
    id: "3",
    name: "Carlos Rodríguez Méndez",
    email: "carlos.rodriguez@bga.com",
    role: "consultant",
    department: "operations",
    status: "active",
    avatar:
      "https://ui-avatars.com/api/?name=Carlos+Rodriguez&background=f59e0b&color=fff",
    lastLogin: new Date(Date.now() - 14400000).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 90).toISOString(),
  },
  {
    id: "4",
    name: "Ana Martínez Silva",
    email: "ana.martinez@bga.com",
    role: "consultant",
    department: "hr",
    status: "inactive",
    avatar:
      "https://ui-avatars.com/api/?name=Ana+Martinez&background=ef4444&color=fff",
    lastLogin: new Date(Date.now() - 86400000 * 7).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 120).toISOString(),
  },
  {
    id: "5",
    name: "Luis Fernando Torres",
    email: "luis.torres@cliente.com",
    role: "client",
    department: "it",
    status: "active",
    avatar:
      "https://ui-avatars.com/api/?name=Luis+Torres&background=8b5cf6&color=fff",
    lastLogin: new Date(Date.now() - 28800000).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
  },
]);

// Computed properties
const filteredUsers = computed(() => {
  let filtered = users.value;

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
    );
  }

  // Apply status filter
  if (filters.status !== "all") {
    filtered = filtered.filter((user) => user.status === filters.status);
  }

  // Apply role filter
  if (filters.role !== "all") {
    filtered = filtered.filter((user) => user.role === filters.role);
  }

  // Apply department filter
  if (filters.department !== "all") {
    filtered = filtered.filter(
      (user) => user.department === filters.department
    );
  }

  return filtered;
});

const totalPages = computed(() =>
  Math.ceil(filteredUsers.value.length / itemsPerPage.value)
);

const activeUsers = computed(
  () => users.value.filter((u) => u.status === "active").length
);
const inactiveUsers = computed(
  () => users.value.filter((u) => u.status === "inactive").length
);
const newUsers = computed(() => {
  const thirtyDaysAgo = new Date(Date.now() - 86400000 * 30);
  return users.value.filter((u) => new Date(u.createdAt) > thirtyDaysAgo)
    .length;
});

// Methods
const getRoleLabel = (role: string) => {
  const labels = {
    admin: "Administrador",
    manager: "Gerente",
    consultant: "Consultor",
    client: "Cliente",
  };
  return labels[role] || role;
};

const getRoleClass = (role: string) => {
  const classes = {
    admin: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    manager: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    consultant:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    client:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  };
  return (
    classes[role] ||
    "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
  );
};

const getDepartmentLabel = (department: string) => {
  const labels = {
    operations: "Operaciones",
    finance: "Finanzas",
    hr: "Recursos Humanos",
    it: "Tecnología",
  };
  return labels[department] || department;
};

const getStatusLabel = (status: string) => {
  const labels = {
    active: "Activo",
    inactive: "Inactivo",
    pending: "Pendiente",
  };
  return labels[status] || status;
};

const getStatusClass = (status: string) => {
  const classes = {
    active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    inactive: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    pending:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  };
  return (
    classes[status] ||
    "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
  );
};

const formatLastLogin = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  );

  if (diffInHours < 1) return "Hace unos minutos";
  if (diffInHours < 24) return `Hace ${diffInHours} horas`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `Hace ${diffInDays} días`;

  return date.toLocaleDateString("es-MX");
};

const clearFilters = () => {
  filters.status = "all";
  filters.role = "all";
  filters.department = "all";
  searchQuery.value = "";
};

const resetForm = () => {
  userForm.name = "";
  userForm.email = "";
  userForm.role = "";
  userForm.department = "";
  userForm.status = "active";
};

const closeModal = () => {
  showCreateModal.value = false;
  showEditModal.value = false;
  editingUser.value = null;
  resetForm();
};

const viewUser = (user: any) => {
  navigateTo(`/users/${user.id}`);
};

const editUser = (user: any) => {
  editingUser.value = user;
  userForm.name = user.name;
  userForm.email = user.email;
  userForm.role = user.role;
  userForm.department = user.department;
  userForm.status = user.status;
  showEditModal.value = true;
};

const saveUser = () => {
  if (showCreateModal.value) {
    // Create new user
    const newUser = {
      id: String(Date.now()),
      ...userForm,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
        userForm.name
      )}&background=0ea5e9&color=fff`,
      lastLogin: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    users.value.push(newUser);
    console.log("Usuario creado:", newUser);
  } else {
    // Update existing user
    const index = users.value.findIndex((u) => u.id === editingUser.value.id);
    if (index !== -1) {
      users.value[index] = { ...users.value[index], ...userForm };
      console.log("Usuario actualizado:", users.value[index]);
    }
  }
  closeModal();
};

const toggleUserStatus = (user: any) => {
  const newStatus = user.status === "active" ? "inactive" : "active";
  user.status = newStatus;
  console.log(
    `Usuario ${user.name} ${
      newStatus === "active" ? "activado" : "desactivado"
    }`
  );
};

const confirmDeleteUser = (user: any) => {
  userToDelete.value = user;
  showDeleteModal.value = true;
};

const deleteUser = () => {
  if (userToDelete.value) {
    const index = users.value.findIndex((u) => u.id === userToDelete.value.id);
    if (index !== -1) {
      users.value.splice(index, 1);
      console.log("Usuario eliminado:", userToDelete.value.name);
    }
    showDeleteModal.value = false;
    userToDelete.value = null;
  }
};

const exportUsers = () => {
  console.log("Exportando usuarios...");
  // Aquí implementarías la lógica de exportación
};

// Page meta
definePageMeta({
  title: "Gestión de Usuarios",
  layout: "default",
});
</script>

<style scoped>
.input-field {
  @apply w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white;
}

.btn-primary {
  @apply px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 transition-colors flex items-center;
}

.btn-secondary {
  @apply px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center;
}

.btn-danger {
  @apply px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 transition-colors;
}

.card {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow;
}
</style>
