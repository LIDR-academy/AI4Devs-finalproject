# FRONT-008: Implementación del Comparador de Opacidad (Layer Comparator)

**Ticket asociado:** US-007 — Comparación de Capas (Slider de Opacidad)  
**Tipo:** Frontend Feature & UX  
**Estimación:** 5 pts  
**Dependencias:** US-004 (PlanViewer base), BACK-009 (ya implementado ✅)

---

## 1. Contexto y estado previo

### 1.1 BACK-009: Ya implementado ✅

El repositorio `PrismaPlanRepository.findByProject` ya incluye `layers` en la consulta Prisma y los mapea correctamente a entidades. El endpoint `GET /projects/:projectId/plans` **ya devuelve** las capas por plan. No se requiere ningún cambio en backend.

### 1.2 Estado actual del frontend

| Artefacto | Ruta | Relevancia |
|---|---|---|
| `PlanViewer.vue` | `components/plans/PlanViewer.vue` | Componente principal a modificar |
| `usePlanNavigation.ts` | `composables/usePlanNavigation.ts` | Zoom/pan compartido — no tocar |
| `usePlans.ts` + `plans store` | `composables/usePlans.ts` / `stores/plans.ts` | API calls existentes: `fetchProjectPlans` devuelve `PlanGroup[]` con layers |
| `PlanControls.vue` | `components/plans/PlanControls.vue` | Referencia de estilo para panel flotante |
| `types/plan.ts` | `types/plan.ts` | Tipos `Plan`, `Layer`, `PlanGroup` ya definidos |

### 1.3 Flujo de datos clave

```
Store: groups (PlanGroup[])
  └── PlanGroup { sheetName, latestVersion, plans: Plan[] }
        └── Plan { id, version, layers: Layer[] }
              └── Layer { id, type: 'BASE'|'OVERLAY', imageUrl, status }
```

El comparador opera sobre **dos planes del mismo sheet** (versiones distintas de `PlanGroup.plans`), mostrando la `imageUrl` de la capa `BASE` de cada uno.

---

## 2. Arquitectura de la solución

### 2.1 Diagrama de componentes

```
PlanViewer.vue
├── [existente] LayerSidebar
├── [existente] Toolbar
├── Canvas Container
│   ├── [MODIFICADO] div.plan-content  ← wrapper único para zoom/pan compartido
│   │   ├── [NUEVO] img.base-layer     ← imagen del plan "Base" (z-index: 0)
│   │   └── [NUEVO] img.proposal-layer ← imagen del plan "Propuesta" (z-index: 1, opacity dinámica)
│   ├── [existente] PinMarker(s)
│   ├── [existente] PlanControls (bottom-right)
│   └── [NUEVO] LayerComparatorControls (bottom-center) ← v-if="comparatorEnabled"
├── [existente] LayerUploadModal
├── [existente] CreatePinModal
└── [existente] CommentsDrawer

[NUEVO] composables/useLayerComparator.ts
[NUEVO] components/layers/LayerComparatorControls.vue
[NUEVO] tests/unit/composables/useLayerComparator.spec.ts
[NUEVO] tests/unit/components/layers/LayerComparatorControls.spec.ts
```

### 2.2 Decisiones de diseño

| Decisión | Razonamiento |
|---|---|
| Composable `useLayerComparator` independiente | Separa la lógica del comparador del componente visual, permite testing aislado |
| Imágenes compartiendo el mismo `plan-content` wrapper | Garantiza sincronización total de zoom/pan sin lógica extra (criterio: "ambas imágenes mantienen el mismo nivel de zoom") |
| Opacidad por CSS `opacity` en img de propuesta | Performance nativa, sin re-renders, respuesta inmediata al drag del slider |
| Dropdowns con planes del store (no fetch extra) | Los datos ya existen en `store.groups` tras `fetchProjectPlans` |
| `LayerComparatorControls` con `v-if="comparatorEnabled"` en PlanViewer | Oculta el panel si hay < 2 versiones disponibles (criterio edge case) |

---

## 3. Pasos de implementación

