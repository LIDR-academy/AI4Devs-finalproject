<template>
  <div class="container mx-auto px-4 py-8">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Catálogo de Productos
        </h1>
        <button
          class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center"
        >
          <PlusIcon class="w-5 h-5 mr-2" />
          Nuevo Producto
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
              placeholder="Buscar productos..."
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
            <option value="hardware">Hardware</option>
            <option value="software">Software</option>
            <option value="office">Oficina</option>
            <option value="electronics">Electrónica</option>
          </select>
        </div>
        <div class="w-full md:w-auto">
          <select
            v-model="stockFilter"
            class="w-full md:w-48 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="">Estado de inventario</option>
            <option value="in_stock">En stock</option>
            <option value="low_stock">Stock bajo</option>
            <option value="out_of_stock">Sin stock</option>
          </select>
        </div>
      </div>

      <!-- Vista de productos -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div 
          v-for="product in filteredProducts" 
          :key="product.id"
          class="bg-white dark:bg-gray-700 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-shadow"
        >
          <div class="h-48 bg-gray-200 dark:bg-gray-600 relative">
            <img 
              :src="product.image" 
              :alt="product.name"
              class="w-full h-full object-cover"
            />
            <div 
              v-if="product.stock <= 0" 
              class="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded"
            >
              Sin stock
            </div>
            <div 
              v-else-if="product.stock < 10" 
              class="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded"
            >
              Stock bajo
            </div>
          </div>
          <div class="p-4">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  {{ product.name }}
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-300">
                  {{ product.category }}
                </p>
              </div>
              <span class="text-lg font-bold text-primary-600 dark:text-primary-400">
                ${{ product.price.toFixed(2) }}
              </span>
            </div>
            <p class="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {{ product.description }}
            </p>
            <div class="mt-4 flex justify-between items-center">
              <span class="text-sm text-gray-600 dark:text-gray-400">
                Stock: {{ product.stock }}
              </span>
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

      <!-- Mensaje si no hay productos -->
      <div 
        v-if="filteredProducts.length === 0" 
        class="text-center py-12 text-gray-500 dark:text-gray-400"
      >
        No se encontraron productos que coincidan con los filtros seleccionados.
      </div>

      <!-- Paginación -->
      <div class="flex justify-between items-center mt-6">
        <div class="text-sm text-gray-700 dark:text-gray-300">
          Mostrando <span class="font-medium">{{ filteredProducts.length }}</span> de <span class="font-medium">{{ products.length }}</span> productos
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
  TrashIcon
} from '@heroicons/vue/24/outline';

// Estado reactivo
const searchQuery = ref('');
const categoryFilter = ref('');
const stockFilter = ref('');

// Datos de ejemplo
const products = ref([
  {
    id: 'PRD-001',
    name: 'Laptop Pro X1',
    category: 'Hardware',
    description: 'Laptop de alto rendimiento con procesador i9, 32GB RAM y 1TB SSD',
    price: 1299.99,
    stock: 15,
    image: 'https://placehold.co/600x400/2563eb/FFFFFF/png?text=Laptop+Pro+X1'
  },
  {
    id: 'PRD-002',
    name: 'Monitor UltraWide 34"',
    category: 'Hardware',
    description: 'Monitor curvo ultrawide de 34 pulgadas con resolución 4K',
    price: 499.99,
    stock: 8,
    image: 'https://placehold.co/600x400/2563eb/FFFFFF/png?text=Monitor+UltraWide'
  },
  {
    id: 'PRD-003',
    name: 'Software de Gestión Empresarial',
    category: 'Software',
    description: 'Suite completa para gestión de proyectos, recursos y finanzas',
    price: 299.99,
    stock: 0,
    image: 'https://placehold.co/600x400/2563eb/FFFFFF/png?text=Software+Gestion'
  },
  {
    id: 'PRD-004',
    name: 'Silla Ergonómica Deluxe',
    category: 'Oficina',
    description: 'Silla de oficina ergonómica con soporte lumbar y reposacabezas',
    price: 249.99,
    stock: 12,
    image: 'https://placehold.co/600x400/2563eb/FFFFFF/png?text=Silla+Ergonomica'
  },
  {
    id: 'PRD-005',
    name: 'Tablet Pro 12',
    category: 'Electrónica',
    description: 'Tablet de 12 pulgadas con pantalla retina y 256GB de almacenamiento',
    price: 799.99,
    stock: 5,
    image: 'https://placehold.co/600x400/2563eb/FFFFFF/png?text=Tablet+Pro+12'
  },
  {
    id: 'PRD-006',
    name: 'Teclado Mecánico RGB',
    category: 'Hardware',
    description: 'Teclado mecánico con retroiluminación RGB personalizable',
    price: 129.99,
    stock: 20,
    image: 'https://placehold.co/600x400/2563eb/FFFFFF/png?text=Teclado+Mecanico'
  },
  {
    id: 'PRD-007',
    name: 'Antivirus Premium',
    category: 'Software',
    description: 'Protección avanzada contra malware, ransomware y amenazas en línea',
    price: 59.99,
    stock: 0,
    image: 'https://placehold.co/600x400/2563eb/FFFFFF/png?text=Antivirus+Premium'
  },
  {
    id: 'PRD-008',
    name: 'Escritorio Ajustable',
    category: 'Oficina',
    description: 'Escritorio con altura ajustable eléctrico para trabajar de pie o sentado',
    price: 349.99,
    stock: 3,
    image: 'https://placehold.co/600x400/2563eb/FFFFFF/png?text=Escritorio+Ajustable'
  }
]);

// Productos filtrados
const filteredProducts = computed(() => {
  return products.value.filter(product => {
    // Filtro de búsqueda
    const matchesSearch = searchQuery.value === '' || 
      product.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.value.toLowerCase());
    
    // Filtro de categoría
    const matchesCategory = categoryFilter.value === '' || 
      product.category.toLowerCase() === categoryFilter.value.toLowerCase();
    
    // Filtro de stock
    let matchesStock = true;
    if (stockFilter.value === 'in_stock') {
      matchesStock = product.stock > 10;
    } else if (stockFilter.value === 'low_stock') {
      matchesStock = product.stock > 0 && product.stock <= 10;
    } else if (stockFilter.value === 'out_of_stock') {
      matchesStock = product.stock <= 0;
    }
    
    return matchesSearch && matchesCategory && matchesStock;
  });
});
</script>
