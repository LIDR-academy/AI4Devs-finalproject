<template>
  <div class="container mx-auto px-4 py-8">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Catálogo de Servicios
        </h1>
        <button
          class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center"
        >
          <PlusIcon class="w-5 h-5 mr-2" />
          Nuevo Servicio
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
              placeholder="Buscar servicios..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
        <div class="w-full md:w-auto">
          <select
            v-model="categoryFilter"
            class="w-full md:w-48 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="">Todas las categorías</option>
            <option value="consultoría">Consultoría</option>
            <option value="desarrollo">Desarrollo</option>
            <option value="soporte">Soporte</option>
            <option value="capacitación">Capacitación</option>
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

      <!-- Tabla de servicios -->
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                ID
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Nombre
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Categoría
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Precio
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Duración
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Estado
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="service in filteredServices" :key="service.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ service.id }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-300">
                    <component :is="getCategoryIcon(service.category)" class="w-5 h-5" />
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ service.name }}
                    </div>
                    <div class="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                      {{ service.description }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ service.category }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                ${{ service.price.toFixed(2) }}
                <span class="text-xs text-gray-500 dark:text-gray-400">
                  {{ service.priceType }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ service.duration }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                  :class="service.active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'"
                >
                  {{ service.active ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button class="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 mr-3">
                  Editar
                </button>
                <button class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                  Eliminar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mensaje si no hay servicios -->
      <div 
        v-if="filteredServices.length === 0" 
        class="text-center py-12 text-gray-500 dark:text-gray-400"
      >
        No se encontraron servicios que coincidan con los filtros seleccionados.
      </div>

      <!-- Paginación -->
      <div class="flex justify-between items-center mt-6">
        <div class="text-sm text-gray-700 dark:text-gray-300">
          Mostrando <span class="font-medium">{{ filteredServices.length }}</span> de <span class="font-medium">{{ services.length }}</span> servicios
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
  UserIcon,
  DocumentIcon,
  CogIcon,
  InformationCircleIcon
} from '@heroicons/vue/24/outline';

// Estado reactivo
const searchQuery = ref('');
const categoryFilter = ref('');
const statusFilter = ref('');

// Datos de ejemplo
const services = ref([
  {
    id: 'SRV-001',
    name: 'Consultoría Estratégica',
    description: 'Asesoramiento para la planificación estratégica y toma de decisiones empresariales',
    category: 'Consultoría',
    price: 150.00,
    priceType: '/hora',
    duration: 'Variable',
    active: true
  },
  {
    id: 'SRV-002',
    name: 'Desarrollo Web Personalizado',
    description: 'Creación de sitios web y aplicaciones web a medida según requerimientos del cliente',
    category: 'Desarrollo',
    price: 5000.00,
    priceType: '/proyecto',
    duration: '4-8 semanas',
    active: true
  },
  {
    id: 'SRV-003',
    name: 'Soporte Técnico 24/7',
    description: 'Servicio de soporte técnico disponible las 24 horas para resolver incidencias',
    category: 'Soporte',
    price: 500.00,
    priceType: '/mes',
    duration: 'Contrato anual',
    active: true
  },
  {
    id: 'SRV-004',
    name: 'Capacitación en Herramientas Digitales',
    description: 'Formación para equipos en el uso de herramientas digitales y software empresarial',
    category: 'Capacitación',
    price: 1200.00,
    priceType: '/curso',
    duration: '20 horas',
    active: true
  },
  {
    id: 'SRV-005',
    name: 'Auditoría de Sistemas',
    description: 'Evaluación completa de sistemas informáticos y procesos para identificar mejoras',
    category: 'Consultoría',
    price: 3500.00,
    priceType: '/auditoría',
    duration: '2-3 semanas',
    active: false
  },
  {
    id: 'SRV-006',
    name: 'Desarrollo de Aplicaciones Móviles',
    description: 'Creación de aplicaciones nativas para iOS y Android',
    category: 'Desarrollo',
    price: 8000.00,
    priceType: '/proyecto',
    duration: '8-12 semanas',
    active: true
  },
  {
    id: 'SRV-007',
    name: 'Mantenimiento Preventivo',
    description: 'Servicio periódico para prevenir fallos en equipos y sistemas',
    category: 'Soporte',
    price: 300.00,
    priceType: '/visita',
    duration: 'Trimestral',
    active: true
  }
]);

// Servicios filtrados
const filteredServices = computed(() => {
  return services.value.filter(service => {
    // Filtro de búsqueda
    const matchesSearch = searchQuery.value === '' || 
      service.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.value.toLowerCase());
    
    // Filtro de categoría
    const matchesCategory = categoryFilter.value === '' || 
      service.category.toLowerCase() === categoryFilter.value.toLowerCase();
    
    // Filtro de estado
    const matchesStatus = statusFilter.value === '' || 
      (statusFilter.value === 'active' && service.active) ||
      (statusFilter.value === 'inactive' && !service.active);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });
});

// Obtener icono según la categoría
const getCategoryIcon = (category) => {
  const icons = {
    'Consultoría': UserIcon,
    'Desarrollo': DocumentIcon,
    'Soporte': CogIcon,
    'Capacitación': InformationCircleIcon
  };
  
  return icons[category] || DocumentIcon;
};
</script>
