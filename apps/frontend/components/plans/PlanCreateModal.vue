<template>
  <UiModal v-model="isOpen" @update:model-value="resetForm">
    <template #title>
      {{ mode === 'NEW_SHEET' ? 'Crear Nuevo Plano' : 'Nueva Versión de Plano' }}
    </template>

    <div class="space-y-4 py-2">
      <!-- Selector de Modo -->
      <div class="flex space-x-4 mb-4 border-b pb-2">
        <button 
          class="text-sm font-medium pb-2 border-b-2 transition-colors"
          :class="mode === 'NEW_SHEET' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'"
          @click="mode = 'NEW_SHEET'"
        >
          Nuevo Sheet
        </button>
        <button 
          class="text-sm font-medium pb-2 border-b-2 transition-colors"
          :class="mode === 'VERSION' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'"
          @click="mode = 'VERSION'"
          :disabled="existingSheets.length === 0"
        >
          Nueva Versión
        </button>
      </div>

      <form @submit.prevent="handleSubmit" id="create-plan-form">
        <!-- Input: Nuevo Nombre -->
        <div v-if="mode === 'NEW_SHEET'">
          <label class="block text-sm font-medium text-gray-700 mb-1">Nombre del Plano</label>
          <UiInput 
            name="sheetName"
            v-model="formData.sheetName" 
            placeholder="Ej: Planta Baja, Alzados..." 
            required
            autofocus
          />
          <p class="mt-1 text-xs text-gray-500">Se creará la Versión 1 automáticamente.</p>
        </div>

        <!-- Select: Versión Existente -->
        <div v-else>
          <label class="block text-sm font-medium text-gray-700 mb-1">Seleccionar Plano Existente</label>
          <select 
            v-model="formData.sheetName"
            class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
            required
          >
            <option value="" disabled>Selecciona un plano...</option>
            <option v-for="sheet in existingSheets" :key="sheet" :value="sheet">
              {{ sheet }}
            </option>
          </select>
          <div v-if="formData.sheetName" class="mt-2 text-sm text-blue-600 bg-blue-50 p-2 rounded">
            Se creará la siguiente versión consecutiva para "{{ formData.sheetName }}".
          </div>
        </div>
      </form>
    </div>

    <template #footer>
      <UiButton variant="secondary" @click="close" class="mr-2">Cancelar</UiButton>
      <UiButton 
        type="submit" 
        form="create-plan-form" 
        :loading="loading"
        :disabled="!isValid"
      >
        {{ mode === 'NEW_SHEET' ? 'Crear Plano' : 'Generar Versión' }}
      </UiButton>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import UiModal from '@/components/common/UiModal.vue'
import UiInput from '@/components/common/UiInput.vue'
import UiButton from '@/components/common/UiButton.vue' // Assuming this exists or will be Aliased
import type { PlanGroup } from '~/types/plan'

const props = defineProps<{
  projectId: string
  groups: PlanGroup[]
}>()

const emit = defineEmits(['created'])
const isOpen = defineModel<boolean>('modelValue')

const { createPlan, loading } = usePlans()

// State
const mode = ref<'NEW_SHEET' | 'VERSION'>('NEW_SHEET')
const formData = reactive({
  sheetName: ''
})

// Computed
const existingSheets = computed(() => props.groups.map(g => g.sheetName))

const isValid = computed(() => {
  return formData.sheetName.trim().length > 2
})

// Methods
const close = () => {
  isOpen.value = false
}

const resetForm = () => {
  if (!isOpen.value) {
    formData.sheetName = ''
    mode.value = props.groups.length > 0 ? 'VERSION' : 'NEW_SHEET'
  }
}

const handleSubmit = async () => {
  if (!isValid.value) return

  try {
    const newPlan = await createPlan(props.projectId, { sheetName: formData.sheetName })
    emit('created')
    close()
    
    // Redirigir al nuevo plano según US-003, Escenario 1
    if (newPlan && newPlan.id) {
        navigateTo(`/dashboard/project/${props.projectId}/plan/${newPlan.id}`)
    }
  } catch (e) {
    // Error manejado en store
    console.error(e)
  }
}
</script>
