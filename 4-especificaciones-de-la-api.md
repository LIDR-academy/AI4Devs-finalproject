# 4. Especificación de la API — Lexio

API REST del **BFF (Backend for Frontend)** de Lexio. El cliente móvil (Expo) se comunica con este backend vía HTTPS; el backend orquesta Firebase Firestore, Claude API y Unsplash API.

**Base URL (desarrollo):** `http://localhost:3000`  
**Base URL (producción):** `https://api.lexio.app` *(placeholder para demo académica)*

**Versión:** `1.0.0`  
**Formato:** JSON (`Content-Type: application/json`)

---

## Autenticación

Todos los endpoints protegidos requieren un **Firebase ID Token** válido obtenido tras login/registro en el cliente.

```http
Authorization: Bearer <firebase_id_token>
```

| Código | Significado |
|--------|-------------|
| `401 Unauthorized` | Token ausente, expirado o inválido |
| `403 Forbidden` | Token válido pero sin permiso sobre el recurso |

---

## Endpoints principales (MVP)

Se documentan los **3 endpoints críticos** del flujo E2E prioritario:

| # | Método | Ruta | Propósito |
|---|--------|------|-----------|
| 1 | `POST` | `/words` | Captura de palabra/frase + sugerencias IA y Unsplash |
| 2 | `POST` | `/sessions/daily` | Generación de sesión diaria (10 ejercicios) |
| 3 | `POST` | `/sessions/{sessionId}/complete` | Cierre de sesión, validación y actualización de racha |

> Otros endpoints planificados (no detallados aquí): `GET /words`, `PUT /words/{id}`, `GET /streak`, `GET /health`.

---

## Especificación OpenAPI 3.0

