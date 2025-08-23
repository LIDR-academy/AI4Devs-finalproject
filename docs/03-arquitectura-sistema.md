# Arquitectura del Sistema

## 2.1. Diagrama de arquitectura

### 2.1. Arquitectura General del Sistema

El sistema se compone de dos componentes principales:

1. **Backend API (Python FastAPI):** Servidor que maneja la lógica de negocio, RAG, y comunicación con Vertex AI
2. **Frontend de Interfaz:**
   - **Primera entrega:** Prototipo funcional mediante Streamlit para cumplir con el hito
   - **Objetivo secundario:** Widget integrado en el portfolio existente en almapi.dev
3. **Base de Datos:** PostgreSQL para datos relacionales y Vertex AI Vector Search para embeddings
4. **Servicios de IA:** Vertex AI con Gemini para generación de respuestas

```mermaid
graph TB
    subgraph "Frontend - Primera Entrega"
        A[Usuario] --> B[Prototipo Streamlit]
        B --> C[Chat Interface]
    end
    
    subgraph "Frontend - Objetivo Secundario"
        D[Usuario] --> E[Portfolio almapi.dev]
        E --> F[Widget Chatbot]
        F --> G[Chat Interface]
    end
    
    subgraph "Backend (Python FastAPI - Repo separado)"
        H[API Gateway] --> I[Chat Service]
        I --> J[RAG Engine]
        J --> K[Vector Search]
        J --> L[LLM Service]
        I --> M[Analytics Service]
        M --> N[Metrics DB]
    end
    
    subgraph "Google Cloud Platform"
        O[Cloud SQL PostgreSQL] --> P[User Data]
        Q[Vector Search] --> R[Embeddings]
        S[Vertex AI] --> T[Gemini Model]
        U[Cloud Storage] --> V[Static Assets]
        W[Cloud Run] --> X[Backend API]
        Y[Cloud Monitoring] --> Z[Logs & Metrics]
    end
    
    subgraph "External Services"
        AA[LinkedIn API] --> BB[Professional Data]
        CC[GitHub API] --> DD[Project Data]
        EE[Atlassian JIRA] --> FF[Project Management]
    end
    
    C --> H
    G --> H
    K --> Q
    L --> S
    N --> O
    J --> AA
    J --> CC
    M --> EE
```

## 2.2. Descripción de componentes principales

### Frontend Components (Ya implementado y desplegado)

#### Portfolio React (Existente en almapi.dev)
- **Tecnología:** React 18 con TypeScript
- **Propósito:** Portfolio web principal con integración del chatbot
- **Responsabilidades:** Presentación del contenido profesional, navegación, integración del widget de chat

#### Chat Widget
- **Tecnología:** React Component con WebSocket
- **Propósito:** Interfaz de usuario para el chatbot
- **Responsabilidades:** 
  - Renderizado de la interfaz de chat
  - Gestión de WebSocket para comunicación en tiempo real
  - Manejo de estados de carga y errores
  - Integración con el portfolio existente

### Backend Components

#### FastAPI Gateway
- **Tecnología:** Python FastAPI
- **Propósito:** API REST principal del sistema
- **Responsabilidades:**
  - Enrutamiento de requests
  - Autenticación y autorización
  - Rate limiting
  - Logging y monitoreo
  - Documentación automática (Swagger/OpenAPI)

#### Chat Service
- **Tecnología:** Python con async/await
- **Propósito:** Orquestación de la lógica del chatbot
- **Responsabilidades:**
  - Procesamiento de mensajes del usuario
  - Coordinación entre RAG y LLM
  - Gestión de contexto de conversación
  - Validación de inputs

#### RAG Engine
- **Tecnología:** Python con Vertex AI
- **Propósito:** Sistema de Retrieval Augmented Generation
- **Responsabilidades:**
  - Búsqueda semántica en la base de conocimiento
  - Generación de embeddings
  - Recuperación de contexto relevante
  - Ranking de resultados

#### LLM Service
- **Tecnología:** Google Vertex AI con Gemini
- **Propósito:** Generación de respuestas en lenguaje natural
- **Responsabilidades:**
  - Procesamiento de prompts
  - Generación de respuestas contextualizadas
  - Manejo de múltiples idiomas
  - Control de calidad de respuestas

