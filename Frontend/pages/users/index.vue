<template>
  <div class="container px-4 py-8 mx-auto">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        Gestión de Usuarios
      </h1>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        Administra los usuarios del sistema
      </p>
    </div>

    <div class="flex justify-between items-center mb-6">
      <div></div>
      <div class="flex space-x-2">
        <button
          class="flex items-center space-x-1 btn-secondary"
          @click="exportUsers"
        >
          <ArrowDownTrayIcon class="w-4 h-4" />
          <span>Exportar</span>
        </button>
        <button
          class="flex items-center space-x-1 btn-primary"
          @click="showCreateModal = true"
        >
          <PlusIcon class="w-4 h-4" />
          <span>Nuevo Usuario</span>
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 gap-6 md:grid-cols-4">
      <MetricCard
        title="Total Usuarios"
        :value="usuariosStore.usuarios.length"
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

    <!-- Espacio entre las métricas y la tabla -->
    <div class="mb-6"></div>

    <!-- Users Table -->
    <div class="card">
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Lista de Usuarios ({{ usuariosStore.usuarios.length }})
          </h3>
          <div class="flex items-center space-x-2">
            <div class="relative">
              <MagnifyingGlassIcon
                class="absolute left-3 top-1/2 w-4 h-4 text-gray-400 transform -translate-y-1/2"
              />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Buscar usuarios..."
                class="py-2 pr-4 pl-9 text-sm rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500"
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
                class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400"
              >
                Usuario
              </th>
              <th
                class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400"
              >
                Email
              </th>
              <th
                class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400"
              >
                Perfil
              </th>
              <th
                class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400"
              >
                Estado
              </th>
              <th
                class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400"
              >
                Acciones
              </th>
            </tr>
          </thead>
          <tbody
            class="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700"
          >
            <tr v-if="usuariosStore.usuarios.length === 0">
              <td
                colspan="5"
                class="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
              >
                No hay usuarios disponibles
              </td>
            </tr>
            <tr v-for="usuario in usuariosStore.usuarios" :key="usuario.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="ml-4">
                    <div
                      class="text-sm font-medium text-gray-900 dark:text-white"
                    >
                      {{ usuario.nombre }} {{ usuario.apellidos }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  {{ usuario.email }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  {{ usuario.perfilNombre || "No asignado" }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="{
                    'px-2 inline-flex text-xs leading-5 font-semibold rounded-full': true,
                    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200':
                      usuario.activo,
                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200':
                      !usuario.activo,
                  }"
                >
                  {{ usuario.activo ? "Activo" : "Inactivo" }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm font-medium whitespace-nowrap">
                <button
                  class="mr-3 text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                  @click="openUsuarioModal(usuario)"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
                <button
                  class="mr-3 text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                  @click="toggleUsuarioStatus(usuario.id, !usuario.activo)"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="inline-block mr-1 w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  {{ usuario.activo ? "Desactivar" : "Activar" }}
                </button>
                <button
                  class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                  @click="deleteUsuario(usuario.id)"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
        <div class="flex justify-between items-center">
          <div class="text-sm text-gray-700 dark:text-gray-300">
            Mostrando {{ (currentPage - 1) * itemsPerPage + 1 }} -
            {{ Math.min(currentPage * itemsPerPage, filteredUsers.length) }} de
            {{ filteredUsers.length }} usuarios
          </div>
          <div class="flex items-center space-x-2">
            <button
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="text-sm btn-secondary"
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
              class="text-sm btn-secondary"
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

    <!-- Panel lateral para crear/editar usuario -->
    <div
      v-if="showCreateModal || showEditModal"
      class="flex fixed inset-0 z-50 justify-end bg-black bg-opacity-50"
    >
      <!-- Overlay para cerrar al hacer clic fuera -->
      <div class="absolute inset-0" @click="closeModal"></div>

      <!-- Panel lateral -->
      <div
        class="overflow-y-auto relative z-10 p-6 w-full max-w-md h-full bg-white shadow-xl transition-transform duration-300 ease-in-out dark:bg-gray-800"
        :class="{
          'translate-x-0': showCreateModal || showEditModal,
          'translate-x-full': !showCreateModal && !showEditModal,
        }"
      >
        <div
          class="flex sticky top-0 z-10 justify-between items-center py-2 mb-6 bg-white dark:bg-gray-800"
        >
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">
            {{ showCreateModal ? "Crear Usuario" : "Editar Usuario" }}
          </h2>
          <button
            @click="closeModal"
            class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <XCircleIcon class="w-6 h-6" />
          </button>
        </div>
        <form @submit.prevent="saveUser" class="space-y-6">
          <!-- Datos personales con fondo y bordes redondeados -->
          <div class="p-5 bg-white rounded-lg border border-gray-200 shadow-sm dark:bg-gray-700 dark:border-gray-600">
            <h3 class="flex items-center mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" class="mr-2 w-5 h-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
              </svg>
              Datos personales
            </h3>
            
            <!-- Nombre (row completo) -->
            <div class="mb-4">
              <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Nombre <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <div class="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                  </svg>
                </div>
                <input
                  v-model="userForm.nombre"
                  type="text"
                  required
                  class="py-2 pr-3 pl-10 w-full rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  placeholder="Nombre"
                  minlength="2"
                  maxlength="50"
                  @input="validateName"
                />
              </div>
              <p v-if="nameError" class="mt-1 text-xs text-red-500">
                {{ nameError }}
              </p>
            </div>

            <!-- Apellidos -->
            <div class="mb-4">
              <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Apellidos <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <div class="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                </div>
                <input
                  v-model="userForm.apellidos"
                  type="text"
                  required
                  class="py-2 pr-3 pl-10 w-full rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  placeholder="Apellidos"
                  minlength="2"
                  maxlength="50"
                  @input="validateLastName"
                />
              </div>
              <p v-if="lastNameError" class="mt-1 text-xs text-red-500">
                {{ lastNameError }}
              </p>
            </div>

            <!-- Email (row completo) -->
            <div class="mb-4">
              <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Email <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <div class="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <input
                  v-model="userForm.email"
                  type="email"
                  required
                  class="py-2 pr-3 pl-10 w-full rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  placeholder="ejemplo@correo.com"
                  @input="validateEmail"
                />
              </div>
              <p v-if="emailError" class="mt-1 text-xs text-red-500">
                {{ emailError }}
              </p>
            </div>
          </div>

          <!-- Información de contacto y roles -->
          <div class="p-5 bg-white rounded-lg border border-gray-200 shadow-sm dark:bg-gray-700 dark:border-gray-600">
            <h3 class="flex items-center mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" class="mr-2 w-5 h-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              Contacto y roles
            </h3>
            
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <!-- Móvil -->
              <div>
                <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Móvil
                </label>
                <div class="relative">
                  <div class="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  </div>
                  <input
                    v-model="userForm.movil"
                    type="tel"
                    class="py-2 pr-3 pl-10 w-full rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    placeholder="Ej: 5512345678"
                    pattern="[0-9]{10}"
                    maxlength="10"
                    @input="validatePhone"
                  />
                </div>
                <p v-if="phoneError" class="mt-1 text-xs text-red-500">
                  {{ phoneError }}
                </p>
                <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Formato: 10 dígitos sin espacios ni guiones
                </p>
              </div>

              <!-- Perfil -->
              <div>
                <label for="perfilId" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Perfil <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <div class="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 005 10a6 6 0 0012 0c0-.35-.035-.691-.1-1.02A5 5 0 0010 11z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <select
                    class="py-2 pr-3 pl-10 w-full rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    id="perfilId"
                    v-model="userForm.perfilId"
                    required
                  >
                    <option value="">Seleccione un perfil</option>
                    <option
                      v-for="perfil in perfilesActivos"
                      :key="perfil.id"
                      :value="perfil.id.toString()"
                    >
                      {{ perfil.nombre }}
                    </option>
                  </select>
                </div>
                <p
                  v-if="perfilesStore.isLoading"
                  class="mt-1 text-xs text-blue-500"
                >
                  Cargando perfiles...
                </p>
              </div>
            </div>
            
            <!-- Empleado (fila completa) -->
            <div class="mt-4">
              <label for="empleadoId" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Empleado (opcional)
              </label>
              <div class="relative">
                <div class="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clip-rule="evenodd" />
                    <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                  </svg>
                </div>
                <select
                  class="py-2 pr-3 pl-10 w-full rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  id="empleadoId"
                  v-model="userForm.empleadoId"
                >
                  <option :value="null">Sin empleado asociado</option>
                  <option
                    v-for="empleado in empleados"
                    :key="empleado.id"
                    :value="empleado.id"
                  >
                    {{ empleado.nombre }} {{ empleado.apellidos }}
                  </option>
                </select>
              </div>
              <p
                v-if="isLoadingEmpleados"
                class="mt-1 text-xs text-blue-500"
              >
                Cargando empleados...
              </p>
              <p
                v-if="!isLoadingEmpleados && empleados.length === 0"
                class="mt-1 text-xs text-yellow-500"
              >
                No se encontraron empleados disponibles
              </p>
            </div>
          </div>

          <!-- Contraseña y Confirmar Contraseña (solo en modo creación) -->
          <div v-if="showCreateModal" class="p-5 mt-4 bg-white rounded-lg border border-gray-200 shadow-sm dark:bg-gray-700 dark:border-gray-600">
            <h3 class="flex items-center mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" class="mr-2 w-5 h-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
              </svg>
              Seguridad de la cuenta
            </h3>
            <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
              <!-- Contraseña -->
              <div>
                <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Contraseña <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <div class="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <input
                    v-model="userForm.password"
                    type="password"
                    required
                    class="py-2 pr-3 pl-10 w-full rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    placeholder="Contraseña"
                    @input="validatePassword"
                  />
                  <p v-if="passwordError" class="mt-1 text-xs text-red-500">
                    {{ passwordError }}
                  </p>
                </div>
              </div>

              <!-- Confirmar Password -->
              <div>
                <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirmar contraseña <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <div class="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <input
                    v-model="passwordConfirm"
                    type="password"
                    required
                    class="py-2 pr-3 pl-10 w-full rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    placeholder="Confirmar contraseña"
                    @input="validatePasswordConfirm"
                  />
                  <p v-if="passwordConfirmError" class="mt-1 text-xs text-red-500">
                    {{ passwordConfirmError }}
                  </p>
                </div>
              </div>
            </div>
            <div class="mt-3 text-xs text-gray-500 dark:text-gray-400">
              <p class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="mr-1 w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                La contraseña debe tener al menos 8 caracteres y contener letras, números y caracteres especiales.
              </p>
            </div>
          </div>          

          <!-- Campos adicionales -->
          <div class="p-4 mt-6 bg-gray-50 rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
            <h3 class="flex items-center mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" class="mr-2 w-5 h-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
              </svg>
              Campos adicionales
            </h3>
            
            <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
              <!-- NormalizedUserName -->
              <div class="p-4 bg-white rounded-md shadow-sm dark:bg-gray-700">
                <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300" for="normalizedUserName">
                  Nombre de usuario normalizado
                </label>
                <div class="relative">
                  <div class="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="normalizedUserName"
                    v-model="userForm.normalizedUserName"
                    class="py-2 pr-3 pl-10 w-full text-gray-500 bg-gray-50 rounded-md border border-gray-300 shadow-sm sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400"
                    placeholder="Usuario"
                    disabled
                  />
                </div>
                <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Generado automáticamente</p>
              </div>
              
              <!-- NormalizedEmail -->
              <div class="p-4 bg-white rounded-md shadow-sm dark:bg-gray-700">
                <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300" for="normalizedEmail">
                  Email normalizado
                </label>
                <div class="relative">
                  <div class="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="normalizedEmail"
                    v-model="userForm.normalizedEmail"
                    class="py-2 pr-3 pl-10 w-full text-gray-500 bg-gray-50 rounded-md border border-gray-300 shadow-sm sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400"
                    placeholder="Email"
                    disabled
                  />
                </div>
                <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Generado automáticamente</p>
              </div>
            </div>
            
            <!-- Opciones de seguridad -->
            <div class="p-3 mt-4 bg-gray-50 rounded-md dark:bg-gray-800">
              <h4 class="flex items-center mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" class="mr-1 w-4 h-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                Opciones de seguridad
              </h4>
              <div class="grid grid-cols-1 gap-2 md:grid-cols-3">
                <!-- EmailConfirmed -->
                <div class="flex items-center p-2 rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-gray-700">
                  <input
                    type="checkbox"
                    id="emailConfirmed"
                    v-model="userForm.emailConfirmed"
                    class="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                  />
                  <label
                    for="emailConfirmed"
                    class="block ml-2 text-sm text-gray-700 dark:text-gray-300"
                  >
                    Email confirmado
                  </label>
                </div>

                <!-- PhoneNumberConfirmed -->
                <div class="flex items-center p-2 rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-gray-700">
                  <input
                    type="checkbox"
                    id="phoneNumberConfirmed"
                    v-model="userForm.phoneNumberConfirmed"
                    class="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                  />
                  <label
                    for="phoneNumberConfirmed"
                    class="block ml-2 text-sm text-gray-700 dark:text-gray-300"
                  >
                    Teléfono confirmado
                  </label>
                </div>

                <!-- TwoFactorEnabled -->
                <div class="flex items-center p-2 rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-gray-700">
                  <input
                    type="checkbox"
                    id="twoFactorEnabled"
                    v-model="userForm.twoFactorEnabled"
                    class="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                  />
                  <label
                    for="twoFactorEnabled"
                    class="block ml-2 text-sm text-gray-700 dark:text-gray-300"
                  >
                    2FA habilitado
                  </label>
                </div>
              </div>
            </div>
            
            <!-- Número de usuario -->
            <div class="p-4 mt-4 bg-white rounded-md shadow-sm dark:bg-gray-700">
              <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300" for="usuarioNumero">
                Número de usuario
              </label>
              <div class="relative">
                <div class="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z" clip-rule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="usuarioNumero"
                  v-model="userForm.usuarioNumero"
                  class="py-2 pr-3 pl-10 w-full rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  placeholder="Número de usuario"
                />
              </div>
            </div>
            <div class="p-4 mt-4 bg-white rounded-md shadow-sm dark:bg-gray-700">
            <div class="flex items-center p-2 rounded-md transition-colors hover:bg-gray-50 dark:hover:bg-gray-600">
              <input
                type="checkbox"
                id="activo"
                v-model="userForm.activo"
                class="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
              />
              <label
                for="activo"
                class="block ml-3 text-sm font-medium text-gray-900 dark:text-gray-300"
              >
                Usuario activo
              </label>
            </div>
          </div>
          </div>          
          

          <div class="sticky bottom-0 pt-6 pb-2 mt-6 bg-white dark:bg-gray-800">
            <div class="flex justify-end items-center space-x-3">
              <button type="button" @click="closeModal" class="btn-secondary">
                Cancelar
              </button>
              <button type="submit" class="btn-primary">
                {{ showCreateModal ? "Crear" : "Actualizar" }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteModal"
      class="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-50"
    >
      <div class="p-6 m-4 w-full max-w-md card">
        <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Confirmar Eliminación
        </h3>
        <p class="mb-6 text-gray-600 dark:text-gray-400">
          ¿Estás seguro de que deseas eliminar al usuario "{{
            userToDelete?.name
          }}"? Esta acción no se puede deshacer.
        </p>
        <div class="flex justify-end items-center space-x-3">
          <button @click="showDeleteModal = false" class="btn-secondary">
            Cancelar
          </button>
          <button @click="deleteUser" class="btn-danger">Eliminar</button>
        </div>
      </div>
    </div>

    <!-- Usuario Modal -->
    <UsuarioModal
      v-model="showUsuarioModal"
      :usuario-id="usuarioSeleccionadoId"
      @saved="onUsuarioSaved"
    ></UsuarioModal>
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
  EyeSlashIcon,
  PencilIcon,
  TrashIcon,
  PowerIcon,
} from "@heroicons/vue/24/outline";
import { ref, onMounted, computed, reactive } from "vue";
import { useAuthStore } from "../../stores/auth";
import { useUsuariosStore } from "../../stores/usuarios";
import { usePerfilesStore } from "../../stores/perfiles";
import empleadoService from "../../services/empleadoService";
import {
  UsuarioDto,
  CreateUsuarioDto,
  UpdateUsuarioDto,
} from "../../services/usuarioService";
import { useToast } from "vue-toastification";
import { useRouter } from "vue-router";

