> Detalla en esta sección los prompts principales utilizados durante la creación del proyecto, que justifiquen el uso de asistentes de código en todas las fases del ciclo de vida del desarrollo. Esperamos un máximo de 3 por sección, principalmente los de creación inicial o  los de corrección o adición de funcionalidades que consideres más relevantes.
Puedes añadir adicionalmente la conversación completa como link o archivo adjunto si así lo consideras


## Índice

1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)

---

## 1. Descripción general del producto

**Prompt 1:**
```
"Necesito crear una plataforma SaaS de gestión de documentos con IA que permita a los usuarios subir documentos, categorizarlos y hacer preguntas inteligentes sobre su contenido. La plataforma debe usar Angular 17+ en el frontend y FastAPI en el backend, con integración de servicios de IA como OpenAI, Google Gemini y Cohere para crear un pipeline RAG completo."
```
*Resultado: Configuración inicial del proyecto InsAI con arquitectura completa, sistema de autenticación JWT, y estructura base para gestión de documentos.*

**Prompt 2:**
```
"Implementa un sistema de chunking inteligente para documentos grandes que divida el contenido por secciones semánticas (títulos, subtítulos, párrafos) y cree embeddings individuales para cada chunk. También necesito un sistema de memoria de conversación que permita a la IA recordar el contexto de conversaciones previas."
```
*Resultado: Sistema completo de chunking (commit 76e4cb6) con DocumentChunkingService, ConversationMemoryService, y expansión de límites de contexto a 128,000 caracteres.*

**Prompt 3:**
```
"Corrige el error crítico del sistema de búsqueda vectorial que está devolviendo '400 Request contains an invalid argument'. El problema parece estar en la configuración del project_number de Vertex AI. Necesito que el sistema RAG funcione correctamente para que los usuarios puedan hacer preguntas sobre sus documentos."
```
*Resultado: Corrección crítica (commit c24bf0f) con variable VERTEX_AI_PROJECT_ID_NUMBER, documentación completa, y sistema RAG completamente funcional.*

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1:**
```
"Crea un diagrama Mermaid que muestre la arquitectura completa de InsAI con las siguientes capas: Frontend (Angular), API Gateway (FastAPI), Application Layer (Servicios), AI Services (OpenAI, Gemini, Cohere), Data Layer (PostgreSQL, Vector DB), e Infrastructure (Google Cloud). Incluye también el flujo de datos del pipeline RAG."
```
*Resultado: Diagrama de arquitectura completo con 6 capas principales, flujo de datos RAG, y conexiones entre servicios.*

**Prompt 2:**
```
"Actualiza el diagrama de arquitectura para incluir Hugging Face para embeddings, eliminar Firebase Hosting y usar Cloud Run, y agregar Vertex AI Vector Search como base de datos vectorial principal."
```
*Resultado: Diagrama actualizado con servicios reales: Hugging Face + Vertex AI para embeddings, Cloud Run para hosting, y Vertex AI Vector Search.*

**Prompt 3:**
```
"Corrige el diagrama de infraestructura para mostrar la arquitectura real de producción con Google Cloud SQL, Cloud Storage, Memorystore Redis, y los servicios de IA correctos."
```
*Resultado: Diagrama de infraestructura preciso con todos los servicios de Google Cloud utilizados en producción.*

### **2.2. Descripción de componentes principales:**

**Prompt 1:**
```
"Describe los componentes principales de la arquitectura InsAI siguiendo principios SOLID, DDD y patrones de diseño como Factory Pattern y Strategy Pattern. No me des tecnologías específicas, sino los principios arquitectónicos aplicados."
```
*Resultado: Descripción de capas basada en principios SOLID, DDD, Factory Pattern, Strategy Pattern, Repository Pattern, y Dependency Injection.*

**Prompt 2:**
```
"Actualiza la descripción del backend para reflejar la implementación real: FastAPI, Service Layer Pattern, Factory Pattern, y Dependency Injection, no Hexagonal Architecture ni CQRS que no se implementaron."
```
*Resultado: Descripción corregida del backend con patrones reales implementados.*

**Prompt 3:**
```
"Agrega una sección de principios fundamentales que explique SOLID, DDD, Abstract Factory, Strategy y Repository patterns aplicados en el proyecto."
```
*Resultado: Sección detallada de principios arquitectónicos con ejemplos de implementación.*

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