---

### Paso 1: Crear composable `useLayerComparator.ts`

**Archivo:** `apps/frontend/composables/useLayerComparator.ts`

**Propósito:** Centralizar la lógica reactiva del comparador: gestión de opacidad, selección de planes y derivación de imágenes a mostrar.

**Responsabilidades:**
- Exponer `opacity` (ref `number`, rango 0–1, default `0.5`)
- Exponer `isBlinking` (ref `boolean`) para el botón blink
- Exponer `basePlanId` y `proposalPlanId` (ref `string | null`)
- Computed `comparatorPlans`: filtra `store.groups` para encontrar el grupo del `currentPlan`, extrae sus planes ordenados por versión descendente
- Computed `comparatorEnabled`: `true` si `comparatorPlans.length >= 2`
- Computed `baseImageUrl` y `proposalImageUrl`: la `imageUrl` de la primera capa `BASE` con `status === 'READY'` del plan correspondiente
- Función `initComparator(currentPlan)`: asigna valores por defecto — `proposalPlanId = currentPlan.id`, `basePlanId = plan con version inmediatamente anterior`
- Función `toggleBlink()`: alterna `opacity` entre `0` y `1` (si estaba en 0, va a 1; en cualquier otro valor, va a 0)

**Interfaz pública:**

```typescript
export function useLayerComparator() {
  return {
    opacity,            // Ref<number> 0-1
    basePlanId,         // Ref<string | null>
    proposalPlanId,     // Ref<string | null>
    comparatorPlans,    // ComputedRef<Plan[]>  — versiones del mismo sheet ordenadas desc
    comparatorEnabled,  // ComputedRef<boolean> — true si >= 2 planes
    baseImageUrl,       // ComputedRef<string>
    proposalImageUrl,   // ComputedRef<string>
    initComparator,     // (currentPlan: Plan) => void
    toggleBlink,        // () => void
  }
}
```

**Notas de implementación:**
- Usar `storeToRefs(usePlansStore())` para acceder a `groups` y `currentPlan` reactivamente
- El helper `getImageUrl` para resolver URLs relativas debe replicarse o importarse (mismo patrón que en `PlanViewer`: `config.public.socketUrl + path`)
- El composable no hace fetch propio; depende de que el store ya tenga `groups` cargados

---

### Paso 2: Crear componente `LayerComparatorControls.vue`

**Archivo:** `apps/frontend/components/layers/LayerComparatorControls.vue`

**Propósito:** Panel flotante inferior-central con slider de opacidad, dropdowns de versión y botón blink.

#### 2.1 Template (estructura)

```
div.fixed.bottom-4.left-1/2.-translate-x-1/2  ← posicionamiento absoluto
  └── div.bg-white/90.backdrop-blur-sm.rounded-xl.shadow-lg.px-4.py-3  ← panel
        ├── [IZQUIERDA] select.base  ← dropdown versión Base
        ├── [CENTRO]
        │   ├── label "Base" ← extremo izquierdo del slider
        │   ├── input[type=range] 0-100 ← slider principal
        │   ├── label "Propuesta" ← extremo derecho del slider
        │   └── button "⚡ Blink" ← botón alternancia rápida
        └── [DERECHA] select.proposal ← dropdown versión Propuesta
```

#### 2.2 Props

```typescript
interface Props {
  opacity: number           // 0-1 (v-model)
  basePlanId: string | null
  proposalPlanId: string | null
  plans: Plan[]             // lista de versiones disponibles para los dropdowns
}
```

#### 2.3 Emits

```typescript
emit('update:opacity', value: number)
emit('update:basePlanId', id: string)
emit('update:proposalPlanId', id: string)
emit('blink')
```

#### 2.4 Internals

