<template>
  <div class="card">
    <div class="p-6 border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ title }}
        </h3>
        <div class="flex items-center space-x-2">
          <!-- Filters -->
          <select
            v-if="showFilters"
            v-model="selectedFilter"
            class="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="all">Todos</option>
            <option v-for="filter in filters" :key="filter.value" :value="filter.value">
              {{ filter.label }}
            </option>
          </select>
          
          <!-- Search -->
          <div v-if="showSearch" class="relative">
            <MagnifyingGlassIcon class="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar..."
              class="pl-8 pr-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
          </div>
          
          <!-- Actions -->
          <slot name="actions"></slot>
        </div>
      </div>
    </div>
    
    <div class="overflow-x-auto">
      <table class="table">
        <thead class="table-header">
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              class="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
              @click="sort(column.key)"
            >
              <div class="flex items-center space-x-1">
                <span>{{ column.label }}</span>
                <div class="flex flex-col">
                  <ChevronUpIcon 
                    class="w-3 h-3"
                    :class="sortKey === column.key && sortOrder === 'asc' ? 'text-primary-600' : 'text-gray-400'"
                  />
                  <ChevronDownIcon 
                    class="w-3 h-3 -mt-1"
                    :class="sortKey === column.key && sortOrder === 'desc' ? 'text-primary-600' : 'text-gray-400'"
                  />
                </div>
              </div>
            </th>
            <th v-if="showActions" class="w-20">Acciones</th>
          </tr>
        </thead>
        <tbody class="table-body">
          <tr
            v-for="(item, index) in paginatedData"
            :key="getItemKey(item, index)"
            class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <td v-for="column in columns" :key="column.key">
              <slot
                :name="`cell-${column.key}`"
                :item="item"
                :value="getNestedValue(item, column.key)"
                :column="column"
              >
                <span v-if="column.type === 'status'">
                  <span
                    class="status-badge"
                    :class="getStatusClass(getNestedValue(item, column.key))"
                  >
                    {{ formatValue(getNestedValue(item, column.key), column) }}
                  </span>
                </span>
                <span v-else-if="column.type === 'progress'">
                  <div class="flex items-center space-x-2">
                    <div class="flex-1 progress-bar">
                      <div 
                        class="progress-bar-fill bg-primary-500"
                        :style="{ width: `${getNestedValue(item, column.key)}%` }"
                      ></div>
                    </div>
                    <span class="text-sm text-gray-600 dark:text-gray-400">
                      {{ getNestedValue(item, column.key) }}%
                    </span>
                  </div>
                </span>
                <span v-else>
                  {{ formatValue(getNestedValue(item, column.key), column) }}
                </span>
              </slot>
            </td>
            <td v-if="showActions">
              <div class="flex items-center space-x-2">
                <slot name="row-actions" :item="item" :index="index">
                  <button
                    @click="$emit('edit', item)"
                    class="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                  >
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="$emit('delete', item)"
                    class="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                  >
                    <TrashIcon class="w-4 h-4" />
                  </button>
                </slot>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Pagination -->
    <div v-if="showPagination && totalPages > 1" class="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
      <div class="flex items-center justify-between">
        <div class="text-sm text-gray-600 dark:text-gray-400">
          Mostrando {{ startItem }} - {{ endItem }} de {{ filteredData.length }} resultados
        </div>
        <div class="flex items-center space-x-2">
          <button
            @click="currentPage--"
            :disabled="currentPage <= 1"
            class="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Anterior
          </button>
          <span class="text-sm text-gray-600 dark:text-gray-400">
            Página {{ currentPage }} de {{ totalPages }}
          </span>
          <button
            @click="currentPage++"
            :disabled="currentPage >= totalPages"
            class="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  MagnifyingGlassIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/vue/24/outline'

interface Column {
  key: string
  label: string
  type?: 'text' | 'number' | 'date' | 'currency' | 'status' | 'progress'
  sortable?: boolean
  format?: string
}

interface Filter {
  label: string
  value: string
}

interface Props {
  title: string
  data: any[]
  columns: Column[]
  filters?: Filter[]
  showFilters?: boolean
  showSearch?: boolean
  showActions?: boolean
  showPagination?: boolean
  pageSize?: number
  keyField?: string
}

const props = withDefaults(defineProps<Props>(), {
  showFilters: false,
  showSearch: true,
  showActions: true,
  showPagination: true,
  pageSize: 10,
  keyField: 'id'
})

defineEmits<{
  edit: [item: any]
  delete: [item: any]
}>()

// Reactive state
const searchQuery = ref('')
const selectedFilter = ref('all')
const sortKey = ref('')
const sortOrder = ref<'asc' | 'desc'>('asc')
const currentPage = ref(1)

// Computed properties
const filteredData = computed(() => {
  let result = [...props.data]
  
  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(item =>
      props.columns.some(column => {
        const value = getNestedValue(item, column.key)
        return String(value).toLowerCase().includes(query)
      })
    )
  }
  
  // Apply filter
  if (selectedFilter.value !== 'all' && props.filters) {
    // This would need to be customized based on your filtering logic
    result = result.filter(item => {
      // Custom filtering logic here
      return true
    })
  }
  
  return result
})

const sortedData = computed(() => {
  if (!sortKey.value) return filteredData.value
  
  return [...filteredData.value].sort((a, b) => {
    const aValue = getNestedValue(a, sortKey.value)
    const bValue = getNestedValue(b, sortKey.value)
    
    let comparison = 0
    if (aValue < bValue) comparison = -1
    else if (aValue > bValue) comparison = 1
    
    return sortOrder.value === 'desc' ? -comparison : comparison
  })
})

const totalPages = computed(() => Math.ceil(sortedData.value.length / props.pageSize))

const paginatedData = computed(() => {
  if (!props.showPagination) return sortedData.value
  
  const start = (currentPage.value - 1) * props.pageSize
  const end = start + props.pageSize
  return sortedData.value.slice(start, end)
})

const startItem = computed(() => {
  if (filteredData.value.length === 0) return 0
  return (currentPage.value - 1) * props.pageSize + 1
})

const endItem = computed(() => {
  const end = currentPage.value * props.pageSize
  return Math.min(end, filteredData.value.length)
})

// Methods
const getNestedValue = (obj: any, path: string) => {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

const getItemKey = (item: any, index: number) => {
  return getNestedValue(item, props.keyField) || index
}

const formatValue = (value: any, column: Column) => {
  if (value === null || value === undefined) return '-'
  
  switch (column.type) {
    case 'currency':
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
      }).format(value)
    
    case 'date':
      return new Date(value).toLocaleDateString('es-MX')
    
    case 'number':
      return new Intl.NumberFormat('es-MX').format(value)
    
    default:
      return String(value)
  }
}

const getStatusClass = (status: string) => {
  const statusClasses = {
    'completed': 'success',
    'in-progress': 'info',
    'pending': 'warning',
    'cancelled': 'danger',
    'approved': 'success',
    'rejected': 'danger',
    'paid': 'success'
  }
  
  return statusClasses[status as keyof typeof statusClasses] || 'info'
}

const sort = (key: string) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
}

// Watch for filter changes to reset pagination
watch([searchQuery, selectedFilter], () => {
  currentPage.value = 1
})
</script>
