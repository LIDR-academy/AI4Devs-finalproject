> Detalla en esta sección los prompts principales utilizados durante la creación del proyecto, que justifiquen el uso de asistentes de código en todas las fases del ciclo de vida del desarrollo. Esperamos un máximo de 3 por sección, principalmente los de creación inicial o los de corrección o adición de funcionalidades que consideres más relevantes.
> Puedes añadir adicionalmente la conversación completa como link o archivo adjunto si así lo consideras

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

> Actúa como Senior Product Manager. Analiza mi idea original (un sistema financiero complejo integrado con WhatsApp e IA desde el día 1) y critica su viabilidad técnica. Propón una alternativa centrada en entregar valor rápidamente ("Walking Skeleton"), posponiendo las integraciones costosas a una fase 2.

*Justificación:* Reducir el riesgo de complejidad. Implementar IA, WhatsApp y un "core bancario" simultáneamente es un patrón clásico de sobreingeniería. El pivote hacia un MVP Web Walking Skeleton permite validar el dominio central (ingresos, gastos, balance, resumen) y la infraestructura antes de invertir en integraciones externas.

**Prompt 2:**

> Define el stack tecnológico ideal para un MVP que debe ser rápido, escalable para IA en el futuro, pero simple ahora. Genera estándares de arquitectura (`standards.mdc`) para Backend (Python/FastAPI) y Frontend (Next.js), enfocándote en una Arquitectura en Capas Simplificada, rechazando explícitamente microservicios o "DDD puro" en esta etapa.

*Justificación:* Aplicación del principio YAGNI. Python para facilitar futura integración con IA; monolito modular para desarrollar rápido manteniendo baja complejidad operativa.

**Prompt 3:**

> Eres un diseñador senior de producto y estratega UX/UI especializado en aplicaciones web responsivas. Tengo un prototipo de app de finanzas personales construido con V0. Inicialmente era mobile-first, pero ahora quiero pivotar a una **estrategia responsive-first** —asegurando que funcione de forma fluida en **desktop, tablet y móvil**, aprovechando las fortalezas de cada dispositivo. Tu misión: analizar el concepto, aplicar mejores prácticas en diseño responsivo, sugerir mejoras de layout, flujo de navegación y diseño de componentes, enfatizando una identidad visual moderna con colores vibrantes en modo claro y oscuro, inspirados en herramientas como Cursor.

*Justificación:* El enfoque "mobile-first" limitaba el uso del espacio en desktop/tablet. Con responsive-first se ofrecen dashboards más ricos en escritorio y una experiencia táctil optimizada en móvil, manteniendo una identidad consistente vía tokens de diseño.

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1:**

> Genera un diagrama de arquitectura del sistema Ze Finance en formato Mermaid (flowchart). Representa el flujo: Usuario → Navegador → Frontend (Next.js 14) → Backend (FastAPI Async) → Base de datos (PostgreSQL 15). Indica el protocolo HTTP + JWT entre frontend y backend, y Async SQLAlchemy entre backend y DB.

**Prompt 2:**

> Explica el patrón arquitectónico aplicado (Arquitectura en Capas Simplificada, Monolito Modular). Justifica la elección de FastAPI, Next.js 14 y PostgreSQL. Lista beneficios principales y trade-offs (por ejemplo: no microservicios por YAGNI, no DDD puro en MVP).

**Prompt 3:**

> Crea un diagrama de infraestructura de desarrollo local usando Mermaid. Incluye: máquina del desarrollador, Docker (PostgreSQL 15 en puerto 5433, Adminer en 8080), Backend FastAPI en 8000, Frontend Next.js en 3000. Muestra las dependencias entre componentes.

### **2.2. Descripción de componentes principales:**

**Prompt 1:**

> Describe los componentes principales del frontend (Next.js 14): framework, lenguaje, styling, librería de gráficos, cliente HTTP, gestión de estado. Incluye tecnologías clave: App Router, TypeScript strict, Tailwind + ShadcnUI, Recharts, Axios, AuthContext.

**Prompt 2:**

> Describe los componentes principales del backend (FastAPI): framework, validación, ORM, driver de BD, servidor, autenticación. Incluye: Pydantic V2, SQLAlchemy 2.0 Async, AsyncPG, Uvicorn, JWT + BCrypt.

**Prompt 3:**

> Describe la base de datos PostgreSQL 15: versión, despliegue, características. Incluye: claves primarias UUID, foreign keys con cascade delete, índices en columnas frecuentes, precisión decimal para montos.

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

**Prompt 1:**

> Genera la estructura de directorios del proyecto ze-finance. Incluye carpetas backend (app/, routers/, tests/), frontend (app/, components/, lib/, context/), ai-specs (specs/, changes/), .cursor/rules. Documenta brevemente el propósito de cada carpeta principal.

**Prompt 2:**