// Stores y servicios
const authStore = useAuthStore();
const usuariosStore = useUsuariosStore();
const perfilesStore = usePerfilesStore();
const toast = useToast();
const router = useRouter();

// Reactive state
const searchQuery = ref("");
const currentPage = ref(1);
const itemsPerPage = ref(10);
const showCreateModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const userToDelete = ref(null);
const editingUser = ref(null);
const perfiles = ref([]);

// Variables para validación de campos
const passwordConfirm = ref("");
const passwordError = ref(""); // Cambiado de passwordErrors (array) a passwordError (string)
const passwordConfirmError = ref(""); // Cambiado de passwordMatchError a passwordConfirmError
const showPassword = ref(false);
const passwordStrength = ref(0);

// Variables para validación de otros campos
const nameError = ref("");
const lastNameError = ref("");
const emailError = ref("");
const phoneError = ref("");

// Computed properties para la validación de contraseña
const passwordStrengthClass = computed(() => {
  switch (passwordStrength.value) {
    case 1:
      return "bg-red-500";
    case 2:
      return "bg-yellow-500";
    case 3:
      return "bg-blue-500";
    case 4:
      return "bg-green-500";
    default:
      return "bg-gray-300";
  }
});

const passwordStrengthText = computed(() => {
  switch (passwordStrength.value) {
    case 1:
      return "Débil";
    case 2:
      return "Regular";
    case 3:
      return "Buena";
    case 4:
      return "Fuerte";
    default:
      return "";
  }
});