#### Analytics Service
- **Tecnología:** Python con pandas/numpy
- **Propósito:** Análisis y métricas del sistema
- **Responsabilidades:**
  - Recopilación de datos de interacción
  - Análisis de preguntas frecuentes
  - Medición de satisfacción del usuario
  - Generación de reportes

### Data Layer Components

#### PostgreSQL Database
- **Tecnología:** Google Cloud SQL
- **Propósito:** Base de datos relacional principal
- **Responsabilidades:**
  - Almacenamiento de datos de usuario
  - Métricas y analytics
  - Configuración del sistema
  - Logs de auditoría

#### Vector Database
- **Tecnología:** Google Cloud Vector Search
- **Propósito:** Almacenamiento de embeddings para búsqueda semántica
- **Responsabilidades:**
  - Indexación de documentos
  - Búsqueda por similitud
  - Actualización de embeddings
  - Optimización de consultas

### External Services

#### Google Vertex AI
- **Propósito:** Plataforma de IA/ML de Google
- **Responsabilidades:**
  - Hosting del modelo Gemini
  - Generación de embeddings
  - Fine-tuning de modelos
  - Monitoreo de rendimiento

#### Atlassian Suite (JIRA + Confluence)
- **Propósito:** Gestión de proyecto y documentación
- **Responsabilidades:**
  - Tracking de tickets y tareas
  - Documentación técnica
  - Gestión de sprints
  - Reportes de progreso

## 2.3. Descripción de alto nivel del proyecto y estructura de ficheros

### Estructura del Repositorio

```
my-resume-react/
├── frontend/                    # Portfolio React existente
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatWidget/      # Nuevo componente de chat
│   │   │   └── ...              # Componentes existentes
│   │   ├── services/
│   │   │   ├── chatService.js   # Servicio de comunicación con backend
│   │   │   └── ...              # Servicios existentes
│   │   └── ...
│   ├── public/
│   └── package.json
├── backend/                     # Nuevo desarrollo
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat.py          # Endpoints de chat
│   │   │   ├── analytics.py     # Endpoints de analytics
│   │   │   └── admin.py         # Endpoints administrativos
│   │   ├── services/
│   │   │   ├── chat_service.py  # Lógica de chat
│   │   │   ├── rag_service.py   # Servicio RAG
│   │   │   ├── llm_service.py   # Servicio LLM
│   │   │   └── analytics_service.py
│   │   ├── models/
│   │   │   ├── chat.py          # Modelos de datos
│   │   │   └── analytics.py
│   │   ├── database/
│   │   │   ├── connection.py    # Configuración de BD
│   │   │   └── migrations/      # Migraciones
│   │   └── utils/
│   │       ├── security.py      # Utilidades de seguridad
│   │       └── logging.py       # Configuración de logs
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
│   ├── requirements.txt
│   └── main.py
├── infrastructure/              # Configuración de infraestructura
│   ├── terraform/               # Terraform para GCP
│   ├── docker/                  # Dockerfiles
│   └── github-actions/          # CI/CD
├── docs/                        # Documentación
│   ├── api/                     # Especificación de API
│   ├── architecture/            # Diagramas de arquitectura
│   └── deployment/              # Guías de despliegue
└── scripts/                     # Scripts de utilidad
    ├── setup.sh                 # Script de configuración
    └── deploy.sh                # Script de despliegue
```

### Patrones Arquitectónicos

#### Clean Architecture
- **Separación de responsabilidades:** Cada capa tiene responsabilidades específicas
- **Independencia de frameworks:** La lógica de negocio es independiente de la tecnología
- **Testabilidad:** Cada componente puede ser testeado de forma aislada
- **Mantenibilidad:** Cambios en una capa no afectan otras

#### Microservices Pattern
- **Servicios independientes:** Chat, Analytics, RAG como servicios separados
- **Comunicación asíncrona:** WebSockets para comunicación en tiempo real
- **Escalabilidad:** Cada servicio puede escalar independientemente
- **Resiliencia:** Fallos en un servicio no afectan otros

