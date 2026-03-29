<template>
  <div class="flex h-[calc(100vh-64px)] overflow-hidden bg-gray-100"> 
    <!-- Sidebar (ocultar botón de agregar en modo guest) -->
    <LayerSidebar 
      :layers="currentPlan?.layers || []"
      :visibility-map="visibilityMap"
      @add-layer="!isGuestMode && (showUploadModal = true)"
      @toggle-visibility="toggleVisibility"
    />

    <!-- Main Stage Area -->
    <div class="flex-1 relative flex flex-col">
       <!-- Toolbar -->
       <div class="h-12 bg-white border-b border-gray-200 flex items-center px-4 shadow-sm z-10">
          <h2 class="text-sm font-semibold text-gray-800 mr-4">
             {{ currentPlan?.sheetName }} <span class="text-gray-400 font-normal">v{{ currentPlan?.version }}</span>
          </h2>
          <div class="flex-1"></div>
          
          <!-- Toggle modo de creación de pines -->
          <button
            v-if="hasLayers"
            class="mr-2 px-3 py-1.5 text-xs font-medium rounded transition-colors"
            :class="{
              'bg-primary text-white': isPinMode,
              'bg-gray-100 text-gray-700 hover:bg-gray-200': !isPinMode,
            }"
            @click="togglePinMode"
          >
            {{ isPinMode ? '✓ Modo Pin' : '+ Añadir Pin' }}
          </button>

          <!-- Toggle comparador de versiones -->
          <div
            v-if="hasLayers"
            class="relative mr-4"
            :title="!comparatorAvailable ? 'Se necesitan al menos 2 versiones del plano para comparar' : (comparatorActive ? 'Desactivar comparador' : 'Activar comparador de versiones')"
          >
            <button
              class="px-3 py-1.5 text-xs font-medium rounded transition-colors flex items-center gap-1.5"
              :class="{
                'bg-primary text-white': comparatorActive,
                'bg-gray-100 text-gray-700 hover:bg-gray-200': !comparatorActive && comparatorAvailable,
                'bg-gray-50 text-gray-300 cursor-not-allowed': !comparatorAvailable,
              }"
              :disabled="!comparatorAvailable"
              @click="toggleComparator"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3.5 h-3.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 3M21 7.5H7.5" />
              </svg>
              Comparar
            </button>
          </div>

          <div class="text-xs text-gray-500 font-mono">
             Zoom: {{ Math.round(scale * 100) }}%
          </div>
       </div>

       <!-- Canvas Container -->
       <div 
         ref="containerRef"
         class="flex-1 overflow-hidden p-0 relative flex items-center justify-center bg-gray-50 bg-dots z-0 select-none"
         :class="{ 
           'cursor-grab': !isDragging && !isPinMode,
           'cursor-grabbing': isDragging && !isPinMode,
           'cursor-crosshair': isPinMode,
         }"
         @wheel.prevent="onWheel"
         @pointerdown="onPointerDown"
         @pointermove="onPointerMove"
         @pointerup="onPointerUp"
         @pointercancel="onPointerUp"
       >
          <div v-if="loading" class="text-gray-500 animate-pulse">Cargando plano...</div>
          <div v-else-if="error" class="text-red-500 bg-red-50 p-4 rounded border border-red-200">
             Error: {{ error }}
          </div>
          <div v-else-if="!hasLayers" class="text-center text-gray-400">
             <p class="mb-2">El plano está vacío.</p>
             <button v-if="!isGuestMode" @click="showUploadModal = true" class="text-primary hover:underline">Sube una capa base</button>
          </div>
          <div 
             v-else
             ref="planContentRef"
             class="plan-content origin-top-left will-change-transform absolute top-0 left-0"
             :style="transformStyle"
             @click="handleCanvasClick"
          >
             <!-- Renderizado de capas superpuestas -->
             <div class="relative" :style="containerDimensions">

                <!-- Modo Comparador: imagen base fija + imagen propuesta con opacidad dinámica -->
                <template v-if="comparatorAvailable && comparatorActive">
                  <img
                    v-if="baseImageUrl"
                    :src="baseImageUrl"
                    class="max-w-none pointer-events-none absolute top-0 left-0"
                    draggable="false"
                    @load="onImageLoad"
                  />
                  <img
                    v-if="proposalImageUrl"
                    :src="proposalImageUrl"
                    class="max-w-none pointer-events-none absolute top-0 left-0 z-10 transition-opacity duration-75"
                    draggable="false"
                    :style="{ opacity }"
                  />
                </template>

                <!-- Modo Normal (1 versión): renderiza todas las capas READY -->
                <template v-else>
                  <template v-for="layer in currentPlan?.layers?.filter((l: any) => l.status === 'READY')" :key="layer.id">
                    <img
                      :src="getImageUrl(layer.imageUrl)"
                      class="max-w-none pointer-events-none absolute top-0 left-0 transition-opacity duration-200"
                      draggable="false"
                      :style="{ opacity: isVisible(layer.id) ? 1 : 0 }"
                      @load="onImageLoad"
                    />
                  </template>
                </template>

                <!-- Renderizado de Pines (siempre visible, z-20 garantizado en PinMarker) -->
                <PinMarker
                  v-for="pin in visiblePins"
                  :key="pin.id"
                  :pin="pin"
                  :scale="scale"
                  @click="handlePinClick"
                />
             </div>
          </div>

          <!-- Controls Overlay -->
          <div class="absolute bottom-6 right-6 z-10 transition-opacity duration-300 hover:opacity-100 opacity-90">
            <PlanControls 
              :zoom-level="scale"
              @zoom-in="handleZoomIn"
              @zoom-out="handleZoomOut" 
              @reset="reset"
              @fit="handleFit"
            />
          </div>

          <!-- Comparador de Capas — panel flotante centrado inferior (US-007) -->
          <!-- stop propagation evita que los eventos del slider activen el drag del canvas -->
          <div
            class="absolute bottom-4 left-1/2 -translate-x-1/2 z-10"
            @pointerdown.stop
            @pointermove.stop
            @pointerup.stop
          >
            <LayerComparatorControls
              v-if="comparatorAvailable && comparatorActive"
              v-model:opacity="opacity"
              v-model:base-plan-id="basePlanId"
              v-model:proposal-plan-id="proposalPlanId"
              :plans="comparatorPlans"
              @blink="toggleBlink"
            />
          </div>
       </div>
    </div>

    <!-- Modals (solo mostrar si no es modo guest) -->
    <LayerUploadModal 
       v-if="currentPlan && !isGuestMode"
       v-model="showUploadModal" 
       :plan-id="currentPlan.id"
       @success="onUploadSuccess"
    />

    <CreatePinModal
      v-model="showCreatePinModal"
      :coords="pendingPinCoords"
      :loading="pinsLoading"
      @submit="handleCreatePin"
    />

    <CommentsDrawer
      v-model="showCommentsDrawer"
      :pin="selectedPin"
      :loading="pinsLoading"
      :can-resolve="canResolve"
      @add-comment="handleAddComment"
      @toggle-status="handleToggleStatus"
    />
  </div>
