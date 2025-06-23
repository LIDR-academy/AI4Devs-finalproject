<template>
  <aside 
    class="fixed left-0 top-0 z-40 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out"
    :class="collapsed ? 'w-16' : 'w-64'"
  >
    <!-- Logo -->
    <div class="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-700">
      <div v-if="!collapsed" class="flex items-center space-x-2">
        <div class="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
          <span class="text-white font-bold text-sm">BGA</span>
        </div>
        <span class="text-xl font-bold text-gray-900 dark:text-white">Business</span>
      </div>
      <div v-else class="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
        <span class="text-white font-bold text-sm">BGA</span>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="mt-6 px-3">
      <div class="space-y-1">
        <!-- Dashboard -->
        <NuxtLink
          to="/"
          class="sidebar-item"
          :class="{ 'active': $route.path === '/' }"
        >
          <HomeIcon class="w-5 h-5 mr-3" />
          <span v-if="!collapsed" class="font-medium">Dashboard</span>
        </NuxtLink>

        <!-- Proyectos -->
        <div>
          <button 
            @click="toggleSection('projects')"
            class="sidebar-item w-full justify-between"
          >
            <div class="flex items-center">
              <FolderIcon class="w-5 h-5 mr-3" />
              <span v-if="!collapsed" class="font-medium">Proyectos</span>
            </div>
            <ChevronDownIcon 
              v-if="!collapsed"
              class="w-4 h-4 transition-transform duration-200"
              :class="{ 'rotate-180': expandedSections.projects }"
            />
          </button>
          
          <div 
            v-if="!collapsed && expandedSections.projects"
            class="ml-8 mt-1 space-y-1"
          >
            <NuxtLink
              to="/projects"
              class="sidebar-item text-sm"
              :class="{ 'active': $route.path === '/projects' }"
            >
              Lista de Proyectos
            </NuxtLink>
            <NuxtLink
              to="/projects/create"
              class="sidebar-item text-sm"
              :class="{ 'active': $route.path === '/projects/create' }"
            >
              Nuevo Proyecto
            </NuxtLink>
            <NuxtLink
              to="/projects/gantt"
              class="sidebar-item text-sm"
              :class="{ 'active': $route.path === '/projects/gantt' }"
            >
              Vista Gantt
            </NuxtLink>
          </div>
        </div>

        <!-- Tareas -->
        <NuxtLink
          to="/tasks"
          class="sidebar-item"
          :class="{ 'active': $route.path.startsWith('/tasks') }"
        >
          <SquaresPlusIcon class="w-5 h-5 mr-3" />
          <span v-if="!collapsed" class="font-medium">Tareas</span>
        </NuxtLink>

        <!-- KPIs -->
        <NuxtLink
          to="/kpis"
          class="sidebar-item"
          :class="{ 'active': $route.path.startsWith('/kpis') }"
        >
          <ChartBarIcon class="w-5 h-5 mr-3" />
          <span v-if="!collapsed" class="font-medium">KPIs</span>
        </NuxtLink>

        <!-- Informes -->
        <div>
          <button 
            @click="toggleSection('reports')"
            class="sidebar-item w-full justify-between"
          >
            <div class="flex items-center">
              <DocumentTextIcon class="w-5 h-5 mr-3" />
              <span v-if="!collapsed" class="font-medium">Informes</span>
            </div>
            <ChevronDownIcon 
              v-if="!collapsed"
              class="w-4 h-4 transition-transform duration-200"
              :class="{ 'rotate-180': expandedSections.reports }"
            />
          </button>
          
          <div 
            v-if="!collapsed && expandedSections.reports"
            class="ml-8 mt-1 space-y-1"
          >
            <NuxtLink
              to="/reports/weekly"
              class="sidebar-item text-sm"
              :class="{ 'active': $route.path === '/reports/weekly' }"
            >
              Informes Semanales
            </NuxtLink>
            <NuxtLink
              to="/reports/financial"
              class="sidebar-item text-sm"
              :class="{ 'active': $route.path === '/reports/financial' }"
            >
              Reportes Financieros
            </NuxtLink>
          </div>
        </div>

        <!-- Finanzas -->
        <div>
          <button 
            @click="toggleSection('finance')"
            class="sidebar-item w-full justify-between"
          >
            <div class="flex items-center">
              <CurrencyDollarIcon class="w-5 h-5 mr-3" />
              <span v-if="!collapsed" class="font-medium">Finanzas</span>
            </div>
            <ChevronDownIcon 
              v-if="!collapsed"
              class="w-4 h-4 transition-transform duration-200"
              :class="{ 'rotate-180': expandedSections.finance }"
            />
          </button>
          
          <div 
            v-if="!collapsed && expandedSections.finance"
            class="ml-8 mt-1 space-y-1"
          >
            <NuxtLink
              to="/finance/expenses"
              class="sidebar-item text-sm"
              :class="{ 'active': $route.path === '/finance/expenses' }"
            >
              Gastos
            </NuxtLink>
            <NuxtLink
              to="/finance/viatics"
              class="sidebar-item text-sm"
              :class="{ 'active': $route.path === '/finance/viatics' }"
            >
              Viáticos
            </NuxtLink>
            <NuxtLink
              to="/finance/budget"
              class="sidebar-item text-sm"
              :class="{ 'active': $route.path === '/finance/budget' }"
            >
              Presupuesto
            </NuxtLink>
          </div>
        </div>

        <!-- Catálogos -->
        <div>
          <button 
            @click="toggleSection('catalogs')"
            class="sidebar-item w-full justify-between"
          >
            <div class="flex items-center">
              <TagIcon class="w-5 h-5 mr-3" />
              <span v-if="!collapsed" class="font-medium">Catálogos</span>
            </div>
            <ChevronDownIcon 
              v-if="!collapsed"
              class="w-4 h-4 transition-transform duration-200"
              :class="{ 'rotate-180': expandedSections.catalogs }"
            />
          </button>
          
          <div 
            v-if="!collapsed && expandedSections.catalogs"
            class="ml-8 mt-1 space-y-1"
          >
            <NuxtLink
              to="/catalogs/clients"
              class="sidebar-item text-sm"
              :class="{ 'active': $route.path === '/catalogs/clients' }"
            >
              <UserGroupIcon class="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
              Clientes
            </NuxtLink>
            <NuxtLink
              to="/catalogs/providers"
              class="sidebar-item text-sm"
              :class="{ 'active': $route.path === '/catalogs/providers' }"
            >
              <BuildingOfficeIcon class="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
              Proveedores
            </NuxtLink>
            <NuxtLink
              to="/catalogs/products"
              class="sidebar-item text-sm"
              :class="{ 'active': $route.path === '/catalogs/products' }"
            >
              <ShoppingBagIcon class="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
              Productos
            </NuxtLink>
            <NuxtLink
              to="/catalogs/services"
              class="sidebar-item text-sm"
              :class="{ 'active': $route.path === '/catalogs/services' }"
            >
              <WrenchScrewdriverIcon class="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
              Servicios
            </NuxtLink>
            <NuxtLink
              to="/catalogs/categories"
              class="sidebar-item text-sm"
              :class="{ 'active': $route.path === '/catalogs/categories' }"
            >
              <TagIcon class="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
              Categorías
            </NuxtLink>
            <NuxtLink
              to="/catalogs/document-types"
              class="sidebar-item text-sm"
              :class="{ 'active': $route.path === '/catalogs/document-types' }"
            >
              <DocumentIcon class="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
              Tipos de Documentos
            </NuxtLink>
          </div>
        </div>

        <!-- Documentos -->
        <NuxtLink
          to="/documents"
          class="sidebar-item"
          :class="{ 'active': $route.path.startsWith('/documents') }"
        >
          <FolderOpenIcon class="w-5 h-5 mr-3" />
          <span v-if="!collapsed" class="font-medium">Documentos</span>
        </NuxtLink>

        <!-- Usuarios -->
        <NuxtLink
          v-if="authStore.isAdmin || authStore.isManager"
          to="/users"
          class="sidebar-item"
          :class="{ 'active': $route.path.startsWith('/users') }"
        >
          <UsersIcon class="w-5 h-5 mr-3" />
          <span v-if="!collapsed" class="font-medium">Usuarios</span>
        </NuxtLink>
      </div>
    </nav>

    <!-- Bottom Actions -->
    <div class="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-200 dark:border-gray-700">
      <div class="space-y-2">
        <!-- Settings -->
        <NuxtLink
          to="/settings"
          class="sidebar-item"
          :class="{ 'active': $route.path === '/settings' }"
        >
          <CogIcon class="w-5 h-5 mr-3" />
          <span v-if="!collapsed" class="font-medium">Configuración</span>
        </NuxtLink>

        <!-- Toggle Sidebar -->
        <button
          @click="$emit('toggle')"
          class="sidebar-item w-full"
        >
          <Bars3Icon class="w-5 h-5 mr-3" />
          <span v-if="!collapsed" class="font-medium">Contraer</span>
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useAuthStore } from '../stores/auth'
import {
  HomeIcon,
  FolderIcon,
  SquaresPlusIcon,
  ChartBarIcon,
  DocumentTextIcon,
  DocumentIcon,
  CurrencyDollarIcon,
  FolderOpenIcon,
  UsersIcon,
  CogIcon,
  Bars3Icon,
  ChevronDownIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  ShoppingBagIcon,
  WrenchScrewdriverIcon,
  TagIcon
} from '@heroicons/vue/24/outline'

interface Props {
  collapsed: boolean
}

defineProps<Props>()
defineEmits<{
  toggle: []
}>()

const authStore = useAuthStore()

// Expanded sections
const expandedSections = reactive({
  projects: true,
  reports: false,
  finance: false,
  catalogs: false
})

const toggleSection = (section: keyof typeof expandedSections) => {
  expandedSections[section] = !expandedSections[section]
}
</script>