- El `input[type=range]` trabaja en rango `0`–`100` (enteros) para mejor UX del slider nativo HTML; convierte a `0-1` al emitir: `emit('update:opacity', value / 100)`
- El `sliderValue` local es un `computed` con `get/set` para la conversión
- Marca visual en `50%` (tick central) con un pseudo-elemento CSS o un `datalist` con `<option value="50">`
- Cada `<option>` de los dropdowns muestra: `v{{ plan.version }} — {{ formatDate(plan.createdAt) }}`
- El botón blink tiene icono ⚡ y texto "Alternar"; aplica clase activa `bg-accent text-white` cuando el blur-mode está en extremo
- Aplicar `transition-opacity duration-150` al panel completo para entrada suave

#### 2.5 Estilo (consistencia con el proyecto)

| Token | Valor | Uso |
|---|---|---|
| `bg-white/90 backdrop-blur-sm` | Panel glassmorphism | Igual que `PlanControls.vue` |
| `rounded-xl shadow-lg` | Bordes y sombra | Consistente con modales |
| `text-primary` | `#3b82f6` | Labels activos |
| `accent` | `#f59e0b` | Botón blink activo |
| `text-xs text-gray-500` | Labels secundarios | Versiones en dropdown |

**Posicionamiento en PlanViewer (en el Canvas Container):**

```html
<!-- Dentro del div.Canvas Container, al mismo nivel que PlanControls -->
<div class="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
  <LayerComparatorControls
    v-if="comparatorEnabled"
    v-model:opacity="opacity"
    v-model:base-plan-id="basePlanId"
    v-model:proposal-plan-id="proposalPlanId"
    :plans="comparatorPlans"
    @blink="toggleBlink"
  />
</div>
```

---

### Paso 3: Modificar `PlanViewer.vue`

Este es el núcleo del cambio. Se realizan modificaciones quirúrgicas para no romper la funcionalidad existente.

#### 3.1 Imports y setup

Añadir al bloque `<script setup>`:

```typescript
import LayerComparatorControls from '@/components/layers/LayerComparatorControls.vue'

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
```

#### 3.2 Modificar la sección de renderizado de imágenes

**Antes** (renderizaba todas las capas de `currentPlan` en un `<template v-for>`):

```html
<template v-for="layer in currentPlan?.layers?.filter(...)">
  <img :src="getImageUrl(layer.imageUrl)" ... />
</template>
```

**Después** (lógica condicional: modo comparador vs modo normal):

```html
<div class="relative" :style="containerDimensions">
  <!-- Modo Comparador: 2 imágenes con opacity control -->
  <template v-if="comparatorEnabled">
    <!-- Imagen Base (fija, z-0) -->
    <img
      v-if="baseImageUrl"
      :src="baseImageUrl"
      class="max-w-none pointer-events-none absolute top-0 left-0"
      draggable="false"
      @load="onImageLoad"
    />
    <!-- Imagen Propuesta (encima, opacity dinámica, z-10) -->
    <img
      v-if="proposalImageUrl"
      :src="proposalImageUrl"
      class="max-w-none pointer-events-none absolute top-0 left-0 z-10 transition-opacity duration-75"
      draggable="false"
      :style="{ opacity: opacity }"
    />
  </template>

  <!-- Modo Normal: renderiza todas las capas READY (comportamiento original) -->
  <template v-else>
    <template
      v-for="layer in currentPlan?.layers?.filter((l: any) => l.status === 'READY')"
      :key="layer.id"
    >
      <img
        :src="getImageUrl(layer.imageUrl)"
        class="max-w-none pointer-events-none absolute top-0 left-0"
        draggable="false"
        @load="onImageLoad"
      />
    </template>
  </template>

  <!-- Renderizado de Pines (siempre visible) -->
  <PinMarker v-for="pin in visiblePins" ... />
</div>
```

**Nota sobre z-index y pines:** los `PinMarker` deben tener `z-index` superior a la imagen propuesta. Verificar que `PinMarker.vue` usa `z-20` o superior.

#### 3.3 Añadir el panel comparador al template

Dentro del `<!-- Canvas Container -->`, justo antes del cierre del `div`:

```html
<!-- Comparador de Capas (bottom-center) -->
<div class="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
  <LayerComparatorControls
    v-if="comparatorEnabled"
    v-model:opacity="opacity"
    v-model:base-plan-id="basePlanId"
    v-model:proposal-plan-id="proposalPlanId"
    :plans="comparatorPlans"
    @blink="toggleBlink"
  />
</div>
```