```yaml
openapi: 3.0.3
info:
  title: Lexio API
  description: |
    API del backend BFF de Lexio. Orquesta captura de vocabulario,
    generación de ejercicios con IA y gestión de rachas.
  version: 1.0.0
  contact:
    name: Lexio — AI4Devs Final Project

servers:
  - url: http://localhost:3000
    description: Desarrollo local
  - url: https://api.lexio.app
    description: Producción (demo académica)

tags:
  - name: Words
    description: Captura y gestión de tarjetas de vocabulario
  - name: Sessions
    description: Sesiones diarias de práctica

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: Firebase ID Token

  schemas:
    Error:
      type: object
      required:
        - error
        - message
      properties:
        error:
          type: string
          example: INSUFFICIENT_VOCABULARY
        message:
          type: string
          example: Necesitas al menos 4 palabras para practicar.

    UnsplashImageSuggestion:
      type: object
      required:
        - photoId
        - url
        - thumbnailUrl
      properties:
        photoId:
          type: string
          example: abc123
        url:
          type: string
          format: uri
          example: https://images.unsplash.com/photo-example
        thumbnailUrl:
          type: string
          format: uri
        photographer:
          type: string
          example: Jane Doe

    WordCard:
      type: object
      required:
        - id
        - userId
        - term
        - definition
        - definitionLanguage
        - imageUrl
        - status
        - createdAt
      properties:
        id:
          type: string
          example: wc_001
        userId:
          type: string
          example: a1b2c3d4-e5f6-7890-abcd-ef1234567890
        term:
          type: string
          example: serendipity
        normalizedTerm:
          type: string
          example: serendipity
        definition:
          type: string
          example: Hallazgo afortunado e inesperado de algo valioso.
        definitionLanguage:
          type: string
          enum: [es, en]
          example: es
        imageUrl:
          type: string
          format: uri
        unsplashPhotoId:
          type: string
          nullable: true
        status:
          type: string
          enum: [active, learned]
          example: active
        learnedAt:
          type: string
          format: date-time
          nullable: true
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time

    CreateWordRequest:
      type: object
      required:
        - term
        - definitionLanguage
      properties:
        term:
          type: string
          minLength: 1
          maxLength: 500
          description: Palabra o frase en inglés (obligatoria)
          example: serendipity
        definitionLanguage:
          type: string
          enum: [es, en]
          description: Idioma de la definición sugerida por IA
          example: es
        definition:
          type: string
          description: Definición editada por el usuario (opcional en borrador)
        imageUrl:
          type: string
          format: uri
          description: URL de imagen elegida (opcional en primera petición)
        unsplashPhotoId:
          type: string
          description: ID de foto Unsplash seleccionada

    CreateWordResponse:
      type: object
      required:
        - wordCard
        - suggestedImages
      properties:
        wordCard:
          $ref: '#/components/schemas/WordCard'
        suggestedImages:
          type: array
          items:
            $ref: '#/components/schemas/UnsplashImageSuggestion'
          minItems: 1
          maxItems: 5

    Exercise:
      type: object
      required:
        - id
        - wordCardId
        - type
        - options
        - correctAnswer
        - orderIndex
      properties:
        id:
          type: string
          example: ex_003
        wordCardId:
          type: string
          example: wc_001
        type:
          type: string
          enum: [image_match, mcq]
          example: mcq
        question:
          type: string
          nullable: true
          example: ¿Cuál palabra describe un hallazgo afortunado e inesperado?
        imageUrl:
          type: string
          format: uri
          nullable: true
          description: Presente cuando type = image_match
        options:
          type: array
          items:
            type: string
          minItems: 4
          maxItems: 4
          example: [serendipity, misfortune, routine, deadline]
        orderIndex:
          type: integer
          minimum: 0
          maximum: 9
          example: 2

    DailySession:
      type: object
      required:
        - id
        - userId
        - sessionDate
        - totalExercises
        - completed
        - exercises
        - startedAt
      properties:
        id:
          type: string
          example: ds_20260607_001
        userId:
          type: string
        sessionDate:
          type: string
          format: date
          example: "2026-06-07"
        totalExercises:
          type: integer
          example: 10
        correctAnswers:
          type: integer
          example: 0
        completed:
          type: boolean
          example: false
        startedAt:
          type: string
          format: date-time
        completedAt:
          type: string
          format: date-time
          nullable: true
        exercises:
          type: array
          items:
            $ref: '#/components/schemas/Exercise'
          minItems: 10
          maxItems: 10

    CreateDailySessionRequest:
      type: object
      properties:
        sessionDate:
          type: string
          format: date
          description: Fecha de la sesión (YYYY-MM-DD). Default = hoy (timezone del cliente enviado o servidor)
          example: "2026-06-07"
        timezone:
          type: string
          description: IANA timezone del dispositivo
          example: America/Mexico_City

    ExerciseAnswer:
      type: object
      required:
        - exerciseId
        - userAnswer
      properties:
        exerciseId:
          type: string
          example: ex_003
        userAnswer:
          type: string
          example: serendipity

    CompleteSessionRequest:
      type: object
      required:
        - answers
      properties:
        answers:
          type: array
          items:
            $ref: '#/components/schemas/ExerciseAnswer'
          minItems: 10
          maxItems: 10

    Streak:
      type: object
      required:
        - userId
        - currentStreak
        - longestStreak
      properties:
        userId:
          type: string
        currentStreak:
          type: integer
          minimum: 0
          example: 6
        lastCompletedDate:
          type: string
          format: date
          nullable: true
          example: "2026-06-07"
        longestStreak:
          type: integer
          minimum: 0
          example: 12

    CompleteSessionResponse:
      type: object
      required:
        - session
        - streak
      properties:
        session:
          allOf:
            - $ref: '#/components/schemas/DailySession'
            - type: object
              properties:
                completed:
                  type: boolean
                  example: true
                correctAnswers:
                  type: integer
                  example: 8
        streak:
          $ref: '#/components/schemas/Streak'

security:
  - BearerAuth: []

paths:
  /words:
    post:
      tags: [Words]
      summary: Capturar palabra o frase
      description: |
        Crea una tarjeta de vocabulario. Genera definición sugerida vía Claude API
        e imágenes sugeridas vía Unsplash. Si el término normalizado ya existe
        para el usuario, responde 409 Conflict.
      operationId: createWord
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateWordRequest'
      responses:
        '201':
          description: Tarjeta creada con sugerencias
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CreateWordResponse'
        '400':
          description: Petición inválida (term vacío, definitionLanguage inválido)
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '401':
          description: No autenticado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '409':
          description: Ya existe una tarjeta para ese término
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /sessions/daily:
    post:
      tags: [Sessions]
      summary: Crear sesión diaria de práctica
      description: |
        Genera una sesión de 10 ejercicios (mezcla de image_match y mcq)
        con palabras aleatorias del banco del usuario. Bloquea si el usuario
        tiene 3 o menos palabras. Si ya existe sesión completada hoy, responde 409.
      operationId: createDailySession
      requestBody:
        required: false
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateDailySessionRequest'
      responses:
        '201':
          description: Sesión creada con 10 ejercicios
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/DailySession'
        '403':
          description: Vocabulario insuficiente (≤ 3 palabras)
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '401':
          description: No autenticado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '409':
          description: Sesión de hoy ya completada o ya en curso
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /sessions/{sessionId}/complete:
    post:
      tags: [Sessions]
      summary: Completar sesión diaria
      description: |
        Recibe las 10 respuestas del usuario, calcula aciertos, marca la sesión
        como completada y actualiza la racha del usuario.
      operationId: completeDailySession
      parameters:
        - name: sessionId
          in: path
          required: true
          schema:
            type: string
          example: ds_20260607_001
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CompleteSessionRequest'
      responses:
        '200':
          description: Sesión completada y racha actualizada
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CompleteSessionResponse'
        '400':
          description: Respuestas inválidas o incompletas
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '401':
          description: No autenticado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '404':
          description: Sesión no encontrada o no pertenece al usuario
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '409':
          description: Sesión ya completada
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
```

