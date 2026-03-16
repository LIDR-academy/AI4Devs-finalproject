# 📡 API Specifications - Nura System

## Overview

**RESTful API Design** con OpenAPI 3.0 siguiendo principios de Domain-Driven Design y arquitectura microkernel. Incluye especificaciones completas para todos los módulos del sistema Nura.

**Design Principles**:
- **RESTful Architecture**: HTTP methods semánticamente correctos
- **Domain Separation**: APIs organizadas por bounded contexts
- **Versioning Strategy**: API versioning con backward compatibility
- **Security First**: OAuth 2.0 + PKCE integration
- **Real-time Support**: WebSocket endpoints para comunicación live
- **Comprehensive Documentation**: OpenAPI 3.0 con ejemplos completos

---

## API Dictionary by Bounded Context

### Overview de APIs por Dominio

| **Bounded Context** | **API Endpoint** | **Método** | **Descripción** | **Autenticación** |
|---------------------|------------------|------------|-----------------|-------------------|
| **Authentication** | `/auth/oauth/authorize` | GET | Inicia flujo OAuth 2.0 con PKCE para autenticación corporativa | No requerida |
| **Authentication** | `/auth/oauth/callback` | POST | Intercambia código de autorización por token de acceso | No requerida |
| **Authentication** | `/auth/refresh` | POST | Refresca token de acceso expirado | No requerida |
| **User Management** | `/users/me` | GET | Obtiene perfil del usuario autenticado | Bearer/OAuth2 |
| **User Management** | `/users/me` | PUT | Actualiza perfil y preferencias del usuario | Bearer/OAuth2 |
| **Conversation Management** | `/conversations` | GET | Lista conversaciones del usuario con filtros y paginación | Bearer/OAuth2 |
| **Conversation Management** | `/conversations` | POST | Crea nueva conversación con tipo y configuración | Bearer/OAuth2 |
| **Conversation Management** | `/conversations/{id}` | GET | Obtiene detalles específicos de una conversación | Bearer/OAuth2 |
| **Conversation Management** | `/conversations/{id}` | PUT | Actualiza metadatos de conversación (título, estado, tags) | Bearer/OAuth2 |
| **Conversation Management** | `/conversations/{id}` | DELETE | Elimina conversación permanentemente | Bearer/OAuth2 |
| **Message Handling** | `/conversations/{id}/messages` | GET | Obtiene historial de mensajes con paginación y metadata | Bearer/OAuth2 |
| **Chat Processing** | `/chat/message` | POST | Envía mensaje y obtiene respuesta con routing inteligente | Bearer/OAuth2 |
| **Agent Orchestration** | `/orchestration/agents` | GET | Lista agentes disponibles con capacidades y estado | Bearer/OAuth2 |
| **Agent Orchestration** | `/orchestration/agent-status/{type}` | GET | Obtiene estado específico de un agente (dev, pm, architect) | Bearer/OAuth2 |
| **Advanced RAG** | `/rag/search` | POST | Búsqueda avanzada con Late Chunking y Contextual Retrieval | Bearer/OAuth2 |
| **Advanced RAG** | `/rag/index/documents` | POST | Indexa documentos con estrategias de chunking configurables | Bearer/OAuth2 |
| **Analytics** | `/analytics/usage` | GET | Métricas de uso con granularidad temporal y filtros | Bearer/OAuth2 |
| **System Health** | `/health` | GET | Estado de salud del sistema para monitoring | No requerida |
| **Webhooks** | `/webhooks/oauth` | POST | Manejo de notificaciones de proveedores OAuth | API Key |

### Detalle por Bounded Context

#### 🔐 **Authentication Bounded Context**
**Responsabilidad**: Gestión de autenticación OAuth 2.0 + PKCE para integración corporativa

| Endpoint | Propósito | Casos de Uso |
|----------|-----------|--------------|
| `GET /auth/oauth/authorize` | Redirección OAuth | Login corporativo con Google Workspace, GitHub, Microsoft |
| `POST /auth/oauth/callback` | Token exchange | Completar flujo OAuth, validar domain corporativo |
| `POST /auth/refresh` | Token refresh | Mantener sesión activa, renovación automática |

#### 👤 **User Management Bounded Context**
**Responsabilidad**: Gestión de perfiles de usuario y preferencias personalizadas

| Endpoint | Propósito | Casos de Uso |
|----------|-----------|--------------|
| `GET /users/me` | Perfil usuario | Dashboard personal, configuración inicial |
| `PUT /users/me` | Actualización perfil | Cambio rol (junior→senior), preferencias idioma, notificaciones |

#### 💬 **Conversation Management Bounded Context**
**Responsabilidad**: Lifecycle completo de conversaciones con metadata y organización

| Endpoint | Propósito | Casos de Uso |
|----------|-----------|--------------|
| `GET /conversations` | Lista conversaciones | Dashboard histórico, búsqueda por tags, filtros por tipo |
| `POST /conversations` | Crear conversación | Nueva sesión chat, proyecto específico, contexto arquitectura |
| `GET /conversations/{id}` | Detalles conversación | Continuar sesión, ver metadata, análisis contexto |
| `PUT /conversations/{id}` | Actualizar conversación | Cambiar título, archivar, actualizar tags, cambiar estado |
| `DELETE /conversations/{id}` | Eliminar conversación | Cleanup data, privacidad compliance |