#### Event-Driven Architecture
- **Eventos de usuario:** Cada interacción genera eventos
- **Procesamiento asíncrono:** Analytics y métricas se procesan de forma asíncrona
- **Desacoplamiento:** Componentes se comunican a través de eventos
- **Trazabilidad:** Todos los eventos se registran para auditoría

## 2.4. Infraestructura y despliegue

### Diagrama de Despliegue

```mermaid
graph TB
    subgraph "Google Cloud Platform"
        subgraph "Frontend"
            A[Cloud Storage] --> B[Load Balancer]
            B --> C[CDN]
        end
        
        subgraph "Backend"
            D[Cloud Run] --> E[API Gateway]
            E --> F[Backend Services]
        end
        
        subgraph "Data & AI"
            G[Cloud SQL] --> H[PostgreSQL]
            I[Vector Search] --> J[Embeddings]
            K[Vertex AI] --> L[Gemini Model]
        end
        
        subgraph "Monitoring"
            M[Cloud Monitoring] --> N[Logs]
            O[Error Reporting] --> P[Alerts]
        end
    end
    
    subgraph "External"
        Q[GitHub] --> R[GitHub Actions]
        S[Atlassian] --> T[JIRA/Confluence]
    end
    
    C --> E
    F --> G
    F --> I
    F --> K
    R --> D
    R --> A
    M --> F
    O --> F
```

### Flujo de CI/CD

```mermaid
graph LR
    A[Code Push] --> B[GitHub Actions]
    B --> C[Tests]
    C --> D[Build]
    D --> E[Security Scan]
    E --> F[Deploy to GCP]
    F --> G[Health Check]
    G --> H[Update JIRA]
    H --> I[Notify Team]
    
    C -->|Fail| J[Rollback]
    E -->|Fail| J
    G -->|Fail| J
```

### Configuración de Infraestructura

#### Google Cloud Platform
- **Region:** us-central1 (Iowa)
- **Project:** chatbot-portfolio-{environment}
- **Billing:** Budget alerts configurados

#### Servicios Utilizados
- **Cloud Run:** Backend API (serverless)
- **Cloud Storage:** Frontend estático + CDN
- **Cloud SQL:** Base de datos PostgreSQL
- **Vector Search:** Base de datos vectorial
- **Vertex AI:** Modelos de IA
- **Cloud Monitoring:** Monitoreo y alertas
- **Cloud Logging:** Logs centralizados
- **Cloud IAM:** Gestión de identidades

#### Configuración de Seguridad
- **VPC:** Red privada para recursos sensibles
- **Firewall:** Reglas restrictivas
- **IAM:** Principio de menor privilegio
- **Encryption:** Datos en reposo y tránsito
- **Secrets Manager:** Gestión segura de secretos

#### Medidas de Ciberseguridad Avanzadas
- **Cloud Armor:** Protección DDoS y WAF rules
- **Security Command Center:** Monitoreo centralizado de amenazas
- **Threat Detection:** Detección en tiempo real de ataques
- **Rate Limiting:** Protección contra abuso de API
- **Geo-blocking:** Bloqueo de regiones sospechosas

#### Control de Costos y Budgets
- **Budget Alerts:** Alertas automáticas en 50%, 80% y 100%
- **Resource Quotas:** Límites estrictos por servicio
- **Cost Monitoring:** Dashboard en tiempo real de gastos
- **Emergency Mode:** Activación automática al exceder presupuesto
- **Auto-scaling Limits:** Control de escalado automático

## 2.5. Seguridad

### OWASP Top 10 for LLM Compliance

#### LLM-01: Prompt Injection
- **Mitigación:** Validación estricta de inputs
- **Implementación:** Sanitización de prompts, listas blancas de comandos
- **Monitoreo:** Detección de patrones sospechosos

#### LLM-02: Insecure Output Handling
- **Mitigación:** Validación de respuestas del LLM
- **Implementación:** Filtros de contenido, escape de HTML/JS
- **Monitoreo:** Análisis de respuestas generadas

#### LLM-03: Training Data Poisoning
- **Mitigación:** Validación de fuentes de datos
- **Implementación:** Verificación de integridad de datos
- **Monitoreo:** Detección de anomalías en datos

#### LLM-04: Model Denial of Service
- **Mitigación:** Rate limiting y quotas
- **Implementación:** Límites por usuario/IP
- **Monitoreo:** Métricas de uso y costos