#### 3.4 Inicializar el comparador en `onMounted`

En el hook `onMounted`, tras cargar el plan, inicializar el comparador:

```typescript
onMounted(async () => {
  await setCurrentPlan(props.planId, props.projectId)
  // Cargar lista de versiones del mismo sheet si no están en el store
  if (props.projectId) {
    await fetchProjectPlans(props.projectId)
  }
  // Inicializar comparador con valores por defecto
  if (currentPlan.value) {
    initComparator(currentPlan.value)
  }
  // ... resto del código existente
})
```

**Nota:** `fetchProjectPlans` ya existe en `usePlans`; sólo se llama si `groups` está vacío para evitar fetch redundante. Añadir guardia: `if (!groups.value.length && props.projectId)`.

#### 3.5 Watch para re-inicialización

```typescript
// Re-inicializar comparador si cambia el plan activo
watch(currentPlan, (newPlan) => {
  if (newPlan) initComparator(newPlan)
}, { immediate: false })
```

#### 3.6 Sincronización de z-index (checklist)

| Elemento | z-index | Notas |
|---|---|---|
| Canvas fondo | `z-0` | |
| Imagen Base | `z-0` | Default |
| Imagen Propuesta | `z-10` | Con `style.opacity` |
| PinMarker | `z-20` | Verificar en `PinMarker.vue` |
| LayerComparatorControls | `z-10` (wrapper abs) | |
| PlanControls (zoom) | `z-10` | Sin conflicto (bottom-right) |
| PinList | Verificar | Ya existente |

---

### Paso 4: Unit Tests

#### 4.1 `tests/unit/composables/useLayerComparator.spec.ts`

**Suite y casos:**

```typescript
describe('useLayerComparator', () => {
  // Setup: mock usePlansStore con grupos de prueba
  
  describe('initComparator', () => {
    it('asigna proposalPlanId al plan actual')
    it('asigna basePlanId al plan con la versión anterior')
    it('no asigna basePlanId si solo hay 1 versión en el grupo')
  })

  describe('comparatorEnabled', () => {
    it('devuelve true si el grupo tiene >= 2 planes')
    it('devuelve false si el grupo tiene 1 plan')
    it('devuelve false si currentPlan es null')
  })

  describe('baseImageUrl / proposalImageUrl', () => {
    it('devuelve la imageUrl de la capa BASE con status READY del plan base')
    it('devuelve string vacío si la capa BASE del plan base no está READY')
    it('devuelve la imageUrl de la capa BASE con status READY del plan propuesta')
  })

  describe('toggleBlink', () => {
    it('cambia opacity de 0.5 a 0 en la primera llamada')
    it('cambia opacity de 0 a 1 en la segunda llamada')
    it('cambia opacity de 1 a 0 en la tercera llamada')
  })

  describe('opacity', () => {
    it('tiene valor inicial de 0.5')
    it('puede actualizarse directamente')
  })
})
```

**Patrón de mock del store (consistente con el proyecto):**

```typescript
import { setActivePinia, createPinia } from 'pinia'
import { usePlansStore } from '~/stores/plans'

beforeEach(() => {
  setActivePinia(createPinia())
  const store = usePlansStore()
  store.groups = [mockPlanGroup]      // ← inyectar datos de prueba
  store.currentPlan = mockCurrentPlan
})
```

#### 4.2 `tests/unit/components/layers/LayerComparatorControls.spec.ts`

**Suite y casos:**