</template>

<script setup lang="ts">
import LayerSidebar from '@/components/layers/LayerSidebar.vue'
import LayerUploadModal from '@/components/layers/LayerUploadModal.vue'
import LayerComparatorControls from '@/components/layers/LayerComparatorControls.vue'
import PlanControls from '@/components/plans/PlanControls.vue'
import PinMarker from '@/components/pins/PinMarker.vue'
import PinList from '@/components/pins/PinList.vue'
import CreatePinModal from '@/components/pins/CreatePinModal.vue'
import CommentsDrawer from '@/components/pins/CommentsDrawer.vue'

const props = defineProps<{
    planId: string
    projectId?: string
    isGuestMode?: boolean
}>()

const { setCurrentPlan, currentPlan, loading, error, groups, fetchProjectPlans } = usePlans()
const showUploadModal = ref(false)

// --- Composable Comparador de Capas (US-007) ---
const {
  opacity,
  basePlanId,
  proposalPlanId,
  comparatorPlans,
  comparatorEnabled,
  baseImageUrl,
  proposalImageUrl,
  initComparator,
  toggleBlink,
} = useLayerComparator()
const config = useRuntimeConfig()

// --- Composable de Pines ---
const {
  pins,
  selectedPin,
  loading: pinsLoading,
  isGuest,
  canResolve,
  fetchPinsByLayer,
  createPin,
  addComment,
  updatePinStatus,
  selectPin,
  deselectPin,
} = usePins()

// --- Estados de UI para Pines ---
const isPinMode = ref(false)
const showCreatePinModal = ref(false)
const showCommentsDrawer = ref(false)
const showPinList = ref(false)
const pendingPinCoords = ref({ x: 0, y: 0 })
const currentPinIndex = ref(0)
const planContentRef = ref<HTMLElement | null>(null)

// --- Navigation Logic (US-004) ---
const containerRef = ref<HTMLElement | null>(null)
const baseImageRef = ref<HTMLImageElement | null>(null)

const { 
  scale, 
  position,
  transformStyle, 
  isDragging,
  minScale,
  zoomToPoint, 
  startDrag, 
  onDrag, 
  stopDrag, 
  reset,
  fitToScreen
} = usePlanNavigation()

// --- Visibilidad de Capas ---
const planIdRef = computed(() => currentPlan.value?.id)
const { visibilityMap, isVisible, toggleVisibility } = useLayerVisibility(planIdRef)