#### 📨 **Message Handling Bounded Context**
**Responsabilidad**: Gestión de mensajes dentro de conversaciones con metadata LLM

| Endpoint | Propósito | Casos de Uso |
|----------|-----------|--------------|
| `GET /conversations/{id}/messages` | Historial mensajes | Cargar contexto, paginación, análisis costos LLM |

#### 🤖 **Chat Processing Bounded Context**
**Responsabilidad**: Core processing de mensajes con routing inteligente a agentes especializados

| Endpoint | Propósito | Casos de Uso |
|----------|-----------|--------------|
| `POST /chat/message` | Envío mensaje | Consulta código, review arquitectura, debugging, planning features |

#### ⚡ **Agent Orchestration Bounded Context**
**Responsabilidad**: Gestión y routing de agentes especializados (Dev, PM, Architect)

| Endpoint | Propósito | Casos de Uso |
|----------|-----------|--------------|
| `GET /orchestration/agents` | Lista agentes | Status dashboard, capacity planning, load balancing |
| `GET /orchestration/agent-status/{type}` | Estado específico | Health checks, routing decisions, user feedback |

#### 🧠 **Advanced RAG Bounded Context**
**Responsabilidad**: Búsqueda inteligente con Late Chunking y Contextual Retrieval

| Endpoint | Propósito | Casos de Uso |
|----------|-----------|--------------|
| `POST /rag/search` | Búsqueda avanzada | Encontrar patrones código, best practices, documentación técnica |
| `POST /rag/index/documents` | Indexación documentos | Actualizar knowledge base, import proyectos, sync repositories |

#### 📊 **Analytics Bounded Context**
**Responsabilidad**: Métricas de uso, costos LLM y performance para optimización

| Endpoint | Propósito | Casos de Uso |
|----------|-----------|--------------|
| `GET /analytics/usage` | Métricas uso | Cost tracking, performance monitoring, usage optimization |

#### 🏥 **System Health Bounded Context**
**Responsabilidad**: Monitoring y health checks para operaciones SRE

| Endpoint | Propósito | Casos de Uso |
|----------|-----------|--------------|
| `GET /health` | Health check | Load balancer checks, monitoring alerts, uptime tracking |

#### 🔗 **Webhooks Bounded Context**
**Responsabilidad**: Integración con sistemas externos para eventos asíncronos

| Endpoint | Propósito | Casos de Uso |
|----------|-----------|--------------|
| `POST /webhooks/oauth` | Eventos OAuth | Token revocation, user changes, domain verification |

### Patrones de Diseño por BC

#### **RESTful Patterns**
- **Resource-based URLs**: Cada BC expone recursos claramente identificados
- **HTTP Methods Semantics**: GET (read), POST (create), PUT (update), DELETE (remove)
- **Stateless Communication**: Cada request es independiente con auth token

#### **Authentication Patterns**
- **OAuth 2.0 + PKCE**: Para authentication BC con security enhancement
- **Bearer Tokens**: Para BCs operacionales (conversaciones, chat, RAG)
- **API Keys**: Para webhooks y integraciones sistema-a-sistema

#### **Error Handling Patterns**
- **Consistent Error Format**: Todos los BCs usan mismo formato error response
- **HTTP Status Codes**: Semántica correcta (400 validation, 401 auth, 403 permission, 404 not found, 429 rate limit)
- **Detailed Validation**: Errores de validación con field-level details

#### **Pagination Patterns**
- **Cursor-based**: Para BCs con alta concurrencia (messages, conversations)
- **Offset-based**: Para BCs con queries simples (analytics, health)

---

## OpenAPI 3.0 Specification

```yaml
openapi: 3.0.3
info:
  title: Nura AI System API
  description: |
    Comprehensive API documentation for Nura AI Developer Assistant System.
    
    **Architecture**: Domain-Driven Design with Microkernel pattern
    **Authentication**: OAuth 2.0 with PKCE for corporate integration
    **Real-time**: WebSocket support for live conversations
    **Versioning**: Semantic versioning with backward compatibility
    
    ## Quick Start
    1. Authenticate via OAuth 2.0 or obtain API key
    2. Create conversation: `POST /api/v1/conversations`
    3. Send message: `POST /api/v1/chat/message`
    4. Connect WebSocket: `ws://api.nura.ai/ws`
    
  version: 1.0.0
  contact:
    name: Nura AI Team
    email: api@nura.ai
    url: https://docs.nura.ai
  license:
    name: MIT
    url: https://opensource.org/licenses/MIT

servers:
  - url: https://api.nura.ai/api/v1
    description: Production server
  - url: https://staging-api.nura.ai/api/v1
    description: Staging server
  - url: http://localhost:8000/api/v1
    description: Development server

# ===================================
# SECURITY SCHEMES
# ===================================

