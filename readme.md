## Índice

0. [Ficha del proyecto](#0-ficha-del-proyecto)
1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)

---

## 0. Ficha del proyecto

### **0.1. Tu nombre completo:**
Lucas Rivas

### **0.2. Nombre del proyecto:**
InsAI - Plataforma de Gestión de Conocimiento Inteligente

### **0.3. Descripción breve del proyecto:**
InsAI es una plataforma SaaS de IA de vanguardia que permite a individuos y empresas transformar su colección de documentos digitales (PDFs, imágenes, texto) en una base de conocimiento interactiva y segura. Mediante un agente conversacional, los usuarios pueden hacer preguntas complejas en lenguaje natural y recibir respuestas precisas y contextualizadas al instante, liberando el valor oculto en su información y eliminando la necesidad de búsquedas manuales tediosas.

### **0.4. URL del proyecto:**
https://github.com/larivasd/insai

### 0.5. URL o archivo comprimido del repositorio
https://github.com/larivasd/insai
Anexado tambien en el formulario de entrga en: https://lidr.typeform.com/proyectoai4devs

---

## 1. Descripción general del producto

### **1.1. Objetivo:**

InsAI nace de la necesidad de crear una solución que permita a individuos y empresas transformar su colección de documentos digitales en una base de conocimiento interactiva y segura. El producto aporta valor al:

- **Liberar información oculta**: Convierte documentos estáticos en conocimiento accesible mediante IA
- **Eliminar búsquedas manuales**: Permite consultas en lenguaje natural sobre documentos complejos
- **Mejorar productividad**: Respuestas instantáneas y contextualizadas para toma de decisiones
- **Garantizar seguridad**: Multi-tenencia estricta con aislamiento completo de datos por usuario

**Público objetivo:**
- **Individuos**: Personas que necesitan gestionar documentos personales (pólizas, contratos, facturas)
- **Empresas**: Organizaciones que manejan grandes volúmenes de documentos
- **Profesionales**: Abogados, aseguradoras, consultores que requieren acceso rápido a información específica

### **1.2. Características y funcionalidades principales:**

#### **Funcionalidades Core:**
1. **Gestión de Categorías**
   - CRUD de categorías (ej., "Pólizas Hogar", "Siniestros Auto")
   - Estados activo/inactivo
   - Filtrado dinámico por categorías

2. **Gestión de Documentos**
   - Subida de PDFs, imágenes y docx
   - OCR para extracción de texto
   - Eliminación definitiva con limpieza de vectores   

3. **Chat Interactivo**
   - Interfaz conversacional intuitiva   
   - Historial completo de conversaciones
   - Análisis de contexto de la conversación
   - Memoria conversacional persistente

4. **Pipeline RAG Avanzado**
   - Recuperación con filtros por metadatos
   - Re-clasificación (re-ranking) de resultados
   - Generación basada exclusivamente en documentos del usuario   

#### **Funcionalidades Avanzadas:**
- **Multi-tenencia Estricta**: Aislamiento completo de datos por usuario
- **Autenticación Híbrida**: Credenciales tradicionales + Google Sign-In
- **Procesamiento Avanzado**: OCR + extracción de texto de PDFs
- **Historial Completo**: Almacenamiento de todas las conversaciones
- **Seguridad Robusta**: JWT, CORS, validación de entrada, sanitización

### **1.3. Diseño y experiencia de usuario:**

#### **Interfaz Principal:**
- **Diseño Moderno**: Angular 17+ con Tailwind CSS para una experiencia visual atractiva
- **Responsive Design**: Adaptación automática a móviles, tablets y desktop
- **Navegación Intuitiva**: Header con menú de usuario y navegación entre módulos
- **Componentes Reutilizables**: Patrones de diseño consistentes en toda la aplicación

#### **Flujo de Usuario:**
1. **Autenticación**: Login/registro con credenciales o Google Sign-In
2. **Dashboard**: Vista general de documentos y categorías
3. **Subida de Documentos**: Modal responsive con drag & drop
4. **Gestión de Categorías**: CRUD completo con estados activo/inactivo
5. **Chat IA**: Interfaz conversacional con streaming de respuestas
6. **Visualización**: Viewer de documentos con zoom y navegación

#### **Experiencia Técnica:**
- **Feedback Visual**: Indicadores de progreso y estados de carga
- **Manejo de Errores**: Mensajes claros y acciones de recuperación

### **1.4. Instrucciones de instalación:**

#### **Prerrequisitos:**
- Node.js (v20 o superior)
- Python (v3.11 o superior)
- Git
- Docker y Docker Compose
- Google Cloud SDK (para deployment)

#### **Configuración del Entorno:**

1. **Clonar el repositorio:**
```bash
git clone https://github.com/larivasd/insai.git
cd insai
```

2. **Configurar variables de entorno:**
```bash
cp env.example .env
# Editar .env con tus credenciales
```

3. **Iniciar infraestructura (Docker):**
```bash
docker-compose up -d postgres redis pgadmin
```

4. **Configurar Backend:**
```bash
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1  # Windows
pip install -r requirements.txt
python main.py
```

5. **Configurar Frontend:**
```bash
cd frontend/insai-app
npm install
npm start
```

#### **Servicios Requeridos:**
- **PostgreSQL**: Base de datos principal (puerto 5432)
- **Redis**: Cache y sesiones (puerto 6379)
- **MinIO**: Storage local para desarrollo (puerto 9000)
- **ChromaDB**: Base de datos vectorial local

#### **Configuración de Base de Datos:**
```bash
# Aplicar migraciones
cd backend
alembic upgrade head

# Verificar conexión
python -c "from app.core.database import engine; print('DB conectada')"
```

#### **Verificación de Instalación:**
- **Frontend**: http://localhost:4200
- **Backend**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **pgAdmin**: http://localhost:5050

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[Angular 17+ App]
        B[Tailwind CSS]
        C[TypeScript]
        D[RxJS]
    end
    
    subgraph "API Gateway Layer"
        E[FastAPI Backend]
        F[JWT Authentication]
        G[CORS Middleware]
        H[Rate Limiting]
    end
    
    subgraph "Application Layer"
        I[Document Service]
        J[Chat Service]
        K[RAG Service]
        L[Auth Service]
        M[Category Service]
    end
    
    subgraph "AI Services"        
        O[Google Gemini]
        P[Cohere Rerank]
        Q[Hugging Face Embeddings]
    end
    
    subgraph "Data Layer"
        R[PostgreSQL]
        S[Redis Cache]
        T[Vertex AI Vector DB]
        U[Google Cloud Storage]
    end
    
    subgraph "Infrastructure"
        V[Google Cloud Platform]
        W[Docker Containers]
        X[Cloud Run]
        Y[Cloud Run Frontend]
    end
    
    A --> E
    E --> I
    E --> J
    E --> K
    E --> L
    E --> M
    
    I --> R
    I --> U
    J --> K    
    K --> O
    K --> P
    K --> Q
    K --> T
    
    L --> R
    M --> R
    
    E --> S
    R --> S
    
    V --> W
    W --> X
    W --> Y
