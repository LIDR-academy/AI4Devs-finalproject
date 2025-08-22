# Especificación de la API

## 4.1. Información General

- **Base URL:** `https://api.chatbot-portfolio.com/v1` (Backend - Repo separado)
- **Versión:** 1.0.0
- **Formato:** JSON
- **Autenticación:** JWT Bearer Token (para endpoints protegidos)
- **Rate Limiting:** 100 requests por minuto por IP
- **Frontend:** Ya desplegado en [almapi.dev](https://almapi.dev/)
- **Integración:** El frontend se comunicará con este backend a través de APIs REST y WebSocket

## 4.1.1 Seguridad y Ciberseguridad

### Autenticación y Autorización
- **JWT Tokens:** Tokens JWT con expiración configurable (default: 24 horas)
- **Refresh Tokens:** Sistema de renovación automática de tokens
- **Role-Based Access Control:** Diferentes niveles de acceso según el rol del usuario
- **API Keys:** Claves de API para integraciones de terceros (con rate limiting estricto)

### Protección contra Ataques
- **Rate Limiting:** 100 requests por minuto por IP, 30 requests por minuto por usuario autenticado
- **Input Validation:** Validación estricta de todos los inputs con sanitización automática
- **SQL Injection Prevention:** Uso de ORM con parámetros preparados
- **XSS Prevention:** Escape automático de contenido dinámico
- **CSRF Protection:** Tokens CSRF en todos los endpoints que modifican estado

### Headers de Seguridad
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

### Monitoreo de Seguridad
- **Security Logging:** Logging estructurado de todos los eventos de seguridad
- **Threat Detection:** Detección automática de patrones sospechosos
- **Audit Trail:** Registro completo de todas las operaciones para auditoría
- **Alerting:** Alertas automáticas para amenazas de seguridad críticas

## 4.2. Endpoints Principales

### 1. Chat Endpoints

#### POST /chat/message
**Descripción:** Envía un mensaje al chatbot y recibe una respuesta.

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {jwt_token} (opcional)
```

**Request Body:**
```json
{
  "message": "¿Cuál es tu experiencia con React?",
  "conversation_id": "uuid-conversation-id",
  "language": "es",
  "context": {
    "user_agent": "Mozilla/5.0...",
    "ip_address": "192.168.1.1",
    "session_id": "session-123"
  }
}
```

**Response (200 OK):**
```json
{
  "message_id": "uuid-message-id",
  "response": "Tengo más de 5 años de experiencia desarrollando aplicaciones con React. He trabajado en proyectos que incluyen React Hooks, Context API, Redux, y Next.js. Algunos de mis proyectos más destacados incluyen...",
  "conversation_id": "uuid-conversation-id",
  "sources": [
    {
      "title": "Proyecto E-commerce React",
      "url": "https://github.com/user/ecommerce-react",
      "relevance_score": 0.95
    }
  ],
  "metadata": {
    "tokens_used": 150,
    "response_time": 1.2,
    "confidence_score": 0.92,
    "language_detected": "es"
  },
  "timestamp": "2025-01-15T10:30:00Z"
}
```

**Error Responses:**
```json
// 400 Bad Request
{
  "error": "validation_error",
  "message": "El mensaje no puede estar vacío",
  "details": {
    "field": "message",
    "constraint": "required"
  }
}

// 429 Too Many Requests
{
  "error": "rate_limit_exceeded",
  "message": "Has excedido el límite de requests por minuto",
  "retry_after": 60
}
```

#### GET /chat/conversation/{conversation_id}
**Descripción:** Obtiene el historial completo de una conversación.

**Response (200 OK):**
```json
{
  "conversation_id": "uuid-conversation-id",
  "user_id": "uuid-user-id",
  "started_at": "2025-01-15T10:00:00Z",
  "message_count": 5,
  "initial_topic": "Experiencia con React",
  "satisfaction_score": 4,
  "is_completed": false,
  "messages": [
    {
      "id": "uuid-message-1",
      "content": "¿Cuál es tu experiencia con React?",
      "role": "user",
      "sent_at": "2025-01-15T10:00:00Z",
      "language": "es"
    },
    {
      "id": "uuid-message-2",
      "content": "Tengo más de 5 años de experiencia...",
      "role": "assistant",
      "sent_at": "2025-01-15T10:00:01Z",
      "tokens_used": 150,
      "response_time": 1.2,
      "language": "es"
    }
  ]
}
```

#### POST /chat/conversation
**Descripción:** Inicia una nueva conversación.

**Request Body:**
```json
{
  "user_info": {
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "language": "es"
  },
  "initial_message": "Hola, me interesa conocer tu experiencia profesional",
  "context": {
    "user_agent": "Mozilla/5.0...",
    "ip_address": "192.168.1.1",
    "referrer": "https://portfolio.com"
  }
}
```

**Response (201 Created):**
```json
{
  "conversation_id": "uuid-new-conversation",
  "user_id": "uuid-user-id",
  "session_id": "session-456",
  "started_at": "2025-01-15T10:00:00Z",
  "welcome_message": "¡Hola Juan! Soy el asistente virtual de Alejandro. Estoy aquí para responder cualquier pregunta sobre mi experiencia profesional, proyectos y habilidades. ¿En qué puedo ayudarte?"
}
```

### 2. Analytics Endpoints

#### GET /analytics/dashboard
**Descripción:** Obtiene métricas generales del dashboard.

**Query Parameters:**
- `start_date`: Fecha de inicio (YYYY-MM-DD)
- `end_date`: Fecha de fin (YYYY-MM-DD)
- `timezone`: Zona horaria (default: UTC)

**Response (200 OK):**
```json
{
  "period": {
    "start_date": "2025-01-01",
    "end_date": "2025-01-15",
    "timezone": "UTC"
  },
  "metrics": {
    "total_conversations": 1250,
    "total_messages": 8750,
    "avg_satisfaction": 4.2,
    "avg_response_time": 1.8,
    "unique_users": 980,
    "conversion_rate": 0.15
  },
  "trends": {
    "conversations_daily": [
      {"date": "2025-01-01", "count": 45},
      {"date": "2025-01-02", "count": 52}
    ],
    "satisfaction_weekly": [
      {"week": "2025-W01", "avg_score": 4.1},
      {"week": "2025-W02", "avg_score": 4.3}
    ]
  }
}
```

#### GET /analytics/frequent-questions
**Descripción:** Obtiene las preguntas más frecuentes.

**Query Parameters:**
- `limit`: Número máximo de resultados (default: 10)
- `category`: Filtrar por categoría
- `period`: Período de análisis (7d, 30d, 90d)

**Response (200 OK):**
```json
{
  "frequent_questions": [
    {
      "question": "¿Cuál es tu experiencia con React?",
      "frequency": 45,
      "category": "technology",
      "avg_satisfaction": 4.3,
      "first_seen": "2025-01-01T00:00:00Z",
      "last_seen": "2025-01-15T23:59:59Z"
    },
    {
      "question": "¿Qué proyectos has desarrollado?",
      "frequency": 38,
      "category": "projects",
      "avg_satisfaction": 4.5,
      "first_seen": "2025-01-01T00:00:00Z",
      "last_seen": "2025-01-15T23:59:59Z"
    }
  ],
  "total_questions": 1250,
  "period": "30d"
}
```

#### GET /analytics/technology-interest
**Descripción:** Análisis de interés en tecnologías específicas.

**Response (200 OK):**
```json
{
  "technologies": [
    {
      "name": "React",
      "interest_count": 156,
      "category": "frontend",
      "engagement_rate": 0.85,
      "avg_satisfaction": 4.2
    },
    {
      "name": "Python",
      "interest_count": 89,
      "category": "backend",
      "engagement_rate": 0.78,
      "avg_satisfaction": 4.4
    },
    {
      "name": "Machine Learning",
      "interest_count": 67,
      "category": "ai",
      "engagement_rate": 0.92,
      "avg_satisfaction": 4.6
    }
  ],
  "categories": {
    "frontend": 45,
    "backend": 30,
    "ai": 15,
    "devops": 10
  }
}
```

### 3. Feedback Endpoints

#### POST /feedback/submit
**Descripción:** Envía feedback sobre una conversación.

**Request Body:**
```json
{
  "conversation_id": "uuid-conversation-id",
  "rating": 5,
  "category": "accuracy",
  "comment": "Las respuestas fueron muy precisas y útiles"
}
```

**Response (201 Created):**
```json
{
  "feedback_id": "uuid-feedback-id",
  "status": "submitted",
  "message": "Gracias por tu feedback. Nos ayuda a mejorar el servicio."
}
```

#### GET /feedback/summary
**Descripción:** Obtiene resumen de feedback recibido.

**Response (200 OK):**
```json
{
  "total_feedback": 450,
  "avg_rating": 4.3,
  "rating_distribution": {
    "5": 180,
    "4": 150,
    "3": 80,
    "2": 25,
    "1": 15
  },
  "category_breakdown": {
    "accuracy": 4.4,
    "helpfulness": 4.2,
    "speed": 4.1,
    "relevance": 4.5
  },
  "recent_feedback": [
    {
      "id": "uuid-feedback-1",
      "rating": 5,
      "category": "accuracy",
      "comment": "Excelente información sobre proyectos",
      "submitted_at": "2025-01-15T10:30:00Z"
    }
  ]
}
```

### 4. Admin Endpoints

#### GET /admin/system-status
**Descripción:** Obtiene el estado del sistema (requiere autenticación admin).

**Response (200 OK):**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:30:00Z",
  "services": {
    "database": {
      "status": "connected",
      "response_time": 0.05
    },
    "vector_search": {
      "status": "connected",
      "index_size": "2.3GB"
    },
    "llm_service": {
      "status": "available",
      "model_version": "gemini-1.5-pro",
      "response_time": 1.2
    }
  },
  "metrics": {
    "active_conversations": 25,
    "requests_per_minute": 45,
    "error_rate": 0.02
  }
}
```

#### POST /admin/knowledge-base/update
**Descripción:** Actualiza la base de conocimiento (requiere autenticación admin).

**Request Body:**
```json
{
  "source": "linkedin",
  "action": "refresh",
  "options": {
    "force_update": true,
    "regenerate_embeddings": true
  }
}
```

**Response (200 OK):**
```json
{
  "status": "processing",
  "job_id": "uuid-job-id",
  "estimated_duration": "5 minutes",
  "message": "Actualización de base de conocimiento iniciada"
}
```

## 4.3. WebSocket Endpoints

### WebSocket /ws/chat/{conversation_id}
**Descripción:** Conexión WebSocket para chat en tiempo real.

**Connection:**
```
wss://api.chatbot-portfolio.com/v1/ws/chat/uuid-conversation-id
```

**Message Format (Client to Server):**
```json
{
  "type": "message",
  "content": "¿Cuál es tu experiencia con React?",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

**Message Format (Server to Client):**
```json
{
  "type": "response",
  "message_id": "uuid-message-id",
  "content": "Tengo más de 5 años de experiencia...",
  "sources": [...],
  "metadata": {...},
  "timestamp": "2025-01-15T10:30:01Z"
}
```

**System Messages:**
```json
{
  "type": "typing",
  "status": "started"
}

{
  "type": "typing", 
  "status": "stopped"
}

{
  "type": "error",
  "code": "rate_limit_exceeded",
  "message": "Has excedido el límite de requests"
}
```

## 4.4. Códigos de Error

### Códigos de Estado HTTP

| Código | Descripción | Ejemplo |
|--------|-------------|---------|
| 200 | OK | Respuesta exitosa |
| 201 | Created | Recurso creado exitosamente |
| 400 | Bad Request | Datos de entrada inválidos |
| 401 | Unauthorized | Token de autenticación requerido |
| 403 | Forbidden | Permisos insuficientes |
| 404 | Not Found | Recurso no encontrado |
| 429 | Too Many Requests | Límite de rate excedido |
| 500 | Internal Server Error | Error interno del servidor |

### Códigos de Error Específicos

```json
{
  "error_codes": {
    "CHAT_001": "Mensaje vacío o inválido",
    "CHAT_002": "Conversación no encontrada",
    "CHAT_003": "Límite de tokens excedido",
    "AUTH_001": "Token de autenticación inválido",
    "AUTH_002": "Token expirado",
    "RATE_001": "Límite de requests excedido",
    "LLM_001": "Servicio de IA no disponible",
    "RAG_001": "Base de conocimiento no disponible",
    "DB_001": "Error de base de datos",
    "SYS_001": "Sistema en mantenimiento"
  }
}
```

## 4.5. Ejemplos de Uso

### Ejemplo 1: Conversación Completa

```javascript
// 1. Iniciar conversación
const startResponse = await fetch('/api/v1/chat/conversation', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user_info: { name: 'Juan', language: 'es' },
    initial_message: 'Hola, me interesa tu experiencia'
  })
});