// --- Comparador: disponibilidad y estado de activación ---
/** true cuando el plan tiene >= 2 versiones comparables */
const comparatorAvailable = computed(() => comparatorEnabled.value)
/** true cuando el usuario ha activado explícitamente el comparador */
const comparatorActive = ref(false)

const toggleComparator = () => {
  if (!comparatorAvailable.value) return
  comparatorActive.value = !comparatorActive.value
}

const onWheel = (e: WheelEvent) => {
  if (!containerRef.value || isPinMode.value) return
  const rect = containerRef.value.getBoundingClientRect()
  const point = { x: e.clientX - rect.left, y: e.clientY - rect.top }
  const delta = Math.sign(e.deltaY) 
  zoomToPoint(delta, point)
}

const onPointerDown = (e: PointerEvent) => {
  if (!containerRef.value) return
  
  // Modo creación de pin
  if (isPinMode.value) {
    handleCanvasClick(e)
    return
  }
  
  // Modo navegación
  (e.target as Element).setPointerCapture(e.pointerId)
  startDrag({ x: e.clientX, y: e.clientY })
}

const onPointerMove = (e: PointerEvent) => {
  if (!isPinMode.value) {
    onDrag({ x: e.clientX, y: e.clientY })
  }
}

const onPointerUp = (e: PointerEvent) => {
  if (!isPinMode.value && e.target) {
    (e.target as Element).releasePointerCapture(e.pointerId)
  }
  stopDrag()
}

// --- Lógica de Pines ---

const togglePinMode = () => {
  isPinMode.value = !isPinMode.value
  if (isPinMode.value) {
    // Cerrar drawer si está abierto
    showCommentsDrawer.value = false
  }
}

/**
 * Convertir coordenadas de click a coordenadas relativas (0-1)
 */
const getRelativeCoords = (e: PointerEvent): { x: number; y: number } | null => {
  if (!planContentRef.value || !baseImageRef.value) return null

  const planRect = planContentRef.value.getBoundingClientRect()
  const containerRect = containerRef.value!.getBoundingClientRect()

  // Coordenadas del click relativas al contenedor
  const clickX = e.clientX - containerRect.left
  const clickY = e.clientY - containerRect.top

  // Coordenadas del plano transformado relativas al contenedor
  const planX = planRect.left - containerRect.left
  const planY = planRect.top - containerRect.top

  // Coordenadas relativas al plano (antes del scale)
  const relativeX = (clickX - planX) / scale.value
  const relativeY = (clickY - planY) / scale.value

  // Obtener dimensiones de la imagen
  const imageWidth = baseImageRef.value.naturalWidth
  const imageHeight = baseImageRef.value.naturalHeight

  // Normalizar a 0-1
  const normalizedX = relativeX / imageWidth
  const normalizedY = relativeY / imageHeight

  // Validar que esté dentro del rango
  if (normalizedX < 0 || normalizedX > 1 || normalizedY < 0 || normalizedY > 1) {
    return null
  }

  return { x: normalizedX, y: normalizedY }
}

const handleCanvasClick = (e: PointerEvent) => {
  if (!isPinMode.value) return

  const coords = getRelativeCoords(e)
  if (!coords) return

  // Abrir modal para escribir comentario
  pendingPinCoords.value = coords
  showCreatePinModal.value = true
}

const handleCreatePin = async (content: string) => {
  if (!currentVisibleLayer.value) return

  try {
    await createPin(currentVisibleLayer.value.id, {
      xCoord: pendingPinCoords.value.x,
      yCoord: pendingPinCoords.value.y,
      content,
    })

    showCreatePinModal.value = false
    isPinMode.value = false
  } catch (e) {
    console.error('Error creating pin:', e)
  }
}

const handlePinClick = async (pinId: string) => {
  await selectPin(pinId)
  showCommentsDrawer.value = true
  
  // Actualizar índice actual
  currentPinIndex.value = visiblePins.value.findIndex(p => p.id === pinId)
}

const handlePinSelect = async (pinId: string) => {
  await handlePinClick(pinId)
}

const handleAddComment = async (content: string) => {
  if (!selectedPin.value) return

  try {
    await addComment(selectedPin.value.id, { content })
  } catch (e) {
    console.error('Error adding comment:', e)
  }
}

const handleToggleStatus = async () => {
  if (!selectedPin.value) return

  const newStatus = selectedPin.value.status === 'RESOLVED' ? 'OPEN' : 'RESOLVED'

  try {
    await updatePinStatus(selectedPin.value.id, { status: newStatus })
  } catch (e) {
    console.error('Error updating status:', e)
  }
}