components:
  securitySchemes:
    OAuth2:
      type: oauth2
      description: OAuth 2.0 with PKCE for corporate Google Workspace integration
      flows:
        authorizationCode:
          authorizationUrl: https://api.nura.ai/auth/oauth/authorize
          tokenUrl: https://api.nura.ai/auth/oauth/token
          scopes:
            read: Read access to conversations and settings
            write: Create and modify conversations
            admin: Administrative access
    
    ApiKeyAuth:
      type: apiKey
      in: header
      name: X-API-Key
      description: API key for service-to-service communication
    
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: JWT token for authenticated requests

  # ===================================
  # REUSABLE SCHEMAS
  # ===================================
  
  schemas:
    # Core Entities
    User:
      type: object
      properties:
        id:
          type: string
          format: uuid
          example: "123e4567-e89b-12d3-a456-426614174000"
        email:
          type: string
          format: email
          example: "developer@company.com"
        name:
          type: string
          example: "John Developer"
        role:
          type: string
          enum: [junior, mid, senior, lead, architect]
          example: "senior"
        domain:
          type: string
          enum: [backend, frontend, fullstack, devops, mobile]
          example: "backend"
        preferences:
          $ref: '#/components/schemas/UserPreferences'
        created_at:
          type: string
          format: date-time
        last_active:
          type: string
          format: date-time
      required: [id, email, name, role, domain]
    
    UserPreferences:
      type: object
      properties:
        language:
          type: string
          enum: [en, es, fr, de]
          default: en
        code_style:
          type: string
          enum: [google, airbnb, pep8, standard]
        ai_personality:
          type: string
          enum: [concise, detailed, educational, direct]
        notification_settings:
          $ref: '#/components/schemas/NotificationSettings'
    
    NotificationSettings:
      type: object
      properties:
        email_notifications:
          type: boolean
          default: true
        realtime_notifications:
          type: boolean
          default: true
        digest_frequency:
          type: string
          enum: [never, daily, weekly]
          default: weekly
    
    Conversation:
      type: object
      properties:
        id:
          type: string
          format: uuid
        title:
          type: string
          example: "Authentication Architecture Review"
        conversation_type:
          type: string
          enum: [general, code_review, architecture, debugging, feature_planning]
        status:
          type: string
          enum: [active, archived, completed]
        user_id:
          type: string
          format: uuid
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time
        message_count:
          type: integer
          example: 12
        tags:
          type: array
          items:
            type: string
          example: ["authentication", "security", "oauth"]
        metadata:
          type: object
          additionalProperties: true
      required: [id, title, conversation_type, status, user_id]
    
    Message:
      type: object
      properties:
        id:
          type: string
          format: uuid
        conversation_id:
          type: string
          format: uuid
        role:
          type: string
          enum: [user, assistant, system]
        content:
          type: string
          example: "¿Por qué usamos OAuth 2.0 con PKCE en lugar de basic auth?"
        agent_type:
          type: string
          enum: [dev, pm, architect, assistant]
          nullable: true
        timestamp:
          type: string
          format: date-time
        llm_metadata:
          $ref: '#/components/schemas/LLMMetadata'
        attachments:
          type: array
          items:
            $ref: '#/components/schemas/Attachment'
      required: [id, conversation_id, role, content, timestamp]
    
    LLMMetadata:
      type: object
      properties:
        model:
          type: string
          example: "gpt-4-turbo"
        tokens_input:
          type: integer
          example: 1500
        tokens_output:
          type: integer
          example: 800
        tokens_total:
          type: integer
          example: 2300
        cost_usd:
          type: number
          format: float
          example: 0.046
        response_time_ms:
          type: integer
          example: 2340
        reasoning_steps:
          type: array
          items:
            type: string
        confidence_score:
          type: number
          format: float
          minimum: 0.0
          maximum: 1.0
    
    Attachment:
      type: object
      properties:
        id:
          type: string
          format: uuid
        filename:
          type: string
          example: "auth_service.py"
        content_type:
          type: string
          example: "text/x-python"
        size_bytes:
          type: integer
          example: 15420
        url:
          type: string
          format: uri
          example: "https://api.nura.ai/attachments/123e4567-e89b-12d3-a456-426614174000"
    
    # Agent & Orchestration
    Agent:
      type: object
      properties:
        id:
          type: string
          example: "dev_agent"
        name:
          type: string
          example: "Development Agent"
        type:
          type: string
          enum: [dev, pm, architect]
        status:
          type: string
          enum: [online, busy, offline, maintenance]
        capabilities:
          type: array
          items:
            type: string
          example: ["code_review", "debugging", "testing"]
        current_load:
          type: integer
          minimum: 0
          maximum: 100
          example: 35
        average_response_time_ms:
          type: integer
          example: 1500
        last_health_check:
          type: string
          format: date-time
    
    # Advanced RAG
    ChunkingStrategy:
      type: object
      properties:
        strategy_type:
          type: string
          enum: [semantic, sliding_window, late_chunking]
        chunk_size:
          type: integer
          minimum: 100
          maximum: 8000
          example: 1000
        overlap_size:
          type: integer
          minimum: 0
          example: 200
        contextual_boundaries:
          type: boolean
          default: true
        metadata_extraction:
          type: boolean
          default: true
    
    SearchQuery:
      type: object
      properties:
        query:
          type: string
          example: "How to implement OAuth 2.0 with PKCE?"
        query_type:
          type: string
          enum: [semantic, keyword, hybrid]
          default: hybrid
        filters:
          type: object
          properties:
            domain:
              type: array
              items:
                type: string
            date_range:
              type: object
              properties:
                start:
                  type: string
                  format: date-time
                end:
                  type: string
                  format: date-time
        max_results:
          type: integer
          minimum: 1
          maximum: 100
          default: 10
        include_metadata:
          type: boolean
          default: false
    
    SearchResult:
      type: object
      properties:
        chunks:
          type: array
          items:
            $ref: '#/components/schemas/DocumentChunk'
        total_results:
          type: integer
        search_time_ms:
          type: integer
        query_expansion:
          type: array
          items:
            type: string
        retrieval_strategy:
          type: string
          enum: [bm25, vector, hybrid, late_chunking]
    
    DocumentChunk:
      type: object
      properties:
        id:
          type: string
        content:
          type: string
        relevance_score:
          type: number
          format: float
          minimum: 0.0
          maximum: 1.0
        source_document:
          type: string
        chunk_metadata:
          type: object
          additionalProperties: true
        context_window:
          type: string
          description: "Additional context for late chunking strategy"
    
    # OAuth Integration
    OAuthProvider:
      type: object
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
          example: "Google Workspace"
        provider_type:
          type: string
          enum: [google, github, microsoft, custom]
        client_id:
          type: string
        authorization_url:
          type: string
          format: uri
        token_url:
          type: string
          format: uri
        scopes:
          type: array
          items:
            type: string
        corporate_domain:
          type: string
          example: "company.com"
        is_active:
          type: boolean
          default: true
      required: [id, name, provider_type, client_id]
    
    # Error Responses
    Error:
      type: object
      properties:
        error:
          type: string
          example: "validation_error"
        message:
          type: string
          example: "Invalid conversation ID provided"
        details:
          type: object
          additionalProperties: true
        timestamp:
          type: string
          format: date-time
        request_id:
          type: string
          format: uuid
      required: [error, message, timestamp]
    
    ValidationError:
      type: object
      properties:
        error:
          type: string
          example: "validation_error"
        message:
          type: string
          example: "Request validation failed"
        validation_errors:
          type: array
          items:
            type: object
            properties:
              field:
                type: string
              error:
                type: string
              value:
                type: string
        timestamp:
          type: string
          format: date-time