```typescript
describe('LayerComparatorControls', () => {
  const defaultProps = {
    opacity: 0.5,
    basePlanId: 'plan-1',
    proposalPlanId: 'plan-2',
    plans: [mockPlanV2, mockPlanV1],   // ordenados desc
  }

  describe('renderizado', () => {
    it('renderiza el slider con valor 50 cuando opacity es 0.5')
    it('renderiza los dropdowns con los planes como opciones')
    it('muestra las versiones en formato "v{n} — {fecha}"')
    it('renderiza el botón de alternancia rápida (blink)')
    it('renderiza labels "Base" y "Propuesta" en extremos del slider')
  })

  describe('slider', () => {
    it('emite update:opacity con valor 0–1 al cambiar el slider')
    it('convierte el valor del slider (0–100) a rango 0–1 al emitir')
    it('slider muestra valor 0 cuando opacity prop es 0')
    it('slider muestra valor 100 cuando opacity prop es 1')
  })

  describe('dropdowns', () => {
    it('emite update:basePlanId con el id seleccionado')
    it('emite update:proposalPlanId con el id seleccionado')
    it('el dropdown base tiene seleccionado basePlanId inicial')
    it('el dropdown propuesta tiene seleccionado proposalPlanId inicial')
  })

  describe('botón blink', () => {
    it('emite evento blink al hacer click')
  })

  describe('accesibilidad', () => {
    it('el slider tiene aria-label descriptivo')
    it('los dropdowns tienen label asociado')
  })
})
```

**Patrón de datos de prueba:**

```typescript
const mockPlanV2: Plan = {
  id: 'plan-2', projectId: 'proj-1', sheetName: 'Planta Baja',
  version: 2, status: 'ACTIVE', createdAt: '2026-02-01T00:00:00Z',
  updatedAt: '2026-02-01T00:00:00Z',
  layers: [{ id: 'l2', planId: 'plan-2', name: 'Base', type: 'BASE',
             status: 'READY', imageUrl: '/uploads/layer2.png',
             createdAt: '2026-02-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z' }]
}

const mockPlanV1: Plan = {
  id: 'plan-1', projectId: 'proj-1', sheetName: 'Planta Baja',
  version: 1, status: 'ACTIVE', createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  layers: [{ id: 'l1', planId: 'plan-1', name: 'Base', type: 'BASE',
             status: 'READY', imageUrl: '/uploads/layer1.png',
             createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' }]
}
```

---

## 4. Orden de ejecución recomendado

```
1. useLayerComparator.ts          ← lógica pura, sin dependencias de UI
2. useLayerComparator.spec.ts     ← TDD: valida el composable
3. LayerComparatorControls.vue    ← componente visual
4. LayerComparatorControls.spec.ts ← tests del componente
5. PlanViewer.vue (modificación)  ← integración final
6. Validación manual              ← según guía de validación
```

---

## 5. Criterios de aceptación — Mapa de cobertura

| Criterio (US-007) | Cómo se cumple |
|---|---|
| Ambas imágenes superpuestas y alineadas al abrir el visor | Comparten el mismo `div.plan-content` con `transformStyle` |
| Mismo zoom y posición en navegación (paneo) | `usePlanNavigation` aplica a todo el wrapper, no por imagen |
| Slider varía transparencia instantáneamente | CSS `opacity` reactivo, sin debounce |
| Panel oculto con < 2 versiones | `v-if="comparatorEnabled"` (computed `plans.length >= 2`) |
| Botón blink alterna entre 0% y 100% | `toggleBlink()` en composable |
| Dropdowns para cambiar Base y Propuesta | Dos `<select>` enlazados a `basePlanId`/`proposalPlanId` |
| Autoselección de versión más reciente como Propuesta | `initComparator`: `proposalPlanId = currentPlan.id` |
| Autoselección de versión anterior como Base | `initComparator`: `basePlanId = plans[1].id` (n-1) |
| Posición `bottom-4 left-1/2 -translate-x-1/2` | Posicionamiento absoluto del wrapper del panel |

---

## 6. Guía de validación

### 6.1 Setup previo

```bash
# Terminal 1: backend
cd apps/backend && npm run dev

# Terminal 2: worker (para procesado de capas)
cd apps/worker && npm run dev

# Terminal 3: frontend
cd apps/frontend && npm run dev
```

Asegurarse de tener al menos un proyecto con **al menos 2 versiones** del mismo sheet (subir la misma hoja arquitectónica dos veces para crear v1 y v2).