**Prompt 1:**
```
"Documenta la estructura de archivos del proyecto InsAI con la organización por features en el frontend (auth, documents, chat) y la arquitectura por capas en el backend (API, Services, Models). Incluye también la configuración de reglas de Cursor distribuidas."
```
*Resultado: Estructura completa documentada con frontend por features, backend por capas, y reglas de Cursor distribuidas.*

**Prompt 2:**
```
"Actualiza la documentación para reflejar la migración de CogniVault a InsAI y la reorganización de reglas de Cursor en carpetas específicas por tecnología."
```
*Resultado: Documentación actualizada con el cambio de nombre del proyecto y nueva estructura de reglas.*

**Prompt 3:**
```
"Agrega información sobre la configuración de entornos (desarrollo/producción), variables de entorno, y la estructura de migraciones de base de datos."
```
*Resultado: Documentación completa de configuración de entornos y migraciones.*

### **2.4. Infraestructura y despliegue**

**Prompt 1:**
```
"Configura GitHub Actions para despliegue automático en Google Cloud Run con Cloud Build, Artifact Registry, y todas las variables de entorno necesarias para Vertex AI, Hugging Face, y otros servicios."
```
*Resultado: Pipeline de CI/CD completo con GitHub Actions, Cloud Build, y despliegue en Cloud Run.*

**Prompt 2:**
```
"Corrige el pipeline de despliegue para usar Artifact Registry en us-east1, eliminar verificaciones innecesarias de APIs, y simplificar el flujo de despliegue."
```
*Resultado: Pipeline optimizado con despliegue directo desde código fuente y verificaciones de estructura.*

**Prompt 3:**
```
"Agrega la variable crítica VERTEX_AI_PROJECT_ID_NUMBER al pipeline de despliegue y actualiza la configuración de CORS para incluir la URL del frontend desplegado."
```
*Resultado: Pipeline actualizado con variable crítica de Vertex AI y configuración CORS correcta.*

### **2.5. Seguridad**

**Prompt 1:**
```
"Implementa un sistema de autenticación JWT completo con duración de 8 horas, middleware de autenticación, endpoints de auth, y validación de tokens en todas las rutas protegidas."
```
*Resultado: Sistema de autenticación completo (commit 2cdbba6) con JWT, middleware, y validación de rutas.*

**Prompt 2:**
```
"Configura CORS correctamente para permitir el frontend desplegado en Cloud Run y agrega validación Pydantic para todos los endpoints de la API."
```
*Resultado: Configuración CORS actualizada y validación robusta con Pydantic.*

**Prompt 3:**
```
"Implementa manejo seguro de credenciales de Google Cloud con service account keys y configuración de variables de entorno para diferentes entornos."
```
*Resultado: Manejo seguro de credenciales con configuración por entornos.*

### **2.6. Tests**

**Prompt 1:**
```
"Configura el entorno de testing con Jest para el frontend Angular y pytest para el backend Python, con cobertura mínima del 80% y testing de integración para el pipeline RAG."
```
*Resultado: Configuración completa de testing con Jest, pytest, y cobertura de código.*

**Prompt 2:**
```
"Implementa tests unitarios para los servicios de chunking, memoria de conversación, y búsqueda vectorial, incluyendo mocks para servicios externos de IA."
```
*Resultado: Tests unitarios completos para servicios críticos con mocks de servicios externos.*

**Prompt 3:**
```
"Agrega tests de integración para verificar el flujo completo del pipeline RAG desde la subida de documentos hasta la generación de respuestas."
```
*Resultado: Tests de integración end-to-end para el pipeline RAG completo.*

---

### 3. Modelo de Datos

**Prompt 1:**
```
"Crea un modelo de base de datos para InsAI que soporte multi-tenencia con las siguientes entidades: TENANTS, USERS, CATEGORIES, DOCUMENTS, CHAT_HISTORY, CHAT_MESSAGES, y AUDIT_LOGS. Incluye relaciones apropiadas y campos para vectorización de documentos."
```
*Resultado: Modelo inicial de base de datos (commit 2b3653a) con multi-tenencia, relaciones definidas, y campos para vectorización.*

**Prompt 2:**
```
"Agrega una tabla DOCUMENT_CHUNKS para el sistema de chunking inteligente con metadatos enriquecidos (página, sección, contexto) y campos para OCR (páginas fallidas, total de páginas) y conversión Word a PDF."
```
*Resultado: Sistema completo de chunking (commit 76e4cb6) con tabla DOCUMENT_CHUNKS, campos de OCR (commit 7aea71d3), y campos de conversión Word (commit 9f485db9).*