# ===================================
# API ENDPOINTS
# ===================================

paths:
  # ===================================
  # AUTHENTICATION & USERS
  # ===================================
  
  /auth/oauth/authorize:
    get:
      tags: [Authentication]
      summary: Initiate OAuth 2.0 authorization flow
      description: |
        Redirects user to OAuth provider for authentication.
        Supports PKCE for enhanced security.
      parameters:
        - name: provider
          in: query
          required: true
          schema:
            type: string
            enum: [google, github, microsoft]
        - name: redirect_uri
          in: query
          required: true
          schema:
            type: string
            format: uri
        - name: code_challenge
          in: query
          required: true
          description: PKCE code challenge
          schema:
            type: string
        - name: code_challenge_method
          in: query
          required: true
          schema:
            type: string
            enum: [S256]
        - name: state
          in: query
          required: true
          schema:
            type: string
      responses:
        '302':
          description: Redirect to OAuth provider
        '400':
          description: Invalid parameters
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ValidationError'
  
  /auth/oauth/callback:
    post:
      tags: [Authentication]
      summary: Handle OAuth callback
      description: Exchange authorization code for access token
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                code:
                  type: string
                state:
                  type: string
                code_verifier:
                  type: string
                  description: PKCE code verifier
              required: [code, state, code_verifier]
      responses:
        '200':
          description: Authentication successful
          content:
            application/json:
              schema:
                type: object
                properties:
                  access_token:
                    type: string
                  refresh_token:
                    type: string
                  expires_in:
                    type: integer
                  user:
                    $ref: '#/components/schemas/User'
        '400':
          description: Invalid authorization code
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
  
  /auth/refresh:
    post:
      tags: [Authentication]
      summary: Refresh access token
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                refresh_token:
                  type: string
              required: [refresh_token]
      responses:
        '200':
          description: Token refreshed successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  access_token:
                    type: string
                  expires_in:
                    type: integer
  
  /users/me:
    get:
      tags: [Users]
      summary: Get current user profile
      security:
        - BearerAuth: []
        - OAuth2: [read]
      responses:
        '200':
          description: User profile
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '401':
          description: Unauthorized
    
    put:
      tags: [Users]
      summary: Update user profile
      security:
        - BearerAuth: []
        - OAuth2: [write]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                name:
                  type: string
                role:
                  type: string
                  enum: [junior, mid, senior, lead, architect]
                domain:
                  type: string
                  enum: [backend, frontend, fullstack, devops, mobile]
                preferences:
                  $ref: '#/components/schemas/UserPreferences'
      responses:
        '200':
          description: Profile updated successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
  
  # ===================================
  # CONVERSATIONS
  # ===================================
  
  /conversations:
    get:
      tags: [Conversations]
      summary: List user conversations
      security:
        - BearerAuth: []
        - OAuth2: [read]
      parameters:
        - name: limit
          in: query
          schema:
            type: integer
            minimum: 1
            maximum: 100
            default: 20
        - name: offset
          in: query
          schema:
            type: integer
            minimum: 0
            default: 0
        - name: status
          in: query
          schema:
            type: string
            enum: [active, archived, completed]
        - name: conversation_type
          in: query
          schema:
            type: string
            enum: [general, code_review, architecture, debugging, feature_planning]
        - name: search
          in: query
          schema:
            type: string
          description: Search in conversation titles and content
      responses:
        '200':
          description: List of conversations
          content:
            application/json:
              schema:
                type: object
                properties:
                  conversations:
                    type: array
                    items:
                      $ref: '#/components/schemas/Conversation'
                  total:
                    type: integer
                  limit:
                    type: integer
                  offset:
                    type: integer
    
    post:
      tags: [Conversations]
      summary: Create new conversation
      security:
        - BearerAuth: []
        - OAuth2: [write]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                title:
                  type: string
                  example: "OAuth Implementation Questions"
                conversation_type:
                  type: string
                  enum: [general, code_review, architecture, debugging, feature_planning]
                  default: general
                initial_message:
                  type: string
                  description: Optional first message
                tags:
                  type: array
                  items:
                    type: string
              required: [title]
      responses:
        '201':
          description: Conversation created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Conversation'
  
  /conversations/{conversation_id}:
    get:
      tags: [Conversations]
      summary: Get conversation details
      security:
        - BearerAuth: []
        - OAuth2: [read]
      parameters:
        - name: conversation_id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Conversation details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Conversation'
        '404':
          description: Conversation not found
    
    put:
      tags: [Conversations]
      summary: Update conversation
      security:
        - BearerAuth: []
        - OAuth2: [write]
      parameters:
        - name: conversation_id
          in: path
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
              properties:
                title:
                  type: string
                status:
                  type: string
                  enum: [active, archived, completed]
                tags:
                  type: array
                  items:
                    type: string
      responses:
        '200':
          description: Conversation updated successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Conversation'
    
    delete:
      tags: [Conversations]
      summary: Delete conversation
      security:
        - BearerAuth: []
        - OAuth2: [write]
      parameters:
        - name: conversation_id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '204':
          description: Conversation deleted successfully
        '404':
          description: Conversation not found
  
  /conversations/{conversation_id}/messages:
    get:
      tags: [Messages]
      summary: Get conversation messages
      security:
        - BearerAuth: []
        - OAuth2: [read]
      parameters:
        - name: conversation_id
          in: path
          required: true
          schema:
            type: string
            format: uuid
        - name: limit
          in: query
          schema:
            type: integer
            minimum: 1
            maximum: 100
            default: 50
        - name: offset
          in: query
          schema:
            type: integer
            minimum: 0
            default: 0
        - name: include_metadata
          in: query
          schema:
            type: boolean
            default: false
      responses:
        '200':
          description: List of messages
          content:
            application/json:
              schema:
                type: object
                properties:
                  messages:
                    type: array
                    items:
                      $ref: '#/components/schemas/Message'
                  total:
                    type: integer
                  has_more:
                    type: boolean
  
  # ===================================
  # CHAT
  # ===================================
  
  /chat/message:
    post:
      tags: [Chat]
      summary: Send chat message
      description: |
        Send a message to the AI assistant. The system will automatically:
        - Route to appropriate specialized agent (dev, pm, architect)
        - Apply contextual retrieval with Late Chunking
        - Generate response with LLM metadata
      security:
        - BearerAuth: []
        - OAuth2: [write]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                conversation_id:
                  type: string
                  format: uuid
                  description: Optional - creates new conversation if not provided
                content:
                  type: string
                  example: "¿Por qué usamos OAuth 2.0 con PKCE en lugar de basic auth?"
                agent_preference:
                  type: string
                  enum: [auto, dev, pm, architect]
                  default: auto
                context_files:
                  type: array
                  items:
                    type: string
                  description: Optional file paths for additional context
                retrieval_strategy:
                  type: string
                  enum: [standard, late_chunking, contextual]
                  default: late_chunking
              required: [content]
      responses:
        '200':
          description: Message sent and response generated
          content:
            application/json:
              schema:
                type: object
                properties:
                  conversation_id:
                    type: string
                    format: uuid
                  user_message:
                    $ref: '#/components/schemas/Message'
                  assistant_message:
                    $ref: '#/components/schemas/Message'
                  agent_routing:
                    type: object
                    properties:
                      selected_agent:
                        type: string
                      confidence_score:
                        type: number
                        format: float
                      reasoning:
                        type: string
        '400':
          description: Invalid request
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ValidationError'
  
  # ===================================
  # ORCHESTRATION & AGENTS
  # ===================================
  
  /orchestration/agents:
    get:
      tags: [Orchestration]
      summary: List available agents
      security:
        - BearerAuth: []
        - OAuth2: [read]
      responses:
        '200':
          description: List of agents
          content:
            application/json:
              schema:
                type: object
                properties:
                  agents:
                    type: array
                    items:
                      $ref: '#/components/schemas/Agent'
  
  /orchestration/agent-status/{agent_type}:
    get:
      tags: [Orchestration]
      summary: Get agent status
      security:
        - BearerAuth: []
        - OAuth2: [read]
      parameters:
        - name: agent_type
          in: path
          required: true
          schema:
            type: string
            enum: [dev, pm, architect]
      responses:
        '200':
          description: Agent status
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Agent'
  
  # ===================================
  # ADVANCED RAG
  # ===================================
  
  /rag/search:
    post:
      tags: [Advanced RAG]
      summary: Search knowledge base
      description: |
        Advanced search with multiple retrieval strategies:
        - **BM25**: Keyword-based search
        - **Vector**: Semantic similarity search  
        - **Hybrid**: Combined BM25 + Vector
        - **Late Chunking**: Post-retrieval contextualization
      security:
        - BearerAuth: []
        - OAuth2: [read]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SearchQuery'
      responses:
        '200':
          description: Search results
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SearchResult'
  
  /rag/index/documents:
    post:
      tags: [Advanced RAG]
      summary: Index documents
      description: Add documents to the knowledge base with specified chunking strategy
      security:
        - BearerAuth: []
        - OAuth2: [write]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                documents:
                  type: array
                  items:
                    type: object
                    properties:
                      id:
                        type: string
                      content:
                        type: string
                      metadata:
                        type: object
                        additionalProperties: true
                      source_url:
                        type: string
                        format: uri
                chunking_strategy:
                  $ref: '#/components/schemas/ChunkingStrategy'
              required: [documents]
      responses:
        '201':
          description: Documents indexed successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  indexed_count:
                    type: integer
                  failed_count:
                    type: integer
                  processing_time_ms:
                    type: integer
  
  # ===================================
  # ANALYTICS & METRICS
  # ===================================
  
  /analytics/usage:
    get:
      tags: [Analytics]
      summary: Get usage analytics
      security:
        - BearerAuth: []
        - OAuth2: [read]
      parameters:
        - name: start_date
          in: query
          schema:
            type: string
            format: date
        - name: end_date
          in: query
          schema:
            type: string
            format: date
        - name: granularity
          in: query
          schema:
            type: string
            enum: [hour, day, week, month]
            default: day
      responses:
        '200':
          description: Usage analytics
          content:
            application/json:
              schema:
                type: object
                properties:
                  period:
                    type: object
                    properties:
                      start_date:
                        type: string
                        format: date
                      end_date:
                        type: string
                        format: date
                  metrics:
                    type: object
                    properties:
                      total_messages:
                        type: integer
                      total_conversations:
                        type: integer
                      llm_calls:
                        type: integer
                      total_cost_usd:
                        type: number
                        format: float
                      average_response_time_ms:
                        type: integer
                      agent_distribution:
                        type: object
                        properties:
                          dev:
                            type: integer
                          pm:
                            type: integer
                          architect:
                            type: integer
                  time_series:
                    type: array
                    items:
                      type: object
                      properties:
                        timestamp:
                          type: string
                          format: date-time
                        messages:
                          type: integer
                        cost_usd:
                          type: number
                          format: float
  
  # ===================================
  # SYSTEM HEALTH
  # ===================================
  
  /health:
    get:
      tags: [System]
      summary: Health check
      description: System health status for monitoring
      responses:
        '200':
          description: System is healthy
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                    enum: [healthy, degraded, unhealthy]
                  timestamp:
                    type: string
                    format: date-time
                  version:
                    type: string
                    example: "1.0.0"
                  components:
                    type: object
                    properties:
                      database:
                        type: string
                        enum: [healthy, unhealthy]
                      redis:
                        type: string
                        enum: [healthy, unhealthy]
                      llm_providers:
                        type: object
                        additionalProperties:
                          type: string
                          enum: [healthy, unhealthy]
                      agents:
                        type: object
                        additionalProperties:
                          type: string
                          enum: [healthy, unhealthy]
        '503':
          description: System is unhealthy
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                    example: "unhealthy"
                  errors:
                    type: array
                    items:
                      type: string

