# Plan de Implementación: FRONT-005 - Visor Interactivo (Canvas)

Este documento detalla los pasos para implementar la funcionalidad de zoom y pan en el visor de planos, utilizando tecnologías nativas de Vue 3 y CSS Transforms.

## 1. Resumen de la Tarea
- **Objetivo**: Permitir navegación fluida (zoom & pan) sobre imágenes de planos.
- **Tecnología**: Nuxt 3 / Vue 3 Composition API, PDF / Imágenes renderizadas.
- **Enfoque**: `CSS Transform` para performance (GPU). `Pointer Events` para unificar mouse/touch. Composable `usePlanNavigation` para lógica reutilizable.
- **Componentes**:
    - `components/plans/PlanViewer.vue` (Contenedor y manejo de eventos)
    - `components/plans/PlanControls.vue` (UI Flotante)
    - `composables/usePlanNavigation.ts` (Lógica de negocio)

## 2. Pasos de Implementación

### Paso 1: Crear Composable `usePlanNavigation`
Extraeremos la lógica matemática compleja a un composable testearlo unitariamente.
**Archivo**: `apps/frontend/composables/usePlanNavigation.ts`
- **Estado**:
  - `scale`: number (Nivel de zoom, default 1)
  - `position`: { x: number, y: number } (Desplazamiento)
  - `origin`: { x: number, y: number } (Punto de origen del zoom)
  - `isDragging`: boolean
- **Métodos**:
  - `zoomIn(factor, centerPoint?)`: Aumenta escala.
  - `zoomOut(factor, centerPoint?)`: Disminuye escala.
  - `startDrag(startPoint)`: Inicia arrastre.
  - `onDrag(currentPoint)`: Calcula delta y actualiza posición con límites.
  - `stopDrag()`: Finaliza arrastre.
  - `resetView()`: Vuelve a escala 1 y posición 0,0.
  - `fitToScreen(containerDim, imageDim)`: Calcula escala inicial.

### Paso 2: Crear Componente `PlanControls`
UI Flotante tonta (dumb component) que emite eventos.
**Archivo**: `apps/frontend/components/plans/PlanControls.vue`
- Props: `zoomLevel` (para mostrar %)
- Emits: `zoom-in`, `zoom-out`, `reset`
- Estilos: Posición absoluta, bottom-right.

### Paso 3: Componente Principal `PlanViewer`
Orquestador que usa el composable y maneja los eventos del DOM.
**Archivo**: `apps/frontend/components/plans/PlanViewer.vue`
- **Template**:
  - Contenedor principal (`overflow: hidden`).
  - Capa de transformación (div que recibe `transform: translate(...) scale(...)`).
  - Imagen del plano.
  - `<PlanControls />` overlay.
- **Eventos DOM**:
  - `@wheel.prevent`: Llama a `zoomIn/Out` pasando coordenadas del cursor relativo al contenedor.
  - `@pointerdown`: Llama a `startDrag` y captura puntero.
  - `@pointermove`: Llama a `onDrag` si `isDragging`.
  - `@pointerup/cancel`: Llama a `stopDrag`.
  - `window "keydown"`: Shortcuts (+, -, 0, Flechas).

### Paso 4: Integración en Página
Integrar `PlanViewer` en la página de detalle de proyecto o dashboard donde corresponda.

## 3. Especificación de Código (Scaffolding)

### 3.1 `composables/usePlanNavigation.ts`
```typescript
// apps/frontend/composables/usePlanNavigation.ts
import { ref, computed } from 'vue'

interface Position { x: number; y: number }

export function usePlanNavigation() {
  const scale = ref(1)
  const position = ref<Position>({ x: 0, y: 0 })
  const isDragging = ref(false)
  const lastPointerPosition = ref<Position | null>(null)

  // Configuración
  const MIN_SCALE = 0.5
  const MAX_SCALE = 5
  const ZOOM_SENSITIVITY = 0.1

  const transformStyle = computed(() => ({
    transform: `translate(${position.value.x}px, ${position.value.y}px) scale(${scale.value})`,
    cursor: isDragging.value ? 'grabbing' : 'grab',
    transformOrigin: '0 0' // Importante para cálculos manuales
  }))

  const setScale = (newScale: number) => {
    scale.value = Math.min(Math.max(newScale, MIN_SCALE), MAX_SCALE)
  }

  // Zoom al punto específico (ex: cursor del mouse)
  const zoomToPoint = (delta: number, point: Position) => {
    const newScale = Math.min(Math.max(scale.value * (1 - delta * ZOOM_SENSITIVITY), MIN_SCALE), MAX_SCALE)
    const scaleRatio = newScale / scale.value

    // Calcular nueva posición para mantener el punto bajo el cursor quieto
    // x_new = point_x - (point_x - x_old) * scaleRatio
    position.value.x = point.x - (point.x - position.value.x) * scaleRatio
    position.value.y = point.y - (point.y - position.value.y) * scaleRatio
    
    scale.value = newScale
  }

  const startDrag = (point: Position) => {
    isDragging.value = true
    lastPointerPosition.value = point
  }

  const onDrag = (point: Position) => {
    if (!isDragging.value || !lastPointerPosition.value) return

    const dx = point.x - lastPointerPosition.value.x
    const dy = point.y - lastPointerPosition.value.y

    position.value.x += dx
    position.value.y += dy
    lastPointerPosition.value = point
  }

  const stopDrag = () => {
    isDragging.value = false
    lastPointerPosition.value = null
  }
  
  const reset = () => {
    scale.value = 1
    position.value = { x: 0, y: 0 }
  }

  return {
    scale,
    position,
    isDragging,
    transformStyle,
    zoomToPoint,
    startDrag,
    onDrag,
    stopDrag,
    reset
  }
}
```

