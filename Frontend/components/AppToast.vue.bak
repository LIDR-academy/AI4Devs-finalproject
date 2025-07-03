<template>
  <Teleport to="body">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="fixed top-4 right-4 z-50 transform transition-all duration-300 ease-in-out"
      :class="toast.visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'"
    >
      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-lg border-l-4 p-4 min-w-80 max-w-96"
        :class="toastTypeClasses[toast.type]"
      >
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <component :is="toastIcons[toast.type]" class="w-5 h-5" />
          </div>
          <div class="ml-3 flex-1">
            <p class="text-sm font-medium text-gray-900 dark:text-white">
              {{ toast.title }}
            </p>
            <p v-if="toast.message" class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {{ toast.message }}
            </p>
          </div>
          <button
            @click="removeToast(toast.id)"
            class="ml-3 flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <XMarkIcon class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  visible: boolean
  duration: number
}

const toasts = ref<Toast[]>([])

const toastTypeClasses = {
  success: 'border-success-500',
  error: 'border-danger-500',
  warning: 'border-warning-500',
  info: 'border-primary-500'
}

const toastIcons = {
  success: CheckCircleIcon,
  error: XCircleIcon,
  warning: ExclamationTriangleIcon,
  info: InformationCircleIcon
}

const showToast = (options: Omit<Toast, 'id' | 'visible'>) => {
  const id = Date.now().toString()
  const toast: Toast = {
    id,
    visible: false,
    duration: 5000,
    ...options
  }
  
  toasts.value.push(toast)
  
  // Animate in
  nextTick(() => {
    toast.visible = true
  })
  
  // Auto remove
  setTimeout(() => {
    removeToast(id)
  }, toast.duration)
}

const removeToast = (id: string) => {
  const toast = toasts.value.find(t => t.id === id)
  if (toast) {
    toast.visible = false
    setTimeout(() => {
      const index = toasts.value.findIndex(t => t.id === id)
      if (index > -1) {
        toasts.value.splice(index, 1)
      }
    }, 300)
  }
}

// Global toast methods
const $toast = {
  success: (title: string, message?: string) => showToast({ type: 'success', title, message }),
  error: (title: string, message?: string) => showToast({ type: 'error', title, message }),
  warning: (title: string, message?: string) => showToast({ type: 'warning', title, message }),
  info: (title: string, message?: string) => showToast({ type: 'info', title, message })
}

// Provide globally
provide('toast', $toast)
</script>