const { conversation_id } = await startResponse.json();

// 2. Enviar mensaje
const messageResponse = await fetch('/api/v1/chat/message', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: '¿Cuál es tu experiencia con React?',
    conversation_id
  })
});

const { response, sources } = await messageResponse.json();

// 3. Enviar feedback
await fetch('/api/v1/feedback/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    conversation_id,
    rating: 5,
    category: 'accuracy'
  })
});
```

### Ejemplo 2: WebSocket Chat

```javascript
const ws = new WebSocket(`wss://api.chatbot-portfolio.com/v1/ws/chat/${conversationId}`);

ws.onopen = () => {
  console.log('Conexión WebSocket establecida');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch(data.type) {
    case 'response':
      displayMessage(data.content, 'assistant');
      break;
    case 'typing':
      showTypingIndicator(data.status === 'started');
      break;
    case 'error':
      showError(data.message);
      break;
  }
};

// Enviar mensaje
ws.send(JSON.stringify({
  type: 'message',
  content: '¿Cuál es tu experiencia con Python?'
}));
```

### Ejemplo 3: Obtener Analytics

```javascript
// Obtener dashboard
const dashboardResponse = await fetch('/api/v1/analytics/dashboard?period=30d');
const dashboard = await dashboardResponse.json();

// Obtener preguntas frecuentes
const questionsResponse = await fetch('/api/v1/analytics/frequent-questions?limit=5');
const questions = await questionsResponse.json();

// Obtener interés en tecnologías
const techResponse = await fetch('/api/v1/analytics/technology-interest');
const technologies = await techResponse.json();
``` 