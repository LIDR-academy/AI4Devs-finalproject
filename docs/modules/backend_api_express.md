# Módulo Backend API: Especificación Técnica (DDD & Hexagonal)

## 1. Enfoque Arquitectónico
Este módulo implementa una **Arquitectura Hexagonal (Ports & Adapters)** estructurada bajo los principios de **DDD (Domain-Driven Design)**. 
Se prioriza la independencia del framework y la separación de responsabilidades en capas concéntricas, donde el Dominio ocupa el centro y la Infraestructura (Express, Prisma, Redis) actúa como detalles de implementación en los bordes externales.

## 2. Definición de Bounded Contexts (Contextos Delimitados)
El sistema se divide en contextos lógicos para desacoplar responsabilidades. En esta implementación Monorepo, estos contextos residen principalmente en un paquete compartido (`packages/core`) que la API consume.

1.  **IAM (Identity & Access Management):**
    *   *Responsabilidad:* Gestión de identidades, autenticación y roles.
    *   *Entidades:* `User`, `Role`, `Credential`.
2.  **Collaboration (Core Domain):**
    *   *Responsabilidad:* Gestión de proyectos, planos, versiones y discusiones.
    *   *Entidades:* `Project`, `Plan`, `Layer`, `Pin`, `Comment`.
    *   *Eventos de Dominio:* `PlanUploaded`, `CommentAdded`.
3.  **FileProcessing (Support Domain):**
    *   *Responsabilidad:* Orquestación de la conversión y optimización de medios.
    *   *Entidades:* `ProcessingJob`, `FileMetadata`.

## 3. Stack Tecnológico
-   **Runtime:** Node.js (TypeScript)
-   **Framework Web (Driver Adapter):** Express.js
-   **ORM (Driven Adapter):** Prisma (Implementación de Repositorios)
-   **Bus de Eventos/Cola:** BullMQ (Redis)
-   **Validación:** Zod (para DTOs y Value Objects)
-   **Inyección de Dependencias:** Awilix o Inversify (opcional, o manual simple).

## 4. Estructura de Directorios (Monorepo Strategy)

La estructura refleja la separación entre el "Core" (Dominio/Aplicación) y el "Shell" (Infraestructura/API).

```bash
/
├── packages/
│   └── core/                   # LÓGICA DE NEGOCIO (Agnóstico del Framework)
│       ├── src/
│       │   ├── Shared/         # Kernel compartido (Value Objects, Base Classes)
│       │   │   ├── Domain/     # (AggregateRoot, Entity, ValueObject, DomainEvent)
│       │   │   └── Infra/      # (Logger, EventBus Interface)
│       │   │
│       │   ├── Contexts/       # Bounded Contexts
│       │   │   ├── IAM/
│       │   │   │   ├── Domain/     # Entidades, Repository Interfaces
│       │   │   │   └── Application/# Casos de Uso
│       │   │   │       ├── RegisterUserUseCase.ts
│       │   │   │       ├── LoginUseCase.ts
│       │   │   │       └── ManageUserRolesUseCase.ts
│       │   │   │
│       │   │   └── Collaboration/
│       │   │       ├── Domain/     # Modelos puros (Project, Plan...)
│       │   │       │   ├── Project.ts
│       │   │       │   ├── ProjectRepository.interface.ts
│       │   │       │   └── Events/ (PlanUploadedEvent.ts)
│       │   │       └── Application/
│       │   │           ├── Project/
│       │   │           │   ├── CreateProjectUseCase.ts
│       │   │           │   ├── InviteUserToProjectUseCase.ts
│       │   │           │   └── AcceptProjectInvitationUseCase.ts
│       │   │           ├── Plan/
│       │   │           │   ├── UploadPlanUseCase.ts
│       │   │           │   └── AddLayerToPlanUseCase.ts
│       │   │           └── Discussion/
│       │   │               ├── CreatePinUseCase.ts
│       │   │               ├── AddCommentUseCase.ts
│       │   │               └── ResolvePinUseCase.ts
│       │   └── index.ts        # Exporta todo para ser usado por apps
│
├── apps/
│   └── backend-api/            # APLICACIÓN EXPRESS (Infraestructura)
│       ├── src/
│       │   ├── controllers/    # Primary Adapters (HTTP)
│       │   │   ├── AuthController.ts
│       │   │   └── ProjectController.ts
│       │   ├── openapi/        # Definición Swagger/OpenAPI
│       │   ├── infrastructure/ # Secondary Adapters (Implementaciones)
│       │   │   ├── persistence/
│       │   │   │   └── PrismaProjectRepository.ts # Implementa interfaz del Core
│       │   │   ├── eventbus/
│       │   │   │   └── BullMQEventBus.ts
│       │   │   └── storage/
│       │   │       └── S3StorageService.ts
│       │   ├── server.ts       # Configuración de Express y DI Container
│       │   └── app.ts          # Entry Point
│       └── package.json        # Dependencia: "@trace/core"
```

