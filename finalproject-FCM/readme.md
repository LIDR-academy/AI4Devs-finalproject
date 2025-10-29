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

### **0.1. Alumno:** Francisco Javier Chía Moctezuma

### **0.2. Nombre del proyecto:** LexiMind

### **0.3. Descripción breve del proyecto:**

LexiMind es un asistente inteligente que transforma la gestión del conocimiento bancario mediante inteligencia artificial conversacional. Esta plataforma fusiona tecnologías de procesamiento de lenguaje natural, búsqueda semántica avanzada y arquitectura RAG (Retrieval-Augmented Generation) para crear un ecosistema donde los empleados bancarios pueden interactuar naturalmente con toda la documentación corporativa, normativas regulatorias y procedimientos internos. Más que un simple repositorio digital, LexiMind actúa como un experto virtual que comprende el contexto, anticipa las necesidades de información y proporciona respuestas precisas e inmediatas, democratizando el acceso al conocimiento institucional y acelerando la toma de decisiones críticas en el entorno financiero altamente regulado.

### **0.4. URL del proyecto:**

Para acceder a la aplicación desplegada en Vercel, visita el siguiente enlace:
https://leximind-ia.vercel.app/

### 0.5. URL o archivo comprimido del repositorio

Proyecto Frontend:
https://github.com/luke-chia/leximind-knowledge-hub.git

Proyecto Backend:
https://github.com/luke-chia/leximind_backend.git

---

## 1. Descripción general del producto

### **1.1. Objetivo:**

El objetivo principal de LexiMind es incrementar la eficiencia y la toma de decisiones dentro del banco. Al proporcionar a los empleados un acceso rápido y preciso a la información relevante, LexiMind busca:

- **Optimizar la productividad de los empleados:**

  - Reducir significativamente el tiempo dedicado a buscar información en diversos sistemas y documentos.
  - Permitir que los empleados se concentren en tareas de mayor valor.

- **Mejorar la precisión y consistencia de las respuestas:**

  - Asegurar acceso a información verificada y actualizada para todos los empleados.
  - Evitar la desinformación, especialmente en áreas críticas como legal y compliance.

- **Agilizar la incorporación y capacitación de nuevos empleados:**

  - Proporcionar una guía exhaustiva y accesible para nuevos colaboradores.
  - Facilitar la familiarización rápida con políticas, procedimientos y productos del banco.
  - Reducir la necesidad de extensas sesiones de formación.

- **Fomentar la innovación y la toma de decisiones informadas:**

  - Democratizar el acceso al conocimiento.
  - Empoderar a los equipos para identificar tendencias, anticipar problemas y tomar decisiones estratégicas basadas en datos precisos y actualizados.

- **Reducir los costos operativos:**

  - Automatizar consultas repetitivas.
  - Mejorar la eficiencia en la búsqueda de información.
  - Liberar recursos humanos y disminuir los costos asociados con la gestión manual del conocimiento.

- **Asegurar el cumplimiento normativo:**
  - Facilitar el acceso a normativas, leyes y políticas internas.
  - Ayudar a los empleados a mantenerse informados sobre los requisitos regulatorios.
  - Reducir riesgos legales.

En esencia, LexiMind busca transformar al banco en un centro de conocimiento inteligente.

### **1.2. Características y funcionalidades principales:**

La primera versión de LexiMind se centrará en las siguientes características y funcionalidades clave:

- 📄 **Carga y Gestión de Documentos:**

  - Importación masiva de documentos en formatos como PDF, Word, Texto Plano, Markdown, etc.
  - Actualización continua del contenido y adición de nuevos documentos.
  - Auditoría de contenido para identificar información relevante, desactualizada o que debe eliminarse.
  - Estructuración y categorización mediante categorías, etiquetas y palabras clave.

- 🧬 **Indexación y Vectorización Inteligente:**

  - Técnicas de embedding para convertir el contenido en vectores mediante IA.
  - Reconocimiento de intenciones para entender el contexto de la consulta del usuario.

- 🔎 **Búsqueda y Recuperación Avanzada:**

  - Búsqueda semántica en lenguaje natural, basada en contexto y significado.
  - Navegación directa a documentos y páginas específicas mediante enlaces.
  - Generación Aumentada por Recuperación (RAG) para respuestas fundamentadas en información interna, minimizando "alucinaciones".

- 💬 **Interacción Conversacional y Experiencia de Usuario:**

  - Interfaz web intuitiva y fácil de usar para empleados sin conocimientos técnicos.
  - Respuestas en lenguaje natural, adaptadas al tono profesional y servicial.
  - Historial de consultas para mejorar precisión y personalización.
  - Gestión de documentos favoritos, últimos abiertos y por área/departamento.
  - Personalización del tono y personalidad del asistente.

- 🔒 **Seguridad y Privacidad de Datos:**

  - Medidas de seguridad robustas y cumplimiento de regulaciones financieras.
  - Control de acceso basado en roles (RBAC).
  - Auditorías de seguridad periódicas.

- 📈 **Mejora Continua y Analítica:**
  - Sistema de retroalimentación para puntuar respuestas y mejorar el modelo.
  - Monitoreo y análisis de uso para identificar áreas de mejora y valor entregado.

### **1.3. Diseño y experiencia de usuario:**

> Proporciona imágenes y/o videotutorial mostrando la experiencia del usuario desde que aterriza en la aplicación, pasando por todas las funcionalidades principales.

https://leximind-ia.vercel.app/demo.html

### **1.4. Instrucciones de instalación:**

Para instalar y ejecutar LexiMind en tu entorno local, sigue estos pasos:

#### **Prerrequisitos:**

Git, Node.js 18+ y npm

#### **Instalación Frontend**

```bash
# Clona el repositorio
git clone https://github.com/luke-chia/leximind-knowledge-hub.git

# Entra al directorio
cd leximind-knowledge-hub

# Instala dependencias
npm install

# Crea el archivo .env y configura las siguientes variables:
cat > .env <<EOF
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=sb_anon_key_dummy_1234567890
VITE_API_BASE_URL=http://localhost:3000/api/v1
EOF

# Ejecuta el servidor de desarrollo
npm run dev
```

