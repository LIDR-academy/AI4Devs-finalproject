<template>
  <aside
    class="fixed top-0 left-0 z-40 h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out dark:bg-gray-800 dark:border-gray-700"
    :class="collapsed ? 'w-16' : 'w-64'"
  >
    <!-- Logo -->
    <div
      class="flex justify-center items-center h-16 border-b border-gray-200 dark:border-gray-700"
    >
      <div v-if="!collapsed" class="flex items-center space-x-2">
        <div
          class="flex justify-center items-center w-8 h-8 bg-gradient-to-br rounded-lg from-primary-500 to-primary-600"
        >
          <span class="text-sm font-bold text-white">BGA</span>
        </div>
        <span class="text-xl font-bold text-gray-900 dark:text-white"
          >Business</span
        >
      </div>
      <div
        v-else
        class="flex justify-center items-center w-8 h-8 bg-gradient-to-br rounded-lg from-primary-500 to-primary-600"
      >
        <span class="text-sm font-bold text-white">BGA</span>
      </div>
    </div>

    <!-- Navigation -->
    <nav
      class="overflow-y-auto px-3 mt-4"
      :style="`max-height: calc(100vh - ${collapsed ? 120 : 180}px);`"
    >
      <div class="pb-4 space-y-2">
        <!-- Dashboard -->
        <NuxtLink
          to="/"
          class="flex items-center sidebar-item"
          :class="{ active: route && route.path === '/' }"
        >
          <HomeIcon class="flex-shrink-0 mr-3 w-5 h-5" />
          <span v-if="!collapsed" class="font-medium">Dashboard</span>
        </NuxtLink>

        <!-- Separador: Gestión de Proyectos -->
        <div class="py-2">
          <div class="flex items-center">
            <div class="flex-grow mr-2 h-px bg-gray-200 dark:bg-gray-700"></div>
            <span
              v-if="!collapsed"
              class="text-xs font-medium text-gray-500 dark:text-gray-400"
              >GESTIÓN</span
            >
            <div
              v-if="!collapsed"
              class="flex-grow ml-2 h-px bg-gray-200 dark:bg-gray-700"
            ></div>
          </div>
        </div>

        <!-- Proyectos -->
        <div>
          <button
            @click="toggleSection('projects')"
            class="flex justify-between items-center w-full sidebar-item"
          >
            <div class="flex items-center">
              <FolderIcon class="flex-shrink-0 mr-3 w-5 h-5" />
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
            class="mt-1 ml-8 space-y-1"
          >
            <NuxtLink
              to="/projects"
              class="text-sm sidebar-item"
              :class="{ active: route && route.path === '/projects' }"
            >
              Lista de Proyectos
            </NuxtLink>
            <NuxtLink
              to="/projects/create"
              class="text-sm sidebar-item"
              :class="{ active: route && route.path === '/projects/create' }"
            >
              Nuevo Proyecto
            </NuxtLink>
            <NuxtLink
              to="/projects/gantt"
              class="text-sm sidebar-item"
              :class="{ active: route && route.path === '/projects/gantt' }"
            >
              Vista Gantt
            </NuxtLink>
          </div>
        </div>

        <!-- Tareas -->
        <NuxtLink
          to="/tasks"
          class="flex items-center sidebar-item"
          :class="{ active: route && route.path && route.path.startsWith('/tasks') }"
        >
          <SquaresPlusIcon class="flex-shrink-0 mr-3 w-5 h-5" />
          <span v-if="!collapsed" class="font-medium">Tareas</span>
        </NuxtLink>

        <!-- KPIs -->
        <NuxtLink
          to="/kpis"
          class="flex items-center sidebar-item"
          :class="{ active: route && route.path && route.path.startsWith('/kpis') }"
        >
          <ChartBarIcon class="flex-shrink-0 mr-3 w-5 h-5" />
          <span v-if="!collapsed" class="font-medium">KPIs</span>
        </NuxtLink>

        <!-- Separador: Reportes y Finanzas -->
        <div class="py-2">
          <div class="flex items-center">
            <div class="flex-grow mr-2 h-px bg-gray-200 dark:bg-gray-700"></div>
            <span
              v-if="!collapsed"
              class="text-xs font-medium text-gray-500 dark:text-gray-400"
              >REPORTES</span
            >
            <div
              v-if="!collapsed"
              class="flex-grow ml-2 h-px bg-gray-200 dark:bg-gray-700"
            ></div>
          </div>
        </div>

        <!-- Informes -->
        <div>
          <button
            @click="toggleSection('reports')"
            class="flex justify-between items-center w-full sidebar-item"
          >
            <div class="flex items-center">
              <DocumentTextIcon class="flex-shrink-0 mr-3 w-5 h-5" />
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
            class="mt-1 ml-8 space-y-1"
          >
            <NuxtLink
              to="/reports/weekly"
              class="text-sm sidebar-item"
              :class="{ active: route && route.path === '/reports/weekly' }"
            >
              Informes Semanales
            </NuxtLink>
            <NuxtLink
              to="/reports/financial"
              class="text-sm sidebar-item"
              :class="{ active: route && route.path === '/reports/financial' }"
            >
              Reportes Financieros
            </NuxtLink>
          </div>
        </div>

        <!-- Finanzas -->
        <div>
          <button
            @click="toggleSection('finance')"
            class="flex justify-between items-center w-full sidebar-item"
          >
            <div class="flex items-center">
              <CurrencyDollarIcon class="flex-shrink-0 mr-3 w-5 h-5" />
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
            class="mt-1 ml-8 space-y-1"
          >
            <NuxtLink
              to="/finance/expenses"
              class="text-sm sidebar-item"
              :class="{ active: route && route.path === '/finance/expenses' }"
            >
              Gastos
            </NuxtLink>
            <NuxtLink
              to="/finance/viatics"
              class="text-sm sidebar-item"
              :class="{ active: $route.path === '/finance/viatics' }"
            >
              Viáticos
            </NuxtLink>
            <NuxtLink
              to="/finance/budget"
              class="text-sm sidebar-item"
              :class="{ active: route && route.path === '/finance/budget' }"
            >
              Presupuesto
            </NuxtLink>
          </div>
        </div>

        <!-- Separador: Catálogos -->
        <div class="py-2">
          <div class="flex items-center">
            <div class="flex-grow mr-2 h-px bg-gray-200 dark:bg-gray-700"></div>
            <span
              v-if="!collapsed"
              class="text-xs font-medium text-gray-500 dark:text-gray-400"
              >CATÁLOGOS</span
            >
            <div
              v-if="!collapsed"
              class="flex-grow ml-2 h-px bg-gray-200 dark:bg-gray-700"
            ></div>
          </div>
        </div>

        <!-- Catálogos -->
        <div>
          <button
            @click="toggleSection('catalogs')"
            class="flex justify-between items-center w-full sidebar-item"
          >
            <div class="flex items-center">
              <TagIcon class="flex-shrink-0 mr-3 w-5 h-5" />
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
            class="pb-2 mt-1 ml-8 space-y-1 sidebar-submenu"
            style="max-height: 300px; overflow-y: auto"
          >
            <!-- Grupo: Entidades -->
            <div class="mb-3">
              <div
                class="px-1 mb-1 border-b border-gray-100 dark:border-gray-700"
              >
                <span
                  class="text-xs font-semibold text-gray-500 dark:text-gray-400"
                  >Entidades</span
                >
              </div>
              <NuxtLink
                to="/catalogs/clients"
                class="flex items-center text-sm sidebar-item"
                :class="{ active: route && route.path === '/catalogs/clients' }"
              >
                <UserGroupIcon
                  class="mr-2 w-4 h-4 text-gray-500 dark:text-gray-400"
                />
                Clientes
              </NuxtLink>
              <NuxtLink
                to="/catalogs/companies"
                class="flex items-center text-sm sidebar-item"
                :class="{ active: route && route.path === '/catalogs/companies' }"
              >
                <BuildingOfficeIcon
                  class="mr-2 w-4 h-4 text-gray-500 dark:text-gray-400"
                />
                Empresas
              </NuxtLink>
              <NuxtLink
                to="/catalogs/departments"
                class="flex items-center text-sm sidebar-item"
                :class="{ active: route && route.path === '/catalogs/departments' }"
              >
                <BuildingOffice2Icon
                  class="mr-2 w-4 h-4 text-gray-500 dark:text-gray-400"
                />
                Departamentos
              </NuxtLink>
              <NuxtLink
                to="/catalogs/puestos"
                class="flex items-center text-sm sidebar-item"
                :class="{ active: route && route.path === '/catalogs/puestos' }"
              >
                <UserGroupIcon
                  class="mr-2 w-4 h-4 text-gray-500 dark:text-gray-400"
                />
                Puestos
              </NuxtLink>
            </div>

            <!-- Grupo: Tipos -->
            <div class="mb-3">
              <div
                class="px-1 mb-1 border-b border-gray-100 dark:border-gray-700"
              >
                <span
                  class="text-xs font-semibold text-gray-500 dark:text-gray-400"
                  >Tipos</span
                >
              </div>
              <NuxtLink
                to="/catalogs/document-types"
                class="flex items-center text-sm sidebar-item"
                :class="{ active: route && route.path === '/catalogs/document-types' }"
              >
                <DocumentIcon
                  class="mr-2 w-4 h-4 text-gray-500 dark:text-gray-400"
                />
                Documentos
              </NuxtLink>
              <NuxtLink
                to="/catalogs/tipos-kpi"
                class="flex items-center text-sm sidebar-item"
                :class="{ active: route && route.path === '/catalogs/tipos-kpi' }"
              >
                <ChartBarIcon
                  class="mr-2 w-4 h-4 text-gray-500 dark:text-gray-400"
                />
                KPI
              </NuxtLink>
              <NuxtLink
                to="/catalogs/tipos-movimiento-viatico"
                class="flex items-center text-sm sidebar-item"
                :class="{ active: route && route.path === '/catalogs/tipos-movimiento-viatico' }"
              >
                <CurrencyDollarIcon
                  class="mr-2 w-4 h-4 text-gray-500 dark:text-gray-400"
                />
                Movimiento de Viático
              </NuxtLink>
              <NuxtLink
                to="/catalogs/tipos-proyecto"
                class="flex items-center text-sm sidebar-item"
                :class="{ active: route && route.path === '/catalogs/tipos-proyecto' }"
              >
                <FolderIcon
                  class="mr-2 w-4 h-4 text-gray-500 dark:text-gray-400"
                />
                Proyecto
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Separador: Sistema -->
        <div class="py-2">
          <div class="flex items-center">
            <div class="flex-grow mr-2 h-px bg-gray-200 dark:bg-gray-700"></div>
            <span
              v-if="!collapsed"
              class="text-xs font-semibold text-gray-500 dark:text-gray-400"
              >SISTEMA</span
            >
            <div
              v-if="!collapsed"
              class="flex-grow ml-2 h-px bg-gray-200 dark:bg-gray-700"
            ></div>
          </div>
        </div>

        <!-- Documentos y Usuarios -->
        <div class="space-y-2">
          <NuxtLink
            to="/documents"
            class="flex items-center sidebar-item"
            :class="{ active: route && route.path && route.path.startsWith('/documents') }"
          >
            <FolderOpenIcon class="flex-shrink-0 mr-3 w-5 h-5" />
            <span v-if="!collapsed" class="font-medium">Documentos</span>
          </NuxtLink>

          <!-- Usuarios -->
          <NuxtLink
            v-if="authStore.isAdmin || authStore.isManager"
            to="/users"
            class="flex items-center sidebar-item"
            :class="{ active: route && route.path && route.path.startsWith('/users') }"
          >
            <UsersIcon class="flex-shrink-0 mr-3 w-5 h-5" />
            <span v-if="!collapsed" class="font-medium">Usuarios</span>
          </NuxtLink>
        </div>
      </div>
    </nav>

    <!-- Bottom Actions -->
    <div
      class="absolute right-0 bottom-0 left-0 p-3 border-t border-gray-200 dark:border-gray-700"
    >
      <div class="space-y-2">
        <!-- Separador: Configuración -->
        <div class="py-1">
          <div class="flex items-center">
            <div class="flex-grow mr-2 h-px bg-gray-200 dark:bg-gray-700"></div>
            <span
              v-if="!collapsed"
              class="text-xs font-semibold text-gray-500 dark:text-gray-400"
              >CONFIGURACIÓN</span
            >
            <div
              v-if="!collapsed"
              class="flex-grow ml-2 h-px bg-gray-200 dark:bg-gray-700"
            ></div>
          </div>
        </div>

        <!-- Settings -->
        <NuxtLink
          to="/settings"
          class="flex items-center sidebar-item"
          :class="{ active: route && route.path === '/settings' }"
        >
          <CogIcon class="flex-shrink-0 mr-3 w-5 h-5" />
          <span v-if="!collapsed" class="font-medium">Configuración</span>
        </NuxtLink>

        <!-- Toggle Sidebar -->
        <button
          @click="$emit('toggle')"
          class="flex items-center pt-2 mt-2 w-full border-t border-gray-100 sidebar-item dark:border-gray-700"
        >
          <Bars3Icon
            class="flex-shrink-0 mr-3 w-5 h-5 text-gray-600 dark:text-gray-300"
          />
          <span v-if="!collapsed" class="font-medium">{{
            collapsed ? "Expandir" : "Contraer"
          }}</span>
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { useAuthStore } from "../stores/auth";
import { useRoute } from "vue-router";
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
  BuildingOffice2Icon,
  ShoppingBagIcon,
  WrenchScrewdriverIcon,
  TagIcon,
} from "@heroicons/vue/24/outline";

interface Props {
  collapsed: boolean;
}

defineProps<Props>();
defineEmits<{
  toggle: [];
}>();

const authStore = useAuthStore();
const route = useRoute();

// Expanded sections
const expandedSections = reactive({
  projects: false,
  reports: false,
  finance: false,
  catalogs: false,
});

const toggleSection = (section: keyof typeof expandedSections) => {
  expandedSections[section] = !expandedSections[section];
};
</script>
