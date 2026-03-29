<template>
  <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
    <TransitionGroup name="toast">
      <div
        v-for="item in items"
        :key="item.id"
        class="flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg min-w-[300px] max-w-md"
        :class="{
          'bg-green-50 border-green-200 text-green-800': item.type === 'success',
          'bg-red-50 border-red-200 text-red-800': item.type === 'error',
          'bg-blue-50 border-blue-200 text-blue-800': item.type === 'info',
        }"
      >
        <!-- Icons -->
        <span class="shrink-0">
          <svg
            v-if="item.type === 'success'"
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <svg
            v-else-if="item.type === 'error'"
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
           <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </span>

        <p class="text-sm font-medium fl-grow">{{ item.message }}</p>

        <button
          @click="remove(item.id)"
          class="ml-auto shrink-0 rounded hover:bg-black/5 p-1"
           aria-label="Cerrar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { useToastStore } from '~/stores/toast';
import { storeToRefs } from 'pinia';

const toastStore = useToastStore();
const { items } = storeToRefs(toastStore);
const { remove } = toastStore;
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
