# 1. Descripción general del producto

## 1.1. Objetivo

EventFlow busca resolver la **fragmentación operativa y el estrés** que vive una persona organizando un evento social o corporativo cuando debe coordinar tareas, presupuesto y proveedores usando herramientas dispersas: WhatsApp, hojas de cálculo, Instagram, Google y comunicación informal con proveedores.

La propuesta de valor del MVP, alineada con `/docs/1-Domain-Discovery-Report.md`, `/docs/3-MVP-Scope-Definition.md` y `/docs/12-Architecture-Vision-and-Principles.md`, es:

> Convertir una idea suelta de evento en un **plan accionable** en pocos minutos, mediante asistencia de IA como **copiloto** con validación humana obligatoria, dentro de un workspace responsive de planificación y un flujo simplificado de descubrimiento y cotización de proveedores.

El MVP **no se documenta como marketplace transaccional**: queda fuera de alcance pagos reales, contratos digitales, comisiones, chat en tiempo real, WhatsApp, SMS, push y app móvil nativa. La IA es siempre copiloto, nunca decisor autónomo.

### Mercado objetivo

- **MVP:** Guatemala.
- **Visión futura:** España y resto de LATAM.

### Roles soportados

- **Organizer:** planifica eventos, recibe sugerencias IA, gestiona tareas/presupuesto/cotizaciones.
- **Vendor:** mantiene perfil aprobado, recibe `QuoteRequest`, responde `Quote`, confirma `BookingIntent`.
- **Admin:** aprueba proveedores, gestiona categorías, modera reseñas y opera el registro de auditoría (`AdminAction`).

## 1.2. Características y funcionalidades principales

Módulos del MVP (alineados con FRD, Use Cases, API Design y Backend Technical Design):

### Autenticación, sesión y perfil de usuario
- Registro y login con email y contraseña; captcha obligatorio en flujos sensibles.
- Sesión basada en **cookie HTTP-only** firmada por el backend (sin tokens en `localStorage`).
- Perfil con idioma preferido (`es-LATAM`, `es-ES`, `pt`, `en`) y rol único (`organizer`, `vendor`, `admin`).

### Workspace del organizador (event planning)
- Wizard de creación de evento con tipo, fecha, invitados, ciudad, presupuesto estimado, moneda e idioma.
- Dashboard del evento con avance, próximas tareas y cotizaciones activas.
- Moneda **inmutable** después de la creación del evento; sin conversión automática.
- Auto-cierre del evento 2 días calendario después de `event_date`.

### Asistencia de IA (`ai-assistance`)
- Generación asistida por IA de plan de evento, checklist sugerida, distribución de presupuesto, categorías sugeridas de proveedor y brief de cotización.
- Resumen IA opcional para comparación de cotizaciones (no altera datos originales).
- **Human-in-the-loop obligatorio:** ninguna salida IA se convierte en dato oficial sin aceptación humana explícita.
- Toda salida IA se persiste en `AIRecommendation` con `llm_provider`, `prompt_version_id`, payload de entrada y salida, `accepted`, `edited`, `fallback_used` y `timeout_ms`.
- Timeout fijo de 60 000 ms y fallback controlado via `MockAIProvider` cuando se habilita por entorno.

### Tareas y presupuesto
- Checklist de tareas manuales o generadas por IA, con estados de avance (`pending`, `in_progress`, `done`, `skipped`).
- Presupuesto por categorías con montos planificados y comprometidos; warning si comprometido supera planificado.

### Directorio y perfil de proveedor
- Directorio curado de proveedores **aprobados** con filtros por categoría, ciudad y rango de precio.
- Perfil de proveedor con biografía, portafolio (máximo 10 imágenes por trabajo/evento exhibido), paquetes/servicios y estado de aprobación administrativa.
- Soporte para una futura página pública SEO-ready por proveedor (`/docs/15`, `/docs/16`).

### Flujo simplificado de cotización
- `QuoteRequest` estructurada con brief derivado del evento, generable o editable por el organizador.
- Límite de **5 `QuoteRequest` activas** por categoría y evento.
- Una solicitud activa por `(evento, proveedor)`.
- `Quote` con total, desglose, condiciones y `valid_until` (por defecto 15 días calendario si el proveedor no la define).
- Comparación lado a lado de cotizaciones; resumen IA opcional.

### Booking simulado y reseñas
- `BookingIntent` simulado (sin pago real ni contrato firmado en plataforma).
- Reseñas verificadas posteriores al evento, solo si existe `BookingIntent` confirmado; una reseña por evento y proveedor; rating entero 1–5.
- Moderación manual con soft delete; trazabilidad por `AdminAction`.