const passwordStrengthTextClass = computed(() => {
  switch (passwordStrength.value) {
    case 1:
      return "text-red-500";
    case 2:
      return "text-yellow-500";
    case 3:
      return "text-blue-500";
    case 4:
      return "text-green-500";
    default:
      return "text-gray-500";
  }
});

// Variables para el modal de usuario
const showUsuarioModal = ref(false);
const usuarioSeleccionadoId = ref(0);
const isLoading = ref(false);

// Lista de empleados para el select
const empleados = ref([]);
const isLoadingEmpleados = ref(false);

// Filters
const filters = reactive({
  status: "all",
  role: "all",
  department: "all",
});

// User form data
const userForm = ref({
  id: null,
  nombre: "",
  apellidos: "",
  email: "",
  movil: "",
  perfilId: "",
  objetoId: "",
  activo: true,
  password: "",
  usuarioNumero: "",
  normalizedUserName: "Usuario", // Valor por defecto como solicitado
  normalizedEmail: "",
  emailConfirmed: false,
  phoneNumberConfirmed: false,
  twoFactorEnabled: false,
  usuarioToken: "",
  usuarioContrasenaRecuperacion: "",
  empleadoId: null, // Campo opcional
  // Campos adicionales
  passwordHash: "", // Se generará a partir de password
  usuarioContrasena: "", // Se generará a partir de password
  securityStamp: "", // Se generará automáticamente
  concurrencyStamp: "", // Se generará automáticamente
  lockoutEnd: null,
  lockoutEnabled: true, // Por defecto habilitado
});