---

## Ejemplos de petición y respuesta

### 1. `POST /words` — Captura de palabra

**Petición**

```http
POST /words HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "term": "serendipity",
  "definitionLanguage": "es"
}
```

**Respuesta `201 Created`**

```json
{
  "wordCard": {
    "id": "wc_001",
    "userId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "term": "serendipity",
    "normalizedTerm": "serendipity",
    "definition": "Hallazgo afortunado e inesperado de algo valioso.",
    "definitionLanguage": "es",
    "imageUrl": "",
    "unsplashPhotoId": null,
    "status": "active",
    "learnedAt": null,
    "createdAt": "2026-06-07T10:05:00.000Z",
    "updatedAt": "2026-06-07T10:05:00.000Z"
  },
  "suggestedImages": [
    {
      "photoId": "abc123",
      "url": "https://images.unsplash.com/photo-abc123",
      "thumbnailUrl": "https://images.unsplash.com/photo-abc123?w=200",
      "photographer": "Jane Doe"
    },
    {
      "photoId": "def456",
      "url": "https://images.unsplash.com/photo-def456",
      "thumbnailUrl": "https://images.unsplash.com/photo-def456?w=200",
      "photographer": "John Smith"
    }
  ]
}
```

**Respuesta `409 Conflict`** *(término duplicado)*

```json
{
  "error": "DUPLICATE_TERM",
  "message": "Ya tienes una tarjeta para 'serendipity'."
}
```

---

### 2. `POST /sessions/daily` — Generar sesión diaria

**Petición**

```http
POST /sessions/daily HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "sessionDate": "2026-06-07",
  "timezone": "America/Mexico_City"
}
```

**Respuesta `201 Created`**

```json
{
  "id": "ds_20260607_001",
  "userId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "sessionDate": "2026-06-07",
  "totalExercises": 10,
  "correctAnswers": 0,
  "completed": false,
  "startedAt": "2026-06-07T08:00:00.000Z",
  "completedAt": null,
  "exercises": [
    {
      "id": "ex_001",
      "wordCardId": "wc_001",
      "type": "image_match",
      "question": null,
      "imageUrl": "https://images.unsplash.com/photo-abc123",
      "options": ["serendipity", "deadline", "routine", "budget"],
      "correctAnswer": "serendipity",
      "orderIndex": 0
    },
    {
      "id": "ex_002",
      "wordCardId": "wc_002",
      "type": "mcq",
      "question": "What does 'reluctant' mean in this context?",
      "imageUrl": null,
      "options": ["eager", "unwilling", "confused", "excited"],
      "correctAnswer": "unwilling",
      "orderIndex": 1
    }
  ]
}
```