## 5. Patrones de Diseño Clave

### 5.1 Capa de Dominio (Domain)
*   **Entidades Ricas:** Las entidades no son simples esquemas de datos. Tienen métodos de negocio (ej: `project.addPlan(...)`).
*   **Value Objects:** Uso de objetos de valor para encapsular validaciones (ej: `Email`, `Coordinates`, `PlanVersion`).
*   **Repository Interfaces:** Contratos puros que definen cómo se guardan los datos, sin depender de Prisma.

### 5.2 Capa de Aplicación (Use Cases)
*   Contienen la orquestación del flujo.
*   **Input Ports:** Reciben DTOs simples (primitivos).
*   Ejemplo: `UploadPlanUseCase` recibe el archivo, llama al StorageService, crea la entidad `Plan` y emite el evento `PlanUploaded`.

### 5.3 Capa de Infraestructura (Adapters)
*   **Controllers:** Reciben la Request HTTP, invocan el Caso de Uso y retornan Response. No contienen lógica.
*   **Persistence:** El repositorio `PrismaProjectRepository` mapea las Entidades del Dominio a modelos de Prisma y viceversa (Data Mappers).

## 6. Integraciones y Flujos de Eventos
El Backend API es el productor principal de eventos de dominio que desencadenan procesos en el Worker.

*   **Flujo Síncrono:** Cliente -> API -> Controller -> UseCase -> DB.
*   **Flujo Asíncrono (Event-Driven):**
    1.  `UploadPlanUseCase` persiste el plan con estado `UPLOADED`.
    2.  Emite evento `PlanUploadedEvent`.
    3.  Un `EventBus` (Infraestructura) captura el evento y lo encola en Redis (BullMQ) para que el Worker lo procese.
    4.  Esto desacopla la API del procesamiento pesado.

## 7. Especificación de la API (OpenAPI)

A continuación se detalla la especificación preliminar de la interfaz RESTful para el MVP.

