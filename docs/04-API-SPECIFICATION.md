# 🔌 Especificación de la API - AI Resume Agent

## 📋 Resumen Ejecutivo

### Objetivo del Documento
Este documento detalla la especificación completa de la API REST del sistema AI Resume Agent, incluyendo endpoints principales, esquemas de datos, códigos de respuesta y ejemplos de uso.

### Tecnologías Utilizadas
- **Framework**: FastAPI 0.115+ con documentación automática
- **Documentación**: Swagger/OpenAPI 3.0
- **Validación**: Pydantic para schemas y validación
- **Autenticación**: Bearer token con Google Cloud Identity

---

## 🌐 Información General de la API

### **Base URL**
```
https://chatbot-api-251107984645.europe-west1.run.app
```

### **Documentación Interactiva**
- **Swagger UI**: `https://chatbot-api-251107984645.europe-west1.run.app/docs`
- **ReDoc**: `https://chatbot-api-251107984645.europe-west1.run.app/redoc`
- **OpenAPI JSON**: `https://chatbot-api-251107984645.europe-west1.run.app/openapi.json`

### **Autenticación**
```http
Authorization: Bearer <gcloud-identity-token>
```

**⚠️ IMPORTANTE**: El backend es **PRIVADO** y requiere autenticación nativa de Google Cloud Platform. Solo usuarios autenticados con GCP pueden acceder a los endpoints.

### **Rate Limiting**
- **Chat**: 30 requests/minuto por IP
- **Analytics**: 10 requests/minuto por IP
- **GDPR**: 5 requests/minuto por IP

---

## 📝 Endpoints Principales

### 4. Especificación de API (OpenAPI)

#### **💬 POST /api/v1/chat**

**Descripción**: Endpoint principal para enviar mensajes al chatbot y recibir respuestas generadas por RAG.

**Request Schema**:
```json
{
  "message": "¿Cuál es tu experiencia con Python?",
  "session_id": "optional-session-id",
  "user_type": "IT"
}
```

**Response Schema**:
```json
{
  "message": "Tengo más de 10 años de experiencia con Python...",
  "sources": [
    {
      "type": "experience",
      "content_preview": "Empresa: InAdvance...",
      "metadata": {
        "company": "InAdvance",
        "role": "Senior Developer",
        "duration": "2 years"
      }
    }
  ],
  "session_id": "session-1234567890",
  "timestamp": "2025-01-15T10:30:00Z",
  "model": "gemini-2.5-flash",
  "response_time_ms": 1850,
  "flow_state": "conversation_active",
  "requires_data_capture": false,
  "requires_gdpr_consent": false
}
```

**Códigos de Respuesta**:
- `200 OK`: Respuesta generada exitosamente
- `400 Bad Request`: Mensaje vacío o inválido
- `429 Too Many Requests`: Rate limit excedido
- `503 Service Unavailable`: Servicio temporalmente no disponible

**Ejemplo de Uso**:
```bash
curl -X POST "https://chatbot-api-251107984645.europe-west1.run.app/api/v1/chat" \
  -H "Authorization: Bearer $(gcloud auth print-identity-token)" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "¿Cuál es tu experiencia con Python?",
    "session_id": "test-session-123",
    "user_type": "IT"
  }'
```

#### **🏥 GET /api/v1/health**

**Descripción**: Health check del servicio para verificar disponibilidad.

**Response Schema**:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2025-01-15T10:30:00Z",
  "uptime_seconds": 86400,
  "database_status": "connected",
  "vector_store_status": "ready",
  "llm_status": "available"
}
```

**Códigos de Respuesta**:
- `200 OK`: Servicio funcionando correctamente
- `503 Service Unavailable`: Servicio con problemas

**Ejemplo de Uso**:
```bash
curl -H "Authorization: Bearer $(gcloud auth print-identity-token)" \
  "https://chatbot-api-251107984645.europe-west1.run.app/api/v1/health"
```

#### **📊 POST /api/v1/analytics/capture-data**

**Descripción**: Captura datos del usuario (email, tipo de usuario, LinkedIn) para generación de leads.

**Request Schema**:
```json
{
  "session_id": "session-1234567890",
  "email": "usuario@empresa.com",
  "user_type": "IT",
  "linkedin": "https://linkedin.com/in/usuario"
}
```

**Response Schema**:
```json
{
  "success": true,
  "message": "Datos capturados exitosamente",
  "session_id": "session-1234567890",
  "data_captured": true,
  "next_action": "conversation_active"
}
```

**Códigos de Respuesta**:
- `200 OK`: Datos capturados exitosamente
- `400 Bad Request`: Datos inválidos o faltantes
- `429 Too Many Requests`: Rate limit excedido
- `500 Internal Server Error`: Error interno

**Ejemplo de Uso**:
```bash
curl -X POST "https://chatbot-api-251107984645.europe-west1.run.app/api/v1/analytics/capture-data" \
  -H "Authorization: Bearer $(gcloud auth print-identity-token)" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "session-1234567890",
    "email": "usuario@empresa.com",
    "user_type": "IT",
    "linkedin": "https://linkedin.com/in/usuario"
  }'