# ===================================
# WEBHOOKS
# ===================================

  /webhooks/oauth:
    post:
      tags: [Webhooks]
      summary: OAuth provider webhook
      description: Handle OAuth provider notifications (user changes, revoked tokens, etc.)
      security:
        - ApiKeyAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                event_type:
                  type: string
                  enum: [user_changed, token_revoked, domain_verified]
                timestamp:
                  type: string
                  format: date-time
                data:
                  type: object
                  additionalProperties: true
              required: [event_type, timestamp, data]
      responses:
        '200':
          description: Webhook processed successfully
        '400':
          description: Invalid webhook payload

# ===================================
# TAGS ORGANIZATION
# ===================================

tags:
  - name: Authentication
    description: OAuth 2.0 and user authentication
  - name: Users
    description: User profile management
  - name: Conversations
    description: Conversation lifecycle management
  - name: Messages
    description: Message handling and history
  - name: Chat
    description: Real-time chat functionality
  - name: Orchestration
    description: Agent orchestration and routing
  - name: Advanced RAG
    description: Knowledge retrieval and indexing
  - name: Analytics
    description: Usage analytics and metrics
  - name: System
    description: System health and monitoring
  - name: Webhooks
    description: External system integrations
```

---

## API Design Patterns

### RESTful Resource Design

```yaml
# Resource Naming Conventions
/api/v1/conversations              # Collection
/api/v1/conversations/{id}         # Individual resource
/api/v1/conversations/{id}/messages # Sub-resource collection

