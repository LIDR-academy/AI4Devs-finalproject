<template>
  <div class="metric-card">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div 
          class="p-3 rounded-lg"
          :class="iconBgClass"
        >
          <component :is="icon" class="w-6 h-6 text-white" />
        </div>
        <div>
          <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
            {{ title }}
          </p>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ formattedValue }}
          </p>
        </div>
      </div>
      
      <div v-if="showTrend" class="text-right">
        <div class="flex items-center space-x-1">
          <component
            :is="trendIcon"
            class="w-4 h-4"
            :class="trendClass"
          />
          <span
            class="text-sm font-medium"
            :class="trendClass"
          >
            {{ Math.abs(trend) }}%
          </span>
        </div>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {{ trendLabel }}
        </p>
      </div>
    </div>
    
    <!-- Progress Bar -->
    <div v-if="showProgress" class="mt-4">
      <div class="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
        <span>Progreso</span>
        <span>{{ progress }}%</span>
      </div>
      <div class="progress-bar">
        <div 
          class="progress-bar-fill"
          :class="progressColorClass"
          :style="{ width: `${progress}%` }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ArrowUpIcon,
  ArrowDownIcon,
  MinusIcon
} from '@heroicons/vue/24/outline'

interface Props {
  title: string
  value: number | string
  icon: any
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray'
  trend?: number
  trendLabel?: string
  progress?: number
  showTrend?: boolean
  showProgress?: boolean
  format?: 'number' | 'currency' | 'percentage'
}

const props = withDefaults(defineProps<Props>(), {
  color: 'blue',
  showTrend: false,
  showProgress: false,
  format: 'number'
})

const colorClasses = {
  blue: 'bg-gradient-to-br from-blue-500 to-blue-600',
  green: 'bg-gradient-to-br from-green-500 to-green-600',
  yellow: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
  red: 'bg-gradient-to-br from-red-500 to-red-600',
  purple: 'bg-gradient-to-br from-purple-500 to-purple-600',
  gray: 'bg-gradient-to-br from-gray-500 to-gray-600'
}

const progressColors = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-500',
  purple: 'bg-purple-500',
  gray: 'bg-gray-500'
}

const iconBgClass = computed(() => colorClasses[props.color])
const progressColorClass = computed(() => progressColors[props.color])

const formattedValue = computed(() => {
  if (typeof props.value === 'string') return props.value
  
  switch (props.format) {
    case 'currency':
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(props.value)
    
    case 'percentage':
      return `${props.value}%`
    
    default:
      return new Intl.NumberFormat('es-MX').format(props.value)
  }
})

const trendIcon = computed(() => {
  if (!props.trend) return MinusIcon
  return props.trend > 0 ? ArrowUpIcon : ArrowDownIcon
})

const trendClass = computed(() => {
  if (!props.trend) return 'text-gray-500'
  return props.trend > 0 ? 'text-green-600' : 'text-red-600'
})
</script>