> El array `exercises` contiene **10 objetos** en la respuesta real; aquí se muestran 2 por brevedad.

**Respuesta `403 Forbidden`** *(vocabulario insuficiente)*

```json
{
  "error": "INSUFFICIENT_VOCABULARY",
  "message": "Necesitas al menos 4 palabras para practicar. Llevas 3."
}
```

---

### 3. `POST /sessions/{sessionId}/complete` — Completar sesión y actualizar racha

**Petición**

```http
POST /sessions/ds_20260607_001/complete HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "answers": [
    { "exerciseId": "ex_001", "userAnswer": "serendipity" },
    { "exerciseId": "ex_002", "userAnswer": "unwilling" },
    { "exerciseId": "ex_003", "userAnswer": "ambiguous" },
    { "exerciseId": "ex_004", "userAnswer": "threshold" },
    { "exerciseId": "ex_005", "userAnswer": "meticulous" },
    { "exerciseId": "ex_006", "userAnswer": "ephemeral" },
    { "exerciseId": "ex_007", "userAnswer": "resilient" },
    { "exerciseId": "ex_008", "userAnswer": "reluctant" },
    { "exerciseId": "ex_009", "userAnswer": "nuance" },
    { "exerciseId": "ex_010", "userAnswer": "pragmatic" }
  ]
}
```

**Respuesta `200 OK`**

```json
{
  "session": {
    "id": "ds_20260607_001",
    "userId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "sessionDate": "2026-06-07",
    "totalExercises": 10,
    "correctAnswers": 8,
    "completed": true,
    "startedAt": "2026-06-07T08:00:00.000Z",
    "completedAt": "2026-06-07T08:04:32.000Z",
    "exercises": []
  },
  "streak": {
    "userId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "currentStreak": 6,
    "lastCompletedDate": "2026-06-07",
    "longestStreak": 12
  }
}
```

> El campo `session.exercises` puede devolverse con `userAnswer` e `isCorrect` por ejercicio, o omitirse en la respuesta de cierre por tamaño; la implementación puede elegir el nivel de detalle.

**Respuesta `409 Conflict`** *(sesión ya completada)*

```json
{
  "error": "SESSION_ALREADY_COMPLETED",
  "message": "Esta sesión ya fue completada."
}
```

---

## Códigos de error del dominio

| Código HTTP | `error` | Cuándo ocurre |
|-------------|---------|---------------|
| 400 | `VALIDATION_ERROR` | Body inválido o campos requeridos ausentes |
| 401 | `UNAUTHORIZED` | Token Firebase ausente o inválido |
| 403 | `INSUFFICIENT_VOCABULARY` | Usuario con ≤ 3 palabras intenta practicar |
| 404 | `NOT_FOUND` | Recurso inexistente o de otro usuario |
| 409 | `DUPLICATE_TERM` | Tarjeta duplicada para el mismo término normalizado |
| 409 | `SESSION_ALREADY_COMPLETED` | Sesión diaria ya cerrada |
| 409 | `SESSION_ALREADY_EXISTS` | Sesión de hoy ya creada/completada |
| 500 | `INTERNAL_ERROR` | Fallo en Firestore, Claude o Unsplash |

---

## Flujo E2E vía API

```mermaid
sequenceDiagram
    participant App as Expo App
    participant API as Lexio BFF

    App->>API: POST /words { term, definitionLanguage }
    API-->>App: 201 wordCard + suggestedImages

    Note over App: Usuario elige imagen (PUT /words/:id — fuera de scope)

    App->>API: POST /sessions/daily
    API-->>App: 201 DailySession (10 exercises)

    Note over App: Usuario responde 10 ejercicios

    App->>API: POST /sessions/{id}/complete { answers }
    API-->>App: 200 session + streak
```

---

## Resumen

La API de Lexio expone **3 endpoints principales** que cubren el flujo MVP **Captura → Práctica → Validación + Racha**. La autenticación es uniforme (`Bearer` Firebase ID Token). Los contratos OpenAPI anteriores pueden importarse en Swagger UI, Postman o usarse para generar clients tipados durante el desarrollo full-stack.