// Función para abrir el modal de usuario
function openUsuarioModal(usuario = null) {
  usuarioSeleccionadoId.value = usuario ? usuario.id : 0;
  if (usuario) {
    userForm.value = {
      id: usuario.id,
      nombre: usuario.nombre,
      apellidos: usuario.apellidos,
      email: usuario.email,
      movil: usuario.movil || "",
      perfilId: usuario.perfilId.toString(),
      objetoId: usuario.objetoId.toString(),
      activo: usuario.activo,
      password: "",
      usuarioNumero: usuario.usuarioNumero || "",
      normalizedUserName: usuario.normalizedUserName || "Usuario",
      normalizedEmail: usuario.normalizedEmail || usuario.email?.toUpperCase() || "",
      emailConfirmed: usuario.emailConfirmed || false,
      phoneNumberConfirmed: usuario.phoneNumberConfirmed || false,
      twoFactorEnabled: usuario.twoFactorEnabled || false,
      usuarioToken: usuario.usuarioToken || "",
      usuarioContrasenaRecuperacion: usuario.usuarioContrasenaRecuperacion || "",
      empleadoId: usuario.empleadoId || null,
      passwordHash: usuario.passwordHash || "",
      usuarioContrasena: usuario.usuarioContrasena || "",
      securityStamp: usuario.securityStamp || "",
      concurrencyStamp: usuario.concurrencyStamp || "",
      lockoutEnd: usuario.lockoutEnd || null,
      lockoutEnabled: usuario.lockoutEnabled !== undefined ? usuario.lockoutEnabled : true,
    };
    showEditModal.value = true;
  } else {
    userForm.value = {
      id: null,
      nombre: "",
      apellidos: "",
      email: "",
      movil: "",
      perfilId: "",
      objetoId: "",
      activo: true,
      password: "",
      usuarioNumero: "",
      normalizedUserName: "Usuario",
      normalizedEmail: "",
      emailConfirmed: false,
      phoneNumberConfirmed: false,
      twoFactorEnabled: false,
      usuarioToken: "",
      usuarioContrasenaRecuperacion: "",
      empleadoId: null,
      passwordHash: "",
      usuarioContrasena: "",
      securityStamp: "",
      concurrencyStamp: "",
      lockoutEnd: null,
      lockoutEnabled: true,
    };
    showCreateModal.value = true;
  }
}