# HTTP Methods
GET     /conversations           # List resources
POST    /conversations           # Create resource
GET     /conversations/{id}      # Get resource
PUT     /conversations/{id}      # Update resource (full)
PATCH   /conversations/{id}      # Update resource (partial)
DELETE  /conversations/{id}      # Delete resource

# Query Parameters
?limit=20&offset=0              # Pagination
?filter[status]=active          # Filtering
?sort=created_at:desc           # Sorting
?include=messages,user          # Resource inclusion
```

### Error Handling Strategy

```yaml
# Error Response Format
400 Bad Request:
  error: "validation_error"
  message: "Request validation failed"
  validation_errors:
    - field: "conversation_id"
      error: "Invalid UUID format"
      value: "invalid-uuid"

401 Unauthorized:
  error: "authentication_required"
  message: "Valid authentication required"
  
403 Forbidden:
  error: "insufficient_permissions"
  message: "User lacks required permissions"
  
404 Not Found:
  error: "resource_not_found"
  message: "Conversation not found"
  
429 Too Many Requests:
  error: "rate_limit_exceeded"
  message: "API rate limit exceeded"
  retry_after: 60

500 Internal Server Error:
  error: "internal_server_error"
  message: "An unexpected error occurred"
  request_id: "req_123456789"
```

### Pagination Strategy

```yaml
# Cursor-based Pagination (Recommended)
GET /conversations?cursor=eyJpZCI6IjEyMyJ9&limit=20