**Prompt 3:**
```
"Corrige los conflictos de nombres en el modelo DocumentChunk y actualiza todas las referencias para evitar ambigüedades con otros modelos del sistema."
```
*Resultado: Resolución de conflictos (commit 144de65) y actualización de referencias en el modelo de datos.*

---

### 4. Especificación de la API

**Prompt 1:**
```
"Implementa endpoints completos para autenticación (login, register), gestión de categorías (CRUD), documentos (upload, search, stats), chat (conversations), y dashboard (estadísticas). Incluye validación Pydantic y códigos de estado apropiados."
```
*Resultado: API completa implementada con endpoints de autenticación (commit 2cdbba6), categorías (commit f0f5b2f), documentos (commit 43df735), chat (commit b2ff642), y dashboard.*

**Prompt 2:**
```
"Agrega endpoints de vectorización y verificación de vectores para permitir auto-vectorización de documentos y verificación del estado de vectorización en Vertex AI."
```
*Resultado: Endpoints de vectorización (commit c24bf0f) con auto-vectorización, verificación de vectores, y documentación completa.*

**Prompt 3:**
```
"Implementa endpoints de descarga de documentos para producción que descarguen archivos desde Google Cloud Storage y los sirvan al frontend de manera segura."
```
*Resultado: Endpoints de descarga (commit ee8a597) con integración con Google Cloud Storage y visualización segura de documentos.*

---

### 5. Historias de Usuario

**Prompt 1:**
```
"Como usuario, quiero poder subir documentos PDF y Word, categorizarlos, y hacer preguntas inteligentes sobre su contenido para obtener respuestas precisas basadas en el análisis de IA."
```
*Resultado: Historia de usuario principal implementada con sistema completo de gestión de documentos, categorización, y chat IA con pipeline RAG.*

**Prompt 2:**
```
"Como usuario, quiero que la IA recuerde el contexto de nuestras conversaciones previas para poder hacer preguntas de seguimiento y mantener una conversación coherente sobre mis documentos."
```
*Resultado: Sistema de memoria de conversación (commit 76e4cb6) con ConversationMemoryService que preserva contexto histórico.*

**Prompt 3:**
```
"Como usuario, quiero ver estadísticas detalladas de mis documentos y categorías en un dashboard intuitivo para entender mejor mi biblioteca de documentos."
```
*Resultado: Dashboard completo (commit 43df735) con estadísticas reales, visor PDF seguro, y métricas de uso.*

---

### 6. Tickets de Trabajo

**Prompt 1:**
```
"Implementa un sistema de chunking inteligente que divida documentos grandes por secciones semánticas (títulos, subtítulos, párrafos) y cree embeddings individuales para cada chunk, mejorando la precisión del pipeline RAG."
```
*Resultado: Ticket completado (commit 76e4cb6) con DocumentChunkingService, modelo DocumentChunk, y 1,117 líneas de código agregadas.*

**Prompt 2:**
```
"Mejora la UI/UX del modal de agregar documentos para que sea completamente responsive en pantallas pequeñas, con botones accesibles y manejo adecuado de porcentajes de progreso."
```
*Resultado: Ticket completado (commit 2a137ba) con modal responsive, mejoras de accesibilidad, y 385 líneas modificadas.*

**Prompt 3:**
```
"Implementa un sistema de búsqueda semántica avanzada con embeddings de Hugging Face, re-ranking con Cohere, y optimización del pipeline RAG para mejorar la precisión de las respuestas."
```
*Resultado: Ticket completado (commit c24bf0f) con sistema de búsqueda semántica, integración con servicios de IA, y 4,705 líneas agregadas.*

---

### 7. Pull Requests

**Prompt 1:**
```
"Crear PR para implementar sistema de chunking inteligente y memoria de conversación que mejore significativamente la capacidad del pipeline RAG para procesar documentos grandes y mantener contexto conversacional."
```
*Resultado: PR #1 - Chunking y Memoria de Conversación (commit 76e4cb6) con 1,117 líneas agregadas, 11 archivos modificados, y funcionalidades críticas implementadas.*

**Prompt 2:**
```
"Crear PR para mejorar la experiencia de usuario en el modal de subida de documentos, haciéndolo completamente responsive y accesible en todos los dispositivos."
```
*Resultado: PR #2 - Mejoras de UI/UX (commit 2a137ba) con 385 líneas modificadas, 2 archivos afectados, y mejoras significativas de usabilidad.*

