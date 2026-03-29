# Plan de Implementación: WORKER-001 (Procesamiento de Planos)

**Estado:** Pendiente

## Objetivo
Consumir tareas de transformación de imágenes sin bloquear el servidor principal, implementando adaptadores para herramientas de procesamiento gráfico.

## Arquitectura y Estructura

### Fase 1: Arquitectura del Worker (Infra Driving)
*   **Entry Point:** `apps/worker/src/index.ts` inicializa el `Worker` de BullMQ consumiendo la cola `layer-processing`.
*   **Procesador:** `LayerProcessor.ts` recibe el job y orquesta la conversión.

### Fase 2: Capa Kernel (Interfaces de Procesamiento)
*   **Ubicación:** `packages/core/src/domain/processing`
*   Definir interfaces agnósticas:
    *   `IImageProcessor`: `resize(buffer, w, h)`, `toFormat(buffer, fmt)`.
    *   `IPdfProcessor`: `extractPage(path, pageNum) -> Buffer`.

### Fase 3: Infraestructura (Adaptadores)
*   **Implementación PDF:** Adaptador usando `ghostscript` o `pdf-lib` para rasterizar vectores.
*   **Implementación Imagen:** Adaptador `SharpImageProcessor`.
*   **Repositorio Workers:** `PrismaLayerRepository` (reutilizable del backend o dedicado).

### Fase 4: Lógica de Ejecución
*   **Flujo del Job:**
    1.  Descarga archivo "raw" desde Storage (usando `IFileStorage`).
    2.  Detecta tipo MIME.
    3.  Si es PDF → Extrae página y rasteriza a Alta Resolución.
    4.  Si es Imagen → Optimiza y genera thumbnail.
    5.  Sube resultado "optimizado" a Storage.
    6.  Actualiza `Layer` en BD: `status = READY`, `imageUrl = nuevoUrl`.
    7.  (Opcional) Emite evento por socket para notificar al frontend.

### Notas Técnicas
*   **Testing:** Unit tests para los adaptadores de imagen (mockeando fs/S3).
*   **Dependencias:** Asegurar que `sharp` y `ghostscript` estén disponibles en el entorno del Worker (Docker).