Response:
{
  "data": [...],
  "pagination": {
    "has_more": true,
    "next_cursor": "eyJpZCI6IjE0NSJ9",
    "prev_cursor": "eyJpZCI6IjEwMSJ9"
  }
}

# Offset-based Pagination (Simple queries)
GET /conversations?offset=0&limit=20

Response:
{
  "data": [...],
  "pagination": {
    "total": 150,
    "offset": 0,
    "limit": 20,
    "has_more": true
  }
}
```

---

## WebSocket API Specification

### Connection & Authentication

```yaml
# WebSocket Connection
ws://api.nura.ai/ws?token={jwt_token}

# Connection Events
{
  "type": "connection_established",
  "data": {
    "session_id": "sess_123456789",
    "user_id": "user_123",
    "capabilities": ["chat", "notifications", "agent_status"]
  }
}
```

### Message Types

```yaml
# Chat Message (Client → Server)
{
  "type": "chat_message",
  "conversation_id": "conv_123",
  "content": "¿Cómo funciona la autenticación OAuth?",
  "timestamp": "2024-01-15T10:30:00Z"
}

# Chat Response (Server → Client)
{
  "type": "chat_response",
  "conversation_id": "conv_123",
  "message": {
    "id": "msg_456",
    "role": "assistant",
    "content": "OAuth 2.0 funciona mediante...",
    "agent_type": "dev",
    "llm_metadata": {
      "model": "gpt-4-turbo",
      "tokens_total": 1500,
      "cost_usd": 0.03
    }
  },
  "timestamp": "2024-01-15T10:30:05Z"
}

# Typing Indicator
{
  "type": "typing_indicator",
  "conversation_id": "conv_123",
  "agent_type": "dev",
  "is_typing": true
}

# Agent Status Update
{
  "type": "agent_status_update",
  "agent": {
    "id": "dev_agent",
    "status": "busy",
    "current_load": 85
  }
}

# Notification
{
  "type": "notification",
  "notification": {
    "id": "notif_789",
    "title": "Conversation Archived",
    "message": "Your conversation 'OAuth Implementation' has been archived",
    "type": "info",
    "timestamp": "2024-01-15T10:35:00Z"
  }
}

# Error
{
  "type": "error",
  "error": {
    "code": "message_failed",
    "message": "Failed to process message",
    "details": {}
  }
}
```

---

## Rate Limiting & Quotas

### Rate Limits

```yaml
# Standard Limits
Free Tier:
  - 100 requests/hour
  - 10 conversations/day
  - 500 messages/month

Pro Tier:
  - 1000 requests/hour
  - 100 conversations/day
  - 10,000 messages/month

Enterprise:
  - 10,000 requests/hour
  - Unlimited conversations
  - 100,000 messages/month