```

#### **Patrón de Arquitectura:**
InsAI sigue una **Clean Architecture** con separación clara de responsabilidades y patrones de diseño bien definidos:

1. **Presentation Layer**: Principios SOLID, Component-Based Architecture
2. **API Gateway Layer**: Facade Pattern, Middleware Pattern, CORS Strategy
3. **Application Layer**: Domain-Driven Design (DDD), Service Layer Pattern
4. **AI Services**: Strategy Pattern, Abstract Factory Pattern, Adapter Pattern
5. **Data Layer**: Repository Pattern, Unit of Work Pattern, Data Mapper
6. **Infrastructure**: Dependency Injection, Configuration Pattern, Factory Pattern

#### **Principios Fundamentales:**
- **SOLID**: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion
- **DDD (Domain-Driven Design)**: Modelado del dominio, entidades, value objects, servicios de dominio
- **Abstract Factory Pattern**: Creación de objetos relacionados sin especificar sus clases concretas
- **Strategy Pattern**: Intercambio de algoritmos en tiempo de ejecución
- **Repository Pattern**: Abstracción de la lógica de acceso a datos

#### **Justificación de la Arquitectura:**
- **Escalabilidad**: Microservicios independientes que pueden escalar por separado
- **Mantenibilidad**: Separación clara de responsabilidades facilita el mantenimiento
- **Flexibilidad**: Fácil intercambio de proveedores de IA y servicios
- **Seguridad**: Multi-tenencia estricta con aislamiento de datos por usuario
- **Performance**: Cache distribuido y base de datos vectorial optimizada

#### **Beneficios:**
- **Desarrollo ágil**: Equipos pueden trabajar independientemente en cada capa
- **Testing**: Cada capa puede ser testeada de forma aislada
- **Deployment**: Despliegue independiente de servicios
- **Monitoreo**: Observabilidad granular de cada componente

#### **Sacrificios:**
- **Complejidad**: Mayor complejidad inicial de configuración
- **Latencia**: Múltiples capas pueden introducir latencia adicional
- **Costo**: Múltiples servicios cloud pueden incrementar costos


### **2.2. Descripción de componentes principales:**

#### **Frontend (Angular 17+)**
- **Framework**: Angular 17+ con control flow moderno (@if, @for, @switch)
- **Styling**: Tailwind CSS para diseño utility-first
- **Lenguaje**: TypeScript con tipado estático
- **Estado**: RxJS para programación reactiva
- **Arquitectura**: Modular con lazy loading y code splitting

#### **Backend (FastAPI)**
- **Framework**: FastAPI con documentación automática OpenAPI
- **Lenguaje**: Python 3.11+ con async/await
- **ORM**: SQLAlchemy para mapeo objeto-relacional
- **Validación**: Pydantic para validación de datos
- **Servidor**: Uvicorn ASGI para alta performance

#### **Base de Datos**
- **Principal**: PostgreSQL con soporte JSONB y full-text search
- **Vectorial**: Vertex AI Vector Search para búsqueda semántica
- **Cache**: Redis para sesiones y cache distribuido
- **Storage**: Google Cloud Storage para archivos

#### **Servicios de IA**
- **LLM**: Google Gemini 2.5 Flash
- **Embeddings**: Hugging Face - Embeddings | Vertex AI
- **OCR**: Pytesseract para extracción de texto de imágenes
- **Rerank**: Cohere Rerank para re-clasificación de resultados

#### **Infraestructura**
- **Cloud**: Google Cloud Platform
- **Containerización**: Docker con docker-compose
- **Despliegue**: Cloud Run para backend y frontend
- **Base de Datos**: Google Cloud SQL (PostgreSQL)
- **Almacenamiento**: Google Cloud Storage
- **Vector Database**: Vertex AI Vector Search
- **Embeddings**: Hugging Face + Vertex AI
- **CI/CD**: GitHub Actions con despliegue automático

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

```
insai/
├── frontend/insai-app/          # Aplicación Angular 17+ principal
│   ├── src/app/
│   │   ├── core/               # Servicios singleton y configuración
│   │   ├── features/           # Módulos de funcionalidad específica
│   │   │   ├── auth/           # Autenticación y autorización
│   │   │   ├── documents/      # Gestión de documentos
│   │   │   ├── chat/           # Chat con IA
│   │   │   └── profile/        # Perfil de usuario
│   │   ├── shared/             # Componentes reutilizables
│   │   ├── layouts/            # Componentes de layout
│   │   └── styles/             # Estilos globales
│   └── .cursor/rules/          # Reglas específicas del frontend
├── backend/                     # API FastAPI
│   ├── app/
│   │   ├── api/                # Endpoints de la API
│   │   │   └── v1/            # Versión 1 de la API
│   │   ├── core/              # Configuración central
│   │   ├── models/            # Modelos SQLAlchemy
│   │   ├── schemas/           # Esquemas Pydantic
│   │   ├── services/          # Lógica de negocio
│   │   ├── ai/                # Servicios de IA
│   │   └── utils/             # Utilidades
│   └── .cursor/rules/         # Reglas específicas del backend
├── database/                   # Migraciones PostgreSQL
│   ├── init/                  # Scripts de inicialización
│   └── migrations/            # Migraciones de base de datos
├── docs/                      # Documentación del proyecto
├── memory-bank/               # Conocimiento del proyecto
├── .cursor/rules/             # Reglas Cursor distribuidas
└── scripts/                   # Scripts de automatización
```

#### **Patrón de Arquitectura:**
El proyecto sigue el patrón **Feature-Based Architecture** con principios de diseño bien establecidos:

- **Frontend**: Feature Modules, Lazy Loading, OnPush Change Detection Strategy
- **Backend**: FastAPI, Service Layer Pattern, Factory Pattern, Dependency Injection
- **Database**: Migration Pattern, Version Control, Schema Evolution
- **Documentation**: Documentation as Code, Living Documentation Pattern

#### **Principios Fundamentales:**
- **SOLID**: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion
- **DDD (Domain-Driven Design)**: Modelado del dominio, entidades, value objects, servicios de dominio
- **Abstract Factory Pattern**: Creación de objetos relacionados sin especificar sus clases concretas
- **Strategy Pattern**: Intercambio de algoritmos en tiempo de ejecución
- **Repository Pattern**: Abstracción de la lógica de acceso a datos

### **2.4. Infraestructura y despliegue**

```mermaid
graph TB
    subgraph "Development Environment"
        A[Local Development]
        B[Docker Compose]
        C[PostgreSQL Local]
        D[Redis Local]
        E[MinIO Local]
        F[ChromaDB Local]
    end
    
    subgraph "Google Cloud Platform"
        G[Cloud Run - Backend]
        H[Cloud Run - Frontend]
        I[Cloud SQL - PostgreSQL]
        J[Memorystore - Redis]
        K[Vertex AI - Vector DB]
        L[Cloud Storage - Files]
        M[Hugging Face - Embeddings]
    end
    
    subgraph "CI/CD Pipeline"
        N[GitHub Actions]
        O[Docker Build]
        P[Security Scan]
        Q[Tests]
        R[Deploy to GCP]
    end
    
    A --> B
    B --> C
    B --> D
    B --> E
    B --> F
    
    N --> O
    O --> P
    P --> Q
    Q --> R
    
    R --> G
    R --> H
    R --> I
    R --> J
    R --> K
    R --> L
    R --> M
```

#### **Infraestructura de Desarrollo:**
- **Local**: Docker Compose con PostgreSQL, Redis, MinIO y ChromaDB
- **Frontend**: Angular dev server en puerto 4200
- **Backend**: FastAPI con Uvicorn en puerto 8000
- **Base de Datos**: PostgreSQL local con migraciones automáticas

#### **Infraestructura de Producción:**
- **Backend**: Google Cloud Run con auto-scaling
- **Frontend**: Cloud Run con CDN global
- **Base de Datos**: Cloud SQL PostgreSQL con alta disponibilidad
- **Cache**: Memorystore Redis para sesiones
- **Vector DB**: Vertex AI Vector Search para almacenamiento de vectores
- **Embeddings**: Hugging Face para generación de embeddings
- **Storage**: Cloud Storage para archivos de documentos

#### **Proceso de Despliegue:**
1. **Push a main**: Trigger automático de GitHub Actions
2. **Build**: Construcción de imágenes Docker
3. **Security Scan**: Análisis de vulnerabilidades
4. **Tests**: Ejecución de tests unitarios e integración
5. **Deploy**: Despliegue automático a Google Cloud Platform
6. **Health Check**: Verificación de servicios desplegados

#### **Configuración de Entornos:**
- **Variables de entorno**: Separadas por entorno (dev/prod)
- **Secrets**: Gestionados por GitHub Secrets
- **Monitoring**: Cloud Logging y Cloud Monitoring
- **Backup**: Automático para base de datos y archivos

### **2.5. Seguridad**

#### **Autenticación y Autorización:**
- **JWT Tokens**: Autenticación basada en tokens con expiración configurable
- **Multi-tenencia**: Aislamiento estricto de datos por usuario/tenant
- **Google Sign-In**: Integración con OAuth 2.0 para autenticación social
- **Password Hashing**: Bcrypt para hash seguro de contraseñas

#### **Validación y Sanitización:**
- **Input Validation**: Pydantic para validación exhaustiva de datos de entrada
- **SQL Injection Prevention**: SQLAlchemy ORM con parámetros preparados
- **XSS Protection**: Sanitización de contenido HTML y JavaScript
- **File Upload Security**: Validación de tipos MIME y tamaño de archivos

#### **Comunicación Segura:**
- **HTTPS**: Comunicación encriptada en producción
- **CORS**: Configuración restrictiva de Cross-Origin Resource Sharing
- **Headers de Seguridad**: Security headers configurados

#### **Almacenamiento Seguro:**
- **Encriptación en Tránsito**: TLS 1.3 para todas las comunicaciones
- **Encriptación en Reposo**: Datos sensibles encriptados en base de datos
- **Secrets Management**: Variables de entorno para credenciales
- **Access Control**: Permisos granulares por recurso

#### **Monitoreo y Auditoría:**
- **Logging de Seguridad**: Registro de eventos de autenticación y autorización
- **Audit Trail**: Trazabilidad completa de acciones del usuario
- **Error Handling**: Manejo seguro de errores sin exposición de información sensible
- **Health Checks**: Monitoreo continuo de la salud del sistema

#### **Ejemplos de Implementación:**

**Validación de Entrada:**
```python
from pydantic import BaseModel, validator
from typing import Optional