```

---

## 🔒 Endpoints de Seguridad y GDPR

#### **🔐 POST /api/v1/analytics/gdpr/consent**

**Descripción**: Registra consentimiento GDPR del usuario.

**Request Schema**:
```json
{
  "session_id": "session-1234567890",
  "consent_type": "data_collection",
  "consent_given": true,
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0..."
}
```

**Response Schema**:
```json
{
  "success": true,
  "message": "Consentimiento registrado exitosamente",
  "session_id": "session-1234567890",
  "consent_recorded": true,
  "consent_timestamp": "2025-01-15T10:30:00Z"
}
```

#### **📤 GET /api/v1/analytics/gdpr/export-data**

**Descripción**: Exporta todos los datos personales del usuario (derecho de portabilidad).

**Query Parameters**:
- `session_id` (required): ID de la sesión

**Response Schema**:
```json
{
  "success": true,
  "session_id": "session-1234567890",
  "data": {
    "session_info": {
      "session_id": "session-1234567890",
      "email": "usuario@empresa.com",
      "user_type": "IT",
      "created_at": "2025-01-15T10:00:00Z",
      "last_activity": "2025-01-15T10:30:00Z"
    },
    "messages": [
      {
        "message_type": "user",
        "content": "¿Cuál es tu experiencia?",
        "created_at": "2025-01-15T10:00:00Z"
      }
    ],
    "analytics": {
      "total_messages": 5,
      "engagement_score": 0.8
    }
  },
  "export_timestamp": "2025-01-15T10:30:00Z"
}
```

#### **🗑️ DELETE /api/v1/analytics/gdpr/delete-data**

**Descripción**: Elimina todos los datos personales del usuario (derecho al olvido).

**Request Schema**:
```json
{
  "session_id": "session-1234567890",
  "confirmation": "DELETE_ALL_DATA"
}
```

**Response Schema**:
```json
{
  "success": true,
  "message": "Datos eliminados exitosamente",
  "session_id": "session-1234567890",
  "deletion_timestamp": "2025-01-15T10:30:00Z",
  "records_deleted": 15
}
```

---

## 📊 Endpoints de Analytics

#### **📈 GET /api/v1/analytics/metrics**

**Descripción**: Obtiene métricas agregadas del sistema.

**Query Parameters**:
- `days` (optional): Número de días hacia atrás (default: 7)
- `user_type` (optional): Filtrar por tipo de usuario

**Response Schema**:
```json
{
  "success": true,
  "metrics": {
    "total_sessions": 150,
    "total_messages": 450,
    "avg_session_duration_minutes": 5.5,
    "avg_engagement_score": 0.75,
    "unique_users": 120,
    "top_technologies": ["Python", "React", "AWS"],
    "top_intents": ["experience", "skills", "projects"],
    "user_type_distribution": {
      "IT": 60,
      "HR": 25,
      "Business": 15
    }
  },
  "period": {
    "start_date": "2025-01-08",
    "end_date": "2025-01-15"
  }
}
```

#### **📋 GET /api/v1/analytics/sessions**

**Descripción**: Lista sesiones con filtros opcionales.

**Query Parameters**:
- `limit` (optional): Número máximo de resultados (default: 50)
- `offset` (optional): Offset para paginación (default: 0)
- `user_type` (optional): Filtrar por tipo de usuario
- `date_from` (optional): Fecha de inicio (ISO format)
- `date_to` (optional): Fecha de fin (ISO format)

**Response Schema**:
```json
{
  "success": true,
  "sessions": [
    {
      "session_id": "session-1234567890",
      "user_type": "IT",
      "email": "usuario@empresa.com",
      "created_at": "2025-01-15T10:00:00Z",
      "last_activity": "2025-01-15T10:30:00Z",
      "total_messages": 5,
      "engagement_score": 0.8,
      "data_captured": true,
      "gdpr_consent_given": true
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 50,
    "offset": 0,
    "has_next": true
  }
}
```

---

## 🔧 Schemas de Datos (Pydantic)

### **📝 Request Schemas**

```python
class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000, description="Mensaje del usuario")
    session_id: Optional[str] = Field(None, max_length=100, description="ID de sesión opcional")
    user_type: Optional[str] = Field(None, max_length=50, description="Tipo de usuario")

class DataCaptureRequest(BaseModel):
    session_id: str = Field(..., max_length=100, description="ID de sesión")
    email: str = Field(..., max_length=255, description="Email del usuario")
    user_type: str = Field(..., max_length=50, description="Tipo de usuario")
    linkedin: Optional[str] = Field(None, max_length=200, description="Perfil de LinkedIn")

class GDPRConsentRequest(BaseModel):
    session_id: str = Field(..., max_length=100, description="ID de sesión")
    consent_type: str = Field(..., max_length=50, description="Tipo de consentimiento")
    consent_given: bool = Field(..., description="Si el consentimiento fue dado")
    ip_address: Optional[str] = Field(None, max_length=45, description="Dirección IP")
    user_agent: Optional[str] = Field(None, max_length=500, description="User Agent")