**Prompt 3:**
```
"Crear PR para corregir el error crítico del sistema de búsqueda vectorial y implementar funcionalidades avanzadas de búsqueda semántica con múltiples servicios de IA."
```
*Resultado: PR #3 - Corrección Crítica de Vertex AI (commit c24bf0f) con 4,705 líneas agregadas, 34 archivos modificados, y resolución del problema crítico del RAG.*

---

## 8. Resumen del Proceso de Desarrollo

> **Nota**: Los logs de prompts no se guardaron desde el inicio del proyecto, pero se presenta aquí un resumen del trabajo realizado en cada sección basado en el historial real de Git y el archivo de progreso del proyecto.

### **8.1. Resumen de la Descripción General del Producto**

**Trabajo Realizado (Basado en Git History):**
- **Evolución del proyecto**: Desde "CogniVault" (commit inicial) hasta "InsAI" (commit 55e79e9)
- **Funcionalidades implementadas**: Basadas en commits reales:
  - **Sistema de autenticación** (commit 2cdbba6): JWT con duración de 8 horas, middleware, endpoints de auth
  - **Módulos de categorías y documentos** (commit bc73196): CRUD robusto, búsqueda, paginación, auditoría
  - **Dashboard con estadísticas** (commit 43df735): Estadísticas reales, visor PDF seguro, mejoras UX
  - **Sistema de chat con historial** (commit b2ff642): Historial de conversaciones completo
  - **Pipeline RAG optimizado** (commit f968aa0): Vectorización con ChromaDB, optimización de RAG

**Desafíos Encontrados:**
- **Cambio de nombre del proyecto**: Migración de CogniVault a InsAI requirió actualización de toda la documentación
- **Evolución de funcionalidades**: Las capacidades reales superaron las descripciones iniciales

### **8.2. Resumen de la Arquitectura del Sistema**

**Trabajo Realizado (Basado en Git History):**
- **Configuración inicial** (commit d118bab): Configuración base del proyecto, estándares de código, documentación
- **Reglas de Cursor distribuidas** (commits 774be41, 6865511): Migración a enfoque distribuido, reglas específicas por tecnología
- **Actualización a Angular 17+** (commit 01671ea): Control flow moderno (@if, @for, @switch)
- **Configuración de despliegue** (commits fe805ac, 64038c7): GitHub Actions, Cloud Build, Artifact Registry
- **Corrección crítica de Vertex AI** (commit c24bf0f): Variable VERTEX_AI_PROJECT_ID_NUMBER, documentación completa

**Desafíos Encontrados:**
- **Configuración de Vertex AI**: Error crítico de '400 Request contains an invalid argument' resuelto
- **Despliegue en Cloud Run**: Múltiples intentos de configuración de puertos y dependencias
- **Reglas de Cursor**: Reorganización completa del sistema de reglas

### **8.3. Resumen del Modelo de Datos**

**Trabajo Realizado (Basado en Git History):**
- **Migraciones iniciales** (commit 2b3653a): Multi-tenencia y mejores prácticas de BD
- **Sistema de chunking** (commit 76e4cb6): Modelo DocumentChunk, DocumentChunkingService
- **Campos de vectorización** (commit 5add438d): Campos de vectorización en documentos
- **Campos de OCR** (commit 7aea71d3): Campos de OCR fallidas en documentos
- **Campos de conversión Word** (commit 9f485db9): Campos de conversión Word a PDF

**Desafíos Encontrados:**
- **Evolución del esquema**: Múltiples migraciones para agregar funcionalidades
- **Conflictos de nombres**: DocumentChunk vs otros modelos (commit 144de65)

### **8.4. Resumen de la Especificación de la API**

**Trabajo Realizado (Basado en Git History):**
- **Endpoints de autenticación** (commit 2cdbba6): Login, registro, validación JWT
- **Endpoints de documentos** (commit 43df735): CRUD completo, búsqueda, estadísticas
- **Endpoints de chat** (commit b2ff642): Sistema de conversaciones
- **Endpoints de vectorización** (commit c24bf0f): Auto-vectorización, verificación de vectores
- **Endpoints de categorías** (commit f0f5b2f): CRUD robusto, búsqueda, paginación

**Desafíos Encontrados:**
- **Evolución de endpoints**: Los endpoints se desarrollaron incrementalmente
- **Integración con servicios externos**: Vertex AI, Hugging Face, Cohere

### **8.5. Resumen de las Historias de Usuario**

