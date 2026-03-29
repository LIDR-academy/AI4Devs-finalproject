# Plan de Implementación: BACK-004 (Subida de Capas)

**Estado:** Completado

## Objetivo
Gestionar la subida segura de archivos y la delegación asíncrona de trabajo al Worker.

## Arquitectura y Estructura

### Fase 1: Setup y Test (RED)
*   **Archivo:** `apps/backend/tests/integration/layers.spec.ts`
*   **Pruebas:**
    *   `POST /plans/:planId/layers`: 202 Accepted (Sube PDF, crea Layer en 'PROCESSING' y devuelve ID).
    *   Validar rechazo de archivos que no sean PDF/PNG/JPG.

### Fase 2: Capa Kernel (Core Domain)
*   **Ubicación:** `packages/core/src/domain/layers`
*   **Entidad:** `Layer` (id, status, type, originalFileUrl).
*   **Interfaces:** `IFileStorage` (upload), `IJobQueue` (add).
*   **Eventos/DTOs:** `LayerProcessingJob` (payload: `{ layerId, fileUrl, pageNumber }`).

### Fase 3: Infraestructura
*   **Storage:** `S3FileStorage` (Usa `@aws-sdk/client-s3` o fs local para dev).
*   **Queue:** `BullMqProducer` (Encola jobs en `layer-processing`).
*   **Upload Middleware:** Configurar `multer` para recibir `multipart/form-data` y volcar a temporal.

### Fase 4: Aplicación
*   **Caso de Uso:** `UploadLayerUseCase`.
    1.  Valida extensión y tamaño.
    2.  Sube archivo a Storage (Bucket "raw").
    3.  Crea registro `Layer` en BD estatus `PROCESSING`.
    4.  Publica evento/job en la cola.
