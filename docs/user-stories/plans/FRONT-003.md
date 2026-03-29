# Plan de Implementación: FRONT-003 (Gestión de Planos y Carga de Capas)

**Estado:** Pendiente
**User Story:** [US-003](../US-003-CargaPlanos.md)

## 1. Objetivo
Implementar la interfaz de usuario para la gestión administrativa de planos (Sheets) y la funcionalidad de carga de capas (Layers), incluyendo soporte avanzado para archivos PDF (selección de páginas).

## 2. Estrategia Técnica

### 2.1 Nueva Librería
Para cumplir el requisito de "Vista previa de todas las páginas del documento" antes de la subida, se añadirá **`pdfjs-dist`** al proyecto. Esto permitirá renderizar miniaturas del PDF en el cliente sin necesidad de subirlo primero.

### 2.2 Gestión de Estado (Pinia)
Se creará un nuevo store `stores/plans.ts` para manejar:
- Lista de planos del proyecto actual.
- Plano activo (seleccionado).
- Estado de las capas del plano activo.
- Lógica de "Optimistic UI" para la creación inmediata de capas mientras se suben.

## 3. Estructura de Archivos Propuesta

```text
apps/frontend/
├── types/
│   └── plan.ts                # Interfaces: Request, Plan, Layer, PlanStatus
├── stores/
│   └── plan.ts                # Store: actions (fetchPlans, createPlan, uploadLayer)
├── composables/
│   └── usePlans.ts            # Lógica reactiva y helpers
├── components/
│   └── plans/
│       ├── PlanList.vue       # Grid de planos (Project Dashboard)
│       ├── PlanCreateModal.vue # Formulario creación/versión
│       └── PlanViewer.vue     # Layout principal del visor
│   └── layers/
│       ├── LayerSidebar.vue   # Lista de capas y controles
│       ├── LayerUploadModal.vue # Dropzone y configuración
│       └── PdfPageSelector.vue # Preview de páginas PDF (Grid seleccionable)
├── pages/
│   └── dashboard/
│       └── project/
│           └── [id]/
│               └── plan/
│                   └── [planId].vue # Ruta para el detalle del plano
```

## 4. Fases de Implementación

### Fase 1: Configuración y Tipado
1.  Instalar `pdfjs-dist`.
2.  Definir interfaces en `types/plan.ts` alineadas con `BACK-003`.
3.  Implementar `stores/plans.ts` con skeleton de acciones.

### Fase 2: Listado y Creación de Planos (Dashboard)
1.  **Componente `PlanList.vue`**: Consumir `GET /projects/:id/plans`. Mostrar tarjetas agrupadas por Sheet.
2.  **Componente `PlanCreateModal.vue`**:
    -   Modo "Nuevo Sheet": Input texto.
    -   Modo "Nueva Versión": Select con sheets existentes.
    -   Validación local antes de `POST /projects/:id/plans`.

### Fase 3: Detalle de Plano (Viewer UI)
1.  Crear ruta `pages/dashboard/project/[id]/plan/[planId].vue`.
2.  LAYOUT del Visor:
    -   **Sidebar Izquierdo**: `LayerSidebar.vue` (Lista de capas).
    -   **Area Central**: Canvas/Stage (Placeholder por ahora).
3.  Conectar Sidebar con Store para listar capas del plano (`plan.layers`).

### Fase 4: Subida de Archivos y PDF (Core Feature)
1.  **Componente `LayerUploadModal.vue`**:
    -   Input File (accept pdf, png, jpg).
    -   Si es imagen: Mostrar preview simple.
    -   Si es PDF: Invocar `PdfPageSelector.vue`.
2.  **Componente `PdfPageSelector.vue`**:
    -   Usar `pdfjs-dist` para iterar páginas.
    -   Renderizar Canvas por cada página.
    -   Permitir selección múltiple.
3.  **Lógica de Subida**:
    -   Iterar selección.
    -   Para cada item: Llamar `POST /plans/:planId/layers` (BACK-004).
    -   Manejo de progreso y errores individuales.

### Fase 5: Testing e Integración
-   **Unit Tests**: Validar lógica de selección de páginas y store.
-   **Edge Cases**:
    -   Subida de archivo corrupto.
    -   Fallo parcial en subida múltiple (3 páginas ok, 1 error).
    -   Permisos (Viewer no ve botones de acción).

## 5. Preguntas Pendientes / Asunciones
-   **Asunción**: El backend maneja la conversión de PDF a imagen para servirla al frontend (Layer type BASE/OVERLAY). El frontend solo sube el file y el page number.
-   **Asunción**: No se requiere edición de imagen (rotar/crop) en esta fase.
