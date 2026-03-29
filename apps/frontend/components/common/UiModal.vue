<template>
  <Teleport to="body">
    <div v-if="modelValue" class="relative z-50" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-primary/60 transition-opacity" aria-hidden="true" @click="close"></div>

      <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <!-- Modal Panel -->
          <div class="relative transform overflow-hidden rounded-lg bg-accent text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
            
            <div class="bg-accent px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                  <h3 class="text-base font-semibold leading-6 text-text" id="modal-title">
                    <slot name="title">Título del Modal</slot>
                  </h3>
                  <div class="mt-2">
                    <slot></slot>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="bg-background px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <slot name="footer">
                <button type="button" class="mt-3 inline-flex w-full justify-center rounded-md bg-accent px-3 py-2 text-sm font-semibold text-text shadow-sm ring-1 ring-inset ring-secondary/30 hover:bg-background sm:mt-0 sm:w-auto" @click="close">
                  Cerrar
                </button>
              </slot>
            </div>

          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits(['update:modelValue'])

const close = () => {
  emit('update:modelValue', false)
}
</script>