### 6.2 Validación de escenarios Gherkin

#### Escenario 1: Carga y sincronización geométrica

1. Navegar a un plan con ≥ 2 versiones: `http://localhost:3000/dashboard/project/{id}/plan/{planId}`
2. ✅ **Verificar:** El panel comparador aparece en el centro-inferior del visor
3. Hacer scroll con el ratón (zoom)
4. ✅ **Verificar:** Ambas imágenes se escalan juntas sin desalineación
5. Hacer clic y arrastrar (paneo)
6. ✅ **Verificar:** Ambas imágenes se mueven en perfecta sincronía

#### Escenario 2: Slider de opacidad

1. Con el panel comparador visible, arrastrar el slider completamente a la izquierda (0%)
2. ✅ **Verificar:** La imagen "Propuesta" desaparece por completo, se ve solo la "Base"
3. Arrastrar el slider al centro (50%)
4. ✅ **Verificar:** Imagen semitransparente; ambas versiones visibles
5. Arrastrar a la derecha (100%)
6. ✅ **Verificar:** Solo visible la imagen "Propuesta"
7. ✅ **Verificar:** No hay lag al arrastrar el slider (respuesta inmediata)

#### Escenario 3: Edge case — solo 1 versión

1. Navegar a un plan con solo 1 versión del sheet
2. ✅ **Verificar:** El panel comparador NO aparece en el visor
3. ✅ **Verificar:** El visor funciona con normalidad (capas, pines, zoom)

#### Escenario 4: Botón Blink

1. Con el panel comparador visible y slider en cualquier posición
2. Hacer clic en el botón "⚡ Alternar"
3. ✅ **Verificar:** La opacidad salta instantáneamente a 0% o 100%
4. Hacer clic de nuevo
5. ✅ **Verificar:** La opacidad salta al estado opuesto

#### Escenario 5: Dropdowns de versión

1. Abrir el dropdown izquierdo ("Base")
2. ✅ **Verificar:** Se listan todas las versiones disponibles del mismo sheet
3. Seleccionar una versión diferente
4. ✅ **Verificar:** La imagen base cambia inmediatamente en el visor
5. Repetir para el dropdown derecho ("Propuesta")

#### Escenario 6: Compatibilidad con pines (regresión)

1. Activar modo comparador (slider visible)
2. Activar modo pin (botón "+ Añadir Pin")
3. ✅ **Verificar:** Los pines existentes son visibles sobre las imágenes comparadas
4. ✅ **Verificar:** Se pueden crear nuevos pines normalmente

#### Escenario 7: Modo Guest

1. Acceder con enlace de invitado a un proyecto con ≥ 2 versiones
2. ✅ **Verificar:** El panel comparador es visible y funcional
3. ✅ **Verificar:** Los dropdowns y slider funcionan igual que en modo autenticado

### 6.3 Validación de tests unitarios

```bash
cd apps/frontend

# Ejecutar tests del comparador
npx vitest run tests/unit/composables/useLayerComparator.spec.ts
npx vitest run tests/unit/components/layers/LayerComparatorControls.spec.ts

# Suite completa (regresión)
npx vitest run
```

✅ **Criterio:** 0 tests en rojo, cobertura de los casos descritos en Paso 4.

### 6.4 Checklist de revisión de código

- [ ] `LayerComparatorControls.vue` no supera 150 líneas de template
- [ ] El composable `useLayerComparator` no tiene referencias al DOM
- [ ] `PlanViewer.vue` sigue funcionando sin el comparador (1 sola versión)
- [ ] No se introducen llamadas extra a la API (se usa el store existente)
- [ ] La opacidad usa `transition-opacity duration-75` para suavidad sin lag
- [ ] Los dropdowns muestran label legible (versión + fecha formateada)
- [ ] El slider tiene `aria-label="Comparador de opacidad"`
- [ ] El z-index del panel no bloquea el acceso a los controles de zoom (`PlanControls`)
- [ ] El componente no renderiza nada si `comparatorEnabled === false`
- [ ] Tests pasan en CI (`npx vitest run`)