// Función para cargar usuarios
const loadUsuarios = async () => {
  isLoading.value = true;
  try {
    await usuariosStore.fetchUsuarios();
  } catch (error) {
    console.error("Error al cargar usuarios:", error);
    toast.error("Error al cargar usuarios");
  } finally {
    isLoading.value = false;
  }
};

// Función para cargar empleados
const loadEmpleados = async () => {
  isLoadingEmpleados.value = true;
  try {
    const response = await empleadoService.getEmpleados();
    if (response && response.data) {
      empleados.value = response.data;
    }
  } catch (error) {
    console.error("Error al cargar empleados:", error);
    toast.error("Error al cargar empleados");
  } finally {
    isLoadingEmpleados.value = false;
  }
};

// Lifecycle hooks
onMounted(async () => {
  try {
    // Cargar usuarios
    await loadUsuarios();

    // Cargar perfiles
    await loadPerfiles();
    
    // Cargar empleados
    await loadEmpleados();
  } catch (error) {
    console.error("Error al cargar datos iniciales:", error);
    toast.error("Error al cargar datos iniciales");
  }
});

// Función para cargar los perfiles
const loadPerfiles = async () => {
  try {
    // Mostrar indicador de carga si es necesario
    const perfilesData = await perfilesStore.fetchAllPerfiles(true);
    perfiles.value = perfilesData;
    console.log("Perfiles cargados:", perfiles.value);
  } catch (error) {
    console.error("Error al cargar perfiles:", error);
    toast.error("Error al cargar los perfiles");
  }
};

