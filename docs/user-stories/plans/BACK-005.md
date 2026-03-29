# Plan de Implementación - BACK-005: Infraestructura de Eventos Real-time

Este plan detalla los pasos para desacoplar la lógica del Worker de la del Socket, utilizando Redis como bus de comunicación para notificar al usuario cuando su capa ha sido procesada.

## 📋 Fase 1: Datos y Contexto (Core & Shared)
El objetivo es que la "identidad" del usuario viaje junto con el trabajo de procesamiento a través de la cola.

1.  **Actualizar DTOs y Interfaces**:
    - [x] Modificar `@trace/core/src/domain/jobs/layer-processing.job.ts`: Añadir `userId: string` a la interfaz `LayerProcessingJob`.
    - [x] Modificar `apps/backend/src/domain/dtos/upload-layer.dto.ts`: Añadir `userId: string`.

2.  **Propagar UserId desde el Controller**:
    - [x] En `LayerController`, extraer `req.user.id` (inyectado por el middleware de auth).
    - [x] Pasarlo al llamar a `uploadLayerUseCase.execute(...)`.
    - [x] Actualizar `UploadLayerUseCase` para incluir `userId` al añadir el job a la cola (`jobQueue.add`).

## 🛠️ Fase 2: Infraestructura WebSocket (Backend)
Crearemos un módulo centralizado para gestionar las conexiones y las salas privadas.

1.  **Crear `SocketService`**:
    - [x] Ubicación: `apps/backend/src/infrastructure/websocket/socket.service.ts`.
    - [x] Responsabilidad: Singleton que inicializa `io`, gestiona `on('connection')` y expone métodos como `notifyUser(userId, event, payload)`.
    - [x] Lógica de Rooms: Al conectarse, el socket hace `socket.join("user:${userId}")`.

2.  **Middleware de Autenticación para Socket**:
    - [x] Implementar validación de JWT en `socket.handshake.auth.token`.

3.  **Refactorizar `server.ts`**:
    - [x] Eliminar la configuración inline actual de Socket.io.
    - [x] Inicializar `SocketService` pasando la instancia `httpServer`.

## 🔄 Fase 3: Worker y Eventos (BullMQ)
El worker necesita devolver información útil, y el backend necesita escucharla.

1.  **Actualizar `LayerProcessor` (Worker)**:
    - [x] Cambiar el método `process` para que retorne un objeto de resultado: `{ status: 'READY', layerId, planId, imageUrl }`. Esto será el `returnvalue` del job en Redis.

2.  **Implementar el "Redis Bridge" (Backend)**:
    - [x] Crear `apps/backend/src/infrastructure/events/job-event.listener.ts`.
    - [x] Instanciar `QueueEvents` de `bullmq` apuntando a la cola `layer-processing`.
    - [x] Escuchar evento `completed`:
        - Leer `jobId`.
        - Obtener instancia del job (`Job.fromId`) para recuperar `job.data.userId`.
        - Emitir evento `layer:processed` vía `SocketService`.
    - [x] Escuchar evento `failed`:
        - Emitir `layer:error` con la razón del fallo.