#### LLM-05: Supply Chain Vulnerabilities
- **Mitigación:** Verificación de dependencias
- **Implementación:** Escaneo de vulnerabilidades
- **Monitoreo:** Actualizaciones de seguridad

#### LLM-06: Sensitive Information Disclosure
- **Mitigación:** Clasificación y protección de datos
- **Implementación:** Data masking y access controls
- **Monitoreo:** Auditoría de acceso a datos sensibles

#### LLM-07: Insecure Plugin Design
- **Mitigación:** Validación estricta de plugins
- **Implementación:** Sandboxing y permission model
- **Monitoreo:** Análisis de comportamiento de plugins

#### LLM-08: Excessive Agency
- **Mitigación:** Validación de acciones del LLM
- **Implementación:** Confirmation flows y escalation procedures
- **Monitoreo:** Logging de todas las acciones del modelo

#### LLM-09: Overreliance
- **Mitigación:** Confidence scoring y human oversight
- **Implementación:** Fallback mechanisms y validación humana
- **Monitoreo:** Métricas de confiabilidad del modelo

#### LLM-10: Model Theft
- **Mitigación:** Protección del modelo y acceso
- **Implementación:** Encryption y access monitoring
- **Monitoreo:** Detección de acceso no autorizado

### Medidas de Seguridad Implementadas

#### Autenticación y Autorización
- **JWT Tokens:** Para autenticación de API
- **OAuth 2.0:** Para integración con servicios externos
- **Role-Based Access Control:** Diferentes niveles de acceso

#### Protección de Datos
- **Encryption at Rest:** Todos los datos cifrados
- **Encryption in Transit:** TLS 1.3 obligatorio
- **Data Masking:** Información sensible ofuscada
- **Audit Logging:** Registro de todas las acciones

#### Seguridad de la Aplicación
- **Input Validation:** Validación estricta de todos los inputs
- **SQL Injection Prevention:** Uso de ORM con parámetros
- **XSS Prevention:** Escape de contenido dinámico
- **CSRF Protection:** Tokens CSRF en formularios

## 2.6. Control de Costos y Monitoreo

### Gestión de Presupuesto

#### Budget Configuration
- **Presupuesto Mensual:** $100 USD (configurable)
- **Alertas Automáticas:** 50%, 80% y 100% del presupuesto
- **Notificaciones:** Pub/Sub, email y Slack
- **Acciones Automáticas:** Modo de emergencia al exceder 100%

#### Resource Quotas por Servicio
- **Vertex AI:** 10,000 requests/día, 1,000 tokens/request
- **Vector Search:** 10GB max, 1,000 queries/minuto
- **Cloud Run:** 10 instancias max, 2 CPU, 4GB RAM
- **Cloud Storage:** 100GB max con lifecycle de 30 días
- **BigQuery:** $5.0 max por query, 50GB storage

### Modo de Emergencia

#### Activación Automática
- **Trigger:** Al exceder 100% del presupuesto
- **Acciones:**
  - Reducción de auto-scaling a 2 instancias
  - Activación de rate limiting estricto (50% del normal)
  - Deshabilitación de servicios no esenciales
  - Notificaciones de emergencia al equipo

#### Monitoreo de Costos
- **Dashboard en Tiempo Real:** Gasto por servicio y período
- **Métricas Clave:** Costo por interacción, eficiencia de recursos
- **Alertas Inteligentes:** Detección de anomalías en costos
- **Reportes Automáticos:** Resúmenes diarios y semanales

### Monitoreo y Observabilidad

#### Security Monitoring
- **Security Command Center:** Dashboard centralizado de amenazas
- **Threat Detection:** Detección en tiempo real de ataques
- **Security Logging:** Logging estructurado de eventos de seguridad
- **Incident Response:** Plan de respuesta automática a incidentes

#### Performance Monitoring
- **Cloud Monitoring:** Métricas de performance y disponibilidad
- **Custom Metrics:** Métricas específicas de RAG y LLM
- **Alerting:** Alertas automáticas para problemas de performance
- **Tracing:** Distributed tracing para debugging

## 2.7. Tests

### Estrategia de Testing