const handlePinNavigation = (direction: 'prev' | 'next') => {
  const newIndex = direction === 'prev' 
    ? Math.max(0, currentPinIndex.value - 1)
    : Math.min(visiblePins.value.length - 1, currentPinIndex.value + 1)

  currentPinIndex.value = newIndex
  const pinId = visiblePins.value[newIndex]?.id
  if (pinId) {
    handlePinClick(pinId)
  }
}

// --- Computed ---

const hasLayers = computed(() => {
    return currentPlan.value?.layers && currentPlan.value.layers.length > 0
})

const currentVisibleLayer = computed(() => {
  // Obtener la primera capa visible (lógica simplificada)
  return currentPlan.value?.layers?.find(l => l.status === 'READY') || null
})

const visiblePins = computed(() => {
  if (!currentVisibleLayer.value) return []
  return pins.value.filter((pin: any) => pin.layerId === currentVisibleLayer.value!.id)
})

const containerDimensions = computed(() => {
  if (!baseImageRef.value) return {}
  return {
    width: `${baseImageRef.value.naturalWidth}px`,
    height: `${baseImageRef.value.naturalHeight}px`,
  }
})

// --- Zoom & Pan Helpers ---

const handleZoomIn = () => {
  if (!containerRef.value) return
  const center = getCenterPoint()
  zoomToPoint(-1, center)
}

const handleZoomOut = () => {
  if (!containerRef.value) return
  const center = getCenterPoint()
  zoomToPoint(1, center)
}

const getCenterPoint = () => {
  if (!containerRef.value) return { x: 0, y: 0 }
  const rect = containerRef.value.getBoundingClientRect()
  return { x: rect.width / 2, y: rect.height / 2 }
}

const handleFit = () => {
    // If we have a base image reference, use it
    if (!containerRef.value || !baseImageRef.value) return
    const rect = containerRef.value.getBoundingClientRect()
    const img = baseImageRef.value
    
    // Fit only if we have dimensions
    if (img.naturalWidth && img.naturalHeight) {
       const fitScale = Math.min(rect.width / img.naturalWidth, rect.height / img.naturalHeight) * 0.9
       // Update minimum zoom to match the fit scale so the user can't zoom out further
       minScale.value = fitScale
       scale.value = fitScale
       position.value.x = (rect.width - img.naturalWidth * fitScale) / 2
       position.value.y = (rect.height - img.naturalHeight * fitScale) / 2
    }
}

const onImageLoad = (e: Event) => {
    const img = e.target as HTMLImageElement
    // If it's the first image loading and view is default, set as base and fit
    if (!baseImageRef.value) {
        baseImageRef.value = img
        // Wait next tick for layout to stabilize if needed, but direct calc works
        handleFit()
    }
}

// Keyboard shortcuts
const handleKeydown = (e: KeyboardEvent) => {
  if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return
  const center = getCenterPoint()
  switch(e.key) {
    case '+': case '=': zoomToPoint(-1, center); break
    case '-': zoomToPoint(1, center); break
    case '0': case 'r': case 'R': reset(); break
  }
}

const getImageUrl = (path?: string) => {
    if (!path) return ''
    if (path.startsWith('http')) return path
    const baseUrl = (config.public.socketUrl as string).replace(/\/$/, '')
    const cleanPath = path.startsWith('/') ? path : `/${path}`
    return `${baseUrl}${cleanPath}`
}

// --- Lifecycle ---

onMounted(async () => {
    await setCurrentPlan(props.planId, props.projectId)
    window.addEventListener('keydown', handleKeydown)

    // Cargar versiones del mismo sheet para el comparador si el store no las tiene aún.
    // En modo guest se omite porque el plan de invitado no tiene historial de versiones accesible.
    if (!groups.value.length && props.projectId && !props.isGuestMode) {
      await fetchProjectPlans(props.projectId)
    }

    // Inicializar comparador con selección por defecto
    if (currentPlan.value) {
      initComparator(currentPlan.value)
    }

    // Cargar pines de la capa visible
    if (currentVisibleLayer.value) {
      await fetchPinsByLayer(currentVisibleLayer.value.id)
    }
})

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
})

const onUploadSuccess = () => {
    // El store ya se actualiza optimisticamente o via re-fetch, 
    // pero podemos forzar refresh si fuera necesario
}

// Watch para cargar pines cuando cambia la capa visible
watch(currentVisibleLayer, async (newLayer, oldLayer) => {
  if (newLayer && newLayer.id !== oldLayer?.id) {
    await fetchPinsByLayer(newLayer.id)
  }
}, { immediate: false })

// Re-inicializar comparador cuando cambia el plan activo (ej: navegar entre versiones)
watch(currentPlan, (newPlan) => {
  if (newPlan) {
    initComparator(newPlan)
    comparatorActive.value = false
  }
}, { immediate: false })
</script>