> Explica el patrón de capas aplicado en el backend: capa de presentación (rutas FastAPI), capa de aplicación (CRUD/servicios), capa de datos (modelos SQLAlchemy). Indica que las rutas son delgadas y delegan en la capa de servicio.

**Prompt 3:**

> Documenta la estructura de componentes del frontend: layout (DesktopSidebar, BottomNavigation), feature components (AuthForm, TransactionItem, ChatBubble), UI primitives (ShadcnUI). Explica cuándo usar Server Components vs Client Components.

### **2.4. Infraestructura y despliegue**

**Prompt 1:**

> Documenta el proceso de despliegue local: Docker Compose para PostgreSQL, variables de entorno del backend (.env.example), variables del frontend (.env.local). Incluye comandos exactos para levantar DB, backend y frontend.

**Prompt 2:**

> Describe el stack de producción: Vercel (frontend), GCP Cloud Run (backend FastAPI), Neon (PostgreSQL). Documenta configuración de CORS, secrets (GCP Secret Manager), y variables NEXT_PUBLIC_API_BASE_URL.

**Prompt 3:**

> Define el pipeline CI/CD mínimo: qué debe ejecutarse en cada PR (backend: lint, typecheck, pytest; frontend: npm run lint, npm run build). Recomienda cache de dependencias y jobs paralelos.

### **2.5. Seguridad**

**Prompt 1:**

> Implementa el hashing de contraseñas con BCrypt usando passlib. Implementa la creación de tokens JWT con python-jose. Incluye ejemplos de código en auth_utils.py: hash_password, create_access_token, validación de expiración.

**Prompt 2:**

> Documenta las prácticas de aislamiento de datos (multi-tenancy lógico): todas las consultas de transacciones deben filtrar por user_id autenticado. Incluye un ejemplo de CRUD que verifica ownership antes de eliminar (delete_user_transaction con where user_id == user_id).

**Prompt 3:**

> Implementa validación de entrada con Pydantic en todos los endpoints. Documenta prevención de SQL injection vía ORM, configuración de CORS (ALLOWED_ORIGINS), y manejo seguro de refresh tokens (HTTP-only cookies).

### **2.6. Tests**

**Prompt 1:**

> Genera tests de integración para el backend usando pytest y pytest-asyncio. Cubre: registro, login, crear transacción (autorizado), listar transacciones (autorizado + aislamiento de usuario), eliminar transacción (ownership check), dashboard summary. Usa base de datos SQLite en memoria para tests.

**Prompt 2:**

> Implementa el flujo E2E mínimo con Playwright: registrar usuario, login, crear transacción de gasto, verificar que aparece en lista y dashboard, eliminar transacción, verificar actualización de totales. Documenta el setup de fixtures y mocks necesarios.

**Prompt 3:**

> Configura Vitest para tests unitarios e integración del frontend. Cubre componentes de chat (useChat hook, ChatBubble, service layer). Incluye mocks para scrollIntoView y scrollTo ya que jsdom no los implementa. Asegura cobertura del flujo optimista (optimistic UI) y manejo de errores.

---

## 3. Modelo de Datos

**Prompt 1:**

