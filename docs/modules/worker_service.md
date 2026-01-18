# Módulo Worker Service: Especificación Técnica (DDD & Hexagonal)

## 1. Enfoque Arquitectónico
El Worker Service no es solo un script de ejecución. En esta arquitectura DDD, actúa como una **Capa de Infraestructura (Driving Adapter)** diferente a la API.
Su función es consumir eventos de dominio o comandos (via BullMQ) y ejecutar **Casos de Uso** del Dominio de `FileProcessing`, reutilizando el núcleo compartido (`packages/core`) para mantener la consistencia de las reglas de negocio.

## 2. Responsabilidad en el Contexto de Dominio
El Worker opera principalmente sobre el Bounded Context de **FileProcessing**, pero interactúa con:
1.  **Collaboration Context:** Actualiza el estado de las Entidades `Plan` una vez procesadas.
2.  **Notification Context:** Genera eventos de `ProcessingCompleted` que eventualmente notifican al usuario.

## 3. Stack Tecnológico
-   **Runtime:** Node.js (TypeScript)
-   **Queue Consumer:** BullMQ (Redis) - Actúa como el "Controller" de este servicio.
-   **Image Processing (Infrastructure Adapters):**
    -   `Sharp` (Optimización y recorte de imágenes).
    -   `Ghostscript` / `PDF-Poppler` (Rasterización de vectores).
-   **Storage:** AWS SDK (S3 / MinIO).

## 4. Estructura de Directorios (Monorepo Strategy)

El Worker consume la lógica definida en el paquete Core, implementando solo los adaptadores específicos para procesamiento de imágenes que la API no requiere.

```bash
/
├── apps/
│   └── worker-service/         # APLICACIÓN WORKER (Consumer)
│       ├── src/
│       │   ├── processors/     # "Controllers" de Colas
│       │   │   └── PlanProcessingJob.ts # Recibe el Job y llama al UseCase
│       │   │
│       │   ├── infrastructure/ # Secondary Adapters Específicos del Worker
│       │   │   ├── adapters/
│       │   │   │   ├── GhostscriptPdfConverter.ts  # Implementa IPdfConverter (del Core)
│       │   │   │   └── SharpImageOptimizer.ts      # Implementa IImageOptimizer (del Core)
│       │   │   └── persistence/
│       │   │       └── PrismaPlanRepository.ts     # Acceso a BD (Reutilizado o extendido)
│       │   │
│       │   ├── index.ts        # Inicialización de Colas y Workers
│       │   └── config.ts       # Configuración de Concurrencia (ej. 5 threads)
│       └── package.json        # Dependencia: "@trace/core"
```

## 5. Diseño de Interacción (Flujo DDD)

### 5.1 Definición del Trabajo (En Core)
En `packages/core/.../FileProcessing/Application/` existe un Caso de Uso: `ProcessPlanUseCase`.
Este caso de uso define el algoritmo abstracto:
1.  Obtener archivo.
2.  Convertir a PNG de alta resolución.
3.  Generar tiles/thumbnails.
4.  Subir optimizados.
5.  Actualizar Entidad `Plan`.

### 5.2 Inversión de Dependencias
El `Use Case` en el Core necesita convertir archivos, pero no debe depender de `sharp` o `ghostscript` directamente. Define interfaces (Puertos):
-   `IPdfConverter`
-   `IImageOptimizer`
-   `IStorageService`

El **Worker Service** implementa estas interfaces en su capa de infraestructura (`GhostscriptPdfConverter`) e inyecta estas implementaciones concretas al ejecutar el Caso de Uso.

### 5.3 Flujo de Ejecución (Pipeline)
1.  **Trigger:** BullMQ recibe un mensajejob `plan-processing`.
2.  **Adaptador (Processor):** `PlanProcessingJob.ts` extrae el `planId` y el `fileKey`.
3.  **Bootstrapping:** Se instancia `ProcessPlanUseCase` inyectándole los adaptadores reales (`S3Storage`, `Ghostscript`, `PrismaRepo`).
4.  **Ejecución:** El Caso de Uso orquesta el dominio.
5.  **Resultado:** Si falla, el Worker maneja el reintento (backoff) o marca el Job como fallido (Dead Letter Queue).

## 6. Escalabilidad
-   Este servicio es **Sateless**.
-   Al estar desacoplado de la API HTTP, se pueden desplegar N réplicas del contenedor Worker para aumentar el throughput de conversión de imágenes sin afectar la latencia de la web.
-   Uso de **Sandboxed Processors** en BullMQ para aislar fallos de segmentación (segfaults) en las librerías nativas de C++ (sharp/ghostscript).