#### **Instalación Backend**

```bash
# Clona el repositorio
git clone https://github.com/luke-chia/leximind_backend.git

# Entra al directorio
cd leximind_backend

# Instala dependencias
npm install

# Crea el archivo .env y configura las siguientes variables:
cat > .env <<EOF
# OpenAI
OPENAI_API_KEY=sk_dummy_openai_key_1234567890
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

# Pinecone
PINECONE_API_KEY=pcsk_dummy_pinecone_key_1234567890
PINECONE_ENVIRONMENT=us-east-1
PINECONE_INDEX_NAME=leximind
PINECONE_NAMESPACE=mimir

# Supabase
SUPABASE_KEY=sb_secret_dummy_supabase_key_1234567890
SUPABASE_URL=https://your-project.supabase.co
EOF

# Ejecuta el servidor de desarrollo
npm run dev
```

#### **Base de Datos y Storage (Supabase):**

1. Crear cuenta en [Supabase](https://supabase.com)
2. Crear nuevo proyecto
3. Ejecutar scripts SQL ubicados en `/database/migrations/inicializacion_tablas.sql` para crear las tablas necesarias
4. Configurar Row Level Security (RLS) según políticas definidas
5. Obtener URL y clave anónima para configurar en `.env` del backend y frontend
6. En la sección Storage de Supabase, crea dos buckets:

- `documents` (para almacenar archivos PDF y documentos privados)
- `public-assets` (para almacenar imágenes y recursos públicos)

#### **Base de Datos Vectorial (Pinecone):**

1. Crear cuenta en [Pinecone](https://www.pinecone.io)
2. Crear nuevo índice con las siguientes especificaciones:

- Nombre del índice: leximind
- Métrica: cosine
- Dimensiones: 1536
- Región: us-east-1 (AWS)
- Tipo: Dense
- Modo de capacidad: Serverless
- Modelo de embedding: text-embedding-3-small

3. Crear namespace llamado `mimir` dentro del índice leximind
4. Obtener API Key desde el dashboard de Pinecone
5. Configurar las variables en el `.env` del backend:

- `PINECONE_API_KEY`: Tu clave API de Pinecone
- `PINECONE_ENVIRONMENT`: us-east-1
- `PINECONE_INDEX_NAME`: leximind
- `PINECONE_NAMESPACE`: mimir

La aplicación estará disponible en `http://localhost:8080` (frontend) y `http://localhost:3000` (backend).

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

LexiMind implementa una **Arquitectura RAG (Retrieval-Augmented Generation)** distribuida con componentes especializados para el procesamiento de conocimiento bancario:

![Arquitectura](docs/arquitecture.png)

#### **Patrón Arquitectónico: RAG + Hexagonal**

**Justificación de la Arquitectura:**

- **RAG (Retrieval-Augmented Generation)**: Combina búsqueda semántica con generación de texto para respuestas precisas y contextualizadas
- **Arquitectura Hexagonal**: Aísla la lógica de negocio bancario del mundo exterior, permitiendo cambios de tecnología sin afectar el core
- **Microservicios especializados**: Separación clara entre gestión de documentos, procesamiento IA y autenticación

#### **Beneficios:**

✅ **Escalabilidad**: Componentes independientes que pueden escalar por separado
✅ **Mantenibilidad**: Lógica de negocio protegida e independiente de tecnologías externas
✅ **Testabilidad**: Interfaces claras permiten testing unitario y de integración
✅ **Flexibilidad**: Fácil intercambio de providers de IA o bases de datos
✅ **Seguridad**: Múltiples capas de autenticación y autorización

#### **Sacrificios:**

❌ **Complejidad inicial**: Más componentes y configuración que una arquitectura monolítica
❌ **Latencia**: Múltiples llamadas entre servicios pueden incrementar tiempo de respuesta
❌ **Costos**: Múltiples servicios externos (OpenAI, Pinecone, Supabase) aumentan costos operativos

### **2.2. Descripción de componentes principales:**

#### **Frontend (React + TypeScript)**

- **Tecnología**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Características**:
  - Interfaz conversacional con animaciones de typing
  - Gestión de estado con React Query para cache inteligente
  - Componentes reutilizables con sistema de design bancario
  - Soporte multiidioma (español/inglés)
- **Funcionalidades clave**: Chat interface, gestión de documentos, perfiles de usuario

#### **Backend API (Node.js + Express)**

- **Tecnología**: Node.js, Express.js, TypeScript
- **Patrón**: Arquitectura Hexagonal con capas Domain, Infrastructure, Presentation
- **Funcionalidades**:
  - Endpoints RESTful para gestión de documentos y conversaciones
  - Pipeline RAG para procesamiento de consultas
  - Integración con servicios de IA (OpenAI)
  - Gestión de embeddings y búsqueda vectorial

#### **Servicios de IA Especializados**

- **OpenAI GPT-3.5-turbo**: Generación de respuestas contextualizadas
- **OpenAI text-embedding-3-small**: Vectorización de documentos (1536 dimensiones)
- **Pipeline RAG**: Recuperación semántica + generación aumentada
- **Procesamiento**: Análisis de documentos PDF, Word, texto plano

#### **Capa de Datos Distribuida**

- **Supabase PostgreSQL**:
  - Metadatos de documentos, conversaciones, mensajes
  - Catálogos bancarios (áreas, categorías, fuentes, tags)
  - Perfiles de usuario y opiniones de expertos
- **Pinecone Vector Database**:
  - Índice `leximind` con métrica cosine
  - Namespace `mimir` para organización
  - Búsqueda semántica de alta velocidad
- **Supabase Storage**: Almacenamiento de documentos con URLs firmadas

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

#### **Estructura del Frontend:**

```bash
src/
├── components/ # Componentes React organizados por funcionalidad
│ ├── chat/ # Interfaces conversacionales (SearchInterface, ChatInterface)
│ ├── layout/ # Layout principal con sidebar bancario
│ └── ui/ # Sistema de design shadcn/ui (no modificar)
├── pages/ # Páginas principales (Index, Search, Documents, NotFound)
├── hooks/ # Custom hooks (use-toast, use-mobile, useApi, useChat)
├── services/ # APIs y servicios externos
│ ├── chat/ # Servicios de chat y IA
│ └── index.ts # Centralized exports
├── lib/ # Utilidades (utils.ts, i18n.ts, supabase.ts)
├── locales/ # Internacionalización ES/EN
└── utils/ # Helpers (api.ts, errors.ts, types.ts)
```

#### **Estructura del Backend (Hexagonal):**

```bash
src/
├── config/ # Configuración y variables de entorno
├── domain/ # Capa de dominio (lógica de negocio pura)
│ ├── datasources/ # Interfaces de fuentes de datos
│ ├── dtos/ # Data Transfer Objects
│ ├── entities/ # Entidades del dominio bancario
│ ├── errors/ # Manejo de errores del dominio
│ ├── repositories/ # Interfaces de repositorios
│ └── use-cases/ # Casos de uso (reglas de negocio)
├── infrastructure/ # Capa de infraestructura (implementaciones)
│ ├── adapters/ # Adaptadores externos (RAG, Upload)
│ ├── datasources/ # Implementaciones de fuentes de datos
│ ├── mappers/ # Mapeo entre capas
│ ├── repositories/ # Implementaciones de repositorios
│ ├── services/ # Servicios (OpenAI, Pinecone, Supabase, Cache)
│ └── use-cases/ # Implementaciones casos de uso
├── presentation/ # Capa de presentación (API REST)
│ ├── auth/ # Endpoints de autenticación
│ ├── chats/ # Endpoints conversacionales con RAG
│ ├── documents/ # Endpoints gestión documentos
│ └── startup/ # Tareas de inicialización
└── data/ # Capa de datos (conexiones DB)
  ├── mongodb/ # MongoDB (opcional/uso futuro)
  └── postgres/ # PostgreSQL
```

#### **Principios Arquitectónicos Aplicados:**

**Domain-Driven Design (DDD):**

- Modelado basado en el dominio bancario (compliance, regulaciones, áreas funcionales)
- Agregados claramente definidos (Document, Conversation, Profile)
- Lenguaje ubicuo reflejado en nombres de entidades y servicios

**SOLID Principles:**

- **S**: Cada clase tiene una única responsabilidad (AuthController, DocumentService)
- **O**: Extensible via nuevas implementaciones sin modificar código existente
- **L**: Interfaces intercambiables (diferentes providers de IA)
- **I**: Interfaces específicas y cohesivas
- **D**: Dependencias invertidas (dominio no depende de infraestructura)

**RAG Pattern Implementation:**

- **Retrieval**: Búsqueda semántica en Pinecone con embeddings de OpenAI
- **Augmentation**: Enriquecimiento de consultas con contexto bancario específico
- **Generation**: Respuestas generadas por GPT-3.5-turbo con contexto recuperado
  Representa la estructura del proyecto y explica brevemente el propósito de las carpetas principales, así como si obedece a algún patrón o arquitectura específica.

---

### **2.4. Infraestructura y despliegue**

```mermaid
graph TD
    A[Usuario] --> B[Vercel - Frontend]
    B --> C[Railway - Backend API]
    C --> D[Supabase - Database]
    C --> E[Pinecone - Vector DB]
    C --> F[OpenAI - LLM]

    B --> G[Vercel Edge Network]
    C --> H[Railway Global Regions]
```

![DiagramaBaseInfra](docs/infraestructura.svg)

#### **💡 Ventajas de la Combinación Vercel + Railway**

**Especialización tecnológica:**

- **Vercel (Frontend)**: Optimizado para React, Vite y aplicaciones estáticas
- **Railway (Backend)**: Perfecto para APIs Node.js con bases de datos

**Optimización de costos:**

- **Frontend gratuito**: Vercel ofrece hosting ilimitado para proyectos personales
- **Backend económico**: Railway desde $5/mes con recursos suficientes para desarrollo
- **Escalabilidad gradual**: Pay-as-you-grow model

**Performance superior:**

- **CDN global**: Vercel Edge Network distribuye el frontend mundialmente
- **API rápida**: Railway Global Regions reduce latencia del backend
- **Optimizaciones automáticas**: Build optimizations y caching inteligente

**Developer Experience:**

- **Deploys automáticos**: Git push → deploy automático en ambas plataformas
- **Preview branches**: Cada PR genera un ambiente de staging
- **Logs centralizados**: Monitoring y debugging integrado

#### **🚀 Proceso de Despliegue**

**Setup en Vercel (Frontend):**

1. **Conectar repositorio**: `vercel.com` → Import Git Repository
2. **Auto-detección**: Vercel detecta Vite automáticamente
3. **Variables de entorno**: Agregar `VITE_*` variables
4. **Deploy automático**: Cada push a `main` despliega automáticamente
5. **Dominio personalizado**: `tu-app.vercel.app` (dominios custom gratuitos)

**Setup en Railway (Backend):**

1. **Conectar repo**: Railway detecta Node.js automáticamente
2. **Variables de entorno**: Configurar `OPENAI_API_KEY`, `PINECONE_API_KEY`, etc.
3. **Base de datos**: Railway PostgreSQL con backups automáticos
4. **Monitoreo**: Métricas de CPU, memoria y requests integradas

#### **Comparativa de Plataformas Frontend**

| Plataforma     | Costo MVP | Build Speed | CDN    | Vite Support | Auto-Deploy |
| -------------- | --------- | ----------- | ------ | ------------ | ----------- |
| **Vercel**     | Gratis    | ⚡⚡⚡      | Global | ⭐⭐⭐       | ✅          |
| **Netlify**    | Gratis    | ⚡⚡        | Global | ⭐⭐         | ✅          |
| **Cloudflare** | Gratis    | ⚡⚡        | Global | ⭐⭐         | ✅          |
| **AWS S3+CF**  | $5-20     | ⚡          | Global | ⭐           | ❌          |

### **2.5. Seguridad**

#### **Seguridad y Autenticación**

- **Supabase Auth**: Autenticación JWT con múltiples providers
- **Row Level Security (RLS)**: Políticas granulares a nivel de base de datos
- **RBAC**: Control de acceso basado en roles bancarios
- **Audit Trail**: Seguimiento de created_by/updated_by en todas las entidades

### **2.6. Tests**

> Describe brevemente algunos de los tests realizados

---

## 3. Modelo de Datos

### **3.1. Diagrama del modelo de datos:**

![DiagramaER](docs/ER_modelo_datos.svg)

El Diagrame ER se puede consultar en docs/ER_modelo_datos.svg

### **3.2. Descripción de entidades principales:**

---

-- Tabla para la gestión de documentos

---

```sql

CREATE TABLE documents (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
original_name TEXT NOT NULL,
alias TEXT,
user_id UUID NOT NULL,
uploaded_at TIMESTAMPTZ DEFAULT NOW(),
storage_path TEXT NOT NULL,
signed_url TEXT,
signed_url_expires_at TIMESTAMPTZ,
created_at TIMESTAMPTZ DEFAULT NOW(),
updated_at TIMESTAMPTZ DEFAULT NOW(),
created_by UUID,
updated_by UUID,
CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
CONSTRAINT fk_created_by_doc FOREIGN KEY (created_by) REFERENCES auth.users(id),
CONSTRAINT fk_updated_by_doc FOREIGN KEY (updated_by) REFERENCES auth.users(id)
);

---

-- Tabla para perfiles de usuario extendidos (Extiende a auth.users)

---

create table public.profiles (
id uuid references auth.users on delete cascade primary key,
name text,
nickname text,
rol text,
status text,
img_url text,
created_at timestamp with time zone default now()
);

---

-- Tabla para conversaciones de usuario (Chats con el LLM)

---

create table public.conversations (
id uuid primary key default gen_random_uuid(),
user_id uuid not null references auth.users(id) on delete cascade,
title text,
created_at timestamptz default now()
);

---

-- Tabla para mensajes dentro de una conversación (Preguntas y respuestas del LLM)

---

create table public.messages (
id uuid primary key default gen_random_uuid(),
conversation_id uuid not null references public.conversations(id) on delete cascade,
user_id uuid not null references auth.users(id) on delete cascade,
role text not null check (role in ('user','assistant')),
content text not null, -- pregunta o respuesta LLM
tokens int, -- opcional: conteo
created_at timestamptz default now()
);

---

-- Tabla para opiniones de expertos sobre mensajes específicos

---

create table public.expert_opinions (
id uuid primary key default gen_random_uuid(),
message_id uuid not null references public.messages(id) on delete cascade,
expert_user_id uuid not null references auth.users(id) on delete restrict,
opinion text not null, -- la opinión redactada
document_url TEXT
);
```

---

## 4. Especificación de la API

```yaml
openapi: 3.0.3
info:
  title: LexiMind API
  version: 1.0.0
servers:
  - url: http://localhost:3000/api/v1
paths:
  /chat/query:
    post:
      summary: Procesa un mensaje de usuario usando RAG (OpenAI + Pinecone)
      tags: [Chat]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [userId, message]
              properties:
                userId:
                  type: string
                  description: Identificador del usuario
                message:
                  type: string
                  description: Pregunta del usuario
                area:
                  type: array
                  items: { type: string }
                  description: Filtro por área (metadatos)
                category:
                  type: array
                  items: { type: string }
                  description: Filtro por categoría (metadatos)
                source:
                  type: array
                  items: { type: string }
                  description: Filtro por fuente (metadatos)
                tags:
                  type: array
                  items: { type: string }
                  description: Filtro por tags (metadatos)
            example:
              userId: '6c944e0c-b365-48dc-89f6-348e6b7c7417'
              message: '¿Cuáles son los requisitos de PLD para apertura de cuenta?'
              area: ['Compliance', 'PLD']
              category: ['Technical']
              source: ['Internal_Manual']
              tags: ['Efisys']
      responses:
        '200':
          description: Respuesta generada por el LLM con fuentes recuperadas
          content:
            application/json:
              schema:
                type: object
                properties:
                  status: { type: string, example: success }
                  answer: { type: string }
                  sources:
                    type: array
                    items:
                      type: object
                      properties:
                        page: { type: string }
                        matchingText: { type: string }
                        source: { type: string }
                        documentId: { type: string }
                        score: { type: string }
              example:
                status: success
                answer: 'Para apertura de cuenta, los requisitos de PLD incluyen...'
                sources:
                  - page: 'p.53'
                    matchingText: '...narrativa por parte del equipo de desarrollo...'
                    source: 'Estandares_Fabrica.pdf'
                    documentId: '0213875b-cfd0-4227-9da0-90dc0c1c029d'
                    score: '0.86'
        '400': { description: Petición inválida }
        '500': { description: Error interno }

  /documents/upload:
    post:
      summary: Carga un PDF, genera embeddings y los upserta en Pinecone
      tags: [Documents]
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              required: [file, documentId]
              properties:
                file:
                  type: string
                  format: binary
                  description: Archivo PDF a procesar
                userId:
                  type: string
                  description: Identificador del usuario (opcional)
                documentId:
                  type: string
                  format: uuid
                  description: UUID provisto por el cliente para identificar el documento
                savepdf:
                  type: boolean
                  description: Si es true, guarda el PDF en el servidor
                area:
                  type: array
                  items: { type: string }
                category:
                  type: array
                  items: { type: string }
                source:
                  type: array
                  items: { type: string }
                tags:
                  type: array
                  items: { type: string }
            encoding:
              file:
                contentType: application/pdf
      responses:
        '200':
          description: Documento procesado e indexado correctamente
          content:
            application/json:
              schema:
                type: object
                properties:
                  status: { type: string, example: success }
                  documentId: { type: string, format: uuid }
                  chunksProcessed: { type: integer }
                  namespace: { type: string, example: mimir }
              example:
                status: success
                documentId: 'cd5f770f-fc93-4767-8c37-a31b60ee81f0'
                chunksProcessed: 854
                namespace: 'mimir'
        '400': { description: Formato inválido o campos faltantes }
        '500': { description: Error al procesar o upsertar en Pinecone }

  /health:
    get:
      summary: Healthcheck de servicios (API, OpenAI, Pinecone, Supabase)
      tags: [Health]
      responses:
        '200':
          description: Todos los servicios operativos
          content:
            application/json:
              schema:
                type: object
                properties:
                  status: { type: string, example: ok }
                  services:
                    type: object
                    properties:
                      api: { type: string, example: up }
                      openai: { type: string, example: up }
                      pinecone: { type: string, example: up }
                      supabase: { type: string, example: up }
        '503': { description: Uno o más servicios con fallas }
```

Ejemplos rápidos (curl):

```bash
# 1) Chat RAG
curl -X POST http://localhost:3000/api/v1/chat/query \
  -H 'Content-Type: application/json' \
  -d '{
    "userId": "6c944e0c-b365-48dc-89f6-348e6b7c7417",
    "message": "¿Requisitos PLD para apertura de cuenta?",
    "area": ["Compliance"],
    "category": ["Technical"],
    "source": ["Internal_Manual"],
    "tags": ["Efisys"]
  }'

# 2) Subida de documento (PDF)
curl -X POST http://localhost:3000/api/v1/documents/upload \
  -H 'Accept: application/json' \
  -F 'file=@/ruta/a/documento.pdf;type=application/pdf' \
  -F 'documentId=cd5f770f-fc93-4767-8c37-a31b60ee81f0' \
  -F 'userId=6c944e0c-b365-48dc-89f6-348e6b7c7417' \
  -F 'savepdf=true' \
  -F 'area=Compliance' -F 'area=PLD' \
  -F 'category=Technical' \
  -F 'source=Internal_Manual' \
  -F 'tags=Efisys'

# 3) Healthcheck
curl http://localhost:3000/api/v1/health
```

---

## 5. Historias de Usuario

### **Historia de Usuario 1: Búsqueda Conversacional Inteligente**

**Formato estándar:** Como empleado bancario, quiero realizar consultas en lenguaje natural sobre documentos corporativos para obtener respuestas precisas e inmediatas sin tener que navegar manualmente por múltiples sistemas.

**Descripción:** Los empleados bancarios necesitan acceder rápidamente a información específica contenida en documentos corporativos, normativas, procedimientos y políticas internas utilizando consultas conversacionales naturales, recibiendo respuestas contextualizadas con referencias a las fuentes originales.

**Criterios de Aceptación:**

- Dado que soy un empleado autenticado en LexiMind, cuando escribo una pregunta en lenguaje natural en la interfaz de chat, entonces el sistema debe procesar mi consulta y generar una respuesta relevante en menos de 5 segundos.
- Dado que realizo una consulta sobre normativas específicas, cuando el sistema genera una respuesta, entonces debe incluir referencias exactas a los documentos fuente con enlaces directos a las secciones relevantes.
- Dado que formulo una pregunta ambigua, cuando el sistema no encuentra información suficiente, entonces debe solicitar aclaraciones específicas o sugerir consultas relacionadas.
- Dado que estoy conversando con el asistente, cuando realizo preguntas de seguimiento, entonces el sistema debe mantener el contexto de la conversación anterior para proporcionar respuestas coherentes.

**Notas adicionales:**

- Implementar pipeline RAG (Retrieval-Augmented Generation) con OpenAI GPT-3.5-turbo
- Utilizar embeddings de text-embedding-3-small para búsqueda semántica en Pinecone
- Considerar límites de tokens y optimización de costos en las consultas
- Incluir sistema de fallback para consultas no resueltas

**Tareas:**

1. **Frontend - Interfaz de Chat:**

   - Crear componente ChatInterface con entrada de texto y área de respuestas
   - Implementar animación de "typing" durante procesamiento
   - Agregar sistema de historial conversacional
   - Integrar manejo de estados de carga y error

2. **Backend - Pipeline RAG:**

   - Desarrollar endpoint POST /api/v1/chat/query para procesamiento de consultas
   - Implementar servicio de vectorización con OpenAI embeddings
   - Crear servicio de búsqueda semántica en Pinecone
   - Desarrollar servicio de generación de respuestas con GPT-3.5-turbo

3. **Base de Datos:**
   - Crear tabla conversations para almacenar sesiones de chat
   - Crear tabla messages para almacenar preguntas y respuestas
   - Implementar índices para optimizar consultas de historial

### **Historia de Usuario 2: Gestión Centralizada de Documentos Corporativos**

**Formato estándar:** Como administrador de contenido bancario, quiero cargar, organizar y actualizar documentos corporativos de forma masiva para mantener la base de conocimiento actualizada y accesible para todos los empleados.

**Descripción:** Los administradores necesitan una plataforma centralizada donde puedan subir documentos en múltiples formatos (PDF, Word, texto), organizarlos mediante categorías y etiquetas, y mantener un control de versiones para asegurar que la información disponible esté siempre actualizada.

**Criterios de Aceptación:**

- Dado que soy un administrador de contenido, cuando subo un documento a la plataforma, entonces el sistema debe procesarlo automáticamente, extraer su contenido y generar embeddings para búsqueda semántica.
- Dado que cargo múltiples documentos simultáneamente, cuando el proceso de carga masiva se ejecuta, entonces debo recibir un reporte detallado del estado de cada archivo (exitoso, error, duplicado).
- Dado que un documento ya existe en el sistema, cuando subo una versión actualizada, entonces el sistema debe reemplazar la versión anterior manteniendo el historial de cambios.
- Dado que organizo documentos, cuando asigno categorías, áreas, fuentes y etiquetas, entonces estos metadatos deben estar disponibles para filtrar búsquedas posteriores.

**Notas adicionales:**

- Implementar validación de formatos de archivo soportados
- Considerar límites de tamaño de archivo y optimización de storage
- Incluir sistema de preview de documentos antes de procesamiento
- Implementar auditoría completa de cambios (created_by, updated_by)

**Tareas:**

1. **Frontend - Interfaz de Gestión:**

   - Crear página Documents con tabla de documentos existentes
   - Implementar componente de drag-and-drop para carga de archivos
   - Agregar formularios para asignación de metadatos (categorías, tags, áreas)
   - Crear sistema de filtros y búsqueda avanzada de documentos

2. **Backend - Procesamiento de Documentos:**

   - Desarrollar endpoint POST /api/v1/documents/upload para carga individual
   - Implementar endpoint POST /api/v1/documents/bulk-upload para carga masiva
   - Crear servicio de extracción de texto (PDF, Word, TXT)
   - Desarrollar servicio de vectorización y almacenamiento en Pinecone

3. **Base de Datos y Storage:**
   - Configurar Supabase Storage buckets (documents, public-assets)
   - Crear tablas de catálogos (areas, categories, sources, tags)
   - Implementar tablas de unión (document_areas, document_categories, etc.)
   - Configurar políticas de Row Level Security (RLS)

### **Historia de Usuario 3: Sistema de Retroalimentación y Mejora Continua**

**Formato estándar:** Como empleado bancario, quiero evaluar la calidad de las respuestas del asistente y proporcionar retroalimentación para contribuir a la mejora continua del sistema y aumentar la precisión de futuras consultas.

**Descripción:** Los usuarios necesitan un mecanismo para calificar las respuestas recibidas, reportar información incorrecta o incompleta, y sugerir mejoras, mientras que los expertos del banco pueden revisar estas evaluaciones y proporcionar opiniones especializadas para enriquecer la base de conocimiento.

**Criterios de Aceptación:**

- Dado que recibo una respuesta del asistente, cuando la evaluó, entonces debo poder asignar una calificación (1-5 estrellas) y opcionalmente agregar comentarios explicativos.
- Dado que una respuesta es marcada como incorrecta o incompleta, cuando un experto bancario revisa el caso, entonces debe poder agregar una opinión especializada con referencias a documentación adicional.
- Dado que soy administrador del sistema, cuando accedo al panel de analíticas, entonces debo ver métricas de satisfacción, consultas más frecuentes y áreas de mejora identificadas.
- Dado que el sistema recibe retroalimentación negativa consistente sobre un tema específico, cuando se alcanza un umbral definido, entonces debe generar alertas automáticas para revisión de contenido.

**Notas adicionales:**

- Implementar sistema de gamificación para incentivar retroalimentación
- Considerar anonimización de datos para análisis de patrones
- Incluir dashboard de métricas para administradores
- Planificar integración futura con sistemas de machine learning para auto-mejora

**Tareas:**

1. **Frontend - Sistema de Evaluación:**

   - Agregar componente de calificación (estrellas) en cada respuesta del chat
   - Crear modal de retroalimentación detallada con campos de texto
   - Implementar panel de administrador con métricas y reportes
   - Desarrollar interfaz para expertos para agregar opiniones especializadas

2. **Backend - Gestión de Retroalimentación:**

   - Crear endpoint POST /api/v1/feedback para capturar evaluaciones
   - Desarrollar endpoint GET /api/v1/analytics/feedback para métricas
   - Implementar sistema de alertas basado en umbrales de calidad
   - Crear servicio de notificaciones para expertos

3. **Base de Datos - Análisis y Auditoría:**
   - Crear tabla message_feedback para almacenar calificaciones
   - Implementar tabla expert_opinions para opiniones especializadas
   - Desarrollar vistas agregadas para análisis de tendencias

---

## 6. Tickets de Trabajo

### **Ticket No.1: API en Backend para Subir Documentos**

Necesito crear una nueva función para cargar documentos PDF desde la interfaz. El proyecto está estructurado como sigue:
`infrastructure/services` and `infrastructure/adapters`.

Ya contamos con los siguientes servicios y adaptadores que pueden ser útiles:

- `infrastructure/services/pinecone.service.ts`
- `infrastructure/adapters/rag.adapter.ts`

### Requirements

1. **Endpoint**

   - Route: `POST /api/documents/upload`
   - Accepts `multipart/form-data`
   - Fields:
     - `file`: the PDF document (required)
     - `userId`: string (optional, for logging purposes)
     - `area`: array of strings (optional)
     - `category`: array of strings (optional)
     - `source`: array of strings (optional)
     - `tags`: array of strings (optional)

2. **Processing flow**

   - Extract text from the uploaded PDF (use `pdf-parse` or a similar lightweight lib).
   - Split the text into chunks suitable for embeddings.
   - Generate embeddings using OpenAI (`text-embedding-3-small`), via `OPENAI_API_KEY` from environment variables.
   - Upsert embeddings into Pinecone:
     - Use the existing `pinecone.service.ts` for Pinecone interactions.
     - Respect `INDEX_NAME` and `NAMESPACE` from environment variables.
     - Store metadata with each vector, for example:
       ```json
       {
         "userId": "...",
         "area": [...],
         "category": [...],
         "source": [...],
         "tags": [...],
         "text": "original text chunk"
       }
       ```

3. **Architecture**

   - Add a new service: `infrastructure/services/embeddings.service.ts`
     - Responsibilities:
       - Interact with OpenAI API to generate embeddings.
       - Keep this logic isolated so it can be reused by other adapters in the future.
   - Add a new adapter: `infrastructure/adapters/upload.adapter.ts`
     - Responsibilities:
       - Orchestrate the flow: receive file + metadata → call `embeddings.service.ts` → call `pinecone.service.ts`.
       - Keep orchestration logic separate from Express routes.
   - Add a new route/controller file: `interfaces/http/document.controller.ts`
     - Responsibilities:
       - Define the Express route.
       - Use `multer` for file upload parsing.
       - Delegate all business logic to the adapter layer.

4. **Implementation details**

   - Use ES modules and TypeScript.
   - Follow async/await patterns.
   - Handle errors gracefully (invalid PDF, missing fields, OpenAI or Pinecone errors).
   - Return a JSON response:
     ```json
     {
       "status": "success",
       "documentId": "generated-or-random-id",
       "chunksProcessed": <number>
     }
     ```
   - Store secrets/configs in environment variables (`OPENAI_API_KEY`, `PINECONE_API_KEY`, `INDEX_NAME`, `NAMESPACE`).
   - Ensure each class or module has a single responsibility.

5. **Future considerations**
   - Even though `userId` has no functional impact now, make sure it is accepted and stored in Pinecone metadata.
   - This will later be used for logging interactions.

### Deliverables

- `infrastructure/services/embeddings.service.ts`
- `infrastructure/adapters/upload.adapter.ts`
- `interfaces/http/document.controller.ts`
- Example Express route registration in the main `app.ts` or `server.ts`

### Notes

- Do NOT use LangChain.
- Keep code clean, modular, and aligned with Clean Architecture and SOLID.
- Add comments to explain each layer’s responsibility.

Le proporcione un ejemplo de código en python como referencia para la tarea
use this example VectorizaPineCone.ipynb

### **Ticket No.2: Pantalla en Front para Subir Documentos**

Quiero que implementes un **document upload form** para la plataforma de **LexiMind** con los siguientes requisitos:

### Functional Requirements

- The form must allow the user to:
  - Upload a file (only PDFs).
  - Enter an alias or short name.
  - Select **areas**, **categories**, **sources**, and **tags** (these come from the existing catalogs in the database).
- Validate required fields: file, alias, at least one area and category.
- Validate file type: only `.pdf` (configurable in a constant).

### User Experience

- The upload form should be user-friendly and visually appealing.
- The upload form should be a rigth-side panel that slides in from the right when triggered.
- The file form panel, must be triggered by the pink button in the docuements section.
- Show an **animated progress bar** while uploading the file.
- Show animations of steps with TailwindCSS icons and descriptive text:
  1. Uploading Document ...
  2. Document Sent ...
  3. Generating Embeddings ...
  4. Saving to Database ...
  5. Saving to LexiMind Memory ...
- At the end, trigger a **confetti effect** and show the message:
  > "Document uploaded successfully 🎉"

### Persistence in Supabase

- Use **Supabase Storage** to save the PDF file.
- Insert metadata into the `documents` table:
  - `original_name`, `alias`, `user_id`, `storage_path`, `signed_url`, `signed_url_expires_at`.
- Create corresponding records in the join tables:
  - `document_areas`
  - `document_categories`
  - `document_sources`
  - `document_tags`

### **Ticket No.3: Sistema de Opiniones de Expertos y RAG Especializado**

Implementar un sistema que permita a oficiales de cumplimiento y expertos bancarios agregar opiniones especializadas a las respuestas generadas por LexiMind, y posteriormente crear un RAG especializado con estas interacciones para mejorar la calidad de respuestas futuras.

### Functional Requirements

#### Phase 1: Expert Opinion System

- **Conversation Storage**:

  - Guardar todas las conversaciones usuario-LexiMind en las tablas `conversations` y `messages`.
  - Cada mensaje debe incluir: `role` (user/assistant), `content`, `tokens`, y `created_at`.

- **Expert Opinion Interface**:

  - Agregar botón "Agregar Opinión de Experto" en cada respuesta de LexiMind.
  - Modal para que expertos certificados escriban sus opiniones sobre respuestas específicas.
  - Campos requeridos: `opinion` (texto), `expert_user_id`, `document_url` (opcional).

- **Expert Role Management**:
  - Identificar usuarios con rol "expert" o "compliance_officer" en la tabla `profiles`.
  - Solo usuarios expertos pueden agregar opiniones.
  - Validar certificaciones de cumplimiento en perfil de usuario.

#### Phase 2: RAG Especializado

- **Data Aggregation**:

  - Cuando se alcancen 1000+ interacciones con opiniones de expertos.
  - Crear pipeline para generar embeddings de: pregunta + respuesta LLM + opinión experto.
  - Almacenar en namespace separado en Pinecone: `expert-opinions`.

- **Enhanced Response System**:
  - Al generar respuestas, buscar en ambos namespaces: `mimir` (documentos) y `expert-opinions`.
  - Mostrar ícono "👨‍💼 Opinión de Experto" cuando existe opinión relacionada.
  - Permitir click para expandir y mostrar la opinión completa del experto.

### Technical Specifications

#### Database Schema Extensions

```sql
-- Tabla expert_opinions
CREATE TABLE expert_opinions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    expert_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    opinion TEXT NOT NULL,
    document_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para optimizar búsquedas
CREATE INDEX idx_expert_opinions_message_id ON expert_opinions(message_id);
CREATE INDEX idx_expert_opinions_expert_user ON expert_opinions(expert_user_id);
```

#### API Endpoints

1. **POST /api/v1/expert-opinions**

   - Body: `{ messageId, opinion, documentUrl? }`
   - Headers: Authorization (JWT)
   - Validation: Usuario debe tener rol "expert"

2. **GET /api/v1/expert-opinions/{messageId}**

   - Obtener opinión de experto para mensaje específico
   - Response: `{ opinion, expertName, createdAt, documentUrl }`

3. **POST /api/v1/rag/build-expert-index**
   - Endpoint administrativo para construir índice de opiniones de expertos
   - Trigger automático al alcanzar 1000 interacciones

#### Frontend Components

1. **ExpertOpinionButton**:

   - Botón flotante en cada respuesta de LexiMind
   - Solo visible para usuarios con rol "expert"

2. **ExpertOpinionModal**:

   - Modal con editor rich-text para opiniones
   - Campo opcional para adjuntar documento de referencia
   - Validación de campos requeridos

3. **ExpertInsightBadge**:
   - Badge que aparece cuando existe opinión de experto
   - Click para expandir contenido de la opinión
   - Mostrar nombre del experto y fecha

### Business Logic

#### Flujo de Trabajo de Opiniones de Expertos

1. **Consulta de Usuario** → LexiMind genera respuesta
2. **Experto revisa** → Hace clic en "Agregar Opinión de Experto"
3. **Experto escribe opinión** → Envía con referencia de documento opcional
4. **Sistema almacena** → Vincula opinión al mensaje específico
5. **Usuarios futuros** → Ven insignia de insight de experto en respuestas similares

#### Lógica de Mejora RAG

1. **Monitorear interacciones** → Contar opiniones enviadas semanalmente
2. **Umbral de activación** → Cuando se acumulen 1000+ opiniones
3. **Generar embeddings** → Combinar consulta + respuesta LLM + opinión de experto
4. **Búsqueda dual** → Buscar en ambos namespaces: documentos y opiniones de expertos
5. **Clasificar resultados** → Priorizar respuestas con opiniones de expertos

### Experiencia de Usuario

#### Para Expertos

- Integración perfecta con la interfaz de chat existente
- Acceso rápido para agregar opiniones sin interrumpir el flujo de trabajo
- Sistema de reconocimiento que muestra el conteo de contribuciones

#### Para Usuarios Regulares

- Indicadores visuales claros cuando los insights de expertos están disponibles
- Fácil acceso a opiniones de expertos sin saturar la interfaz
- Mayor confianza en las respuestas de LexiMind

### Prioridad de Implementación

1. **Alta Prioridad**: Sistema de almacenamiento y visualización de opiniones de expertos
2. **Prioridad Media**: Mejora RAG con opiniones de expertos
3. **Baja Prioridad**: Dashboard de analíticas para contribuciones de expertos

### Entregables

#### Backend (Capa de Base de Datos)

- Scripts de migración para mejoras de tabla expert_opinions
- Implementación de patrón repositorio para opiniones de expertos
- Extensión de servicio RAG para búsqueda de dual-namespace

#### Backend (Capa API)

- ExpertOpinionController con operaciones CRUD
- ChatController mejorado con integración de opiniones de expertos
- Endpoints administrativos para gestión de índice RAG

#### Frontend (Componentes)

- Componentes ExpertOpinionButton y Modal
- ExpertInsightBadge con contenido expandible
- Integración con ChatInterface existente

#### Infraestructura

- Configuración de namespace de Pinecone para opiniones de expertos
- Trabajo en segundo plano para generación de embeddings
- Monitoreo y alertas para umbrales del sistema

---

## 7. Pull Requests

> Documenta 3 de las Pull Requests realizadas durante la ejecución del proyecto

✅ Pull Request 1: Sistema de Opiniones de Expertos en el Chat

🔢 Commit base: 944df4d

Título del PR: feat: Sistema de Opiniones de Expertos
Descripción:

Este PR introduce el sistema para que expertos bancarios puedan agregar opiniones especializadas sobre respuestas generadas por LexiMind. Se implementa una interfaz intuitiva para agregar y visualizar estas opiniones, y se conecta con la API de backend para persistir la información en Supabase.

Archivos modificados:

documentacion/expert_opinions_setup.sql

src/components/chat/AddOpinionDrawer.tsx

src/components/chat/ChatInterface.tsx

src/components/chat/ViewOpinionsModal.tsx

src/services/opinions/index.ts

src/services/opinions/opinionsApi.ts

src/services/opinions/types.ts

Cambios clave:

Se agregó un Drawer para redactar opiniones desde el frontend.

Se integró un Modal para visualizar opiniones previas asociadas a un mensaje.

Se conectó la API POST /api/v1/expert-opinions para guardar opiniones en la base de datos.

Se utilizó un sistema condicional para mostrar el botón solo si el usuario tiene rol de experto.

Resultado:

Los expertos pueden aportar conocimiento adicional sobre cualquier respuesta del LLM. Las opiniones son almacenadas y se muestran a usuarios posteriores, enriqueciendo el sistema de RAG especializado.

✅ Pull Request 2: Implementación Completa del Formulario de Carga de Documentos

🔢 Commit base: 14ddb94 (y extendido por aae5a9c)

Título del PR: feat: Formulario de carga de documentos con metadatos
Descripción:

Este PR habilita la carga de documentos PDF desde el frontend de LexiMind, integrando validación de campos requeridos, asignación de metadatos (categorías, áreas, tags) y subida directa a Supabase Storage. También se conectan los servicios necesarios para almacenar referencias y prepararlos para vectorización.

Archivos modificados:

src/components/documents/DocumentUploadPanel.tsx

src/hooks/useDocumentUpload.ts

src/services/documents/documentsApi.ts

src/services/documents/types.ts

src/pages/Documents.tsx

src/hooks/useFilterEntities.ts

src/locales/en/translation.json

src/locales/es/translation.json

Cambios clave:

Se creó un formulario de carga lateral con validación de campos (archivo, alias, áreas).

Se animaron los estados del flujo (subiendo, procesando, finalizando).

Se integró Supabase Storage para guardar el archivo y generar un signed_url.

Se almacenaron los metadatos en las tablas correspondientes (documents, document_areas, etc.).

Resultado:

Los usuarios pueden subir documentos fácilmente desde la interfaz, etiquetarlos y almacenarlos con persistencia segura. La interfaz ofrece feedback visual claro durante el proceso.

✅ Pull Request 3: API para Opiniones de Expertos

🔢 Commits involucrados:

8852a84 feat: api para guardar opiniones

31584db chore: validaciones para opinions

f82f366 fix: errores de validacion

8728eea refactor: esquema supabase para opiniones

Título del PR: feat: API para Opiniones Expertas sobre Respuestas
Descripción:

Este Pull Request implementa la API REST que permite a usuarios con rol de experto guardar opiniones sobre respuestas generadas por el modelo LLM. Estas opiniones son parte fundamental del mecanismo de retroalimentación humana que enriquece el RAG con criterio experto.

Se incluyen:

Definición del modelo ExpertOpinion

Creación de migraciones SQL y validación de esquema

Endpoint POST /api/v1/expert-opinions con validaciones robustas

Endpoint GET /api/v1/expert-opinions?message_id={uuid} para recuperar las opiniones asociadas a un mensaje

Middleware de autenticación y validación de rol

Archivos modificados o creados:

src/routes/expert-opinions.ts

src/controllers/opinionController.ts

src/validators/opinionSchema.ts

src/middlewares/auth.ts

src/models/ExpertOpinion.ts

supabase/migrations/2025-09-28T-opinion.sql

Cambios clave:

Validación de esquema: Se asegura que el campo message_id esté ligado a la tabla messages, y que expert_user_id pertenezca a un usuario existente con rol válido.

Protección por rol: Solo usuarios con el rol expert pueden guardar opiniones.

Asociación semántica: Las opiniones están vinculadas a mensajes específicos, lo que permite enriquecer futuras respuestas.

Integración futura: Las opiniones podrán alimentar heurísticas, ranking o RAG semántico avanzado.