> Genera el diagrama ER del modelo de datos en Mermaid (erDiagram). Incluye entidades User y Transaction. User: id (UUID PK), email (UK), hashed_password, full_name, monthly_budget, created_at, last_login_at. Transaction: id (UUID PK), user_id (FK), amount, type (INCOME/EXPENSE), category, description, occurred_at, created_at. Relación User ||--o{ Transaction.

**Prompt 2:**

> Describe la entidad User en detalle: atributos con tipo y restricciones, reglas de validación (email único, password mín 8 chars), relaciones (transacciones), índices. Incluye diseño de claves primarias UUID v4 para evitar enumeración de recursos.

**Prompt 3:**

> Describe la entidad Transaction: atributos, validaciones (amount positivo, category requerida), relaciones, índice compuesto (user_id, occurred_at). Documenta principios: integridad referencial, precisión monetaria (Decimal), distinción entre occurred_at (fecha negocio) y created_at (auditoría).

---

## 4. Especificación de la API

**Prompt 1:**

> Define los endpoints principales de la API en formato OpenAPI/REST. Incluye: POST /auth/register (público), POST /token (OAuth2 form), GET /transactions?limit=50 (protegido), POST /transactions (protegido), DELETE /transactions/{id} (protegido), GET /dashboard/summary (protegido). Todos los protegidos requieren Authorization: Bearer <token>.

**Prompt 2:**

> Genera ejemplos de request/response para POST /auth/register (201 con access_token) y POST /transactions (201 con objeto transaction completo). Incluye códigos de error: 400 (email duplicado), 401 (credenciales inválidas), 404 (transacción no encontrada o no pertenece al usuario).

**Prompt 3:**

> Documenta los endpoints de perfil y chat: GET /user/profile, PATCH /user/profile, POST /chat/messages (retorna mensaje y envelope de metadata UI), POST /auth/refresh (cookie HTTP-only refresh_token), POST /auth/logout. Indica que la especificación completa está en ai-specs/specs/api-spec.yml y en /docs cuando el backend está activo.

---

## 5. Historias de Usuario

**Prompt 1:**

> Documenta la historia de usuario "Registro y autenticación". Formato: Como usuario, quiero registrarme e iniciar sesión para acceder de forma segura a mis datos financieros. Incluye: Problema/Valor, Alcance (registro, login, JWT, BCrypt), Criterios de aceptación, Fuera de alcance (reset password, OAuth), Dependencias, Plan de pruebas.

**Prompt 2:**

> Documenta la historia "Gestión de transacciones". Como usuario, quiero crear, listar y eliminar mis transacciones financieras para hacer seguimiento de ingresos y gastos. Incluye criterios: crear con amount/type/category, listar con límite, eliminar solo propias, orden por occurred_at, aislamiento de datos. Fuera de alcance: edición backend (inicialmente), transacciones recurrentes.

**Prompt 3:**

> Documenta la historia "Dashboard financiero". Como usuario, quiero ver un resumen de mi situación financiera para entender balance, ingresos, gastos y desglose por categoría. Criterios: totales correctos, desglose por categoría, actualización al añadir/eliminar transacciones, estado vacío manejado. Fuera de alcance: analytics avanzados, presupuestos, filtros por período.

---

## 6. Tickets de Trabajo

**Prompt 1:**

> Genera el plan de implementación del ticket Backend - Core Architecture (feat-1). Siguiendo el comando /plan-backend-ticket: capa de datos (User, Transaction, schemas Pydantic), capa CRUD (auth, transactions, dashboard), rutas API (register, token, transactions, dashboard), tests de integración. Referencias: api-spec.yml, data-model.md.

*Ejemplo de uso:* `/plan-backend-ticket @ai-specs/changes/feat-1-core-arch-backend-plan.md`

**Prompt 2:**

> Genera el plan de implementación del ticket Frontend - Scaffolding (feat-3). Siguiendo /plan-frontend-ticket: rutas App Router (login, register, dashboard, transactions, insights, chat, settings), componentes layout (DesktopSidebar, BottomNavigation), AuthContext, lib/api.ts (Axios + interceptores). Integración con backend: register, login, transacciones, dashboard. Layout responsive (móvil/tablet/desktop).

*Ejemplo de uso:* `/develop-frontend @ai-specs/changes/feat-3-scaffolding-front-plan.md desenvolva o plano`

**Prompt 3:**

> Genera el plan del ticket Backend - Zefa Chatbot Agent (feat-8). Incluye: modelos ChatMessage y ChatConversationSummary, gateway IA provider-agnóstico (OpenAI/Anthropic), tools (get_balance, list_transactions, create_transaction, analyze_spending), persistencia de conversaciones, respuestas en pt-BR. Restricciones: aislamiento por user_id, texto-only en V1.

*Ejemplo de uso:* `/develop-backend @ai-specs/changes/feat-8-zefa-chatbot-agent-finance-plan.md`

---

## 7. Pull Requests

**Prompt 1:**

> Redacta la descripción del PR "Entrega 2 - Walking Skeleton Implementation" (rama feature-entrega2-WJC). Resumen: entrega end-to-end Frontend → API → DB más documentación. Secciones: Backend (auth, transactions, dashboard, CRUD, tests), Infra (docker-compose PostgreSQL + Adminer), Frontend (páginas, layout responsive, AuthContext, tests Vitest + Playwright), Docs (README, TECHNICAL_DOCUMENTATION, prompts, rules). Incluye plan de verificación: pytest, npm test, playwright test, docker compose up -d.

**Prompt 2:**

> Redacta la descripción del PR para la integración del Chat frontend (feat-9). Cambios: UI de chat integrada con backend, useChat hook con persistencia localStorage, optimistic UI, ChatBubble con Markdown GFM, TypingIndicator, TransactionConfirmationCard, lib/chat/service.ts. Tests: 27 nuevos (integración chat, useChat, service). Criterios de aceptación: uso de @/lib/api, persistencia cross-navegación, Markdown rendering, manejo de timeout/401.

**Prompt 3:**

> Redacta la descripción del PR para el agente IA backend (feat-8). Módulos nuevos: app/chat/, app/ai/ (gateway, tools, prompt). Features: POST /chat/messages, tools (get_balance, list_transactions, create_transaction, analyze_spending), persistencia de mensajes, provider-agnóstico. Tests: test_chat_agent.py con respx para mock de llamadas HTTP al proveedor IA. Docs: PROJECT_DOCUMENTATION, TECHNICAL_DOCUMENTATION, PROMPTS actualizados.

---

## Información adicional

**Flujo de desarrollo con comandos Cursor:**

- **Planificación:** `/plan-backend-ticket`, `/plan-frontend-ticket`
- **Desarrollo:** `/develop-backend`, `/develop-frontend`
- **Documentación:** `/update-docs`