class DocumentUpload(BaseModel):
    title: str
    description: Optional[str] = None
    category_id: Optional[int] = None
    
    @validator('title')
    def validate_title(cls, v):
        if len(v.strip()) < 3:
            raise ValueError('Title must be at least 3 characters')
        return v.strip()
```

**Autenticación JWT:**
```python
from jose import JWTError, jwt
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
```

### **2.6. Tests**

#### **Estrategia de Testing:**
- **Cobertura mínima**: 80% para código crítico, 90% para servicios de IA
- **Testing piramidal**: Unit tests, integration tests, e2e tests
- **Testing automatizado**: Integrado en CI/CD pipeline
- **Testing de regresión**: Prevención de bugs en nuevas funcionalidades

#### **Tipos de Tests Implementados:**

**1. Unit Tests (Frontend - Angular)**
```typescript
describe('DocumentService', () => {
  let service: DocumentService;
  let httpMock: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'put', 'delete']);
    TestBed.configureTestingModule({
      providers: [
        DocumentService,
        { provide: HttpClient, useValue: spy }
      ]
    });
    service = TestBed.inject(DocumentService);
    httpMock = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;
  });

  it('should upload document successfully', () => {
    const mockResponse = { id: '123', title: 'Test Document' };
    httpMock.post.and.returnValue(of(mockResponse));

    service.uploadDocument(mockFile).subscribe(response => {
      expect(response).toEqual(mockResponse);
      expect(httpMock.post).toHaveBeenCalledWith('/api/v1/documents/upload', expect.any(FormData));
    });
  });
});
```

**2. Unit Tests (Backend - FastAPI)**
```python
import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch

class TestDocumentAPI:
    def test_upload_document_success(self, client: TestClient, mock_document_service):
        """Test successful document upload."""
        # Arrange
        mock_response = {"id": "123", "title": "Test Document", "status": "processing"}
        mock_document_service.upload_document.return_value = mock_response
        
        # Act
        with open("test_document.pdf", "rb") as f:
            response = client.post(
                "/api/v1/documents/upload",
                files={"file": f},
                data={"title": "Test Document"}
            )
        
        # Assert
        assert response.status_code == 200
        assert response.json() == mock_response
        mock_document_service.upload_document.assert_called_once()
    
    def test_upload_document_invalid_file_type(self, client: TestClient):
        """Test upload with invalid file type."""
        # Act
        with open("test_file.txt", "rb") as f:
            response = client.post(
                "/api/v1/documents/upload",
                files={"file": f},
                data={"title": "Test Document"}
            )
        
        # Assert
        assert response.status_code == 400
        assert "Invalid file type" in response.json()["detail"]
```

**3. Integration Tests**
```python
class TestRAGPipeline:
    def test_end_to_end_rag_flow(self, client: TestClient, test_document):
        """Test complete RAG pipeline from document upload to chat response."""
        # Upload document
        upload_response = client.post("/api/v1/documents/upload", files={"file": test_document})
        assert upload_response.status_code == 200
        
        # Wait for processing
        time.sleep(2)
        
        # Chat with document
        chat_response = client.post(
            "/api/v1/chat/message",
            json={"message": "What is this document about?"}
        )
        
        assert chat_response.status_code == 200
        assert "response" in chat_response.json()