// Función para eliminar usuario
async function deleteUsuario(id) {
  if (confirm("¿Está seguro que desea eliminar este usuario?")) {
    isLoading.value = true;
    try {
      const result = await usuariosStore.deleteUsuario(id);
      if (result) {
        toast.success("Usuario eliminado correctamente");
      }
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      toast.error("Error al eliminar el usuario");
    } finally {
      isLoading.value = false;
    }
  }
}

// Función para cambiar estado de usuario
async function toggleUsuarioStatus(id, nuevoEstado) {
  isLoading.value = true;
  try {
    // El store ya se encarga de mostrar el mensaje toast
    await usuariosStore.toggleUsuarioStatus(id, nuevoEstado);
  } catch (error) {
    console.error("Error al cambiar estado del usuario:", error);
    // Solo mostramos mensaje de error aquí si ocurre una excepción no controlada
    toast.error("Error al cambiar el estado del usuario");
  } finally {
    isLoading.value = false;
  }
}

// Función cuando se guarda un usuario desde el modal
function onUsuarioSaved() {
  // Actualizar la lista de usuarios
  loadUsuarios();
}

// Computed properties
const perfilesActivos = computed(() =>
  perfilesStore.perfiles.filter((perfil) => perfil.activo === true)
);

const filteredUsers = computed(() => {
  let filtered = usuariosStore.usuarios;

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (user) =>
        user.nombre.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
    );
  }

  // Apply status filter
  if (filters.status !== "all") {
    const isActive = filters.status === "active";
    filtered = filtered.filter((user) => user.activo === isActive);
  }

  // Apply role filter
  if (filters.role !== "all") {
    filtered = filtered.filter(
      (user) => user.perfilId.toString() === filters.role
    );
  }

  // Apply department filter
  if (filters.department !== "all") {
    filtered = filtered.filter(
      (user) => user.objetoId.toString() === filters.department
    );
  }

  return filtered;
});

const totalPages = computed(() =>
  Math.ceil(filteredUsers.value.length / itemsPerPage.value)
);

const activeUsers = computed(
  () => usuariosStore.usuarios.filter((u) => u.activo).length
);
const inactiveUsers = computed(
  () => usuariosStore.usuarios.filter((u) => !u.activo).length
);
const newUsers = computed(() => {
  const thirtyDaysAgo = new Date(Date.now() - 86400000 * 30);
  return usuariosStore.usuarios.filter((u) => {
    if (!u.fechaCreacion) return false;
    return new Date(u.fechaCreacion) > thirtyDaysAgo;
  }).length;
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

const getStatusLabel = (status: boolean) => {
  return status ? "Activo" : "Inactivo";
};

const getStatusClass = (status: boolean) => {
  return status
    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
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
  searchQuery.value = "";
};

// Función para validar la fortaleza de la contraseña
const validatePassword = () => {
  const password = userForm.value.password;
  passwordError.value = "";

  // Reiniciar la fortaleza
  passwordStrength.value = 0;

  if (!password) return;

  // Criterios de validación
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  // Calcular fortaleza
  let strength = 0;
  if (hasMinLength) strength++;
  if (hasUpperCase && hasLowerCase) strength++;
  if (hasNumbers) strength++;
  if (hasSpecial) strength++;
  
  passwordStrength.value = strength;
  
  // Validar requisitos mínimos
  if (!hasMinLength) {
    passwordError.value = "La contraseña debe tener al menos 8 caracteres";
  } else if (!(hasUpperCase && hasLowerCase && hasNumbers)) {
    passwordError.value = "La contraseña debe incluir mayúsculas, minúsculas y números";
  }
};

// Función para validar que las contraseñas coincidan
const validatePasswordConfirm = () => {
  if (!userForm.value.password || !passwordConfirm.value) {
    passwordConfirmError.value = "";
    return;
  }

  if (userForm.value.password !== passwordConfirm.value) {
    passwordConfirmError.value = "Las contraseñas no coinciden";
  } else {
    passwordConfirmError.value = "";
  }
};

// Función para validar el nombre
const validateName = () => {
  const nombre = userForm.value.nombre;
  nameError.value = "";

  if (!nombre) return;

  if (nombre.length < 2) {
    nameError.value = "El nombre debe tener al menos 2 caracteres";
  } else if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(nombre)) {
    nameError.value = "El nombre solo debe contener letras";
  }
};

// Función para validar los apellidos
const validateLastName = () => {
  const apellidos = userForm.value.apellidos;
  lastNameError.value = "";

  if (!apellidos) return;

  if (apellidos.length < 2) {
    lastNameError.value = "Los apellidos deben tener al menos 2 caracteres";
  } else if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(apellidos)) {
    lastNameError.value = "Los apellidos solo deben contener letras";
  }
};