```

### **📤 Response Schemas**

```python
class ChatResponse(BaseModel):
    message: str = Field(..., description="Respuesta generada por el chatbot")
    sources: List[SourceDocument] = Field(default_factory=list, description="Fuentes utilizadas")
    session_id: str = Field(..., description="ID de sesión")
    timestamp: datetime = Field(..., description="Timestamp de la respuesta")
    model: str = Field(..., description="Modelo utilizado para generar la respuesta")
    response_time_ms: int = Field(..., description="Tiempo de respuesta en milisegundos")
    flow_state: str = Field(..., description="Estado actual del flujo")
    requires_data_capture: bool = Field(..., description="Si requiere captura de datos")
    requires_gdpr_consent: bool = Field(..., description="Si requiere consentimiento GDPR")

class SourceDocument(BaseModel):
    type: str = Field(..., description="Tipo de fuente")
    content_preview: str = Field(..., description="Vista previa del contenido")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Metadatos de la fuente")

class HealthResponse(BaseModel):
    status: str = Field(..., description="Estado del servicio")
    version: str = Field(..., description="Versión de la API")
    timestamp: datetime = Field(..., description="Timestamp del health check")
    uptime_seconds: int = Field(..., description="Tiempo de actividad en segundos")
    database_status: str = Field(..., description="Estado de la base de datos")
    vector_store_status: str = Field(..., description="Estado del vector store")
    llm_status: str = Field(..., description="Estado del LLM")
```

---

## ⚠️ Manejo de Errores

### **🔴 Códigos de Error Estándar**

| Código | Descripción | Ejemplo |
|--------|-------------|---------|
| `400` | Bad Request | Mensaje vacío o datos inválidos |
| `401` | Unauthorized | Token de autenticación inválido |
| `403` | Forbidden | Acceso denegado |
| `404` | Not Found | Recurso no encontrado |
| `429` | Too Many Requests | Rate limit excedido |
| `500` | Internal Server Error | Error interno del servidor |
| `503` | Service Unavailable | Servicio temporalmente no disponible |

### **📋 Formato de Error**

```json
{
  "detail": "Descripción del error",
  "error_code": "VALIDATION_ERROR",
  "timestamp": "2025-01-15T10:30:00Z",
  "request_id": "req-1234567890"
}
```

### **🔄 Retry Logic Recomendado**

```python
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# Configuración de retry
retry_strategy = Retry(
    total=3,
    backoff_factor=1,
    status_forcelist=[429, 500, 502, 503, 504],
)

session = requests.Session()
session.mount("https://", HTTPAdapter(max_retries=retry_strategy))
```

---

## 🧪 Testing de la API

### **🔧 Herramientas de Testing**

**Swagger UI**: Testing interactivo en `/docs`
**Postman**: Colección de requests predefinidos
**curl**: Ejemplos de línea de comandos
**Python**: Cliente programático con requests

### **📝 Ejemplos de Testing**

**Test de Health Check**:
```bash
curl -H "Authorization: Bearer $(gcloud auth print-identity-token)" \
  "https://chatbot-api-251107984645.europe-west1.run.app/api/v1/health"
```

**Test de Chat**:
```bash
curl -X POST "https://chatbot-api-251107984645.europe-west1.run.app/api/v1/chat" \
  -H "Authorization: Bearer $(gcloud auth print-identity-token)" \
  -H "Content-Type: application/json" \
  -d '{"message": "¿Cuál es tu experiencia?", "session_id": "test-123"}'
```

**Test de Rate Limiting**:
```bash
# Ejecutar múltiples requests rápidamente para probar rate limiting
for i in {1..35}; do
  curl -X POST "https://chatbot-api-251107984645.europe-west1.run.app/api/v1/chat" \
    -H "Authorization: Bearer $(gcloud auth print-identity-token)" \
    -H "Content-Type: application/json" \
    -d '{"message": "Test message '$i'", "session_id": "test-'$i'"}'
done
```

---

## 📊 Métricas de Performance

### **⚡ Métricas de Latencia**

| Endpoint | Latencia P50 | Latencia P95 | Latencia P99 |
|----------|--------------|--------------|--------------|
| `/api/v1/chat` | 1.2s | 2.5s | 4.0s |
| `/api/v1/health` | 50ms | 100ms | 200ms |
| `/api/v1/analytics/capture-data` | 200ms | 500ms | 1.0s |

### **📈 Throughput**

- **Chat**: 30-50 requests/minuto
- **Health**: 100+ requests/minuto
- **Analytics**: 20-30 requests/minuto

### **🎯 Disponibilidad**

- **Uptime**: 99.9%
- **MTTR**: < 5 minutos
- **MTBF**: > 30 días

---

## 🔄 Versionado de la API

### **📋 Estrategia de Versionado**

**Versión Actual**: `v1`
**Formato**: `/api/v1/`
**Compatibilidad**: Backward compatible
**Deprecación**: 6 meses de aviso

### **🔄 Cambios Futuros**

**v2 Planificado**:
- WebSocket support para real-time
- GraphQL endpoint opcional
- Batch processing para analytics
- Enhanced caching headers