#### Pirámide de Testing
```
    /\
   /  \     E2E Tests (2%)
  /____\    Integration Tests (18%)
 /______\   Unit Tests (80%)
```

#### Tipos de Tests

##### Unit Tests (80%)
- **Cobertura:** >90% de líneas de código
- **Frameworks:** pytest para Python, Jest para JavaScript
- **Foco:** Lógica de negocio, servicios individuales
- **Ejecución:** En cada commit, <30 segundos

##### Integration Tests (18%)
- **Cobertura:** APIs, base de datos, servicios externos
- **Frameworks:** pytest-asyncio, TestContainers
- **Foco:** Comunicación entre componentes
- **Ejecución:** En cada PR, <5 minutos

##### E2E Tests (2%)
- **Cobertura:** Flujos completos de usuario
- **Frameworks:** Playwright, Cypress
- **Foco:** Experiencia de usuario completa
- **Ejecución:** En cada release, <15 minutos

### Tests Específicos del Sistema

#### Tests de Chatbot
- **Respuestas del LLM:** Validación de calidad y relevancia
- **RAG System:** Precisión de búsqueda semántica
- **Multiidioma:** Traducción y contexto cultural
- **Performance:** Latencia de respuestas

#### Tests de Analytics
- **Recopilación de datos:** Precisión de métricas
- **Procesamiento:** Análisis estadístico correcto
- **Reportes:** Generación de insights válidos

#### Tests de Seguridad
- **Penetration Testing:** Vulnerabilidades conocidas
- **OWASP Compliance:** Verificación de mitigaciones
- **Data Protection:** Cumplimiento de privacidad
- **Prompt Injection Testing:** Validación de protección RAG
- **Rate Limiting Testing:** Verificación de límites de uso
- **Adversarial Testing:** Tests con prompts maliciosos y patrones de ataque
- **Geo-blocking Testing:** Validación de bloqueo por regiones
- **Authentication Bypass Testing:** Verificación de seguridad de acceso
- **Security Headers Testing:** Validación de headers de seguridad
- **Key Rotation Testing:** Verificación de rotación automática de claves
- **Threat Detection Testing:** Validación de detección de amenazas

#### Tests de Control de Costos
- **Budget Alerts:** Validación de alertas automáticas
- **Emergency Mode:** Testing de modo de emergencia
- **Resource Quotas:** Verificación de límites de recursos
- **Cost Monitoring:** Validación de métricas de costos
- **Circuit Breaker Testing:** Validación de circuit breakers para costos
- **Cache Warming Testing:** Verificación de precarga inteligente de cache
- **Performance Under Load Testing:** Testing con usuarios concurrentes
- **Quality Metrics Testing:** Validación de alertas proactivas de calidad

### Automatización de Tests

#### CI/CD Pipeline
```mermaid
graph LR
    A[Code Push] --> B[Unit Tests]
    B --> C[Integration Tests]
    C --> D[Security Tests]
    D --> E[Adversarial Testing]
    E --> F[Performance Tests]
    F --> G[Vulnerability Scan]
    G --> H[E2E Tests]
    H --> I[Deploy Staging]
    I --> J[Quality Validation]
    J --> K[Security Validation]
    K --> L[Deploy Production]
    
    B -->|Fail| M[Block PR]
    C -->|Fail| M
    D -->|Fail| M
    E -->|Fail| M
    F -->|Fail| M
    G -->|Fail| M
    H -->|Fail| M
    J -->|Fail| M
    K -->|Fail| M
```

#### Herramientas de Testing
- **Python:** pytest, pytest-asyncio, pytest-cov
- **JavaScript:** Jest, React Testing Library
- **Security:** OWASP ZAP, Bandit, Security Headers
- **Adversarial Testing:** Custom prompts maliciosos, pattern detection
- **Performance:** Locust, Artillery, concurrent testing
- **Geo-blocking:** GeoIP testing, region validation
- **Circuit Breakers:** Budget simulation, cost threshold testing
- **Cache Testing:** Redis performance, cache warming validation
- **Quality Monitoring:** Custom quality metrics, proactive alerting
- **Monitoring:** Test observability con OpenTelemetry
- **Cost Testing:** Simulación de presupuesto y alertas 