// Función para validar el email
const validateEmail = () => {
  const email = userForm.value.email;
  emailError.value = "";

  if (!email) return;

  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  if (!emailRegex.test(email)) {
    emailError.value = "Por favor, introduce un email válido";
  }
};

// Función para validar el teléfono (10 dígitos)
const validatePhone = () => {
  // Eliminar cualquier carácter que no sea un número
  userForm.value.movil = userForm.value.movil?.replace(/[^0-9]/g, "");

  if (!userForm.value.movil) {
    phoneError.value = "";
    return;
  }

  if (userForm.value.movil.length !== 10) {
    phoneError.value = "El móvil debe tener 10 dígitos";
  } else {
    phoneError.value = "";
  }
};

const resetForm = () => {
  userForm.value = {
    id: null,
    nombre: "",
    apellidos: "",
    email: "",
    movil: "",
    perfilId: "",
    objetoId: "2", // Establecemos el valor por defecto a 2
    activo: true,
    password: "",
    usuarioNumero: "",
    normalizedUserName: "Usuario",
    normalizedEmail: "",
    emailConfirmed: false,
    phoneNumberConfirmed: false,
    twoFactorEnabled: false,
    usuarioToken: "",
    usuarioContrasenaRecuperacion: "",
    empleadoId: null,
    passwordHash: "",
    usuarioContrasena: "",
    securityStamp: "",
    concurrencyStamp: "",
    lockoutEnd: null,
    lockoutEnabled: true,
  };
  passwordConfirm.value = "";
  passwordError.value = "";
  passwordConfirmError.value = "";
  passwordStrength.value = 0;
  showPassword.value = false;
};

const closeModal = () => {
  showCreateModal.value = false;
  showEditModal.value = false;
  editingUser.value = null;
  resetForm();
};

const viewUser = (user: any) => {
  router.push(`/users/${user.id}`);
};