### 3.2 `components/plans/PlanViewer.vue`
```vue
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { usePlanNavigation } from '@/composables/usePlanNavigation'

const props = defineProps<{
  imageUrl: string
}>()

const containerRef = ref<HTMLElement | null>(null)
const { 
  scale, 
  transformStyle, 
  zoomToPoint, 
  startDrag, 
  onDrag, 
  stopDrag, 
  reset 
} = usePlanNavigation()

// --- Event Handlers ---

const onWheel = (e: WheelEvent) => {
  if (!containerRef.value) return
  const rect = containerRef.value.getBoundingClientRect()
  const point = {
    x: e.clientX - rect.left, // Coordenada relativa al contenedor
    y: e.clientY - rect.top
  }
  // deltaY > 0 es zoom out, < 0 es zoom in. 
  // Normalizamos sign a +/- 1
  const delta = Math.sign(e.deltaY) 
  zoomToPoint(delta, point)
}

const onPointerDown = (e: PointerEvent) => {
  if (!containerRef.value) return
  // Captura el puntero para seguir recibiendo eventos fuera del div
  (e.target as Element).setPointerCapture(e.pointerId)
  startDrag({ x: e.clientX, y: e.clientY }) // Usamos Page/Client global para drag
}

const onPointerMove = (e: PointerEvent) => {
  onDrag({ x: e.clientX, y: e.clientY })
}

const onPointerUp = (e: PointerEvent) => {
  (e.target as Element).releasePointerCapture(e.pointerId)
  stopDrag()
}

// --- Keyboard Support ---
const handleKeydown = (e: KeyboardEvent) => {
  // Implementar +, -, 0
  if (e.key === '+' || e.key === '=') zoomToPoint(-1, { x: window.innerWidth/2, y: window.innerHeight/2 }) // Zoom center mockup
  if (e.key === '-') zoomToPoint(1, { x: window.innerWidth/2, y: window.innerHeight/2 })
  if (e.key === '0' || e.key.toLowerCase() === 'r') reset()
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => window.removeEventListener('keydown', handleKeydown))
</script>

<template>
  <div 
    ref="containerRef"
    class="plan-viewer-container w-full h-full overflow-hidden relative bg-gray-100 touch-none select-none"
    @wheel.prevent="onWheel"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
  >
    <div 
      class="plan-content origin-top-left will-change-transform"
      :style="transformStyle"
    >
      <img :src="imageUrl" alt="Plan" class="max-w-none pointer-events-none" draggable="false" />
    </div>

    <PlanControls 
      class="absolute bottom-5 right-5"
      :zoom-level="scale"
      @zoom-in="..." 
      @zoom-out="..." 
      @reset="reset"
    />
  </div>
</template>
```

## 4. Estrategia de Testing (Unit)
Crear tests para `usePlanNavigation` asegurando la lógica matemática.

**Archivo**: `apps/frontend/tests/unit/composables/usePlanNavigation.spec.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { usePlanNavigation } from '@/composables/usePlanNavigation'

describe('usePlanNavigation', () => {
    it('initializes with default values', () => {
        const { scale, position } = usePlanNavigation()
        expect(scale.value).toBe(1)
        expect(position.value).toEqual({ x: 0, y: 0 })
    })

    it('zooms in correctly', () => {
        const { scale, zoomToPoint } = usePlanNavigation()
        // Zoom in al punto 0,0
        zoomToPoint(-1, { x: 0, y: 0 }) // -1 delta normalmente es zoom in
        expect(scale.value).toBeGreaterThan(1)
    })
    
    it('drags correctly', () => {
        const { startDrag, onDrag, position } = usePlanNavigation()
        startDrag({ x: 0, y: 0 })
        onDrag({ x: 10, y: 10 })
        expect(position.value).toEqual({ x: 10, y: 10 })
    })

    it('resets correctly', () => {
        const { scale, position, zoomToPoint, reset } = usePlanNavigation()
        zoomToPoint(-1, { x: 0, y: 0 })
        reset()
        expect(scale.value).toBe(1)
        expect(position.value).toEqual({ x: 0, y: 0 })
    })
})
```

## 5. Criterios de Validación Final
- [x] Ejecutar `npm run test` para validar lógica.
- [x] Verificar que el scroll de la página no se active al hacer zoom (uso de `.prevent`).
- [x] Verificar funcionamiento en simulación móvil (touch events a través de pointer events).
