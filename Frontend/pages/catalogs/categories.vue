<template>
  <div class="container mx-auto px-4 py-8">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Catálogo de Categorías
        </h1>
        <button
          class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center"
        >
          <PlusIcon class="w-5 h-5 mr-2" />
          Nueva Categoría
        </button>
      </div>

      <!-- Filtros -->
      <div class="mb-6 flex flex-wrap gap-4">
        <div class="flex-1 min-w-[200px]">
          <div class="relative">
            <MagnifyingGlassIcon
              class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar categorías..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
        <div class="w-full md:w-auto">
          <select
            v-model="typeFilter"
            class="w-full md:w-48 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="">Todos los tipos</option>
            <option value="producto">Producto</option>
            <option value="servicio">Servicio</option>
            <option value="cliente">Cliente</option>
            <option value="proveedor">Proveedor</option>
          </select>
        </div>
        <div class="w-full md:w-auto">
          <select
            v-model="statusFilter"
            class="w-full md:w-48 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="">Estado</option>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
          </select>
        </div>
      </div>

      <!-- Vista de categorías -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="category in filteredCategories" 
          :key="category.id"
          class="bg-white dark:bg-gray-700 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-shadow"
        >
          <div class="p-5">
            <div class="flex justify-between items-start">
              <div class="flex items-center">
                <div class="h-10 w-10 rounded-lg flex items-center justify-center" :class="getCategoryColorClass(category.type)">
                  <component :is="getCategoryIcon(category.type)" class="w-6 h-6 text-white" />
                </div>
                <div class="ml-3">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                    {{ category.name }}
                  </h3>
                  <p class="text-sm text-gray-600 dark:text-gray-300">
                    {{ category.type }}
                  </p>
                </div>
              </div>
              <span 
                class="px-2 py-1 text-xs font-semibold rounded-full"
                :class="category.active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'"
              >
                {{ category.active ? 'Activo' : 'Inactivo' }}
              </span>
            </div>
            
            <p class="mt-3 text-sm text-gray-600 dark:text-gray-400">
              {{ category.description }}
            </p>
            
            <div class="mt-4 flex items-center justify-between">
              <div class="text-sm text-gray-500 dark:text-gray-400">
                <span class="font-medium">{{ category.itemCount }}</span> elementos
              </div>
              <div class="flex space-x-2">
                <button class="p-1 text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300">
                  <PencilIcon class="w-5 h-5" />
                </button>
                <button class="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                  <TrashIcon class="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Mensaje si no hay categorías -->
      <div 
        v-if="filteredCategories.length === 0" 
        class="text-center py-12 text-gray-500 dark:text-gray-400"
      >
        No se encontraron categorías que coincidan con los filtros seleccionados.
      </div>

      <!-- Paginación -->
      <div class="flex justify-between items-center mt-6">
        <div class="text-sm text-gray-700 dark:text-gray-300">
          Mostrando <span class="font-medium">{{ filteredCategories.length }}</span> de <span class="font-medium">{{ categories.length }}</span> categorías
        </div>
        <div class="flex space-x-2">
          <button class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50" disabled>
            Anterior
          </button>
          <button class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
            Siguiente
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { 
  MagnifyingGlassIcon, 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  WrenchScrewdriverIcon
} from '@heroicons/vue/24/outline';

// Estado reactivo
const searchQuery = ref('');
const typeFilter = ref('');
const statusFilter = ref('');

// Datos de ejemplo
const categories = ref([
  {
    id: 'CAT-001',
    name: 'Hardware',
    type: 'Producto',
    description: 'Equipos y componentes físicos de computación',
    itemCount: 24,
    active: true
  },
  {
    id: 'CAT-002',
    name: 'Software',
    type: 'Producto',
    description: 'Programas y aplicaciones informáticas',
    itemCount: 18,
    active: true
  },
  {
    id: 'CAT-003',
    name: 'Consultoría',
    type: 'Servicio',
    description: 'Servicios de asesoramiento profesional',
    itemCount: 8,
    active: true
  },
  {
    id: 'CAT-004',
    name: 'Empresas',
    type: 'Cliente',
    description: 'Clientes corporativos y empresariales',
    itemCount: 42,
    active: true
  },
  {
    id: 'CAT-005',
    name: 'Gobierno',
    type: 'Cliente',
    description: 'Entidades gubernamentales y públicas',
    itemCount: 15,
    active: true
  },
  {
    id: 'CAT-006',
    name: 'Tecnología',
    type: 'Proveedor',
    description: 'Proveedores de equipos y soluciones tecnológicas',
    itemCount: 31,
    active: true
  },
  {
    id: 'CAT-007',
    name: 'Capacitación',
    type: 'Servicio',
    description: 'Servicios de formación y entrenamiento',
    itemCount: 12,
    active: false
  },
  {
    id: 'CAT-008',
    name: 'Oficina',
    type: 'Producto',
    description: 'Equipamiento y suministros para oficina',
    itemCount: 27,
    active: true
  },
  {
    id: 'CAT-009',
    name: 'Logística',
    type: 'Proveedor',
    description: 'Proveedores de servicios logísticos y transporte',
    itemCount: 9,
    active: false
  }
]);

// Categorías filtradas
const filteredCategories = computed(() => {
  return categories.value.filter(category => {
    // Filtro de búsqueda
    const matchesSearch = searchQuery.value === '' || 
      category.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      category.description.toLowerCase().includes(searchQuery.value.toLowerCase());
    
    // Filtro de tipo
    const matchesType = typeFilter.value === '' || 
      category.type.toLowerCase() === typeFilter.value.toLowerCase();
    
    // Filtro de estado
    const matchesStatus = statusFilter.value === '' || 
      (statusFilter.value === 'active' && category.active) ||
      (statusFilter.value === 'inactive' && !category.active);
    
    return matchesSearch && matchesType && matchesStatus;
  });
});

// Obtener icono según el tipo de categoría
const getCategoryIcon = (type) => {
  const icons = {
    'Producto': ShoppingBagIcon,
    'Servicio': WrenchScrewdriverIcon,
    'Cliente': UserGroupIcon,
    'Proveedor': BuildingOfficeIcon
  };
  
  return icons[type] || ShoppingBagIcon;
};

// Obtener clase de color según el tipo de categoría
const getCategoryColorClass = (type) => {
  const colors = {
    'Producto': 'bg-blue-600',
    'Servicio': 'bg-purple-600',
    'Cliente': 'bg-green-600',
    'Proveedor': 'bg-orange-600'
  };
  
  return colors[type] || 'bg-gray-600';
};
</script>
