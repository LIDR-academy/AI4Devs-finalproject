# Modelo de Datos

## 3.1. Diagrama del modelo de datos

### Diagrama ER Principal

```mermaid
erDiagram
    USERS {
        uuid id PK "Identificador único del usuario"
        string email UK "Email del usuario"
        string name "Nombre completo"
        string ip_address "Dirección IP del visitante"
        timestamp created_at "Fecha de creación"
        timestamp last_activity "Última actividad"
        string user_agent "User agent del navegador"
        string language "Idioma preferido"
        string timezone "Zona horaria"
    }

    CONVERSATIONS {
        uuid id PK "Identificador único de la conversación"
        uuid user_id FK "Referencia al usuario"
        string session_id "ID de sesión"
        timestamp started_at "Inicio de conversación"
        timestamp ended_at "Fin de conversación"
        integer message_count "Número de mensajes"
        string initial_topic "Tema inicial"
        integer satisfaction_score "Puntuación de satisfacción"
        boolean is_completed "Conversación completada"
    }

    MESSAGES {
        uuid id PK "Identificador único del mensaje"
        uuid conversation_id FK "Referencia a la conversación"
        string content "Contenido del mensaje"
        string role "Rol: user/assistant/system"
        timestamp sent_at "Fecha de envío"
        integer tokens_used "Tokens utilizados"
        float response_time "Tiempo de respuesta en segundos"
        string language "Idioma del mensaje"
        json metadata "Metadatos adicionales"
    }

    KNOWLEDGE_BASE {
        uuid id PK "Identificador único del documento"
        string title "Título del documento"
        string content "Contenido del documento"
        string source "Fuente: linkedin/github/projects/certifications"
        string category "Categoría del contenido"
        timestamp created_at "Fecha de creación"
        timestamp updated_at "Fecha de actualización"
        boolean is_active "Documento activo"
        json metadata "Metadatos del documento"
    }

    EMBEDDINGS {
        uuid id PK "Identificador único del embedding"
        uuid knowledge_base_id FK "Referencia al documento"
        vector embedding "Vector de embedding"
        string model_version "Versión del modelo usado"
        timestamp created_at "Fecha de creación"
        float similarity_score "Score de similitud"
    }

    ANALYTICS {
        uuid id PK "Identificador único del registro"
        uuid conversation_id FK "Referencia a la conversación"
        string metric_type "Tipo de métrica"
        string metric_name "Nombre de la métrica"
        float metric_value "Valor de la métrica"
        timestamp recorded_at "Fecha de registro"
        json context "Contexto adicional"
    }

    FEEDBACK {
        uuid id PK "Identificador único del feedback"
        uuid conversation_id FK "Referencia a la conversación"
        integer rating "Puntuación 1-5"
        string comment "Comentario del usuario"
        string category "Categoría del feedback"
        timestamp submitted_at "Fecha de envío"
        boolean is_processed "Feedback procesado"
    }

    SYSTEM_CONFIG {
        uuid id PK "Identificador único de configuración"
        string config_key UK "Clave de configuración"
        string config_value "Valor de configuración"
        string description "Descripción de la configuración"
        timestamp updated_at "Fecha de actualización"
        string updated_by "Usuario que actualizó"
    }

    USERS ||--o{ CONVERSATIONS : "has"
    CONVERSATIONS ||--o{ MESSAGES : "contains"
    CONVERSATIONS ||--o{ ANALYTICS : "generates"
    CONVERSATIONS ||--o{ FEEDBACK : "receives"
    KNOWLEDGE_BASE ||--o{ EMBEDDINGS : "has"
    KNOWLEDGE_BASE ||--o{ MESSAGES : "referenced_in"
```

### Notas de Implementación

**Repositorio:** Este modelo de datos será implementado en el nuevo repositorio `almapi-chatbot-backend` que contendrá toda la lógica de base de datos y persistencia.

**Base de Datos:** Se utilizará Google Cloud SQL (PostgreSQL) para las tablas relacionales y Vertex AI Vector Search para los embeddings.

**Integración:** El frontend ya desplegado en almapi.dev se comunicará con este backend a través de APIs REST y WebSocket.

### Seguridad de Datos

#### Encriptación y Protección
- **Datos en Reposo:** Todos los datos sensibles (emails, IPs, contenido de mensajes) estarán encriptados usando GCP Cloud KMS
- **Datos en Tránsito:** Comunicación TLS 1.3 obligatoria para todas las APIs
- **Access Control:** Control de acceso basado en roles (RBAC) para todas las operaciones de base de datos
- **Audit Logging:** Registro completo de todas las operaciones CRUD para auditoría de seguridad

#### Protección de Privacidad
- **Data Masking:** IPs y datos personales serán ofuscados en logs y reportes
- **Retention Policy:** Políticas automáticas de retención de datos según regulaciones GDPR/CCPA
- **Anonymization:** Datos de analytics serán anonimizados antes del almacenamiento
- **Consent Management:** Sistema de gestión de consentimiento para recolección de datos

#### Seguridad de Embeddings
- **Vector Encryption:** Los embeddings vectoriales estarán encriptados en Vertex AI Vector Search
- **Access Monitoring:** Monitoreo continuo de acceso a la base de conocimiento
- **Rate Limiting:** Límites estrictos de acceso a embeddings para prevenir abuso
- **Threat Detection:** Detección automática de patrones sospechosos en consultas de embeddings 