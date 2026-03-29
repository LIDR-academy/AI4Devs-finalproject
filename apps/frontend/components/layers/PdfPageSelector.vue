<template>
  <div class="mt-4">
    <div v-if="loading" class="text-center py-8">
      <p class="text-gray-500">Analizando documento PDF...</p>
    </div>

    <!-- Grid de Páginas -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-6 max-h-[60vh] overflow-y-auto p-2">
      <div 
        v-for="page in pages" 
        :key="page.pageNumber"
        class="border rounded-lg p-3 transition-all outline-none"
        :class="page.selected ? 'border-primary ring-2 ring-primary ring-opacity-50' : 'border-gray-200 hover:border-gray-400'"
      >
        <!-- Checkbox de Selección -->
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold text-gray-500">Página {{ page.pageNumber }}</span>
          <input 
            type="checkbox" 
            v-model="page.selected" 
            class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            @change="emitSelection"
          />
        </div>

        <!-- Thumbnail (Canvas) -->
        <div class="bg-gray-100 min-h-[150px] flex items-center justify-center mb-3 overflow-hidden rounded">
          <canvas :ref="el => setCanvasRef(el, page.pageNumber)" class="max-w-full h-auto object-contain"></canvas>
        </div>

        <!-- Configuración de Capa (Solo si seleccionado) -->
        <div v-if="page.selected" class="space-y-2">
          <div>
            <label class="block text-xs font-medium text-gray-700">Nombre de Capa</label>
            <input 
              v-model="page.layerName" 
              type="text" 
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-xs"
            />
          </div>
          <div>
             <label class="block text-xs font-medium text-gray-700">Tipo</label>
             <select 
                v-model="page.layerType"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-xs"
             >
                <option value="BASE">Base (Opaco)</option>
                <option value="OVERLAY">Overlay (Transparente)</option>
             </select>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Import dinámico para evitar errores SSR con pdfjs-dist (DOMMatrix is not defined en Node)
let pdfjsLib: any;

const props = defineProps<{
  file: File
}>()

const emit = defineEmits(['update:selection'])

interface PageItem {
  pageNumber: number;
  selected: boolean;
  layerName: string;
  layerType: 'BASE' | 'OVERLAY';
}

const loading = ref(true)
const pages = ref<PageItem[]>([])
// Referencias a los canvas para renderizar
const canvasRefs = new Map<number, HTMLCanvasElement>()

const setCanvasRef = (el: any, pageNum: number) => {
    if (el) canvasRefs.set(pageNum, el as HTMLCanvasElement)
}

// Watch selection changes to emit parent
const emitSelection = () => {
    const selected = pages.value
        .filter(p => p.selected)
        .map(p => ({
            pageNumber: p.pageNumber,
            name: p.layerName,
            type: p.layerType
        }));
    emit('update:selection', selected);
}

// Observar cambio en campos de texto/select también
watch(() => pages.value.map(p => ({ n: p.layerName, t: p.layerType })), () => {
    emitSelection()
}, { deep: true })

onMounted(async () => {
    await loadPdf()
})

const loadPdf = async () => {
    try {
        loading.value = true;
        
        // Cargar librería dinámicamente solo en cliente
        if (!pdfjsLib) {
             pdfjsLib = await import('pdfjs-dist');
             pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
        }
        
        // Convertir File a ArrayBuffer
        const arrayBuffer = await props.file.arrayBuffer();
        
        // Cargar documento
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const totalPages = pdf.numPages;

        // Inicializar estado de páginas
        const tempPages: PageItem[] = [];
        for (let i = 1; i <= totalPages; i++) {
            tempPages.push({
                pageNumber: i,
                selected: false,
                layerName: `Capa - Pag ${i}`,
                layerType: i === 1 ? 'BASE' : 'OVERLAY' // Default inteligente
            });
        }
        pages.value = tempPages;
        
        // Renderizar miniaturas (next tick para que existan los canvas en DOM)
        nextTick(async () => {
            for (let i = 1; i <= totalPages; i++) {
                renderThumbnail(pdf, i);
            }
        });

    } catch (e) {
        console.error('Error loading PDF', e);
    } finally {
        loading.value = false;
    }
}

const renderThumbnail = async (pdfDoc: any, pageNum: number) => {
    try {
        const page = await pdfDoc.getPage(pageNum);
        const canvas = canvasRefs.get(pageNum);
        if (!canvas) return;

        const viewport = page.getViewport({ scale: 0.3 }); // Miniatura
        const context = canvas.getContext('2d');
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
            canvasContext: context,
            viewport: viewport
        };
        await page.render(renderContext).promise;
    } catch(err) {
        console.error(`Error rendering page ${pageNum}`, err);
    }
}
</script>