# Headers
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642291200
```

### Cost Management

```yaml
# LLM Usage Tracking
{
  "daily_usage": {
    "date": "2024-01-15",
    "tokens_consumed": 45000,
    "cost_usd": 0.90,
    "messages_sent": 30,
    "conversations": 5
  },
  "monthly_limits": {
    "max_cost_usd": 50.00,
    "remaining_budget": 49.10,
    "reset_date": "2024-02-01"
  }
}
```

---

## Integration Examples

### cURL Examples

```bash
# Authenticate via OAuth
curl -X GET "https://api.nura.ai/api/v1/auth/oauth/authorize" \
  -G \
  -d "provider=google" \
  -d "redirect_uri=https://app.nura.ai/callback" \
  -d "code_challenge=dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk" \
  -d "code_challenge_method=S256" \
  -d "state=random_state_string"

# Create conversation
curl -X POST "https://api.nura.ai/api/v1/conversations" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "OAuth Implementation Questions",
    "conversation_type": "architecture",
    "tags": ["oauth", "security", "authentication"]
  }'

# Send chat message
curl -X POST "https://api.nura.ai/api/v1/chat/message" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "conversation_id": "123e4567-e89b-12d3-a456-426614174000",
    "content": "¿Por qué usamos OAuth 2.0 con PKCE en lugar de basic auth?",
    "retrieval_strategy": "late_chunking"
  }'

# Search knowledge base
curl -X POST "https://api.nura.ai/api/v1/rag/search" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "OAuth 2.0 implementation best practices",
    "query_type": "hybrid",
    "max_results": 10,
    "filters": {
      "domain": ["security", "authentication"]
    }
  }'
```

### SDK Usage Examples

```python
# Python SDK Example
from nura_sdk import NuraClient

client = NuraClient(api_key="your_api_key")

# Create conversation
conversation = client.conversations.create(
    title="OAuth Architecture Review",
    conversation_type="architecture",
    tags=["oauth", "security"]
)

# Send message with Late Chunking
response = client.chat.send_message(
    conversation_id=conversation.id,
    content="¿Cómo implementamos OAuth 2.0 con PKCE?",
    retrieval_strategy="late_chunking"
)

print(f"Agent: {response.assistant_message.agent_type}")
print(f"Response: {response.assistant_message.content}")
print(f"Cost: ${response.assistant_message.llm_metadata.cost_usd}")

# Search with contextual retrieval
results = client.rag.search(
    query="OAuth PKCE implementation",
    query_type="hybrid",
    max_results=5
)

for chunk in results.chunks:
    print(f"Score: {chunk.relevance_score}")
    print(f"Content: {chunk.content[:100]}...")
```

```javascript
// JavaScript SDK Example
import { NuraClient } from '@nura/sdk';

const client = new NuraClient({ apiKey: 'your_api_key' });

// Create conversation
const conversation = await client.conversations.create({
  title: 'OAuth Implementation Questions',
  conversationType: 'architecture',
  tags: ['oauth', 'security']
});

// Send message
const response = await client.chat.sendMessage({
  conversationId: conversation.id,
  content: '¿Por qué usamos OAuth 2.0 con PKCE?',
  retrievalStrategy: 'late_chunking'
});

console.log(`Agent: ${response.assistantMessage.agentType}`);
console.log(`Response: ${response.assistantMessage.content}`);
console.log(`Tokens: ${response.assistantMessage.llmMetadata.tokensTotal}`);

// WebSocket connection
const ws = client.websocket.connect();

ws.on('chat_response', (message) => {
  console.log(`New message: ${message.content}`);
});

ws.on('agent_status_update', (status) => {
  console.log(`Agent ${status.agent.id} is now ${status.agent.status}`);
});
```

Esta especificación API completa proporciona:

✅ **OpenAPI 3.0 Compliance** con documentación comprehensiva
✅ **OAuth 2.0 + PKCE Integration** para autenticación corporativa
✅ **Advanced RAG Endpoints** con Late Chunking y Contextual Retrieval
✅ **WebSocket Specifications** para comunicación real-time
✅ **Domain-Driven Design** con bounded contexts claros
✅ **Enterprise-grade Features** con rate limiting y analytics
✅ **Comprehensive Examples** en múltiples lenguajes
✅ **Error Handling** patterns y troubleshooting
✅ **Security Best Practices** integradas por design

<function_calls>
<invoke name="TodoWrite">
<parameter name="todos">[{"content": "Completar Frontend Architecture con React/TypeScript y design system", "status": "completed", "id": "frontend_architecture"}, {"content": "Desarrollar Performance & Scalability architecture con m\u00e9tricas", "status": "completed", "id": "performance_scalability"}, {"content": "Implementar Deployment Architecture con AWS y estrategias h\u00edbridas", "status": "completed", "id": "deployment_architecture"}, {"content": "Crear Testing Strategy con E2E, Unit, Integration testing", "status": "completed", "id": "testing_strategy"}, {"content": "Documentar API Specifications con OpenAPI 3.0", "status": "completed", "id": "api_specifications"}]