```

**4. E2E Tests (Cypress)**
```typescript
describe('Document Management E2E', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.login('test@example.com', 'password');
  });

  it('should upload and process document', () => {
    cy.visit('/documents');
    cy.get('[data-cy=upload-button]').click();
    cy.get('[data-cy=file-input]').selectFile('cypress/fixtures/test-document.pdf');
    cy.get('[data-cy=title-input]').type('Test Document');
    cy.get('[data-cy=submit-button]').click();
    
    cy.get('[data-cy=upload-progress]').should('be.visible');
    cy.get('[data-cy=upload-success]', { timeout: 10000 }).should('be.visible');
    cy.get('[data-cy=document-list]').should('contain', 'Test Document');
  });

  it('should chat with uploaded document', () => {
    cy.visit('/chat');
    cy.get('[data-cy=chat-input]').type('What documents do I have?');
    cy.get('[data-cy=send-button]').click();
    
    cy.get('[data-cy=chat-messages]').should('contain', 'Test Document');
  });
});
```

#### **Herramientas de Testing:**
- **Frontend**: Jasmine, Karma, Cypress
- **Backend**: pytest, FastAPI TestClient
- **Coverage**: Coverage.py, Istanbul
- **Mocking**: unittest.mock, jasmine.createSpy
- **CI/CD**: GitHub Actions con reporting automático

---

## 3. Modelo de Datos

### **3.1. Diagrama del modelo de datos:**

```mermaid
erDiagram
    TENANTS {
        uuid id PK
        string name
        string description
        boolean is_active
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }
    
    USERS {
        uuid id PK
        uuid tenant_id FK
        string email UK
        string full_name
        string hashed_password
        boolean is_active
        boolean is_admin
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }
    
    CATEGORIES {
        uuid id PK
        uuid tenant_id FK
        string name
        string description
        boolean is_active
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }
    
    DOCUMENTS {
        uuid id PK
        uuid tenant_id FK
        uuid user_id FK
        uuid category_id FK
        string title
        text description
        string file_name
        string file_path
        string mime_type
        bigint file_size
        jsonb metadata
        text content
        integer page_count
        jsonb ocr_failed_pages
        integer ocr_failed_pages_count
        integer ocr_total_pages
        boolean is_active
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }
    
    DOCUMENT_CHUNKS {
        uuid id PK
        uuid document_id FK
        text content
        jsonb chunk_metadata
        string page_range
        string section_type
        text embedding_vector
        float similarity_score
        integer content_length
        timestamp created_at
        timestamp updated_at
    }
    
    CHAT_HISTORY {
        uuid id PK
        uuid user_id FK
        string title
        string status
        timestamp created_at
        timestamp updated_at
    }
    
    CHAT_MESSAGES {
        uuid id PK
        uuid chat_history_id FK
        string message_type
        text content
        jsonb context_used
        timestamp created_at
    }
    
    AUDIT_LOGS {
        uuid id PK
        uuid tenant_id FK
        uuid user_id FK
        string action
        string resource_type
        uuid resource_id
        jsonb old_values
        jsonb new_values
        string ip_address
        string user_agent
        timestamp created_at
    }
    
    TENANTS ||--o{ USERS : "has"
    TENANTS ||--o{ CATEGORIES : "has"
    TENANTS ||--o{ DOCUMENTS : "has"
    TENANTS ||--o{ AUDIT_LOGS : "has"
    USERS ||--o{ DOCUMENTS : "creates"
    USERS ||--o{ CHAT_HISTORY : "creates"
    USERS ||--o{ AUDIT_LOGS : "performs"
    CATEGORIES ||--o{ DOCUMENTS : "categorizes"
    DOCUMENTS ||--o{ DOCUMENT_CHUNKS : "contains"
    CHAT_HISTORY ||--o{ CHAT_MESSAGES : "contains"
```


### **3.2. Descripción de entidades principales:**

#### **TENANTS (Inquilinos)**
- **Propósito**: Implementa multi-tenencia para aislar datos por organización
- **Clave Primaria**: `id` (UUID)
- **Atributos**:
  - `id`: UUID único del tenant
  - `name`: Nombre del tenant (NOT NULL, VARCHAR(255))
  - `description`: Descripción opcional del tenant (TEXT)
  - `is_active`: Estado activo/inactivo (BOOLEAN, DEFAULT true)
  - `created_at`, `updated_at`, `deleted_at`: Timestamps de auditoría
- **Relaciones**: 1:N con USERS, CATEGORIES, DOCUMENTS, AUDIT_LOGS

#### **USERS (Usuarios)**
- **Propósito**: Gestión de usuarios del sistema con autenticación
- **Clave Primaria**: `id` (UUID)
- **Clave Foránea**: `tenant_id` → TENANTS.id
- **Atributos**:
  - `id`: UUID único del usuario
  - `tenant_id`: Referencia al tenant (NOT NULL, FK)
  - `email`: Email único del usuario (NOT NULL, UNIQUE, VARCHAR(255))
  - `full_name`: Nombre completo (NOT NULL, VARCHAR(255))
  - `hashed_password`: Contraseña hasheada (NOT NULL, VARCHAR(255))
  - `is_active`: Estado activo/inactivo (BOOLEAN, DEFAULT true)
  - `is_admin`: Rol de administrador (BOOLEAN, DEFAULT false)
  - Timestamps de auditoría
- **Restricciones**: Email único por tenant, contraseña obligatoria

#### **CATEGORIES (Categorías)**
- **Propósito**: Organización de documentos por categorías
- **Clave Primaria**: `id` (UUID)
- **Clave Foránea**: `tenant_id` → TENANTS.id
- **Atributos**:
  - `id`: UUID único de la categoría
  - `tenant_id`: Referencia al tenant (NOT NULL, FK)
  - `name`: Nombre de la categoría (NOT NULL, VARCHAR(255))
  - `description`: Descripción opcional (TEXT)
  - `is_active`: Estado activo/inactivo (BOOLEAN, DEFAULT true)
  - Timestamps de auditoría
- **Restricciones**: Nombre único por tenant

#### **DOCUMENTS (Documentos)**
- **Propósito**: Almacenamiento de documentos y metadatos
- **Clave Primaria**: `id` (UUID)
- **Claves Foráneas**: 
  - `tenant_id` → TENANTS.id
  - `user_id` → USERS.id
  - `category_id` → CATEGORIES.id (opcional)
- **Atributos**:
  - `id`: UUID único del documento
  - `tenant_id`: Referencia al tenant (NOT NULL, FK)
  - `user_id`: Usuario que subió el documento (NOT NULL, FK)
  - `category_id`: Categoría del documento (NULLABLE, FK)
  - `title`: Título del documento (NOT NULL, VARCHAR(255))
  - `description`: Descripción opcional (TEXT)
  - `file_name`: Nombre original del archivo (NOT NULL, VARCHAR(255))
  - `file_path`: Ruta de almacenamiento (NOT NULL, VARCHAR(500))
  - `mime_type`: Tipo MIME del archivo (NOT NULL, VARCHAR(100))
  - `file_size`: Tamaño en bytes (NOT NULL, BIGINT)
  - `metadata`: Metadatos adicionales (JSONB)
  - `content`: Contenido extraído del documento (TEXT)
  - `page_count`: Número de páginas (INTEGER)
  - `ocr_failed_pages`: Páginas que fallaron en OCR (JSONB)
  - `ocr_failed_pages_count`: Conteo de páginas fallidas (INTEGER)
  - `ocr_total_pages`: Total de páginas procesadas (INTEGER)
  - `is_active`: Estado activo/inactivo (BOOLEAN, DEFAULT true)
  - Timestamps de auditoría
- **Restricciones**: Título único por tenant, archivo obligatorio

#### **DOCUMENT_CHUNKS (Chunks de Documentos)**
- **Propósito**: Almacenamiento de chunks individuales para búsqueda vectorial
- **Clave Primaria**: `id` (UUID)
- **Clave Foránea**: `document_id` → DOCUMENTS.id
- **Atributos**:
  - `id`: UUID único del chunk
  - `document_id`: Referencia al documento (NOT NULL, FK)
  - `content`: Contenido textual del chunk (NOT NULL, TEXT)
  - `chunk_metadata`: Metadatos enriquecidos (JSONB)
  - `page_range`: Rango de páginas (VARCHAR(50))
  - `section_type`: Tipo de sección (VARCHAR(100))
  - `embedding_vector`: Vector de embedding (TEXT)
  - `similarity_score`: Puntuación de similitud (FLOAT)
  - `content_length`: Longitud del contenido (INTEGER)
  - Timestamps de auditoría
- **Restricciones**: Contenido obligatorio, documento válido

#### **CHAT_HISTORY (Historial de Chat)**
- **Propósito**: Gestión de conversaciones con IA
- **Clave Primaria**: `id` (UUID)
- **Clave Foránea**: `user_id` → USERS.id
- **Atributos**:
  - `id`: UUID único de la conversación
  - `user_id`: Usuario propietario (NOT NULL, FK)
  - `title`: Título de la conversación (NOT NULL, VARCHAR(255))
  - `status`: Estado de la conversación (VARCHAR(50), DEFAULT 'active')
  - Timestamps de auditoría
- **Restricciones**: Título obligatorio, usuario válido

#### **CHAT_MESSAGES (Mensajes de Chat)**
- **Propósito**: Almacenamiento de mensajes individuales
- **Clave Primaria**: `id` (UUID)
- **Clave Foránea**: `chat_history_id` → CHAT_HISTORY.id
- **Atributos**:
  - `id`: UUID único del mensaje
  - `chat_history_id`: Referencia a la conversación (NOT NULL, FK)
  - `message_type`: Tipo de mensaje ('user' o 'assistant') (NOT NULL, VARCHAR(20))
  - `content`: Contenido del mensaje (NOT NULL, TEXT)
  - `context_used`: Contexto utilizado para la respuesta (JSONB)
  - `created_at`: Timestamp de creación
- **Restricciones**: Contenido obligatorio, tipo válido

#### **AUDIT_LOGS (Logs de Auditoría)**
- **Propósito**: Trazabilidad completa de acciones del sistema
- **Clave Primaria**: `id` (UUID)
- **Claves Foráneas**: 
  - `tenant_id` → TENANTS.id
  - `user_id` → USERS.id
- **Atributos**:
  - `id`: UUID único del log
  - `tenant_id`: Referencia al tenant (NOT NULL, FK)
  - `user_id`: Usuario que realizó la acción (NOT NULL, FK)
  - `action`: Tipo de acción (NOT NULL, VARCHAR(100))
  - `resource_type`: Tipo de recurso afectado (NOT NULL, VARCHAR(100))
  - `resource_id`: ID del recurso afectado (UUID)
  - `old_values`: Valores anteriores (JSONB)
  - `new_values`: Valores nuevos (JSONB)
  - `ip_address`: Dirección IP del usuario (VARCHAR(45))
  - `user_agent`: User agent del navegador (TEXT)
  - `created_at`: Timestamp de la acción
- **Restricciones**: Acción y recurso obligatorios

#### **Relaciones Principales:**
- **TENANTS** → **USERS**: 1:N (Un tenant tiene muchos usuarios)
- **TENANTS** → **CATEGORIES**: 1:N (Un tenant tiene muchas categorías)
- **TENANTS** → **DOCUMENTS**: 1:N (Un tenant tiene muchos documentos)
- **USERS** → **DOCUMENTS**: 1:N (Un usuario crea muchos documentos)
- **CATEGORIES** → **DOCUMENTS**: 1:N (Una categoría contiene muchos documentos)
- **DOCUMENTS** → **DOCUMENT_CHUNKS**: 1:N (Un documento tiene muchos chunks)
- **USERS** → **CHAT_HISTORY**: 1:N (Un usuario tiene muchas conversaciones)
- **CHAT_HISTORY** → **CHAT_MESSAGES**: 1:N (Una conversación tiene muchos mensajes)

---

## 4. Especificación de la API

### **4.1. Endpoints de Autenticación**

#### `POST /api/v1/auth/login`
**Descripción**: Autentica un usuario y retorna token de acceso

**Headers Requeridos**:
```
Content-Type: application/json
```

**Body de la Petición**:
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña_segura"
}
```

**Respuesta Exitosa (200)**:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "expires_in": 1800,
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "usuario@ejemplo.com",
    "full_name": "Usuario Ejemplo"
  }
}
```

#### `POST /api/v1/auth/register`
**Descripción**: Registra un nuevo usuario en el sistema

**Body de la Petición**:
```json
{
  "email": "nuevo@ejemplo.com",
  "password": "contraseña_segura",
  "full_name": "Usuario Nuevo"
}
```

----

### **4.2. Endpoints de Categorías**

#### `GET /api/v1/categories/`
**Descripción**: Obtiene la lista de categorías del usuario

**Headers Requeridos**:
```
Authorization: Bearer <JWT_TOKEN>
```

**Parámetros de Query**:
- `page`: Número de página (mínimo 1) - OPCIONAL, default: 1
- `limit`: Elementos por página (1-100) - OPCIONAL, default: 20
- `search`: Término de búsqueda - OPCIONAL
- `include_inactive`: Incluir categorías inactivas - OPCIONAL, default: false

**Respuesta Exitosa (200)**:
```json
{
  "categories": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Contratos",
      "description": "Documentos contractuales",
      "type": "document",
      "color": "#3B82F6",
      "document_count": 15,
      "is_active": true,
      "created_at": "2024-12-19T10:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20,
  "pages": 1
}
```

#### `POST /api/v1/categories/`
**Descripción**: Crea una nueva categoría

**Headers Requeridos**:
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Body de la Petición**:
```json
{
  "name": "Contratos",
  "description": "Documentos contractuales",
  "type": "document",
  "color": "#3B82F6",
  "icon": "file-contract"
}
```

----

### **4.3. Endpoint de Subida de Documentos**

#### `POST /api/v1/documents/`
**Descripción**: Sube un documento al sistema para procesamiento y vectorización

**Headers Requeridos**:
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: multipart/form-data
```

**Parámetros**:
- `file`: Archivo a subir (PDF, imagen, texto) - REQUERIDO
- `title`: Título del documento - REQUERIDO
- `description`: Descripción opcional - OPCIONAL
- `category_id`: ID de categoría - OPCIONAL

**Ejemplo de Petición**:
```bash
curl -X POST "https://api.insai.com/api/v1/documents/upload" \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..." \
  -F "file=@documento.pdf" \
  -F "title=Contrato de Servicios" \
  -F "description=Contrato de servicios profesionales" \
  -F "category_id=123e4567-e89b-12d3-a456-426614174000"
```

**Respuesta Exitosa (200)**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Contrato de Servicios",
  "status": "processing",
  "message": "Documento subido exitosamente",
  "file_size": 1048576,
  "mime_type": "application/pdf",
  "created_at": "2024-12-19T10:00:00Z"
}
```

**Respuesta de Error (400)**:
```json
{
  "detail": "Archivo demasiado grande. Tamaño máximo: 100MB"
}
```

---

### **4.4. Endpoint de Chat con IA**

#### `POST /api/v1/conversations/chat`
**Descripción**: Envía un mensaje al chat IA y recibe respuesta basada en documentos del usuario

**Headers Requeridos**:
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Body**:
```json
{
  "message": "¿Cuáles son los términos principales del contrato?",
  "category_filter": "123e4567-e89b-12d3-a456-426614174000",
  "conversation_id": "123e4567-e89b-12d3-a456-426614174000"
}
```

**Ejemplo de Petición**:
```bash
curl -X POST "https://api.insai.com/api/v1/chat/message" \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "message": "¿Cuáles son los términos principales del contrato?",
    "category_filter": "123e4567-e89b-12d3-a456-426614174000"
  }'
```

**Respuesta Exitosa (200)**:
```json
{
  "response": "Basándome en los documentos de contratos que tienes, los términos principales incluyen:\n\n1. **Duración del contrato**: 12 meses con renovación automática\n2. **Pago**: $5,000 mensuales pagaderos el día 15 de cada mes\n3. **Terminación**: Cualquiera de las partes puede terminar con 30 días de aviso\n4. **Confidencialidad**: Cláusula de no divulgación por 2 años\n\n¿Te gustaría que profundice en algún término específico?",
  "sources": [
    {
      "document_id": "123e4567-e89b-12d3-a456-426614174000",
      "title": "Contrato de Servicios",
      "relevance_score": 0.95,
      "page_reference": "Página 2, Sección 3"
    }
  ],
  "conversation_id": "123e4567-e89b-12d3-a456-426614174000",
  "timestamp": "2024-12-19T10:00:00Z"
}
```

**Respuesta de Error (404)**:
```json
{
  "detail": "No se encontraron documentos relevantes para responder tu pregunta"
}
```

---

### **4.5. Endpoint de Búsqueda Vectorial**

#### `GET /api/v1/documents/search/vector`
**Descripción**: Realiza búsqueda semántica en documentos del usuario

**Headers Requeridos**:
```
Authorization: Bearer <JWT_TOKEN>
```

**Parámetros de Query**:
- `query`: Consulta de búsqueda - REQUERIDO
- `category_id`: Filtrar por categoría - OPCIONAL
- `limit`: Número máximo de resultados (default: 10) - OPCIONAL
- `threshold`: Umbral de similitud (default: 0.7) - OPCIONAL

**Ejemplo de Petición**:
```bash
curl -X GET "https://api.insai.com/api/v1/documents/search/vector?query=cláusulas de terminación&category_id=123e4567-e89b-12d3-a456-426614174000&limit=5" \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

**Respuesta Exitosa (200)**:
```json
{
  "results": [
    {
      "document_id": "123e4567-e89b-12d3-a456-426614174000",
      "title": "Contrato de Servicios",
      "content": "Cláusula de terminación: Cualquiera de las partes puede terminar este contrato con 30 días de aviso previo por escrito...",
      "similarity_score": 0.92,
      "page_reference": "Página 3, Sección 5",
      "category": "Contratos",
      "created_at": "2024-12-19T10:00:00Z"
    },
    {
      "document_id": "456e7890-e89b-12d3-a456-426614174000",
      "title": "Acuerdo de Confidencialidad",
      "content": "Términos de terminación: Este acuerdo permanecerá vigente hasta que sea terminado por mutuo acuerdo...",
      "similarity_score": 0.87,
      "page_reference": "Página 1, Sección 2",
      "category": "Acuerdos",
      "created_at": "2024-12-18T15:30:00Z"
    }
  ],
  "total_results": 2,
  "query": "cláusulas de terminación",
  "search_time_ms": 150
}
```

**Respuesta de Error (400)**:
```json
{
  "detail": "Query de búsqueda es requerida"
}
```

---

### **4.6. Endpoints de Dashboard/Estadísticas**

#### `GET /api/v1/documents/stats/summary`
**Descripción**: Obtiene estadísticas de documentos del usuario

**Headers Requeridos**:
```
Authorization: Bearer <JWT_TOKEN>
```

**Respuesta Exitosa (200)**:
```json
{
  "total_documents": 25,
  "total_size_mb": 150.5,
  "documents_by_type": {
    "pdf": 20,
    "docx": 3,
    "txt": 2
  },
  "recent_uploads": 5,
  "processing_status": {
    "completed": 23,
    "processing": 2,
    "failed": 0
  }
}
```

#### `GET /api/v1/categories/stats/summary`
**Descripción**: Obtiene estadísticas de categorías

**Headers Requeridos**:
```
Authorization: Bearer <JWT_TOKEN>
```

**Respuesta Exitosa (200)**:
```json
{
  "total_categories": 8,
  "active_categories": 7,
  "categories_by_type": {
    "document": 5,
    "image": 2,
    "mixed": 1
  },
  "most_used_category": "Contratos"
}
```

#### `GET /api/v1/conversations/stats/summary`
**Descripción**: Obtiene estadísticas de conversaciones

**Headers Requeridos**:
```
Authorization: Bearer <JWT_TOKEN>
```

**Respuesta Exitosa (200)**:
```json
{
  "total_conversations": 12,
  "total_messages": 156,
  "average_messages_per_conversation": 13,
  "most_active_conversation": "Análisis de Contratos",
  "recent_activity": "2024-12-19T10:00:00Z"
}
```

----

### **4.7. Códigos de Estado HTTP**

| Código | Descripción | Uso |
|--------|-------------|-----|
| 200 | OK | Operación exitosa |
| 201 | Created | Recurso creado exitosamente |
| 400 | Bad Request | Datos de entrada inválidos |
| 401 | Unauthorized | Token JWT inválido o expirado |
| 403 | Forbidden | Sin permisos para acceder al recurso |
| 404 | Not Found | Recurso no encontrado |
| 413 | Payload Too Large | Archivo demasiado grande |
| 422 | Unprocessable Entity | Error de validación |
| 500 | Internal Server Error | Error interno del servidor |

### **4.8. Autenticación**

Todos los endpoints requieren autenticación JWT:
```
Authorization: Bearer <JWT_TOKEN>
```

**Obtención del Token**:
```bash
curl -X POST "https://api.insai.com/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@ejemplo.com",
    "password": "contraseña123"
  }'
```

**Respuesta**:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "expires_in": 86400,
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "usuario@ejemplo.com",
    "full_name": "Usuario Ejemplo",
    "tenant_id": "123e4567-e89b-12d3-a456-426614174000"
  }
}
```

---

## 5. Historias de Usuario

### **Historia de Usuario 1: Subida y Procesamiento de Documentos**

**Como** un usuario de InsAI  
**Quiero** poder subir documentos PDF e imágenes a mi base de conocimiento  
**Para** que la IA pueda analizarlos y responder preguntas sobre su contenido

#### **Criterios de Aceptación:**
- [ ] Puedo subir archivos PDF, PNG, JPG y JPEG hasta 100MB
- [ ] El sistema extrae automáticamente el texto usando OCR
- [ ] Recibo confirmación visual del progreso de procesamiento
- [ ] Los documentos se organizan por categorías que puedo crear
- [ ] El sistema me notifica si alguna página falló en el OCR
- [ ] Puedo ver el contenido extraído antes de confirmar la subida

#### **Escenario de Uso:**
1. Usuario accede a la sección "Documentos"
2. Hace clic en "Agregar Documento"
3. Selecciona un archivo PDF de contrato
4. Completa título y descripción
5. Selecciona categoría "Contratos" o crea una nueva
6. Confirma la subida
7. Observa el progreso de procesamiento en tiempo real
8. Recibe confirmación de subida exitosa

#### **Definición de Terminado:**
- Documento subido y procesado correctamente
- Texto extraído y almacenado en base de datos
- Chunks creados para búsqueda vectorial
- Usuario puede ver el documento en su lista

---

### **Historia de Usuario 2: Chat Inteligente con Documentos**

**Como** un usuario de InsAI  
**Quiero** poder hacer preguntas en lenguaje natural sobre mis documentos  
**Para** obtener respuestas precisas y contextualizadas sin tener que buscar manualmente

#### **Criterios de Aceptación:**
- [ ] Puedo escribir preguntas en lenguaje natural
- [ ] La IA responde basándose únicamente en mis documentos
- [ ] Las respuestas incluyen referencias a documentos específicos
- [ ] Puedo filtrar búsquedas por categorías
- [ ] El chat mantiene contexto de conversaciones previas
- [ ] Las respuestas se generan en tiempo real (streaming)

#### **Escenario de Uso:**
1. Usuario accede a la sección "Chat IA"
2. Escribe: "¿Cuáles son los términos de pago en mis contratos?"
3. Selecciona categoría "Contratos" como filtro
4. La IA busca en documentos relevantes
5. Genera respuesta con términos específicos encontrados
6. Incluye referencias a documentos y páginas específicas
7. Usuario puede hacer preguntas de seguimiento

#### **Definición de Terminado:**
- Pregunta procesada correctamente
- Respuesta generada basada en documentos del usuario
- Referencias a fuentes incluidas
- Conversación guardada en historial

---

### **Historia de Usuario 3: Búsqueda Semántica Avanzada**

**Como** un usuario de InsAI  
**Quiero** poder buscar información específica en mis documentos usando búsqueda semántica  
**Para** encontrar contenido relevante incluso si no uso las palabras exactas del documento

#### **Criterios de Aceptación:**
- [ ] Puedo buscar por conceptos, no solo palabras exactas
- [ ] Los resultados se ordenan por relevancia semántica
- [ ] Puedo filtrar búsquedas por categorías y fechas
- [ ] Veo fragmentos del documento con la información relevante
- [ ] Puedo acceder directamente al documento completo
- [ ] La búsqueda funciona en múltiples idiomas

#### **Escenario de Uso:**
1. Usuario accede a la búsqueda avanzada
2. Escribe: "cláusulas de terminación de contrato"
3. Selecciona categoría "Contratos" y rango de fechas
4. El sistema busca semánticamente en todos los documentos
5. Muestra resultados ordenados por relevancia
6. Cada resultado incluye fragmento relevante y referencia
7. Usuario puede hacer clic para ver documento completo

#### **Definición de Terminado:**
- Búsqueda semántica ejecutada correctamente
- Resultados relevantes encontrados y ordenados
- Fragmentos de contenido mostrados
- Enlaces a documentos completos funcionando

---

### **Criterios de Calidad de Historias de Usuario:**

#### **INVEST (Independent, Negotiable, Valuable, Estimable, Small, Testable):**
- **Independent**: Cada historia puede desarrollarse independientemente
- **Negotiable**: Detalles negociables entre stakeholders
- **Valuable**: Cada historia aporta valor al usuario final
- **Estimable**: Tamaño estimable para planificación de sprints
- **Small**: Tamaño apropiado para completar en un sprint
- **Testable**: Criterios de aceptación claros y testeables

#### **Definición de Ready (Listo para Desarrollo):**
- [ ] Criterios de aceptación definidos
- [ ] Escenarios de uso documentados
- [ ] Definición de terminado clara
- [ ] Dependencias identificadas
- [ ] Estimación de esfuerzo realizada
- [ ] Criterios de testing definidos

---

## 6. Tickets de Trabajo

### **Ticket 1: Backend - Implementación del Sistema de Chunking Inteligente**

**Título**: Implementar sistema de chunking inteligente para documentos grandes  
**Tipo**: Backend  
**Prioridad**: Alta  
**Estimación**: 8 story points  
**Sprint**: Sprint 3  

#### **Descripción:**
Implementar un sistema de chunking inteligente que divida documentos grandes en chunks semánticos individuales para mejorar la búsqueda vectorial y preservar el contexto completo de documentos extensos.

#### **Contexto del Problema:**
- El sistema actual crea un solo embedding por documento completo
- Documentos grandes (100+ páginas) pierden contexto granular
- Respuestas incompletas debido a limitaciones de contexto
- Necesidad de preservar información específica por secciones

#### **Requisitos Técnicos:**

**1. Crear Modelo de Base de Datos:**
```python
# backend/app/models/document_chunk.py
class DocumentChunk(Base):
    __tablename__ = "document_chunks"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"), nullable=False)
    content = Column(Text, nullable=False)
    chunk_metadata = Column(JSONB, nullable=True)
    page_range = Column(String(50), nullable=True)
    section_type = Column(String(100), nullable=True)
    embedding_vector = Column(Text, nullable=True)
    similarity_score = Column(Float, nullable=True)
    content_length = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

**2. Implementar Servicio de Chunking:**
```python
# backend/app/services/document_chunking_service.py
class DocumentChunkingService:
    def create_smart_chunks(self, document: Document) -> List[DocumentChunk]:
        """
        Crea chunks inteligentes dividiendo por secciones semánticas
        """
        # División por títulos y subtítulos
        # División por párrafos coherentes
        # Preservación de contexto y metadatos
        # Vectorización individual de cada chunk
```

#### **Criterios de Aceptación:**
- [ ] Tabla `document_chunks` creada con todos los campos requeridos
- [ ] Servicio de chunking divide documentos por secciones semánticas
- [ ] Cada chunk se vectoriza individualmente
- [ ] Metadatos enriquecidos incluyen página, tipo de sección y contexto
- [ ] Integración con pipeline RAG existente
- [ ] Tests unitarios con cobertura > 80%

#### **Tareas de Desarrollo:**
1. **Diseño de Base de Datos** (2 puntos)
   - Crear modelo DocumentChunk
   - Definir relaciones con Document
   - Crear migración Alembic

2. **Servicio de Chunking** (4 puntos)
   - Implementar división por secciones
   - Lógica de preservación de contexto
   - Metadatos enriquecidos

3. **Integración RAG** (2 puntos)
   - Modificar RAGService para usar chunks
   - Actualizar búsqueda vectorial
   - Testing de integración

#### **Definición de Terminado:**
- [ ] Código implementado y revisado
- [ ] Tests unitarios pasando
- [ ] Migración aplicada correctamente
- [ ] Documentación actualizada
- [ ] Performance validada con documentos grandes

---

### **Ticket 2: Frontend - Modal de Subida de Documentos Responsive**

**Título**: Crear modal de subida de documentos responsive para móviles  
**Tipo**: Frontend  
**Prioridad**: Media  
**Estimación**: 5 story points  
**Sprint**: Sprint 2  

#### **Descripción:**
Desarrollar un modal de subida de documentos que funcione correctamente en dispositivos móviles y tablets, con diseño responsive y experiencia de usuario optimizada.

#### **Contexto del Problema:**
- Modal actual no se adapta a pantallas pequeñas
- Botones de acción inaccesibles sin scroll
- Distorsión vertical en dispositivos móviles
- Necesidad de mejorar accesibilidad

#### **Criterios de Aceptación:**
- [ ] Modal se adapta correctamente a pantallas móviles (320px+)
- [ ] Botones de acción siempre visibles y accesibles
- [ ] Drag & drop funciona en dispositivos táctiles
- [ ] Progreso de subida visible y comprensible
- [ ] Validación de archivos con mensajes claros
- [ ] Accesibilidad WCAG 2.1 nivel AA

#### **Tareas de Desarrollo:**
1. **Diseño Responsive** (2 puntos)
   - Estructura HTML flexible
   - CSS responsive con breakpoints
   - Testing en diferentes dispositivos

2. **Funcionalidad de Subida** (2 puntos)
   - Drag & drop implementado
   - Validación de archivos
   - Progreso en tiempo real

3. **UX/UI Mejoras** (1 punto)
   - Animaciones suaves
   - Estados de carga
   - Mensajes de error claros

#### **Definición de Terminado:**
- [ ] Modal funciona en móviles, tablets y desktop
- [ ] Tests E2E pasando en diferentes dispositivos
- [ ] Código revisado y aprobado
- [ ] Documentación de componentes actualizada

---

### **Ticket 3: Backend - Implementación de Búsqueda Semántica Avanzada**

**Título**: Implementar sistema de búsqueda semántica con embeddings y re-ranking  
**Tipo**: Backend  
**Prioridad**: Alta  
**Estimación**: 8 story points  
**Sprint**: Sprint 1  

#### **Descripción:**
Implementar un sistema completo de búsqueda semántica que permita encontrar documentos relevantes usando embeddings vectoriales y técnicas de re-ranking para mejorar la precisión de los resultados.

#### **Contexto del Problema:**
- Los usuarios necesitan encontrar información específica en documentos largos
- La búsqueda por palabras clave no es suficiente para contenido semántico
- Necesidad de búsqueda inteligente que entienda el contexto
- Requisito de resultados ordenados por relevancia semántica

#### **Requisitos Técnicos:**

**1. Servicio de Embeddings:**
```python
# backend/app/services/embedding_service.py
class EmbeddingService:
    def __init__(self):
        self.huggingface_client = HuggingFaceClient()
        self.vertex_ai_client = VertexAIClient()
    
    async def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Genera embeddings para una lista de textos"""
        # Implementación con Hugging Face y Vertex AI
        pass
    
    async def search_similar(self, query_embedding: List[float], 
                           limit: int = 10) -> List[Dict]:
        """Busca documentos similares usando embeddings"""
        pass
```

**2. Servicio de Re-ranking:**
```python
# backend/app/services/reranking_service.py
class RerankingService:
    def __init__(self):
        self.cohere_client = CohereClient()
    
    async def rerank_results(self, query: str, 
                           documents: List[Dict]) -> List[Dict]:
        """Re-ordena resultados por relevancia semántica"""
        # Implementación con Cohere Rerank
        pass
```

**3. Endpoint de Búsqueda Vectorial:**
```python
# backend/app/api/v1/documents.py
@router.get("/search/vector")
async def search_documents_vector(
    query: str = Query(..., min_length=1),
    limit: int = Query(10, ge=1, le=50),
    file_type: Optional[str] = Query(None),
    categories: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Búsqueda semántica en documentos vectorizados"""
    # Implementación del endpoint
    pass
```

#### **Criterios de Aceptación:**
- [ ] Servicio de embeddings implementado con Hugging Face y Vertex AI
- [ ] Servicio de re-ranking con Cohere integrado
- [ ] Endpoint de búsqueda vectorial funcionando
- [ ] Índices vectoriales optimizados en base de datos
- [ ] Búsqueda por similitud semántica implementada
- [ ] Re-ranking de resultados por relevancia

#### **Tareas de Desarrollo:**
1. **Servicios de IA** (3 puntos)
   - Implementar EmbeddingService
   - Integrar Hugging Face y Vertex AI
   - Crear RerankingService con Cohere

2. **Base de Datos Vectorial** (2 puntos)
   - Configurar Vertex AI Vector Search
   - Implementar índices vectoriales
   - Crear migraciones de base de datos

3. **API y Lógica de Negocio** (3 puntos)
   - Endpoint de búsqueda vectorial
   - Lógica de filtrado por categorías
   - Integración con servicios de IA

#### **Definición de Terminado:**
- [ ] Búsqueda semántica funcionando correctamente
- [ ] Re-ranking mejora la precisión de resultados
- [ ] Tests de integración con servicios de IA
- [ ] Performance validada con consultas complejas
- [ ] Documentación de API actualizada

---

## 7. Pull Requests

### **Pull Request 1: Implementación del Sistema de Chunking Inteligente**

**Título**: feat: Implementar sistema de chunking inteligente para documentos grandes  
**Número**: #45  
**Rama**: `feature/document-chunking` → `development`  
**Fecha**: 2024-12-19  
**Autor**: [Tu nombre]  
**Revisores**: [Revisor 1], [Revisor 2]  

#### **Descripción:**
Implementa un sistema de chunking inteligente que divide documentos grandes en chunks semánticos individuales para mejorar la búsqueda vectorial y preservar el contexto completo de documentos extensos.

#### **Cambios Principales:**
- ✅ Nueva tabla `document_chunks` con metadatos enriquecidos
- ✅ Servicio `DocumentChunkingService` para división semántica
- ✅ Integración con pipeline RAG existente
- ✅ Migración de base de datos con Alembic
- ✅ Tests unitarios con cobertura > 80%

#### **Archivos Modificados:**
```
backend/app/models/document_chunk.py (nuevo)
backend/app/services/document_chunking_service.py (nuevo)
backend/app/services/rag_service.py (modificado)
backend/alembic/versions/002_add_document_chunks_table.py (nuevo)
backend/tests/test_document_chunking.py (nuevo)
```

#### **Código Destacado:**
```python
class DocumentChunkingService:
    def create_smart_chunks(self, document: Document) -> List[DocumentChunk]:
        """Crea chunks inteligentes dividiendo por secciones semánticas"""
        chunks = []
        
        # División por títulos y subtítulos
        sections = self._split_by_sections(document.content)
        
        for section in sections:
            chunk = DocumentChunk(
                document_id=document.id,
                content=section['content'],
                chunk_metadata={
                    'page_range': section['page_range'],
                    'section_type': section['type'],
                    'context': section['context']
                },
                page_range=section['page_range'],
                section_type=section['type']
            )
            chunks.append(chunk)
        
        return chunks
```

#### **Testing:**
- [x] Tests unitarios para `DocumentChunkingService`
- [x] Tests de integración con RAG pipeline
- [x] Tests de migración de base de datos
- [x] Cobertura de código > 80%

#### **Impacto:**
- **Performance**: Mejora significativa en búsqueda de documentos grandes
- **Precisión**: Respuestas más precisas con contexto granular
- **Escalabilidad**: Sistema preparado para documentos de cualquier tamaño

---

### **Pull Request 2: Modal de Subida Responsive para Móviles**

**Título**: feat: Crear modal de subida de documentos responsive para móviles  
**Número**: #38  
**Rama**: `feature/responsive-upload-modal` → `development`  
**Fecha**: 2024-12-18  
**Autor**: [Tu nombre]  
**Revisores**: [Revisor 1], [Revisor 2]  

#### **Descripción:**
Desarrolla un modal de subida de documentos que funcione correctamente en dispositivos móviles y tablets, con diseño responsive y experiencia de usuario optimizada.

#### **Cambios Principales:**
- ✅ Modal responsive con breakpoints móviles
- ✅ Drag & drop funcional en dispositivos táctiles
- ✅ Progreso de subida en tiempo real
- ✅ Validación de archivos con mensajes claros
- ✅ Accesibilidad WCAG 2.1 nivel AA

#### **Archivos Modificados:**
```
frontend/insai-app/src/app/features/documents/upload-modal/
├── upload-modal.component.html (modificado)
├── upload-modal.component.scss (modificado)
├── upload-modal.component.ts (modificado)
└── upload-modal.component.spec.ts (modificado)
```

#### **Código Destacado:**
```scss
.upload-modal-container {
  .modal-content {
    width: 90%;
    max-width: 500px;
    max-height: 80vh;
    overflow-y: auto;
    
    @media (max-width: 768px) {
      width: 95%;
      max-height: 90vh;
      margin: 10px;
    }
  }
  
  .modal-footer {
    @media (max-width: 768px) {
      flex-direction: column;
      
      button {
        width: 100%;
        margin-bottom: 10px;
      }
    }
  }
}
```

#### **Testing:**
- [x] Tests unitarios para componente
- [x] Tests E2E en diferentes dispositivos
- [x] Tests de accesibilidad
- [x] Validación de responsive design

#### **Impacto:**
- **UX**: Mejor experiencia en dispositivos móviles
- **Accesibilidad**: Cumplimiento WCAG 2.1
- **Usabilidad**: Interfaz más intuitiva y accesible

---

### **Pull Request 3: Sistema de Auditoría Completo**

**Título**: feat: Implementar sistema completo de auditoría con logs de acciones  
**Número**: #32  
**Rama**: `feature/audit-system` → `development`  
**Fecha**: 2024-12-17  
**Autor**: [Tu nombre]  
**Revisores**: [Revisor 1], [Revisor 2]  

#### **Descripción:**
Crea un sistema completo de auditoría que registre todas las acciones importantes del sistema para cumplir con requisitos de compliance y trazabilidad.

#### **Cambios Principales:**
- ✅ Tabla `audit_logs` con campos completos
- ✅ Triggers automáticos para tablas principales
- ✅ Servicio `AuditService` para gestión de logs
- ✅ Middleware de auditoría para requests HTTP
- ✅ Índices optimizados para performance

#### **Archivos Modificados:**
```
backend/app/models/audit_log.py (nuevo)
backend/app/services/audit_service.py (nuevo)
backend/app/middleware/audit_middleware.py (nuevo)
backend/alembic/versions/003_create_audit_system.sql (nuevo)
database/migrations/003_create_audit_system.sql (nuevo)
```

---

## 8. Resumen del Proceso de Desarrollo

> **Nota**: Los logs de prompts no se guardaron desde el inicio del proyecto, pero se presenta aquí un resumen del trabajo realizado en cada sección basado en el historial de conversaciones y el archivo de progreso del proyecto.

### **8.1. Resumen de la Ficha del Proyecto**

**Trabajo Realizado:**
- **Información personal**: Actualizada con el nombre "Lucas Rivas"
- **URL de despliegue**: Corregida a la URL real de Cloud Run `https://insai-frontend-689617092291.us-east1.run.app`
- **Descripción del proyecto**: Basada en la documentación real del memory-bank, describiendo InsAI como una plataforma SaaS de IA para gestión de documentos
- **URL del repositorio**: Verificada y actualizada

**Desafíos Encontrados:**
- Inicialmente se usó información genérica que necesitó ser personalizada
- La URL de despliegue original (Firebase Hosting) no coincidía con la implementación real (Cloud Run)

### **8.2. Resumen de la Descripción General del Producto**

**Trabajo Realizado:**
- **Objetivo**: Definido basándose en la visión real del proyecto InsAI
- **Funcionalidades principales**: Actualizadas para reflejar las capacidades reales implementadas:
  - Gestión de categorías (no solo documentos)
  - Chat interactivo con historial completo y análisis de contexto
  - Pipeline RAG avanzado con chunking inteligente
- **Diseño UX**: Descrito basándose en la implementación real con Angular y Tailwind CSS
- **Instrucciones de instalación**: Detalladas para el stack tecnológico real

**Desafíos Encontrados:**
- Las funcionalidades iniciales no reflejaban las capacidades reales del sistema
- Se necesitó corregir la descripción del chat para incluir memoria conversacional en lugar de funcionalidades no implementadas

### **8.3. Resumen de la Arquitectura del Sistema**

**Trabajo Realizado:**
- **Diagramas Mermaid**: Creados para mostrar la arquitectura real del sistema
- **Patrones de arquitectura**: Corregidos para reflejar los patrones reales implementados:
  - SOLID, DDD, Factory Pattern, Strategy Pattern
  - FastAPI, Service Layer Pattern, Dependency Injection
- **Infraestructura**: Actualizada para incluir todos los servicios reales:
  - Google Cloud SQL, Cloud Storage, Vertex AI Vector Search
  - Hugging Face para embeddings
  - Cloud Run para frontend y backend
- **Seguridad**: Documentada basándose en la implementación real con JWT, CORS, validación Pydantic

**Desafíos Encontrados:**
- Inicialmente se describían patrones arquitectónicos incorrectos (Hexagonal Architecture, CQRS)
- La infraestructura no incluía todos los servicios reales utilizados
- Los diagramas necesitaron múltiples correcciones para reflejar la arquitectura real

### **8.4. Resumen del Modelo de Datos**

**Trabajo Realizado:**
- **Diagrama ER**: Creado basándose en los modelos reales de la base de datos
- **Entidades**: Documentadas según la implementación real:
  - TENANTS, USERS, CATEGORIES, DOCUMENTS, DOCUMENT_CHUNKS
  - CHAT_HISTORY, CHAT_MESSAGES, AUDIT_LOGS
- **Relaciones**: Definidas según el esquema real de la base de datos
- **Multi-tenencia**: Documentada correctamente

**Desafíos Encontrados:**
- El modelo inicial no incluía todas las entidades reales del sistema
- Las relaciones necesitaron ser verificadas contra la implementación real

### **8.5. Resumen de la Especificación de la API**

**Trabajo Realizado:**
- **Endpoints completos**: Documentados todos los endpoints reales implementados:
  - Autenticación: `/auth/login`, `/auth/register`
  - Categorías: `/categories/` (GET, POST, PUT, DELETE)
  - Documentos: `/documents/` (POST), `/documents/search/vector` (GET)
  - Chat: `/conversations/chat` (POST)
  - Dashboard: `/documents/stats/summary`, `/categories/stats/summary`
- **Ejemplos reales**: Basados en la implementación real del backend
- **Códigos de estado**: Documentados según el uso real en la API

**Desafíos Encontrados:**
- Inicialmente faltaban endpoints importantes como login, categorías y dashboard
- Los endpoints documentados no coincidían con la implementación real
- Se necesitó revisar el código del backend para documentar los endpoints correctos

### **8.6. Resumen de las Historias de Usuario**

**Trabajo Realizado:**
- **3 historias principales**: Basadas en las funcionalidades reales del sistema
- **Criterios de aceptación**: Definidos según la implementación real
- **Escenarios de uso**: Descritos basándose en el flujo real de la aplicación
- **Definición de terminado**: Alineada con las capacidades reales del sistema

**Desafíos Encontrados:**
- Las historias iniciales no reflejaban las funcionalidades reales implementadas
- Se necesitó alinear los criterios de aceptación con la implementación real

### **8.7. Resumen de los Tickets de Trabajo**

**Trabajo Realizado:**
- **Ticket 1**: Sistema de Chunking Inteligente - Basado en la implementación real
- **Ticket 2**: Modal Responsive - Basado en las mejoras reales de UI/UX
- **Ticket 3**: Búsqueda Semántica Avanzada - Actualizado para reflejar funcionalidad real
- **Criterios técnicos**: Basados en la implementación real del backend
- **Tareas de desarrollo**: Alineadas con el trabajo real realizado

**Desafíos Encontrados:**
- El ticket 3 inicialmente era sobre auditoría, pero se cambió a búsqueda semántica para reflejar funcionalidad más relevante
- Los criterios técnicos necesitaron ser verificados contra la implementación real

### **8.8. Resumen de los Pull Requests**

**Trabajo Realizado:**
- **3 PRs principales**: Basados en el trabajo real documentado en el progress log
- **Código destacado**: Extraído de la implementación real del proyecto
- **Métricas**: Estimadas basándose en el trabajo real realizado
- **Lecciones aprendidas**: Basadas en el proceso real de desarrollo

**Desafíos Encontrados:**
- Los PRs necesitaron ser creados basándose en el trabajo real documentado
- El código destacado se extrajo de la implementación real del proyecto

### **8.9. Proceso de Desarrollo Real (Basado en Progress Log)**

**Fases Principales del Desarrollo:**

1. **Setup Inicial (2024-12-16)**
   - Configuración de Angular 17 + FastAPI
   - Estructura de base de datos PostgreSQL
   - Configuración de servicios de IA

2. **Configuración de Entorno (2024-12-17)**
   - Variables de entorno para desarrollo y producción
   - Migraciones de base de datos
   - Factory pattern para servicios

3. **Resolución de Errores (2024-12-18)**
   - Corrección de errores de subida de documentos
   - Manejo de tipos y métodos síncronos/asíncronos
   - Inicialización condicional de servicios

4. **Funcionalidades de OCR (2024-12-19)**
   - Conteo de páginas fallidas de OCR
   - Visualización de documentos en producción
   - Endpoints de descarga de archivos

5. **Verificación de Vectores (2024-12-19)**
   - Endpoints de verificación de vectorización
   - Scripts de verificación automática
   - Documentación completa

6. **Mejoras del Chat IA (2024-12-19)**
   - Chunking inteligente de documentos
   - Memoria de conversación persistente
   - UI/UX responsive mejorada
   - Expansión de límites de contexto

7. **Corrección Crítica (2024-12-19)**
   - Resolución del problema de búsqueda vectorial
   - Configuración correcta de Vertex AI
   - Pipeline RAG completamente operativo

8. **Estabilización Final (2025-01-10)**
   - Optimización del sistema RAG
   - Corrección del progreso de vectorización
   - Limpieza y estabilización del código

### **8.10. Lecciones Aprendidas del Proceso**

**Desafíos Técnicos Superados:**
- **Configuración de Vertex AI**: Problema crítico de project_number resuelto
- **Chunking de documentos**: Implementación de división semántica inteligente
- **Memoria de conversación**: Sistema persistente de contexto histórico
- **UI Responsive**: Modal de subida optimizado para móviles
- **Pipeline RAG**: Optimización de consultas y rendimiento

**Mejores Prácticas Aplicadas:**
- **Logging detallado**: Para debugging y monitoreo
- **Configuración centralizada**: Variables de entorno bien organizadas
- **Testing exhaustivo**: Verificación de funcionalidades críticas
- **Documentación actualizada**: Mantenimiento de documentación al día
- **Código limpio**: Eliminación de scripts de prueba y código obsoleto

**Resultado Final:**
Un sistema completo y funcional de gestión de documentos con IA, con búsqueda semántica avanzada, chat inteligente con memoria conversacional, y una interfaz responsive optimizada para todos los dispositivos.
