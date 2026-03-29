<template>
  <UiModal v-model="isOpen" @update:model-value="() => reset()">
    <template #title>Nueva Capa</template>

    <div class="space-y-4">
      <!-- File Select -->
      <div 
        class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer"
        @click.stop="triggerFileInput"
        v-if="!file"
      >
        <div class="text-gray-500">
          <span class="block text-3xl mb-2">📄</span>
          <p class="text-sm font-medium">Click para seleccionar archivo</p>
          <p class="text-xs">Soporta PDF, PNG, JPG</p>
        </div>
      </div>
      
      <!-- Hidden Input shifted out to avoid bubbling issues -->
      <input 
          ref="fileInput" 
          type="file" 
          class="hidden" 
          accept=".pdf,.png,.jpg,.jpeg"
          @change="handleFileSelect" 
      />

      <!-- Preview Steps -->
      <div v-if="file">
         <div class="flex items-center justify-between bg-gray-100 p-2 rounded mb-4">
            <span class="text-sm truncate max-w-[200px]">{{ file.name }}</span>
            <button @click="reset" class="text-xs text-red-500 hover:text-red-700">Cambiar archivo</button>
         </div>

         <!-- PDF Selector -->
         <PdfPageSelector 
            v-if="isPdf" 
            :file="file" 
            @update:selection="handlePdfSelection"
         />

         <!-- Image Preview & Config -->
         <div v-else class="space-y-4">
            <div class="text-center">
                <img :src="imagePreviewUrl" class="max-h-[200px] mx-auto rounded shadow" />
            </div>
            
            <div>
               <label class="block text-sm font-medium text-gray-700">Nombre de Capa</label>
               <UiInput name="layerName" v-model="singleLayerConfig.name" />
            </div>
            <div>
               <label class="block text-sm font-medium text-gray-700">Tipo</label>
               <select 
                  v-model="singleLayerConfig.type"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
               >
                  <option value="BASE">Base (Opaco)</option>
                  <option value="OVERLAY">Overlay (Transparente)</option>
               </select>
            </div>
         </div>
      </div>

      <!-- Errores -->
      <div v-if="uploadError" class="text-sm text-red-600 bg-red-50 p-2 rounded">
          {{ uploadError }}
      </div>
    </div>

    <template #footer>
        <UiButton variant="secondary" @click="close" class="mr-2">Cancelar</UiButton>
        <UiButton 
            @click="handleUpload" 
            :loading="uploading"
            :disabled="!canUpload"
        >
            {{ uploadButtonLabel }}
        </UiButton>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import UiModal from '@/components/common/UiModal.vue'
import UiInput from '@/components/common/UiInput.vue'
import UiButton from '@/components/common/UiButton.vue'
import PdfPageSelector from '@/components/layers/PdfPageSelector.vue'
import type { UploadLayerDto } from '~/types/plan'

const props = defineProps<{
    planId: string
}>()
const emit = defineEmits(['success'])
const isOpen = defineModel<boolean>('modelValue')

const { uploadLayer } = usePlans()
const fileInput = ref<HTMLInputElement>()
const file = ref<File | null>(null)
const imagePreviewUrl = ref<string>('')
const uploading = ref(false)
const uploadError = ref<string | null>(null)

// Config para imagen individual
const singleLayerConfig = reactive({
    name: '',
    type: 'BASE' as 'BASE' | 'OVERLAY'
})

// Selección desde PDF
const pdfSelection = ref<any[]>([])

// Computed
const isPdf = computed(() => file.value?.type === 'application/pdf')
const canUpload = computed(() => {
    if (!file.value) return false;
    if (isPdf.value) return pdfSelection.value.length > 0;
    return singleLayerConfig.name.length > 2;
})
const uploadButtonLabel = computed(() => {
    if (uploading.value) return 'Subiendo...';
    if (isPdf.value && pdfSelection.value.length > 1) return `Subir ${pdfSelection.value.length} capas`;
    return 'Subir Capa';
})

// Methods
const triggerFileInput = () => fileInput.value?.click()

const handleFileSelect = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files[0]) {
        file.value = target.files[0];
        uploadError.value = null;
        
        if (isPdf.value) {
            // PDF Setup
        } else {
            // Image Setup
            singleLayerConfig.name = file.value.name.split('.')[0];
            imagePreviewUrl.value = URL.createObjectURL(file.value);
        }
    }
}

const handlePdfSelection = (selection: any[]) => {
    pdfSelection.value = selection;
}

const reset = (force: boolean = false) => {
    // Si force es true, reseteamos independientemente de isOpen
    // Esto es necesario tras un upload exitoso
    if (!isOpen.value || force) {
        file.value = null
        uploadError.value = null
        pdfSelection.value = []
        singleLayerConfig.name = ''
        singleLayerConfig.type = 'BASE'
        if (imagePreviewUrl.value) URL.revokeObjectURL(imagePreviewUrl.value)
        if (fileInput.value) fileInput.value.value = ''
    }
}

const close = () => {
    isOpen.value = false;
    // No llamamos a reset aquí porque el watcher de isOpen ya lo hará
}

const handleUpload = async () => {
    if (!file.value) return;
    uploading.value = true;
    uploadError.value = null;

    try {
        if (isPdf.value) {
            // Iterar subidas
            for (const item of pdfSelection.value) {
                 const dto: UploadLayerDto = {
                     name: item.name,
                     type: item.type,
                     file: file.value!,
                     pageNumber: item.pageNumber
                 };
                 await uploadLayer(props.planId, dto);
            }
        } else {
            // Single Image
            const dto: UploadLayerDto = {
                name: singleLayerConfig.name,
                type: singleLayerConfig.type,
                file: file.value!
            };
            await uploadLayer(props.planId, dto);
        }

        emit('success')
        reset(true) // Forzamos reset explícito tras éxito
        close()
    } catch (e: any) {
        console.error(e)
        uploadError.value = e.message || 'Error al subir capas';
    } finally {
        uploading.value = false;
    }
}
</script>
