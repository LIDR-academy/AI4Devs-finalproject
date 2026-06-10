# 0. Ficha del proyecto

## 0.1. Tu nombre completo

**Walter Alexander Cordero Lara**

## 0.2. Nombre del proyecto

**EventFlow**

## 0.3. Descripción breve del proyecto

EventFlow es una plataforma web responsive de planificación de eventos asistida por IA y gestión simplificada de cotizaciones de proveedores. Su MVP target se define como **AI-assisted event planning workspace + simplified vendor quote flow** y se enfoca en ayudar a organizadores de eventos sociales y corporativos a convertir una idea inicial en un plan estructurado con checklist, presupuesto, categorías de proveedor y flujo simplificado de cotizaciones, sin convertirse en un marketplace transaccional completo en v1.

- **Tipo de producto:** AI-assisted event planning workspace + simplified vendor quote flow.
- **Mercado MVP:** Guatemala, con visión futura hacia España y resto de LATAM.
- **Usuarios objetivo:**
  - **Organizer** (organizador de bodas, XV años, bautizos, baby showers, cumpleaños y eventos corporativos pequeños).
  - **Vendor** (proveedor de servicios para eventos: catering, decoración, fotografía, música, mobiliario, etc.).
  - **Admin** (gobernanza de la plataforma, moderación y curaduría de proveedores y categorías).
- **Plataforma MVP:** aplicación web responsive (escritorio, tablet y móvil); sin aplicación móvil nativa en MVP.

## 0.4. Stack y decisiones técnicas principales

Decisiones documentadas en `/docs/12` (Architecture Vision & Principles), `/docs/13` (System Architecture), `/docs/14` (Backend Technical Design), `/docs/15` (Frontend Architecture), `/docs/21` (Deployment & DevOps Design) y formalizadas en `/docs/22` (ADR Log):

| Capa | Tecnología | Estado |
|---|---|---|
| Estilo arquitectónico | Modular Monolith + Clean / Hexagonal Architecture | Accepted (ADR-ARCH-001, ADR-ARCH-002) |
| Backend | Node.js (LTS) + Express.js + TypeScript | Accepted (ADR-BE-001) |
| ORM | Prisma | Accepted (ADR-BE-002) |
| Base de datos | PostgreSQL 15+ | Accepted (ADR-DB-001) |
| API | REST JSON `/api/v1` | Accepted (ADR-ARCH-003, ADR-API-001) |
| Frontend | Next.js (App Router) + TypeScript + Tailwind CSS + TanStack Query + React Hook Form + Zod + next-intl | Accepted (ADR-FE-001, ADR-FE-002) |
| Capa de IA | Puerto `LLMProvider` con adapters `OpenAIProvider` (principal), `MockAIProvider` (obligatorio) y `AnthropicProvider` (stub) | Accepted (ADR-AI-001 a ADR-AI-008) |
| Validación de DTOs | Zod | Accepted (ADR-API-003) |
| Sesión | Cookies HTTP-only firmadas, sin tokens en `localStorage` | Accepted (ADR-SEC-002) |
| Autorización | RBAC + ownership + assignment-based, enforced en backend | Accepted (ADR-SEC-003) |
| Testing | Vitest + Supertest (backend), Vitest + Testing Library + MSW + Playwright (frontend), `MockAIProvider` (IA) | Accepted (ADR-TEST-001, ADR-TEST-002, ADR-TEST-003) |
| Cloud | AWS — Amplify Hosting (frontend) + App Runner (backend Docker) + RDS PostgreSQL + S3 + Secrets Manager / SSM + CloudWatch | Accepted (ADR-DEVOPS-001 a ADR-DEVOPS-007) |
| CI/CD | GitHub Actions | Accepted (ADR-DEVOPS-006) |

## 0.5. Estado académico del proyecto

| Fase | Estado | Evidencia |
|---|---|---|
| Planning & Analysis | Completado | `/docs/1` a `/docs/11` |
| Architecture & Technical Design | Completado | `/docs/12` a `/docs/22` |
| Implementación de código | Pendiente | No hay código fuente backend ni frontend en este repositorio |
| Despliegue en URL pública | Pendiente | No hay URL de Amplify / App Runner desplegada |
| Pull requests reales | Pendiente | El plan de PRs vive en `/deliverables/7-Pull-requests.md` |
| Evidencia visual / demo | Pendiente | No hay capturas ni video demo |
| Reporte de ejecución de tests | Pendiente | No hay reportes ni cobertura |

## 0.6. URL del proyecto

Pendiente de despliegue. No disponible en la documentación actual.

## 0.7. URL o archivo comprimido del repositorio

Pendiente de publicación. No disponible en la documentación actual.

## 0.8. Documentos de referencia clave

- [Architecture Vision & Principles](../docs/12-Architecture-Vision-and-Principles.md)
- [System Architecture Document](../docs/13-System-Architecture-Document.md)
- [Backend Technical Design](../docs/14-Backend-Technical-Design.md)
- [Frontend Architecture Design](../docs/15-Frontend-Architecture-Design.md)
- [API Design Specification](../docs/16-API-Design-Specification.md)
- [AI Architecture & PromptOps Design](../docs/17-AI-Architecture-and-PromptOps-Design.md)
- [Database Physical Design](../docs/18-Database-Physical-Design.md)
- [Security & Authorization Design](../docs/19-Security-and-Authorization-Design.md)
- [Testing Strategy](../docs/20-Testing-Strategy.md)
- [Deployment & DevOps Design](../docs/21-Deployment-and-DevOps-Design.md)
- [Architecture Decision Records](../docs/22-Architecture-Decision-Records.md)