### Gobernanza administrativa
- Aprobación / rechazo de proveedores y gestión del catálogo de categorías (`ServiceCategory`).
- Moderación de reseñas, lectura auditada de eventos para soporte y auditoría de acciones (`AdminAction`).
- Operación de seed/demo reset desde un endpoint protegido.

### Notificaciones
- Bandeja in-app y email simulado por logs estructurados.
- Avisos para cotizaciones, booking, tareas y gobernanza.

### Internacionalización y moneda
- Locales soportados: `es-LATAM`, `es-ES`, `pt`, `en`.
- Monedas soportadas: `GTQ`, `USD`, `EUR`, `MXN`, `COP`; sin conversión automática.

### Seed y demo readiness
- Datos seed reproducibles con `is_seed = true`.
- `MockAIProvider` obligatorio para tests y demos offline.
- Reset surgical via `DELETE WHERE is_seed = true` documentado en `/docs/11` y `/docs/18`.

## 1.3. Exclusiones explícitas del MVP

Documentadas en `/docs/3-MVP-Scope-Definition.md`, `/docs/8.1-Product-Owner-Decisions-Use-Cases-Addendum.md`, `/docs/12-Architecture-Vision-and-Principles.md` y reforzadas por ADRs:

- **Sin pagos reales** (tarjetas, escrow, comisiones).
- **Sin contratos digitales** firmados en plataforma.
- **Sin chat en tiempo real** (WebSockets / streaming).
- **Sin integración con WhatsApp, SMS, push, telefonía o calendarios externos**.
- **Sin app móvil nativa** en MVP.
- **Sin moderación o aprobación autónoma de IA**.
- **Sin conversión automática de moneda**.
- **Sin chatbot libre** ni asistente conversacional general.
- **Sin generación de imágenes con IA**.
- **Sin RAG, vector stores ni embeddings** en MVP.
- **Sin multi-tenant**.
- **Sin failover productivo entre proveedores LLM** (`AnthropicProvider` queda como stub).

## 1.4. Diseño y experiencia de usuario

Pendiente de evidencia visual implementada (no hay capturas ni mockups vinculados en este repositorio).

Con base en `/docs/15-Frontend-Architecture-Design.md`, la experiencia esperada es la de una aplicación web responsive (Next.js + App Router) con:

- **Layouts por rol** (`organizer`, `vendor`, `admin`) y áreas autenticadas separadas de áreas públicas SEO-ready.
- **AI UX human-in-the-loop:** badges visuales que distinguen contenido IA, estados `pending`/`accepted`/`edited`/`rejected`/`discarded` para `AIRecommendation`.
- **Forms con React Hook Form + Zod**, validación tipo-segura y mensajes claros por campo.
- **Estados vacíos, loading y error** definidos por feature (eventos, tareas, cotizaciones, perfiles).
- **i18n via `next-intl`** y formateo de moneda sin conversión automática.
- **Accesibilidad mínima:** teclado, foco, labels, contraste y ARIA básicos según NFR.

## 1.5. Instrucciones de instalación

Pendiente de implementación.

Cuando el repositorio incluya código fuente backend y frontend, esta sección debe completarse con:

- Requisitos previos (Node.js LTS, npm/pnpm, Docker para PostgreSQL local).
- Variables de entorno (`.env.example` documentado; ver `/docs/21-Deployment-and-DevOps-Design.md`).
- Instalación de dependencias (`npm install` o equivalente).
- Configuración de base de datos PostgreSQL local.
- Migraciones Prisma (`prisma migrate dev`).
- Seed reproducible (`npm run seed:demo` u equivalente, ver `/docs/11`).
- Ejecución local del backend (`npm run dev` en el monolito Express).
- Ejecución local del frontend (`npm run dev` en Next.js).
- Ejecución de tests (`vitest`, `playwright`).
- Configuración del modo `LLM_PROVIDER=mock` para ejecutar sin OpenAI.

## 1.6. Documentos fuente

- [Domain Discovery Report](../docs/1-Domain-Discovery-Report.md)
- [Product Owner Decisions](../docs/2-Product-Owner-Decisions.md)
- [MVP Scope Definition](../docs/3-MVP-Scope-Definition.md)
- [AI Features Specification](../docs/7-AI-Features-Specification.md)
- [Use Cases Specification](../docs/8-Use-Cases-Specification.md)
- [Functional Requirements Document](../docs/9-Functional-Requirements-Document.md)
- [Non-Functional Requirements](../docs/10-Non-Functional-Requirements.md)
- [Architecture Vision & Principles](../docs/12-Architecture-Vision-and-Principles.md)
- [System Architecture Document](../docs/13-System-Architecture-Document.md)
- [Frontend Architecture Design](../docs/15-Frontend-Architecture-Design.md)