**Trabajo Realizado (Basado en Git History):**
- **Historia 1 - Gestión de Documentos**: Basada en commits de CRUD de documentos (43df735, f0f5b2f)
- **Historia 2 - Chat Interactivo**: Basada en commits de chat y RAG (b2ff642, f968aa0, 76e4cb6)
- **Historia 3 - Dashboard y Estadísticas**: Basada en commits de dashboard (43df735)

**Desafíos Encontrados:**
- **Evolución de funcionalidades**: Las historias se adaptaron a las capacidades reales implementadas
- **Integración de servicios**: RAG, vectorización, memoria de conversación

### **8.6. Resumen de los Tickets de Trabajo**

**Trabajo Realizado (Basado en Git History):**
- **Ticket 1 - Sistema de Chunking Inteligente**: Basado en commit 76e4cb6 (1,117 líneas agregadas)
- **Ticket 2 - Modal Responsive**: Basado en commit 2a137ba (385 líneas modificadas)
- **Ticket 3 - Búsqueda Semántica Avanzada**: Basado en commit c24bf0f (4,705 líneas agregadas)

**Desafíos Encontrados:**
- **Complejidad técnica**: Cada ticket involucró múltiples archivos y tecnologías
- **Integración de servicios**: Vertex AI, Hugging Face, Cohere

### **8.7. Resumen de los Pull Requests**

**Trabajo Realizado (Basado en Git History):**
- **PR 1 - Chunking y Memoria de Conversación**: Basado en commit 76e4cb6
- **PR 2 - Mejoras de UI/UX**: Basado en commit 2a137ba
- **PR 3 - Corrección Crítica de Vertex AI**: Basado en commit c24bf0f

**Desafíos Encontrados:**
- **Tamaño de los PRs**: Algunos commits fueron muy grandes (4,705 líneas)
- **Integración compleja**: Múltiples servicios y tecnologías

### **8.8. Proceso de Desarrollo Real (Basado en Git History)**

**Fases Principales del Desarrollo:**

1. **Setup Inicial (Commit 93ee977 - 2b3653a)**
   - Configuración inicial del proyecto
   - Migraciones de base de datos
   - Reglas de Cursor y documentación

2. **Sistema de Autenticación (Commit 2cdbba6)**
   - JWT con duración de 8 horas
   - Middleware de autenticación
   - Endpoints de auth

3. **Módulos de Categorías y Documentos (Commits f0f5b2f, bc73196)**
   - CRUD robusto de categorías
   - Búsqueda, paginación, auditoría
   - Módulo de documentos estable

4. **Dashboard y Estadísticas (Commit 43df735)**
   - Dashboard con estadísticas reales
   - Visor PDF seguro
   - Mejoras de UX

5. **Sistema de Chat y RAG (Commits b2ff642, f968aa0)**
   - Historial de conversaciones
   - Vectorización con ChromaDB
   - Optimización de RAG pipeline

6. **Chunking Inteligente y Memoria (Commit 76e4cb6)**
   - Modelo DocumentChunk
   - DocumentChunkingService
   - ConversationMemoryService

7. **Mejoras de UI/UX (Commit 2a137ba)**
   - Modal responsive
   - Mejoras de accesibilidad
   - Optimización para móviles

8. **Corrección Crítica de Vertex AI (Commit c24bf0f)**
   - Variable VERTEX_AI_PROJECT_ID_NUMBER
   - Documentación completa
   - Sistema RAG funcional

9. **Estabilización y Optimización (Commits recientes)**
   - Optimización del sistema RAG
   - Corrección de progreso de vectorización
   - Limpieza y estabilización

### **8.9. Lecciones Aprendidas del Proceso**

**Desafíos Técnicos Superados:**
- **Configuración de Vertex AI**: Error crítico de project_number resuelto
- **Chunking de documentos**: Implementación de división semántica inteligente
- **Memoria de conversación**: Sistema persistente de contexto histórico
- **UI Responsive**: Modal de subida optimizado para móviles
- **Pipeline RAG**: Optimización de consultas y rendimiento

**Mejores Prácticas Aplicadas:**
- **Commits atómicos**: Cada commit tiene un propósito específico
- **Documentación actualizada**: Memory-bank mantenido al día
- **Testing exhaustivo**: Verificación de funcionalidades críticas
- **Configuración centralizada**: Variables de entorno bien organizadas
- **Código limpio**: Eliminación de scripts de prueba y código obsoleto

**Resultado Final:**
Un sistema completo y funcional de gestión de documentos con IA, con búsqueda semántica avanzada, chat inteligente con memoria conversacional, y una interfaz responsive optimizada para todos los dispositivos.