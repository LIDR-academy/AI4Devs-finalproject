# User Prompt — Generate MVP Scope Definition for EventFlow

Using the following two source documents:

1. `./docs/1-Domain-Discovery-Report.md`
2. `./docs/2-Product-Owner-Decisions.md`

Generate a complete **MVP Scope Definition** document for **EventFlow**.

EventFlow is an AI-assisted event planning and vendor management platform. The MVP must be realistic for a Master’s final project in AI-assisted Software Development, useful as a portfolio project, and aligned with the Product Owner decisions already documented.

## Goal

Create a clear and structured MVP Scope Definition that defines exactly:

- What will be built in the MVP.
- What will not be built in the MVP.
- What will be mocked, simulated, or seeded.
- Which roles are included.
- Which user flows are included.
- Which AI features are included.
- Which business rules apply to the MVP.
- Which risks must be controlled.
- Which success criteria define MVP completion.

The document must avoid overengineering and must reinforce the strategic decision that EventFlow should start as an **AI-assisted event planning workspace** with a simplified vendor quote flow, not as a full marketplace.

## Important Product Decisions to Respect

Use the source documents as the main source of truth. In particular, respect these decisions:

- Market priority: Guatemala first, with future vision for Spain and LATAM.
- MVP platform: web responsive only.
- No native mobile app in v1.
- Event types in MVP: weddings, XV años, baptisms, baby showers, birthdays, and corporate events.
- Initial data: mostly seed data; real providers are optional and not required.
- Business model for MVP: conceptual/simulated provider subscription.
- Future business model: freemium for organizers, provider subscription, possible commission per closed contract, premium vendor gallery.
- LLM provider: OpenAI as primary recommendation, with provider abstraction for Anthropic or a mock provider.
- Languages: Spanish LATAM neutral, Spanish Spain, Portuguese, and English. English is mandatory.
- Currency support must exist in MVP.
- WhatsApp integration is future scope.
- Branding direction: premium / aspirational, but accessible and human.
- Admin user: Product Owner for demo.
- Demo should include 5 to 10 organizer users and enough seed data to show created, active, and completed events.
- Reviews must be supported and seeded.
- Sentiment analysis and AI moderation are deferred.
- Admin/moderator can manually remove offensive comments or reviews.
- No formal country-specific legal compliance in MVP beyond good privacy and security practices.

## Required Output Format

Return the document in **Spanish LATAM** using this structure:

```markdown
# EventFlow — MVP Scope Definition

## 1. Propósito del documento

## 2. Resumen del MVP

## 3. Objetivos del MVP

### 3.1 Objetivos de producto
### 3.2 Objetivos académicos
### 3.3 Objetivos de portafolio
### 3.4 Objetivos técnicos

## 4. Principios de alcance

## 5. Usuarios y roles incluidos en el MVP

### 5.1 Organizador
### 5.2 Proveedor
### 5.3 Administrador

## 6. Tipos de evento incluidos

## 7. Alcance funcional incluido

### 7.1 Autenticación y roles
### 7.2 Gestión de eventos
### 7.3 Planificación asistida por IA
### 7.4 Checklist de tareas
### 7.5 Presupuesto
### 7.6 Directorio de proveedores
### 7.7 Perfil de proveedor
### 7.8 Solicitudes de cotización
### 7.9 Respuestas de cotización
### 7.10 Comparación de cotizaciones
### 7.11 Booking intent simulado
### 7.12 Reseñas
### 7.13 Notificaciones simuladas o in-app
### 7.14 Panel administrativo
### 7.15 Idiomas y moneda
### 7.16 Datos seed para demo

## 8. Alcance de IA en el MVP

### 8.1 Features IA incluidas
### 8.2 Features IA diferidas
### 8.3 Validación humana obligatoria
### 8.4 Fallback y MockAIProvider
### 8.5 Riesgos de IA en el MVP

## 9. Fuera de alcance del MVP

## 10. Funcionalidades simuladas o simplificadas

## 11. Flujos principales del MVP

### 11.1 Flujo del organizador
### 11.2 Flujo del proveedor
### 11.3 Flujo del administrador
### 11.4 Flujo de IA
### 11.5 Flujo de cotización

## 12. Reglas de negocio aplicables al MVP

## 13. Entidades principales incluidas en el MVP

## 14. Criterios de éxito del MVP

### 14.1 Criterios funcionales
### 14.2 Criterios académicos
### 14.3 Criterios técnicos
### 14.4 Criterios de demo

## 15. Métricas académicas recomendadas

## 16. Riesgos de alcance y mitigaciones

## 17. Supuestos, restricciones y dependencias

### 17.1 Supuestos
### 17.2 Restricciones
### 17.3 Dependencias

## 18. Roadmap post-MVP

### 18.1 Versión 1.1
### 18.2 Versión 2.0
### 18.3 Futuro comercial

## 19. Resumen ejecutivo de alcance

## 20. Checklist final de alcance MVP
````

## Content Requirements

The document must include:

1. A clear MVP definition in one paragraph.
2. A table of included features.
3. A table of excluded features.
4. A table of simulated/simplified features.
5. A table of MVP AI features.
6. A table of users and permissions at a high level.
7. A list of main MVP flows.
8. A list of MVP business rules.
9. A list of MVP entities.
10. A list of measurable MVP success criteria.
11. A list of academic evaluation metrics.
12. A risk table focused on MVP scope control.
13. A post-MVP roadmap.
14. A final checklist that can be used to validate whether the MVP scope is complete.

## Writing Guidelines

* Write as a Product Manager / Product Owner delivering a formal MVP Scope Definition.
* Be clear, practical, and structured.
* Do not invent requirements that contradict the source documents.
* If something is not defined in the source documents, mark it as an assumption or recommendation.
* Keep the MVP realistic and achievable.
* Avoid turning the MVP into a full marketplace.
* Clearly separate MVP scope from future scope.
* Use tables when helpful.
* Use requirement-style language where appropriate.
* Keep the tone professional and suitable for technical documentation.

## Strategic Direction

The document must reinforce this strategic decision:

```text
EventFlow MVP must be built as an AI-assisted event planning workspace first, with a simplified vendor discovery and quote flow. It must not be built as a full transactional marketplace in v1.
```

## Final Instruction

Generate the complete **EventFlow — MVP Scope Definition** document now, using only the two provided source documents as the foundation.