```yaml
openapi: 3.0.3
info:
  title: Tracé API
  description: API Backend para la plataforma SaaS de gestión de planos arquitectónicos 'Tracé'.
  version: 1.0.0
servers:
  - url: /api/v1
    description: Base path para la API

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    Error:
      type: object
      properties:
        code:
          type: string
          example: AUTH_INVALID_CREDENTIALS
        message:
          type: string
          example: Credenciales incorrectas

    User:
      type: object
      properties:
        id:
          type: string
          format: uuid
        email:
          type: string
          format: email
        name:
          type: string

    Project:
      type: object
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
        role:
          type: string
          enum: [OWNER, EDITOR, VIEWER]
          description: Rol del usuario actual en este proyecto

security:
  - bearerAuth: []

paths:
  # --- IAM Context ---
  /auth/register:
    post:
      summary: Registro de nuevo Arquitecto
      security: []
      tags: [Auth]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [email, password, name]
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
                  minLength: 8
                name:
                  type: string
      responses:
        '201':
          description: Usuario creado exitosamente
          content:
            application/json:
              schema:
                type: object
                properties:
                  user:
                    $ref: '#/components/schemas/User'
                  token:
                    type: string
        '400':
          description: Datos inválidos o usuario ya existente

  /auth/login:
    post:
      summary: Inicio de sesión
      security: []
      tags: [Auth]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [email, password]
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
      responses:
        '200':
          description: Login exitoso
          content:
            application/json:
              schema:
                type: object
                properties:
                  user:
                    $ref: '#/components/schemas/User'
                  token:
                    type: string
        '401':
          description: Credenciales inválidas

  # --- Collaboration Context (Projects) ---
  /projects:
    get:
      summary: Listar proyectos del usuario
      description: Retorna proyectos donde el usuario es Owner o Invitado
      tags: [Projects]
      responses:
        '200':
          description: Lista de proyectos
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Project'
    post:
      summary: Crear nuevo proyecto
      tags: [Projects]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [name]
              properties:
                name:
                  type: string
      responses:
        '201':
          description: Proyecto creado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Project'
        '403':
          description: Límite de plan gratuito alcanzado (Máx 3 proyectos)

  /projects/{id}:
    parameters:
      - in: path
        name: id
        schema:
          type: string
          format: uuid
        required: true
    get:
      summary: Obtener detalles del proyecto
      tags: [Projects]
      responses:
        '200':
          description: Detalle del proyecto
    delete:
      summary: Eliminar proyecto
      tags: [Projects]
      responses:
        '204':
          description: Proyecto eliminado
        '403':
          description: Solo el Owner puede eliminar

  # --- Collaboration Context (Project Access) ---
  /projects/{projectId}/users:
    get:
      summary: Listar colaboradores del proyecto
      tags: [Project Access]
      security:
        - bearerAuth: []
      parameters:
        - in: path
          name: projectId
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Lista de usuarios y sus roles en el proyecto
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
                  properties:
                    id:
                       type: string
                       format: uuid
                    email:
                       type: string
                       format: email
                    name:
                       type: string
                    role:
                       type: string
                       enum: [OWNER, EDITOR, VIEWER]

  /projects/{projectId}/invitations:
    post:
      summary: Invitar usuario por email
      tags: [Project Access]
      security:
        - bearerAuth: []
      parameters:
        - in: path
          name: projectId
          required: true
          schema:
             type: string
             format: uuid
      requestBody:
        required: true
        content:
          application/json:
             schema:
               type: object
               required: [email]
               properties:
                 email:
                   type: string
                   format: email
                 role:
                   type: string
                   enum: [EDITOR, VIEWER]
                   default: VIEWER
      responses:
        '201':
           description: Invitación enviada exitosamente
        '400':
           description: El usuario ya es miembro o tiene invitación pendiente
        '403':
           description: Requiere rol OWNER o EDITOR

  /projects/{projectId}/users/{userId}:
    delete:
       summary: Revocar acceso a un usuario
       tags: [Project Access]
       security:
        - bearerAuth: []
       parameters:
         - in: path
           name: projectId
           required: true
           schema:
              type: string
              format: uuid
         - in: path
           name: userId
           required: true
           schema:
              type: string
              format: uuid
       responses:
         '204':
            description: Usuario eliminado del proyecto
         '403':
            description: Requiere rol OWNER

  /projects/{projectId}/share-token:
     post:
       summary: Generar/Obtener token para acceso público (Guest)
       tags: [Project Access]
       description: Soporte para US-005. Permite acceso de solo lectura sin login.
       parameters:
         - in: path
           name: projectId
           required: true
           schema:
             type: string
             format: uuid
       requestBody:
         content:
           application/json:
             schema:
               type: object
               properties:
                 enable:
                   type: boolean
                   default: true
       responses:
         '200':
           description: Token generado
           content:
             application/json:
               schema:
                 type: object
                 properties:
                   token:
                     type: string
                   url:
                     type: string
                     description: URL completa para compartir

  # --- Collaboration Context (Plans) ---
  /projects/{projectId}/plans:
    post:
      summary: Subir un nuevo plano (PDF/Image)
      tags: [Plans]
      parameters:
        - in: path
          name: projectId
          required: true
          schema:
            type: string
      requestBody:
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                file:
                  type: string
                  format: binary
      responses:
        '202':
          description: Archivo aceptado para procesamiento asíncrono
          content:
            application/json:
              schema:
                type: object
                properties:
                  jobId:
                    type: string
                  status:
                    type: string
                    example: PROCESSING

  /plans/{id}:
    get:
      summary: Obtener plano y sus capas procesadas
      tags: [Plans]
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Datos del plano para el visor (incluye URLs de tiles/imágenes)

  # --- Collaboration Context (Discussion) ---
  /plans/{planId}/pins:
    get:
      summary: Obtener pines de un plano
      tags: [Discussion]
      parameters:
        - in: path
          name: planId
          required: true
          schema:
            type: string
    post:
      summary: Crear un pin en coordenadas X,Y
      tags: [Discussion]
      parameters:
        - in: path
          name: planId
          required: true
          schema:
            type: string
      requestBody:
        content:
          application/json:
            schema:
              type: object
              required: [x, y]
              properties:
                x: 
                  type: number
                y: 
                  type: number
                initialComment:
                  type: string
      responses:
        '201':
          description: Pin creado

  /pins/{pinId}/comments:
    post:
      summary: Añadir comentario a un hilo
      tags: [Discussion]
      parameters:
        - in: path
          name: pinId
          required: true
      requestBody:
        content:
          application/json:
            schema:
              type: object
              required: [content]
              properties:
                content:
                  type: string
      responses:
        '201':
          description: Comentario añadido

  /pins/{pinId}/resolve:
    patch:
      summary: Marcar pin como resuelto
      tags: [Discussion]
      parameters:
        - in: path
          name: pinId
          required: true
      responses:
        '200':
          description: Pin actualizado a estado 'RESOLVED'
```
