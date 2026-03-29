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
    *   *Responsabilidad:* Gestión de proyectos, planos, versiones, invitaciones y discusiones.
    *   *Entidades:* `Project`, `Plan`, `Layer`, `Pin`, `Comment`, `Invitation`.
    *   *Eventos de Dominio:* `PlanUploaded`, `CommentAdded`, `InvitationCreated`.
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
│       │   │           │   ├── DeleteProjectUseCase.ts
│       │   │           │   └── ListUserProjectsUseCase.ts
│       │   │           ├── Invitation/
│       │   │           │   ├── CreateProjectInvitationUseCase.ts
│       │   │           │   ├── GetProjectInvitationsUseCase.ts
│       │   │           │   ├── RevokeProjectInvitationUseCase.ts
│       │   │           │   └── GuestLoginUseCase.ts
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
  - url: /api
    description: Base path para la API (Servidor Local: http://localhost:4000/api)

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

  /auth/guest/login:
    post:
      summary: Inicio de sesión como Invitado (Guest)
      description: Intercambia un token de invitación por un JWT de sesión limitada con permisos de solo lectura.
      security: []
      tags: [Auth]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [token]
              properties:
                token:
                  type: string
                  description: El token de invitación generado por un Owner/Editor del proyecto
      responses:
        '200':
          description: Login de invitado exitoso
          content:
             application/json:
               schema:
                 type: object
                 properties:
                   accessToken:
                     type: string
                     description: JWT con rol GUEST y permisos READ_PROJECT, READ_PLANS, READ_LAYERS
                   project:
                     type: object
                     properties:
                       id:
                         type: string
                         format: uuid
                       title:
                         type: string
        '401':
           description: Token inválido, expirado o proyecto inactivo
        '403':
           description: Proyecto no está en estado ACTIVE

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
    get:
      summary: Listar invitaciones activas del proyecto
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
           description: Lista de invitaciones activas (PENDING y ACCEPTED)
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
                     token:
                       type: string
                       description: Token único para acceso de invitado
                     email:
                       type: string
                       default: guest@system
                     status:
                       type: string
                       enum: [PENDING, ACCEPTED, EXPIRED]
                     expiresAt:
                       type: string
                       format: date-time
                     createdAt:
                       type: string
                       format: date-time
        '403':
           description: Requiere rol OWNER o EDITOR
        '404':
           description: Proyecto no encontrado

    post:
      summary: Crear nueva invitación (generar token)
      description: Genera un token único para acceso de invitado con permisos de solo lectura. Solo OWNER y EDITOR pueden crear invitaciones.
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
        content:
          application/json:
             schema:
               type: object
               properties:
                 email:
                   type: string
                   format: email
                   description: Email opcional para tracking (por defecto guest@system)
                 expiresAt:
                   type: string
                   format: date-time
                   description: Fecha de expiración opcional (por defecto 1 año)
      responses:
        '201':
           description: Invitación creada exitosamente
           content:
             application/json:
               schema:
                 type: object
                 properties:
                   id:
                     type: string
                     format: uuid
                   token:
                     type: string
                   email:
                     type: string
                   status:
                     type: string
                     example: PENDING
                   expiresAt:
                     type: string
                     format: date-time
        '403':
           description: Requiere rol OWNER o EDITOR
        '404':
           description: Proyecto no encontrado

  /projects/{projectId}/invitations/{token}:
    delete:
      summary: Revocar invitación (invalidar token)
      description: Cambia el estado de la invitación a EXPIRED, invalidando el token permanentemente. Solo OWNER y EDITOR pueden revocar.
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
          name: token
          required: true
          schema:
            type: string
      responses:
        '204':
          description: Invitación revocada exitosamente
        '403':
          description: Requiere rol OWNER o EDITOR
        '404':
          description: Invitación no encontrada

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
       summary: Generar/Regenerar token para acceso público (Guest)
       tags: [Project Access]
       description: Genera un nuevo shareToken para el proyecto. Invalida el anterior si existía.
       parameters:
         - in: path
           name: projectId
           required: true
           schema:
             type: string
             format: uuid
       responses:
         '201':
           description: Token generado exitosamente
           content:
             application/json:
               schema:
                 type: object
                 properties:
                   token:
                     type: string
                   url:
                     type: string
     get:
       summary: Obtener el token de acceso público actual
       tags: [Project Access]
       parameters:
         - in: path
           name: projectId
           required: true
           schema:
             type: string
             format: uuid
       responses:
         '200':
           description: Token actual
           content:
             application/json:
               schema:
                 type: object
                 properties:
                   token:
                     type: string
                     nullable: true
                   isEnabled:
                     type: boolean
     delete:
       summary: Revocar el acceso público (Eliminar token)
       tags: [Project Access]
       parameters:
         - in: path
           name: projectId
           required: true
           schema:
              type: string
              format: uuid
       responses:
          '204':
            description: Token eliminado, acceso público desactivado

  # --- Collaboration Context (Plans) ---
  /projects/{projectId}/plans:
    get:
      summary: Listar planos de un proyecto agrupados por hoja
      description: >
        Retorna todos los planos del proyecto agrupados por `sheetName`. Cada grupo incluye
        todas las versiones del plano y sus capas procesadas (`layers`), listas para ser
        consumidas por el comparador de capas (US-007 / BACK-009).
      tags: [Plans]
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
          description: Planos agrupados por hoja, cada plan incluye sus capas procesadas
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
                  properties:
                    sheetName:
                      type: string
                      description: Nombre de la hoja/plano
                    latestVersion:
                      type: integer
                      description: Número de la versión más reciente para esta hoja
                    plans:
                      type: array
                      items:
                        type: object
                        properties:
                          id:
                            type: string
                            format: uuid
                          projectId:
                            type: string
                            format: uuid
                          sheetName:
                            type: string
                          version:
                            type: integer
                          status:
                            type: string
                            enum: [DRAFT, ACTIVE, ARCHIVED]
                          createdAt:
                            type: string
                            format: date-time
                          updatedAt:
                            type: string
                            format: date-time
                          layers:
                            type: array
                            description: Capas procesadas del plano (vacío si aún no se han subido capas)
                            items:
                              type: object
                              properties:
                                id:
                                  type: string
                                  format: uuid
                                planId:
                                  type: string
                                  format: uuid
                                name:
                                  type: string
                                imageUrl:
                                  type: string
                                  format: uri
                                  description: URL pública de la imagen procesada (relativa a BASE_URL)
                                type:
                                  type: string
                                  enum: [BASE, OVERLAY]
                                status:
                                  type: string
                                  enum: [PROCESSING, READY, ERROR]
                                createdAt:
                                  type: string
                                  format: date-time
                                updatedAt:
                                  type: string
                                  format: date-time
        '401':
          description: No autenticado
        '403':
          description: Sin permisos sobre el proyecto
        '404':
          description: Proyecto no encontrado

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
  /layers/{layerId}/pins:
    get:
      summary: Listar pines de una capa
      description: Obtiene todos los pines de una capa, opcionalmente filtrados por estado. Soporta autenticación de usuarios y guests.
      tags: [Discussion]
      security:
        - bearerAuth: []
      parameters:
        - in: path
          name: layerId
          required: true
          schema:
            type: string
            format: uuid
        - in: query
          name: status
          required: false
          schema:
            type: string
            enum: [OPEN, RESOLVED]
          description: Filtrar pines por estado
      responses:
        '200':
          description: Lista de pines
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
                    layerId:
                      type: string
                      format: uuid
                    xCoord:
                      type: number
                      format: float
                      minimum: 0
                      maximum: 1
                      description: Coordenada X normalizada (0-1)
                    yCoord:
                      type: number
                      format: float
                      minimum: 0
                      maximum: 1
                      description: Coordenada Y normalizada (0-1)
                    status:
                      type: string
                      enum: [OPEN, RESOLVED]
                    createdBy:
                      type: string
                      format: uuid
                      nullable: true
                      description: ID del usuario que creó el pin (null para guests)
                    guestName:
                      type: string
                      nullable: true
                      description: Nombre del guest que creó el pin (null para usuarios autenticados)
                    createdAt:
                      type: string
                      format: date-time
                    updatedAt:
                      type: string
                      format: date-time
        '401':
          description: No autenticado
        '404':
          description: Capa no encontrada

    post:
      summary: Crear un pin con comentario inicial
      description: Crea un pin en coordenadas normalizadas (0-1) con un comentario inicial obligatorio. Soporta usuarios autenticados y guests.
      tags: [Discussion]
      security:
        - bearerAuth: []
      parameters:
        - in: path
          name: layerId
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
              required: [xCoord, yCoord, content]
              properties:
                xCoord:
                  type: number
                  format: float
                  minimum: 0
                  maximum: 1
                  description: Coordenada X normalizada (0-1)
                yCoord:
                  type: number
                  format: float
                  minimum: 0
                  maximum: 1
                  description: Coordenada Y normalizada (0-1)
                content:
                  type: string
                  minLength: 1
                  maxLength: 300
                  description: Comentario inicial del pin
      responses:
        '201':
          description: Pin creado exitosamente
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    type: string
                    format: uuid
                  layerId:
                    type: string
                    format: uuid
                  xCoord:
                    type: number
                    format: float
                  yCoord:
                    type: number
                    format: float
                  status:
                    type: string
                    enum: [OPEN]
                  createdBy:
                    type: string
                    format: uuid
                    nullable: true
                  guestName:
                    type: string
                    nullable: true
                  createdAt:
                    type: string
                    format: date-time
                  updatedAt:
                    type: string
                    format: date-time
                  comments:
                    type: array
                    items:
                      type: object
                      properties:
                        id:
                          type: string
                          format: uuid
                        content:
                          type: string
                        authorId:
                          type: string
                          format: uuid
                          nullable: true
                        guestName:
                          type: string
                          nullable: true
                        createdAt:
                          type: string
                          format: date-time
        '400':
          description: Datos inválidos (coordenadas fuera de rango, contenido vacío o muy largo)
        '401':
          description: No autenticado
        '404':
          description: Capa no encontrada

  /pins/{pinId}:
    get:
      summary: Obtener pin con sus comentarios
      description: Retorna un pin específico con todos sus comentarios no eliminados
      tags: [Discussion]
      security:
        - bearerAuth: []
      parameters:
        - in: path
          name: pinId
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Pin con comentarios
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    type: string
                    format: uuid
                  layerId:
                    type: string
                    format: uuid
                  xCoord:
                    type: number
                    format: float
                  yCoord:
                    type: number
                    format: float
                  status:
                    type: string
                    enum: [OPEN, RESOLVED]
                  createdBy:
                    type: string
                    format: uuid
                    nullable: true
                  guestName:
                    type: string
                    nullable: true
                  createdAt:
                    type: string
                    format: date-time
                  updatedAt:
                    type: string
                    format: date-time
                  comments:
                    type: array
                    items:
                      type: object
                      properties:
                        id:
                          type: string
                          format: uuid
                        content:
                          type: string
                        authorId:
                          type: string
                          format: uuid
                          nullable: true
                        guestName:
                          type: string
                          nullable: true
                        createdAt:
                          type: string
                          format: date-time
        '401':
          description: No autenticado
        '404':
          description: Pin no encontrado o eliminado

    delete:
      summary: Eliminar pin (soft delete)
      description: Marca el pin como eliminado (soft delete). Solo el creador puede eliminar su propio pin.
      tags: [Discussion]
      security:
        - bearerAuth: []
      parameters:
        - in: path
          name: pinId
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '204':
          description: Pin eliminado exitosamente
        '401':
          description: No autenticado
        '403':
          description: No tienes permiso para eliminar este pin (solo el creador puede eliminarlo)
        '404':
          description: Pin no encontrado o ya eliminado

  /pins/{pinId}/status:
    patch:
      summary: Actualizar estado del pin (resolver/reabrir)
      description: Cambia el estado de un pin entre OPEN y RESOLVED. Solo usuarios autenticados pueden cambiar el estado (guests no pueden).
      tags: [Discussion]
      security:
        - bearerAuth: []
      parameters:
        - in: path
          name: pinId
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
              required: [status]
              properties:
                status:
                  type: string
                  enum: [OPEN, RESOLVED]
      responses:
        '200':
          description: Estado del pin actualizado
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    type: string
                    format: uuid
                  status:
                    type: string
                    enum: [OPEN, RESOLVED]
                  updatedAt:
                    type: string
                    format: date-time
        '400':
          description: Estado inválido
        '401':
          description: No autenticado
        '403':
          description: Los guests no pueden cambiar el estado de los pines
        '404':
          description: Pin no encontrado

  /pins/{pinId}/comments:
    post:
      summary: Añadir comentario a un pin
      description: Agrega un nuevo comentario a un pin existente. Soporta usuarios autenticados y guests.
      tags: [Discussion]
      security:
        - bearerAuth: []
      parameters:
        - in: path
          name: pinId
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
              required: [content]
              properties:
                content:
                  type: string
                  minLength: 1
                  maxLength: 300
                  description: Contenido del comentario
      responses:
        '201':
          description: Comentario añadido exitosamente
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    type: string
                    format: uuid
                  pinId:
                    type: string
                    format: uuid
                  content:
                    type: string
                  authorId:
                    type: string
                    format: uuid
                    nullable: true
                  guestName:
                    type: string
                    nullable: true
                  createdAt:
                    type: string
                    format: date-time
        '400':
          description: Contenido inválido (vacío o muy largo)
        '401':
          description: No autenticado
        '404':
          description: Pin no encontrado

  /comments/{commentId}:
    delete:
      summary: Eliminar comentario (soft delete)
      description: Marca el comentario como eliminado (soft delete). Solo el creador puede eliminar su propio comentario.
      tags: [Discussion]
      security:
        - bearerAuth: []
      parameters:
        - in: path
          name: commentId
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '204':
          description: Comentario eliminado exitosamente
        '401':
          description: No autenticado
        '403':
          description: No tienes permiso para eliminar este comentario (solo el creador puede eliminarlo)
        '404':
          description: Comentario no encontrado o ya eliminado
```