// Function to save user (create or update)
const saveUser = async () => {
  // Validar campos obligatorios
  if (
    !userForm.value.nombre ||
    !userForm.value.apellidos ||
    !userForm.value.email ||
    !userForm.value.perfilId
  ) {
    toast.error("Por favor complete todos los campos obligatorios");
    return;
  }

  // Ejecutar todas las validaciones
  validateName();
  validateLastName();
  validateEmail();
  validatePhone();
  if (showCreateModal || userForm.value.password) {
    validatePassword();
    validatePasswordConfirm();
  }

  // Verificar si hay errores de validación
  if (
    nameError.value ||
    lastNameError.value ||
    emailError.value ||
    phoneError.value
  ) {
    toast.error("Por favor, corrige los errores en el formulario");
    return;
  }

  // Validar que las contraseñas coincidan si se está creando un usuario o si se ha ingresado una contraseña
  if (
    (showCreateModal || userForm.value.password) &&
    passwordConfirmError.value
  ) {
    toast.error("Las contraseñas no coinciden");
    return;
  }

  // Validar fortaleza de contraseña
  if (
    (showCreateModal || userForm.value.password) &&
    passwordError.value
  ) {
    toast.error("La contraseña no cumple con los requisitos de seguridad");
    return;
  }

  // Validar que se haya seleccionado un perfil
  if (!userForm.value.perfilId) {
    toast.error("Por favor, selecciona un perfil");
    return;
  }

  try {
    // Establecer objetoId a 2 siempre
    const objetoId = 2; // Número en lugar de string

    if (showCreateModal) {
      // Crear un objeto con el tipo correcto para crear usuario
      const createData = {
        nombre: userForm.value.nombre,
        apellidos: userForm.value.apellidos,
        email: userForm.value.email,
        movil: userForm.value.movil,
        password: userForm.value.password,
        perfilId: parseInt(userForm.value.perfilId),
        objetoId: objetoId,
        activo: userForm.value.activo,
        usuarioNumero: userForm.value.usuarioNumero || "",
        normalizedUserName: userForm.value.normalizedUserName || "Usuario",
        normalizedEmail: userForm.value.email.toUpperCase(),
        emailConfirmed: userForm.value.emailConfirmed || false,
        phoneNumberConfirmed: userForm.value.phoneNumberConfirmed || false,
        twoFactorEnabled: userForm.value.twoFactorEnabled || false,
        usuarioToken: userForm.value.usuarioToken || "",
        usuarioContrasenaRecuperacion: userForm.value.usuarioContrasenaRecuperacion || "",
        empleadoId: userForm.value.empleadoId,
        // Campos que se generan a partir de la contraseña
        passwordHash: userForm.value.password, // El backend lo convertirá en hash
        usuarioContrasena: userForm.value.password, // El backend lo procesará
        // Campos que se generan automáticamente en el backend
        securityStamp: new Date().getTime().toString(), // Valor temporal, el backend lo actualizará
        concurrencyStamp: new Date().getTime().toString(), // Valor temporal, el backend lo actualizará
        lockoutEnd: null,
        lockoutEnabled: userForm.value.lockoutEnabled !== undefined ? userForm.value.lockoutEnabled : true,
      };

      await usuariosStore.createUsuario(createData);
      toast.success("Usuario creado correctamente");
    } else {
      // Crear un objeto con el tipo correcto para actualizar usuario
      const updateData = {
        id: editingUser.value.id,
        nombre: userForm.value.nombre,
        apellidos: userForm.value.apellidos,
        email: userForm.value.email,
        movil: userForm.value.movil,
        perfilId: parseInt(userForm.value.perfilId),
        objetoId: objetoId,
        activo: userForm.value.activo,
        usuarioNumero: userForm.value.usuarioNumero || "",
        normalizedUserName: userForm.value.normalizedUserName || "Usuario",
        normalizedEmail: userForm.value.email.toUpperCase(),
        emailConfirmed: userForm.value.emailConfirmed || false,
        phoneNumberConfirmed: userForm.value.phoneNumberConfirmed || false,
        twoFactorEnabled: userForm.value.twoFactorEnabled || false,
        usuarioToken: userForm.value.usuarioToken || "",
        usuarioContrasenaRecuperacion: userForm.value.usuarioContrasenaRecuperacion || "",
        empleadoId: userForm.value.empleadoId,
        // Mantener los valores existentes para estos campos si no hay contraseña nueva
        passwordHash: editingUser.value.passwordHash || "",
        usuarioContrasena: editingUser.value.usuarioContrasena || "",
        securityStamp: editingUser.value.securityStamp || new Date().getTime().toString(),
        concurrencyStamp: editingUser.value.concurrencyStamp || new Date().getTime().toString(),
        lockoutEnd: editingUser.value.lockoutEnd || null,
        lockoutEnabled: userForm.value.lockoutEnabled !== undefined ? userForm.value.lockoutEnabled : true,
      };

      // Si hay contraseña, actualizar los campos relacionados con la contraseña
      if (userForm.value.password) {
        // Actualizar todos los campos relacionados con la contraseña
        // Usar una asignación de tipo para evitar el error de TypeScript
        (updateData as any).password = userForm.value.password;
        updateData.passwordHash = userForm.value.password; // El backend lo convertirá en hash
        updateData.usuarioContrasena = userForm.value.password; // El backend lo procesará
        // Generar nuevos valores para los stamps de seguridad
        updateData.securityStamp = new Date().getTime().toString(); // El backend lo actualizará
        updateData.concurrencyStamp = new Date().getTime().toString(); // El backend lo actualizará
      }

      await usuariosStore.updateUsuario(editingUser.value.id, updateData);
      toast.success("Usuario actualizado correctamente");
    }
    closeModal();
    // Usar los parámetros correctos para fetchUsuarios o ninguno si no los necesita
    await usuariosStore.fetchUsuarios();
  } catch (error) {
    console.error("Error al guardar usuario:", error);
    toast.error(
      `Error al ${showCreateModal ? "crear" : "actualizar"} usuario: ${
        error.message || "Error desconocido"
      }`
    );
  }
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
    const index = usuariosStore.usuarios.findIndex(
      (u) => u.id === userToDelete.value.id
    );
    if (index !== -1) {
      usuariosStore.usuarios.splice(index, 1);
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
// En Nuxt 3, definePageMeta está disponible automáticamente en las páginas
// pero para evitar errores de lint, lo envolvemos en un bloque de comentario
// que el compilador de Nuxt procesará correctamente

/* @ts-ignore */
definePageMeta({
  layout: "default",
});
</script>

<style scoped>
/* Usando clases de Tailwind directamente en lugar de @apply */
.input-field {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background-color: white;
  color: #111827;
}

.dark .input-field {
  border-color: #4b5563;
  background-color: #1f2937;
  color: white;
}

.input-field:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}

.btn-primary {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: #2563eb;
  color: white;
  border-radius: 0.5rem;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background-color: #1d4ed8;
}

.btn-secondary {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: #e5e7eb;
  color: #374151;
  border-radius: 0.5rem;
  transition: background-color 0.2s;
}

.dark .btn-secondary {
  background-color: #374151;
  color: #d1d5db;
}

.btn-secondary:hover {
  background-color: #d1d5db;
}

.dark .btn-secondary:hover {
  background-color: #4b5563;
}

.btn-danger {
  padding: 0.5rem 1rem;
  background-color: #dc2626;
  color: white;
  border-radius: 0.5rem;
  transition: background-color 0.2s;
}

.btn-danger:hover {
  background-color: #b91c1c;
}

.card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.dark .card {
  background-color: #1f2937;
}
</style>
