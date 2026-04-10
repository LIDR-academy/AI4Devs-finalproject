# 🤖 ChatBot Self-Improvement System — readme-VSL

> **AI4Devs Final Project · Cronos Consulting · Iniciales: VSL**

---

## Tabla de Contenidos

- [1. Descripción general del producto](#1-descripción-general-del-producto)
- [2. Arquitectura del Sistema](#2-arquitectura-del-sistema)
- [3. Modelo de Datos](#3-modelo-de-datos)
- [4. Especificación de la API](#4-especificación-de-la-api)
- [5. User Stories](#5-user-stories)
- [6. Tickets de trabajo](#6-tickets-de-trabajo)
- [7. Ejecución de la aplicación](#7-ejecución-de-la-aplicación)
- [8. Guías y Demos](#8-guías-y-demos)

---

# 1. Descripción general del producto

## 1.1. Visión del producto

El **ChatBot Self-Improvement System** es un sistema inteligente de mejora continua para chatbots basado en el paradigma *human-in-the-loop*. El sistema introduce un "meta-agente" — un segundo agente de IA — que supervisa, analiza y mejora de forma autónoma el comportamiento de un chatbot operativo, guiado por el feedback estructurado de un administrador humano experto.

El problema que resuelve es fundamental en el despliegue real de chatbots: **los modelos de lenguaje grandes (LLMs) cometen errores contextualmente específicos que solo un humano con conocimiento del dominio puede detectar**. Hasta ahora, corregir esos errores requería intervención manual directa sobre los prompts del sistema, sin trazabilidad ni ciclo de aprendizaje. Este sistema cierra ese ciclo.

**Concepto académico central:**
> *"Un sistema de meta-aprendizaje donde un agente de IA (meta-agente) supervisa y mejora a otro agente de IA (chatbot) basándose en el feedback estructurado de un humano experto, implementando un ciclo de mejora continua human-in-the-loop."*

## 1.2. Funcionalidades Clave del MVP

### Funcionalidades Must-Have (Phase 0)

**Sistema de trazabilidad de conversaciones**
- Almacenamiento completo de conversaciones del chatbot con metadatos de ejecución.
- Cada mensaje vinculado a `session_id`, `workflow_id` y `execution_id` para trazabilidad completa.
- Capacidad de recuperar el contexto histórico completo de cualquier conversación.

**Canal de feedback del administrador**
- Panel web para que el administrador visualice conversaciones y marque respuestas problemáticas.
- Formulario estructurado para enviar feedback referenciando un mensaje específico.
- Diferenciación clara entre input de usuario normal e input de corrección administrativa.

**Meta-agente de análisis y mejora**
- Recibe el feedback del admin junto con la conversación completa como contexto.
- Analiza la causa raíz del problema: ¿viene del prompt del chatbot o de factores externos?
- Si el origen es el prompt: propone una modificación específica con justificación.
- Si el origen es externo (datos, workflows): informa al admin con diagnóstico detallado.
- Flujo de confirmación con el admin antes de aplicar cualquier cambio.

**Gestión de versiones de prompts**
- Historial completo de versiones del prompt del chatbot.
- Capacidad de aplicar, revertir y comparar versiones.
- Trazabilidad entre cambio de prompt y feedback que lo originó.

**Chatbot de demostración**
- Chatbot funcional (atención al cliente genérica) que sirve como sujeto de mejora.
- Interfaz web para interactuar con el chatbot en tiempo real.

### Funcionalidades Should-Have (Phase 0 — opcionales)

- Estadísticas básicas: número de feedbacks procesados, prompts modificados, tasa de aceptación de propuestas.
- Exportación del historial de cambios en formato JSON/CSV.

### Fuera de alcance (Phase 1+)

- Análisis automático de workflows (N8N, Zapier, etc.).
- Modificación automática de lógica de workflows.
- Análisis de fuentes de datos externas (APIs, bases de datos de terceros).
- Multi-chatbot: gestión de múltiples agentes simultáneos.
- Fine-tuning automático del modelo base.

## 1.3. Valor añadido

**Diferenciación respecto a soluciones existentes:**

| Aspecto | Soluciones tradicionales | ChatBot Self-Improvement System |
|---------|--------------------------|----------------------------------|
| Corrección de errores | Manual, sin trazabilidad | Guiada por IA, con historial |
| Ciclo de mejora | Ad-hoc, reactivo | Estructurado, proactivo |
| Diagnóstico | El admin adivina la causa | Meta-agente identifica causa raíz |
| Historial de cambios | Inexistente o informal | Versionado completo |
| Escalabilidad | No escala | Patrón reutilizable en cualquier chatbot |

## 1.4. Lean Canvas

| Bloque | Contenido |
|--------|-----------|
| **Problema** | Los chatbots en producción cometen errores contextuales. Corregirlos es manual, lento y sin trazabilidad. Los admins no siempre saben si el error es del prompt o de los datos. |
| **Segmentos de clientes** | Equipos de producto que despliegan chatbots de atención al cliente. PMs y admins técnicos responsables de la calidad del bot. |
| **Propuesta de valor única** | *"Tu chatbot aprende de sus errores con la supervisión de un humano experto y la inteligencia de otro agente de IA."* |
| **Solución** | Meta-agente que analiza feedback, diagnostica causa raíz, propone mejoras de prompt y las aplica con confirmación humana. |
| **Canales** | Aplicación web interna. API REST para integración con sistemas existentes. |
| **Métricas clave** | Nº de feedbacks procesados/semana. Tasa de aceptación de propuestas del meta-agente. Reducción de errores recurrentes tras aplicar mejoras. |
| **Ventaja competitiva** | Sistema genérico, no acoplado a ningún cliente. Arquitectura extensible. Enfoque académico con documentación formal. Human-in-the-loop como principio de diseño. |
| **Estructura de costes** | OpenAI API (meta-agente + chatbot). Hosting (Railway/Render free tier). Desarrollo. |
| **Flujos de ingresos** | SaaS B2B (suscripción mensual por equipo). Licencia para integración en plataformas de chatbots. |

---

# 2. Arquitectura del Sistema

## 2.1. Visión general

El sistema se implementa bajo una **arquitectura monolítica modular**, adecuada para el MVP con un equipo pequeño y tiempo de desarrollo limitado. El backend expone tanto la API REST como el frontend mediante Jinja2 templates, simplificando el despliegue a un único servicio.

```
┌────────────────────────────────────────────────────────────┐
│                  NAVEGADOR WEB (Admin / User)               │
│           Jinja2 Templates servidas por FastAPI             │
└─────────────────────────┬──────────────────────────────────┘
                          │ HTTP
┌─────────────────────────▼──────────────────────────────────┐
│                    BACKEND — FastAPI (Python)                │
│                                                             │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │  /chatbot   │  │   /feedback  │  │   /meta-agent     │  │
│  │  Interfaz   │  │   Admin panel│  │   Análisis +      │  │
│  │  usuario    │  │   + feedback │  │   propuesta mejora│  │
│  └──────┬──────┘  └──────┬───────┘  └────────┬──────────┘  │
│         │                │                    │             │
│  ┌──────▼────────────────▼────────────────────▼──────────┐  │
│  │              CAPA DE SERVICIOS (Business Logic)        │  │
│  │  ChatbotService │ FeedbackService │ MetaAgentService   │  │
│  └──────────────────────────┬─────────────────────────────┘  │
│                             │                               │
│  ┌──────────────────────────▼─────────────────────────────┐  │
│  │                  CAPA DE DATOS (SQLAlchemy)             │  │
│  └──────────────────────────┬─────────────────────────────┘  │
└─────────────────────────────┼──────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
   ┌──────▼──────┐    ┌───────▼──────┐   ┌────────▼───────┐
   │ PostgreSQL  │    │  OpenAI API  │   │  (futuro: N8N) │
   │  (datos)    │    │ (GPT-4o-mini)│   │                │
   └─────────────┘    └──────────────┘   └────────────────┘
```

## 2.2. Metodología arquitectónica

Se adopta una **arquitectura monolítica modular** con separación clara de responsabilidades por dominio:

- **Módulo `chatbot`**: Lógica del chatbot de demostración, historial de conversaciones.
- **Módulo `feedback`**: Recepción, almacenamiento y listado de feedback administrativo.
- **Módulo `meta_agent`**: Núcleo del sistema. Orquesta el análisis de causa raíz y la propuesta de mejoras.
- **Módulo `prompts`**: Gestión del versionado de prompts del chatbot.
- **Módulo `shared`**: Configuración, manejo de errores, utilidades comunes.

**Justificación del monolito para Phase 0:**

| Decisión | Justificación |
|----------|---------------|
| Monolito modular | Reduce complejidad de despliegue; un único servicio a mantener |
| FastAPI + Python | Ecosistema natural para IA/LLM; async nativo para llamadas a OpenAI |
| PostgreSQL | Integridad referencial y soporte nativo para JSONB (almacenar mensajes) |
| Jinja2 templates | Elimina la necesidad de un segundo servicio frontend |
| SQLAlchemy ORM | Migrations con Alembic, abstracción de la BD |

## 2.3. Flujo principal del sistema

```
┌──────────┐     (1) Chat con bot      ┌─────────────┐
│  USUARIO │ ─────────────────────────▶│   CHATBOT   │
│          │◀─────────────────────────-│  (GPT-4o)   │
└──────────┘     (2) Respuesta         └─────────────┘
                                              │
                                    (3) Almacena conversación
                                              │
┌──────────┐     (4) Ve conversación   ┌──────▼──────┐
│  ADMIN   │◀────────────────────────-│    BD       │
│          │                           │ PostgreSQL  │
│          │ ──(5) Envía feedback──────▶             │
└──────────┘                           └──────┬──────┘
      ▲                                       │
      │                               (6) Contexto completo
      │                                       │
      │            ┌──────────────────────────▼──────────┐
      │            │          META-AGENTE (GPT-4o)        │
      │            │  • Recupera conversación             │
      │            │  • Analiza causa raíz                │
      │            │  • ¿Problema en prompt? Sí/No        │
      │            │  • Propone modificación              │
      │            └──────────────────────────┬──────────┘
      │                                       │
      └─────(7) Muestra propuesta────────────┘
      │
      │ (8) Admin confirma/rechaza
      │
      ▼
┌─────────────┐
│ Nuevo prompt│ ← (9) Se aplica y versiona
│  del bot    │
└─────────────┘
```

## 2.4. Consideraciones de escalabilidad

La arquitectura está preparada para evolucionar hacia:
- **Extracción de microservicios**: el meta-agente puede separarse en su propio servicio con cola de mensajes (Redis/RabbitMQ).
- **Multi-agente**: el módulo `prompts` puede extenderse para gestionar múltiples chatbots simultáneos.
- **Análisis de workflows**: el módulo `meta_agent` tiene una interfaz preparada para recibir contexto externo adicional.

---

# 3. Modelo de Datos

## 3.1. Visión general

El modelo de datos soporta tres flujos principales: (1) la conversación del chatbot con el usuario, (2) el feedback del administrador sobre conversaciones problemáticas, y (3) el historial de versiones del prompt con trazabilidad hacia el feedback que originó cada cambio.

Se utiliza un **modelo relacional normalizado (3FN)** sobre PostgreSQL, con uso de `JSONB` para almacenar los mensajes de conversación de forma flexible y eficiente.

## 3.2. Diagrama Entidad-Relación

```
┌─────────────────┐       ┌──────────────────────┐
│   conversations  │       │       messages        │
├─────────────────┤       ├──────────────────────┤
│ id (PK, UUID)   │──────▶│ id (PK, UUID)        │
│ session_id      │       │ conversation_id (FK) │
│ workflow_id     │       │ role (user/assistant) │
│ execution_id    │       │ content (TEXT)        │
│ user_identifier │       │ created_at            │
│ created_at      │       └──────────┬───────────┘
│ updated_at      │                  │
└─────────────────┘                  │ (1:1, optional)
                                     │
                          ┌──────────▼───────────┐
                          │       feedback        │
                          ├──────────────────────┤
                          │ id (PK, UUID)         │
                          │ message_id (FK)       │
                          │ admin_comment (TEXT)  │
                          │ expected_response     │
                          │ status (ENUM)         │
                          │ created_at            │
                          └──────────┬────────────┘
                                     │
                          ┌──────────▼───────────┐
                          │   feedback_analysis   │
                          ├──────────────────────┤
                          │ id (PK, UUID)         │
                          │ feedback_id (FK)      │
                          │ root_cause (ENUM)     │
                          │ analysis (TEXT)       │
                          │ proposed_prompt (TEXT)│
                          │ accepted (BOOLEAN)    │
                          │ created_at            │
                          └──────────────────────┘

┌─────────────────────────────────────────┐
│            prompt_versions              │
├─────────────────────────────────────────┤
│ id (PK, UUID)                           │
│ version_number (INT)                    │
│ content (TEXT)                          │
│ is_active (BOOLEAN)                     │
│ feedback_analysis_id (FK, nullable)     │  ← trazabilidad
│ created_at                              │
│ created_by (admin/system)               │
└─────────────────────────────────────────┘
```

## 3.3. Descripción de entidades

### `conversations`
Representa una sesión completa de conversación entre un usuario y el chatbot.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID PK | Identificador único |
| `session_id` | VARCHAR | ID de sesión del navegador |
| `workflow_id` | VARCHAR nullable | ID del workflow externo si aplica |
| `execution_id` | VARCHAR nullable | ID de ejecución del workflow |
| `user_identifier` | VARCHAR | Email o ID anónimo del usuario |
| `created_at` | TIMESTAMP | Inicio de la conversación |
| `updated_at` | TIMESTAMP | Último mensaje de la conversación |

### `messages`
Cada mensaje individual dentro de una conversación.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID PK | Identificador único |
| `conversation_id` | UUID FK | Conversación a la que pertenece |
| `role` | ENUM(`user`, `assistant`) | Quién envió el mensaje |
| `content` | TEXT | Contenido del mensaje |
| `created_at` | TIMESTAMP | Momento del mensaje |

### `feedback`
Feedback estructurado de un administrador sobre un mensaje problemático.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID PK | Identificador único |
| `message_id` | UUID FK | Mensaje sobre el que se da feedback |
| `admin_comment` | TEXT | Descripción del problema por el admin |
| `expected_response` | TEXT nullable | Cómo debería haber respondido el bot |
| `status` | ENUM(`PENDING`, `ANALYSED`, `APPLIED`, `REJECTED`) | Estado del feedback |
| `created_at` | TIMESTAMP | Cuándo se creó el feedback |

### `feedback_analysis`
Resultado del análisis del meta-agente sobre un feedback.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID PK | Identificador único |
| `feedback_id` | UUID FK | Feedback analizado |
| `root_cause` | ENUM(`PROMPT`, `EXTERNAL_DATA`, `WORKFLOW`, `UNKNOWN`) | Causa raíz identificada |
| `analysis` | TEXT | Razonamiento del meta-agente |
| `proposed_prompt` | TEXT nullable | Nuevo prompt propuesto (si causa es PROMPT) |
| `accepted` | BOOLEAN nullable | Si el admin aceptó o rechazó la propuesta |
| `created_at` | TIMESTAMP | Cuándo se realizó el análisis |

### `prompt_versions`
Historial versionado del prompt del sistema del chatbot.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID PK | Identificador único |
| `version_number` | INTEGER | Número secuencial de versión |
| `content` | TEXT | Contenido completo del prompt |
| `is_active` | BOOLEAN | Si esta es la versión activa actualmente |
| `feedback_analysis_id` | UUID FK nullable | Análisis que originó este cambio |
| `created_at` | TIMESTAMP | Cuándo se creó esta versión |
| `created_by` | VARCHAR | `admin` o `system` |

## 3.4. Relaciones principales

- Una `conversation` tiene muchos `messages`.
- Un `message` puede tener un `feedback` (relación 1:1 opcional).
- Un `feedback` genera un `feedback_analysis` (relación 1:1).
- Un `feedback_analysis` puede originar una `prompt_version` (trazabilidad completa).

---

# 4. Especificación de la API

## 4.1. Visión general

La API REST expone los recursos necesarios para el flujo completo del sistema: chat con el bot, gestión de feedback administrativo, ejecución del meta-agente y gestión de versiones de prompts.

- **Base path:** `/api/v1`
- **Formato:** JSON
- **Autenticación:** API Key en header (MVP simplificado, sin JWT completo)
- **Errores:** Códigos HTTP estándar + payload consistente

## 4.2. Respuesta de error estándar

```json
{
  "error": "RESOURCE_NOT_FOUND",
  "message": "Feedback with id 'abc-123' not found",
  "detail": null
}
```

## 4.3. OpenAPI Specification

```yaml
openapi: 3.0.3
info:
  title: ChatBot Self-Improvement System API
  version: 1.0.0
  description: API para el sistema de mejora continua de chatbots con human-in-the-loop

servers:
  - url: /api/v1

components:
  schemas:

    ChatMessage:
      type: object
      required: [message, session_id]
      properties:
        message:
          type: string
          description: Mensaje del usuario al chatbot
        session_id:
          type: string
          description: Identificador de sesión del usuario
        user_identifier:
          type: string
          description: Email o identificador del usuario (opcional)

    ChatResponse:
      type: object
      properties:
        response:
          type: string
        message_id:
          type: string
          format: uuid
        conversation_id:
          type: string
          format: uuid

    FeedbackCreate:
      type: object
      required: [message_id, admin_comment]
      properties:
        message_id:
          type: string
          format: uuid
        admin_comment:
          type: string
          description: Descripción del problema detectado por el admin
        expected_response:
          type: string
          description: Cómo debería haber respondido el bot (opcional)

    FeedbackAnalysis:
      type: object
      properties:
        id:
          type: string
          format: uuid
        root_cause:
          type: string
          enum: [PROMPT, EXTERNAL_DATA, WORKFLOW, UNKNOWN]
        analysis:
          type: string
          description: Razonamiento del meta-agente
        proposed_prompt:
          type: string
          nullable: true
          description: Nuevo prompt propuesto (solo si root_cause es PROMPT)

    PromptVersion:
      type: object
      properties:
        id:
          type: string
          format: uuid
        version_number:
          type: integer
        content:
          type: string
        is_active:
          type: boolean
        created_at:
          type: string
          format: date-time

paths:

  /chat:
    post:
      summary: Enviar mensaje al chatbot
      tags: [Chatbot]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ChatMessage'
      responses:
        '200':
          description: Respuesta del chatbot
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ChatResponse'

  /conversations:
    get:
      summary: Listar conversaciones (panel admin)
      tags: [Admin]
      parameters:
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
        - name: offset
          in: query
          schema:
            type: integer
            default: 0
      responses:
        '200':
          description: Lista de conversaciones con sus mensajes

  /conversations/{conversation_id}:
    get:
      summary: Obtener conversación completa con mensajes
      tags: [Admin]
      parameters:
        - name: conversation_id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Conversación completa
        '404':
          description: Conversación no encontrada

  /feedback:
    post:
      summary: Crear feedback sobre un mensaje problemático
      tags: [Feedback]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/FeedbackCreate'
      responses:
        '201':
          description: Feedback creado
    get:
      summary: Listar feedbacks (panel admin)
      tags: [Feedback]
      responses:
        '200':
          description: Lista de feedbacks con estado

  /feedback/{feedback_id}/analyse:
    post:
      summary: Ejecutar meta-agente para analizar feedback
      tags: [Meta-Agente]
      parameters:
        - name: feedback_id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Resultado del análisis del meta-agente
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/FeedbackAnalysis'

  /feedback/{feedback_id}/apply:
    post:
      summary: Admin confirma y aplica la propuesta del meta-agente
      tags: [Meta-Agente]
      parameters:
        - name: feedback_id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Propuesta aplicada, nuevo prompt activo

  /feedback/{feedback_id}/reject:
    post:
      summary: Admin rechaza la propuesta del meta-agente
      tags: [Meta-Agente]
      parameters:
        - name: feedback_id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Propuesta rechazada

  /prompts:
    get:
      summary: Listar historial de versiones de prompts
      tags: [Prompts]
      responses:
        '200':
          description: Lista de versiones ordenadas por número de versión desc

  /prompts/active:
    get:
      summary: Obtener prompt activo actual del chatbot
      tags: [Prompts]
      responses:
        '200':
          description: Prompt activo
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PromptVersion'

  /prompts/{prompt_id}/activate:
    post:
      summary: Revertir a una versión anterior de prompt
      tags: [Prompts]
      parameters:
        - name: prompt_id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Versión activada

  /health:
    get:
      summary: Health check
      responses:
        '200':
          description: Sistema operativo
```

## 4.4. Decisiones clave de API

- El meta-agente **no aplica cambios automáticamente** — siempre requiere confirmación vía `/apply`.
- El endpoint `/analyse` es idempotente — si el feedback ya fue analizado, devuelve el análisis existente.
- La autenticación en Phase 0 es mediante API Key simple en header `X-Admin-Key` para el panel de administración.
- El chatbot es accesible sin autenticación (simula un widget público).

---

# 5. User Stories

## 5.1. Must-Have (Phase 0)

---

### US-01: Conversar con el chatbot

#### Descripción

**Como** usuario final,  
**quiero** enviar mensajes al chatbot y recibir respuestas en tiempo real,  
**para** obtener asistencia sobre el dominio del bot (atención al cliente genérica).

#### Criterios de Aceptación

- El sistema procesa el mensaje del usuario y devuelve una respuesta generada por el LLM.
- Cada conversación y mensaje se almacena con su `session_id` para permitir trazabilidad posterior.
- El chatbot usa el prompt activo en ese momento de la tabla `prompt_versions`.
- La interfaz es una página web simple con campo de texto y área de respuesta.

#### Notas adicionales
- El chatbot de demo responde sobre atención al cliente genérica (preguntas frecuentes, productos, etc.).
- No se requiere autenticación para el usuario final en Phase 0.

#### Historias relacionadas
- US-02: Ver conversaciones en el panel admin
- US-03: Dar feedback sobre respuesta incorrecta

---

### US-02: Ver conversaciones en el panel administrativo

#### Descripción

**Como** administrador,  
**quiero** ver el listado de conversaciones del chatbot con todos sus mensajes,  
**para** identificar respuestas incorrectas o mejorables que requieren feedback.

#### Criterios de Aceptación

- El panel admin muestra el listado de conversaciones ordenadas por fecha descendente.
- Al seleccionar una conversación se muestran todos sus mensajes con el turno de cada rol (usuario/asistente).
- Cada mensaje tiene un botón "Reportar problema" para iniciar el flujo de feedback.
- El panel requiere autenticación mediante API Key.

#### Notas adicionales
- En Phase 0 hay un único administrador. No se gestiona multi-admin.

#### Historias relacionadas
- US-01: Conversar con el chatbot
- US-03: Dar feedback sobre respuesta incorrecta

---

### US-03: Dar feedback sobre una respuesta incorrecta

#### Descripción

**Como** administrador,  
**quiero** marcar una respuesta del bot como incorrecta y describir el problema,  
**para** que el meta-agente tenga contexto suficiente para proponer una mejora.

#### Criterios de Aceptación

- El admin puede seleccionar un mensaje específico del bot y enviar feedback.
- El feedback incluye: descripción del problema (obligatorio) y respuesta esperada (opcional).
- El feedback se almacena con estado `PENDING` y queda disponible para análisis.
- El sistema confirma al admin que el feedback fue registrado.

#### Notas adicionales
- No se permite feedback sobre mensajes del usuario, solo sobre respuestas del asistente.

#### Historias relacionadas
- US-02: Ver conversaciones en el panel admin
- US-04: Analizar feedback con el meta-agente

---

### US-04: Analizar feedback con el meta-agente

#### Descripción

**Como** administrador,  
**quiero** que el meta-agente analice el feedback que proporcioné y diagnostique la causa raíz del problema,  
**para** recibir una propuesta de mejora concreta y fundamentada.

#### Criterios de Aceptación

- El admin puede ejecutar el análisis del meta-agente sobre un feedback en estado `PENDING`.
- El meta-agente recupera la conversación completa y el prompt activo como contexto.
- El sistema clasifica la causa raíz en: `PROMPT`, `EXTERNAL_DATA`, `WORKFLOW`, o `UNKNOWN`.
- Si la causa es `PROMPT`: el sistema devuelve un nuevo prompt propuesto con justificación.
- Si la causa es otra: el sistema devuelve un diagnóstico explicativo al admin.
- El resultado del análisis se muestra al admin antes de tomar ninguna acción.

#### Notas adicionales
- El análisis puede tardar varios segundos (llamada a OpenAI). La UI debe reflejar el estado de carga.
- El meta-agente usa GPT-4o-mini para el análisis.

#### Historias relacionadas
- US-03: Dar feedback sobre respuesta incorrecta
- US-05: Confirmar o rechazar propuesta del meta-agente

---

### US-05: Confirmar o rechazar la propuesta del meta-agente

#### Descripción

**Como** administrador,  
**quiero** revisar la propuesta del meta-agente y decidir si aplicarla o rechazarla,  
**para** mantener el control humano sobre los cambios en el comportamiento del chatbot.

#### Criterios de Aceptación

- El admin ve claramente el prompt actual vs. el prompt propuesto (diff visual si es posible).
- El admin tiene dos acciones: "Aplicar propuesta" o "Rechazar propuesta".
- Si acepta: se crea una nueva versión en `prompt_versions`, se marca como activa, y el feedback pasa a estado `APPLIED`.
- Si rechaza: el feedback pasa a estado `REJECTED` y el prompt no cambia.
- En ambos casos, el resultado queda registrado en `feedback_analysis`.

#### Notas adicionales
- El chatbot usa inmediatamente el nuevo prompt en la siguiente conversación tras aplicar el cambio.

#### Historias relacionadas
- US-04: Analizar feedback con el meta-agente
- US-06: Ver historial de versiones de prompts

---

### US-06: Ver historial de versiones de prompts

#### Descripción

**Como** administrador,  
**quiero** ver el historial completo de versiones del prompt del chatbot,  
**para** entender la evolución del bot y poder revertir a una versión anterior si es necesario.

#### Criterios de Aceptación

- El panel muestra todas las versiones del prompt ordenadas por número de versión descendente.
- Para cada versión se muestra: número de versión, fecha, si es la activa, y el feedback que la originó (si aplica).
- El admin puede revertir a cualquier versión anterior con un clic.
- La versión activa queda claramente señalizada.

#### Notas adicionales
- La reversión crea una nueva entrada en `prompt_versions` (no sobreescribe el historial).

#### Historias relacionadas
- US-05: Confirmar o rechazar propuesta del meta-agente

---

## 5.2. Should-Have (Phase 0 — opcionales)

### US-07: Dashboard de métricas básicas

**Como** administrador,  
**quiero** ver estadísticas básicas del sistema de mejora,  
**para** evaluar la efectividad del ciclo human-in-the-loop.

**Criterios de Aceptación:**
- Número total de feedbacks procesados.
- Número de cambios de prompt aplicados.
- Tasa de aceptación de propuestas del meta-agente (aceptadas / total analizadas).
- Distribución de causas raíz identificadas.

---

## 5.3. Alcance de User Stories — Phase 0

**Incluido:**
- Flujo E2E completo: chat → feedback → análisis → propuesta → confirmación → nuevo prompt.
- Trazabilidad completa de cada cambio hasta su feedback de origen.
- Control humano explícito en cada decisión crítica.

**Excluido:**
- Multi-admin y gestión de roles.
- Análisis automático de workflows externos.
- Notificaciones (email, Slack).
- Fine-tuning del modelo base.
- Análisis de causa raíz en fuentes de datos externas.

---

# 6. Tickets de trabajo

Estimaciones con metodología Fibonacci. Ordenados por prioridad de implementación.

---

## TICKET-01 — Setup del proyecto y estructura base

**Tipo:** Técnico / Configuración  
**Descripción:** Crear la estructura del proyecto FastAPI con módulos separados por dominio, configuración de entorno, Docker Compose con PostgreSQL, y conexión base con SQLAlchemy + Alembic.

**Criterios de Aceptación:**
- Estructura de carpetas organizada por módulo (chatbot, feedback, meta_agent, prompts, shared).
- `docker-compose.yml` con PostgreSQL y el backend.
- Variables de entorno centralizadas en `.env` con `.env.example`.
- Health check endpoint `/api/v1/health` operativo.
- README de ejecución local funcional.

**Prioridad:** Alta | **Estimación:** 3 | **Etiquetas:** `setup`, `arquitectura`, `phase-0`

---

## TICKET-02 — Modelo de datos y migraciones Alembic

**Tipo:** Técnico / Persistencia  
**Descripción:** Implementar el esquema completo de base de datos según el ERD: tablas `conversations`, `messages`, `feedback`, `feedback_analysis`, `prompt_versions` con sus relaciones y restricciones.

**Criterios de Aceptación:**
- Todas las tablas creadas con migraciones Alembic versionadas.
- Claves foráneas y restricciones de integridad definidas.
- Script de seed con datos iniciales: prompt v1 activo y una conversación de ejemplo.
- Modelos SQLAlchemy correspondientes a cada tabla.

**Prioridad:** Alta | **Estimación:** 5 | **Etiquetas:** `base-de-datos`, `alembic`, `phase-0`

---

## TICKET-03 — Módulo chatbot: API + integración OpenAI

**Tipo:** Funcionalidad  
**Descripción:** Implementar el endpoint `POST /api/v1/chat` que recibe el mensaje del usuario, recupera el prompt activo de BD, llama a OpenAI GPT-4o-mini y almacena la conversación completa.

**Criterios de Aceptación:**
- El endpoint procesa mensajes y devuelve respuestas del LLM.
- Cada llamada crea/actualiza `conversations` y crea `messages` (user + assistant).
- El prompt usado es siempre el `is_active=True` de `prompt_versions`.
- Manejo de errores: timeout de OpenAI, prompt no encontrado.

**Prioridad:** Alta | **Estimación:** 5 | **Etiquetas:** `chatbot`, `openai`, `core`

---

## TICKET-04 — Módulo feedback: CRUD y panel admin (API)

**Tipo:** Funcionalidad  
**Descripción:** Implementar los endpoints de feedback: crear feedback sobre un mensaje, listar feedbacks, y listar/detallar conversaciones para el panel de administración.

**Criterios de Aceptación:**
- `POST /api/v1/feedback` crea feedback con estado `PENDING`.
- `GET /api/v1/feedback` lista todos los feedbacks con estado y fecha.
- `GET /api/v1/conversations` lista conversaciones paginadas.
- `GET /api/v1/conversations/{id}` devuelve conversación completa con mensajes.
- Validación: solo se puede dar feedback sobre mensajes con `role=assistant`.

**Prioridad:** Alta | **Estimación:** 5 | **Etiquetas:** `feedback`, `admin`, `api`

---

## TICKET-05 — Meta-agente: lógica de análisis de causa raíz

**Tipo:** Funcionalidad / IA  
**Descripción:** Implementar el núcleo del sistema. El endpoint `POST /api/v1/feedback/{id}/analyse` orquesta: recuperar contexto completo, construir el prompt del meta-agente, llamar a OpenAI, parsear el resultado y almacenarlo en `feedback_analysis`.

**Criterios de Aceptación:**
- El meta-agente recibe: conversación completa + prompt activo + feedback del admin.
- El resultado contiene `root_cause` (enum) + `analysis` (texto) + `proposed_prompt` (si aplica).
- La respuesta de OpenAI se parsea de forma robusta (JSON estructurado).
- Si el análisis ya existe para ese feedback, se devuelve el existente (idempotencia).
- El estado del feedback cambia a `ANALYSED`.

**Prioridad:** Alta | **Estimación:** 8 | **Etiquetas:** `meta-agente`, `openai`, `core`, `ia`

---

## TICKET-06 — Aplicar/rechazar propuesta y versionado de prompts

**Tipo:** Funcionalidad  
**Descripción:** Implementar los endpoints `/apply` y `/reject` del feedback. Al aplicar: crear nueva `prompt_version` activa, desactivar la anterior, actualizar estado del feedback.

**Criterios de Aceptación:**
- `POST /feedback/{id}/apply` crea nuevo prompt activo con `version_number` incrementado.
- El `feedback_analysis_id` queda vinculado en la nueva versión (trazabilidad).
- `POST /feedback/{id}/reject` actualiza estado a `REJECTED`, no modifica prompts.
- Solo se puede aplicar/rechazar feedback en estado `ANALYSED`.
- `GET /api/v1/prompts` lista todas las versiones ordenadas.
- `POST /api/v1/prompts/{id}/activate` permite revertir a versión anterior.

**Prioridad:** Alta | **Estimación:** 5 | **Etiquetas:** `prompts`, `versionado`, `core`

---

## TICKET-07 — Frontend: interfaz de chat del usuario (Jinja2)

**Tipo:** Frontend  
**Descripción:** Crear la página web de chat para el usuario final usando Jinja2 templates servidas por FastAPI. Interfaz simple con campo de texto, historial de mensajes y gestión de `session_id`.

**Criterios de Aceptación:**
- Página `/chat` con UI de chat funcional.
- Los mensajes se envían via fetch/AJAX al endpoint `/api/v1/chat`.
- El `session_id` se genera en el cliente y se mantiene en la sesión.
- Diseño básico pero usable (Bootstrap o TailwindCSS via CDN).
- Indicador de carga mientras el bot responde.

**Prioridad:** Alta | **Estimación:** 3 | **Etiquetas:** `frontend`, `jinja2`, `ux`

---

## TICKET-08 — Frontend: panel de administración (Jinja2)

**Tipo:** Frontend  
**Descripción:** Crear el panel de administración completo: listado de conversaciones, vista de conversación con botón de feedback, formulario de feedback, vista de análisis del meta-agente, confirmación/rechazo, e historial de prompts.

**Criterios de Aceptación:**
- `/admin/conversations` muestra listado de conversaciones con paginación.
- `/admin/conversations/{id}` muestra mensajes con botón "Reportar" en cada respuesta del bot.
- `/admin/feedback` muestra listado de feedbacks con estado y botón "Analizar".
- Modal/página de análisis muestra resultado del meta-agente con botones Aplicar/Rechazar.
- `/admin/prompts` muestra historial de versiones con botón de revertir.
- Autenticación básica con API Key vía cookie de sesión.

**Prioridad:** Alta | **Estimación:** 8 | **Etiquetas:** `frontend`, `admin`, `ux`

---

## TICKET-09 — Tests: unitarios e integración

**Tipo:** Calidad  
**Descripción:** Implementar suite de tests para los módulos core: servicio del meta-agente (mockeando OpenAI), lógica de versionado de prompts, y endpoints principales via TestClient de FastAPI.

**Criterios de Aceptación:**
- Tests unitarios para `MetaAgentService`: clasificación de causa raíz, construcción de prompt.
- Tests de integración para endpoints: `/chat`, `/feedback`, `/feedback/{id}/analyse`, `/feedback/{id}/apply`.
- OpenAI mockeado en tests (no se hacen llamadas reales).
- Cobertura mínima del 60% en módulos core.
- `pytest` configurado y ejecutable con `make test`.

**Prioridad:** Media | **Estimación:** 5 | **Etiquetas:** `testing`, `pytest`, `calidad`

---

## TICKET-10 — Test E2E del flujo principal

**Tipo:** Calidad / E2E  
**Descripción:** Implementar el test E2E que valida el flujo completo: usuario chatea → admin da feedback → meta-agente analiza → admin aplica → nuevo prompt activo.

**Criterios de Aceptación:**
- Test con `pytest` + `httpx` que ejecuta el flujo completo contra la app en modo test.
- Verifica que el prompt activo cambia tras aplicar una propuesta.
- Verifica trazabilidad: la nueva versión del prompt referencia el `feedback_analysis_id`.
- Ejecutable en CI/CD (GitHub Actions).

**Prioridad:** Media | **Estimación:** 5 | **Etiquetas:** `e2e`, `testing`, `flujo-principal`

---

## TICKET-11 — CI/CD y despliegue en Railway

**Tipo:** Infraestructura  
**Descripción:** Configurar pipeline de GitHub Actions (test → build → deploy) y despliegue en Railway con PostgreSQL gestionado.

**Criterios de Aceptación:**
- Pipeline con 3 jobs: `test` → `build` → `deploy`.
- Variables de entorno (OpenAI API Key, DB URL) gestionadas como secrets en GitHub/Railway.
- URL pública accesible con el chatbot funcionando.
- `render.yaml` o `railway.toml` configurado correctamente.

**Prioridad:** Alta | **Estimación:** 5 | **Etiquetas:** `cicd`, `despliegue`, `railway`

---

## 6.1. Resumen de estimación (Fibonacci)

| Área | Tickets | Puntos |
|------|---------|--------|
| Setup e infraestructura | T01, T11 | 8 |
| Datos y persistencia | T02 | 5 |
| Backend core | T03, T04, T05, T06 | 23 |
| Frontend | T07, T08 | 11 |
| Testing | T09, T10 | 10 |
| **Total** | **11 tickets** | **57 puntos** |

---

# 7. Ejecución de la aplicación

## 7.1. Estructura del proyecto

```
finalproject-VSL/
├── backend/
│   ├── app/
│   │   ├── modules/
│   │   │   ├── chatbot/       # Chat endpoint + service
│   │   │   ├── feedback/      # Feedback CRUD
│   │   │   ├── meta_agent/    # Meta-agent service
│   │   │   └── prompts/       # Prompt versioning
│   │   ├── shared/            # Config, errors, DB session
│   │   ├── templates/         # Jinja2 HTML templates
│   │   ├── static/            # CSS, JS
│   │   └── main.py            # FastAPI app entry point
│   ├── alembic/               # DB migrations
│   ├── tests/                 # Unit + integration + E2E tests
│   ├── .env.example
│   ├── requirements.txt
│   └── Dockerfile
├── docker-compose.yml
├── .github/workflows/
│   └── pipeline.yml
├── docs/
│   ├── architecture_diagram.png
│   └── erd_diagram.png
└── readme-VSL.md
```

## 7.2. Pre-requisitos

- Python 3.11+
- Docker y Docker Compose
- OpenAI API Key

## 7.3. Variables de entorno

```bash
# backend/.env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/chatbot_improvement
OPENAI_API_KEY=sk-...
ADMIN_API_KEY=admin-secret-key-change-in-production
SECRET_KEY=your-secret-key-here
ENVIRONMENT=development
```

## 7.4. Iniciar con Docker Compose

```bash
cd finalproject-VSL

# Copiar variables de entorno
cp backend/.env.example backend/.env
# Editar backend/.env con tus valores

# Iniciar todos los servicios
docker-compose up --build

# La app estará disponible en:
# - Chatbot (usuario): http://localhost:8000/chat
# - Panel admin:       http://localhost:8000/admin
# - API docs:          http://localhost:8000/docs
```

## 7.5. Ejecución local sin Docker

```bash
cd finalproject-VSL/backend

# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Aplicar migraciones
alembic upgrade head

# Cargar datos iniciales
python -m app.shared.seed

# Iniciar servidor de desarrollo
uvicorn app.main:app --reload --port 8000
```

## 7.6. Testing

```bash
cd finalproject-VSL/backend

# Tests unitarios e integración
pytest tests/ -v

# Con cobertura
pytest tests/ --cov=app --cov-report=html

# Solo test E2E del flujo principal
pytest tests/e2e/ -v
```

---

# 8. Guías y Demos

- **URL pública:** https://chatbot-self-improvement-production.up.railway.app/
- **Chatbot (usuario):** https://chatbot-self-improvement-production.up.railway.app/chat
- **Panel admin:** https://chatbot-self-improvement-production.up.railway.app/admin
- **API docs (Swagger):** https://chatbot-self-improvement-production.up.railway.app/docs

**Credenciales de demo:**
- Admin API Key: `admin-secret-key`

**Flujo de demostración:**
1. Ve a `/chat` y envía mensajes al bot
2. Ve a `/admin/conversations` y selecciona la conversación
3. Click en "Reportar" en una respuesta del bot
4. Ve a `/admin/feedback` y click en "Analizar"
5. Revisa la propuesta del meta-agente y aplícala
6. Ve a `/admin/prompts` para ver el historial de versiones

---

*Última actualización: Abril 2026*  
*ChatBot Self-Improvement System — AI4Devs Final Project*  
*Autor: Cronos Consulting — Iniciales: VSL*
