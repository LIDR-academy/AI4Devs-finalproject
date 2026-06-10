# User Story Refinement Review — US-099

## Source User Story File

`management/user-stories/US-099-prisma-schema.md`

## Decision Resolution Artifact

`management/user-stories/decision-resolutions/US-099-decision-resolution.md` — **Encontrado** (creado el 2026-06-09 después de la primera pasada de refinación). Las 11 decisiones PO/BA formalizadas en este artefacto se aplican como precedencia sobre cualquier conflicto con documentos fuente anteriores. Esta segunda pasada de refinación valida que la historia sigue siendo consistente con el Decision Resolution y con `PO/BA Decisions Applied` del propio User Story.

## Review Date

2026-06-09 (segunda pasada de validación)

---

## 1. Resultado Ejecutivo

| Campo                                      | Evaluación                                                          |
| ------------------------------------------ | ------------------------------------------------------------------- |
| User Story ID                              | US-099                                                              |
| File Path                                  | `management/user-stories/US-099-prisma-schema.md`                   |
| Backlog Item                               | PB-P0-001 — Database Schema, Migrations & Constraints               |
| Epic                                       | EPIC-DB-001 — Database & Prisma Physical Model                      |
| Estado actual                              | Ready for Approval                                                  |
| Estado recomendado                         | Ready for Approval                                                  |
| Nivel de riesgo                            | Bajo                                                                |
| Calidad general                            | Alta                                                                |
| Requiere decisión PO                       | No                                                                  |
| Requiere decisión técnica                  | No                                                                  |
| Requiere decisión QA                       | No                                                                  |
| Requiere decisión Seguridad                | No                                                                  |
| Decision Resolution artifact found         | Yes                                                                 |
| User Story file updated                    | Yes (actualización mínima: `Last Updated` refleja segunda pasada de validación) |
| Refinement review artifact created/updated | Yes (evidencia de segunda pasada)                                   |
| Refinement review path                     | `management/user-stories/refinement-reviews/US-099-refinement-review.md` |

---

## 2. Diagnóstico PO/BA

US-099 es una historia técnica de fundación que entrega únicamente la declaración de `prisma/schema.prisma` (sin migraciones, sin índices avanzados, sin constraints físicos, sin lógica de aplicación). Continúa siendo **clara**, **valiosa**, **testable**, **trazable**, **alineada con el MVP** y **respetuosa del scope** tras esta segunda pasada de validación.

* El rol (`System`) es correcto para una historia de fundación de DB.
* El goal (declarar los 19 modelos MVP, enums, mappings y convenciones físicas) es preciso y verificable mediante `prisma validate` / `prisma generate` / tests estructurales.
* El valor de negocio es explícito: desbloquea EPIC-BE-001, EPIC-API-001, EPIC-AI-001 y EPIC-SEED-001.
* Los límites con US-100 (migraciones), US-101 (índices avanzados) y US-102 (constraints C-001..C-062) están **explícitos y formalizados** en `PO/BA Decisions Applied` y consolidados en el Decision Resolution artifact.
* No introduce scope creep: respeta MVP guardrails (sin pagos, contratos, chat, WhatsApp, push, RAG, multi-tenant, IA autónoma).
* No requiere `Split Required`: la historia es atómica y de tamaño razonable para entrega.

Las 11 decisiones PO/BA están consolidadas en el Decision Resolution artifact y su rationale está respaldado por ADRs aceptados (ADR-DB-001..ADR-DB-005, ADR-AI-006). La consistencia entre `PO/BA Decisions Applied` del User Story y el Decision Resolution artifact es **completa**.

---

## 3. Hallazgos Principales

| Severidad | Hallazgo                                                                                                                                                                  | Impacto                                                              | Recomendación                                                                                                                                                                                              |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Media     | Documentation Alignment Required: Doc 18 §11/§12 declara `event_types` con PK `code`, mientras US-099 + ADR-DB-002 establecen `id UUID` PK y `code` unique.               | Riesgo de confusión futura al implementar migraciones (US-100).      | Amendar Doc 18 §11 y §12 para alinear con ADR-DB-002. No bloquea US-099: la PO/BA Decision y ADR-DB-002 (Accepted) tienen precedencia sobre Doc 18.                                                         |
| Media     | Documentation Alignment Required: Doc 18 §26 declara mecanismos mixtos de soft delete (`is_active`, `status`, solo `attachments` usa `deleted_at`), mientras US-099 estandariza `deletedAt` para los 7 modelos. | Riesgo de divergencia con repositorios futuros si Doc 18 no se amenda. | Tech Decision uniforme formalizada en `PO/BA Decisions Applied` y consolidada en Decision Resolution §Decisión 8 (válida bajo ADR-DB-004 que admite `status` o `deleted_at`). Amendar Doc 18 §26. No bloquea US-099. |
| Baja      | Documentation Alignment Required: PB-P0-001 (Backlog Prioritized) menciona `VendorWork` y `Task` en la descripción. Doc 6 §6 establece que `VendorPortfolioItem` se cubre con `Attachment` polimórfico, y la entidad canónica es `EventTask`. | Posible interpretación errada al generar tareas de desarrollo.       | Amendar la descripción de PB-P0-001 para usar `EventTask` y eliminar `VendorWork`. No bloquea US-099.                                                                                                       |
| Baja      | EPIC Map mantiene `US-DB-001` como alias; PO/BA Decision establece `US-099` como ID oficial.                                                                              | Riesgo de ambigüedad menor en referencias cruzadas.                  | Limpiar el alias en una pasada de housekeeping documental o mantenerlo explícitamente como alias interno. No bloquea US-099.                                                                                |

> **Nota:** los hallazgos de trazabilidad ADR ampliada y de refuerzo de AC-07/AC-09 que aparecían en la primera pasada de refinación ya fueron resueltos y no se repiten aquí. La sección `Related ADR(s)` lista los 8 ADRs habilitantes, y AC-07/AC-09 citan ADR-DB-004 y ADR-DB-002 respectivamente.

---

## 4. Validación de Alcance MVP

| Check                                | Resultado | Comentario                                                                                                       |
| ------------------------------------ | --------- | ---------------------------------------------------------------------------------------------------------------- |
| No introduce pagos reales            | Pass      | Schema explícitamente excluye campos de pago (SEC-03).                                                            |
| No introduce contratos firmados      | Pass      | SEC-04 lo prohíbe.                                                                                                |
| No introduce WhatsApp/chat/push      | Pass      | SEC-04 + Out of Scope.                                                                                            |
| Respeta human-in-the-loop IA         | Pass      | `AIRecommendationStatus` incluye `pending/accepted/edited/rejected/discarded`.                                    |
| Respeta backend como source of truth | Pass      | Schema relacional con FKs explícitas, sin lógica en frontend.                                                     |
| Respeta seed/demo si aplica          | Pass      | `is_seed` declarado en cada modelo operativo según Doc 18 §8.5 y BR-SEED-005.                                     |
| No introduce RAG/vector DB           | Pass      | Explícitamente fuera de scope.                                                                                    |
| No introduce multi-tenant enterprise | Pass      | Explícitamente fuera de scope.                                                                                    |
| No introduce P4/Future scope         | Pass      | Sin `EventCollaborator`, `Availability` avanzada, `Conversation`, `Payment`, etc.                                 |

---

## 5. Revisión de Acceptance Criteria

| AC    | Calidad      | Problema detectado                                                                              | Acción recomendada                                                                                                            |
| ----- | ------------ | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| AC-01 | Clear        | —                                                                                               | Sin cambios. Lista los 19 modelos MVP de forma explícita y verificable.                                                       |
| AC-02 | Clear        | —                                                                                               | Sin cambios. Enumera enums base (4) y enums de status por entidad (10) sin permitir reuso de un enum genérico.                |
| AC-03 | Clear        | —                                                                                               | Sin cambios. Convenciones `@@map`/`@map` correctamente expresadas.                                                            |
| AC-04 | Clear        | —                                                                                               | Sin cambios. `@db.Decimal(14,2)`, `@db.Timestamptz(6)` y `@db.JsonB` correctamente especificados.                              |
| AC-05 | Clear        | —                                                                                               | Sin cambios. Plantilla canónica de timestamps explícita.                                                                      |
| AC-06 | Clear        | —                                                                                               | Sin cambios. Marca `isSeed` obligatoria con valor por defecto `false`.                                                        |
| AC-07 | Clear        | —                                                                                               | Sin cambios. Cita ADR-DB-004, lista los 7 modelos, clarifica coexistencia con `status`/`is_active`.                            |
| AC-08 | Clear        | —                                                                                               | Sin cambios. `@relation` explícito + `Restrict` por defecto + `Cascade` solo en `Budget → BudgetItem`.                         |
| AC-09 | Clear        | —                                                                                               | Sin cambios. Cita ADR-DB-002, declara `id UUID` PK + `code` unique, aclara implicación en US-100.                              |
| AC-10 | Clear        | —                                                                                               | Sin cambios. Modelo `AIPromptVersion` declarado con relación a `AIRecommendation`.                                            |
| AC-11 | Clear        | —                                                                                               | Sin cambios. `npx prisma generate` debe producir Prisma Client sin warnings bloqueantes.                                      |

**Cobertura adicional verificada:** EC-01..EC-04 cubren edge cases (FK inválida, cambio de enum sin migración, omisión de `isSeed`, soft delete faltante). NT-01..NT-08 cubren los casos negativos correspondientes a cada VR.

---

## 6. Gaps Detectados

### Producto / Negocio

No aplica. Las 11 decisiones PO/BA están consolidadas en el Decision Resolution artifact.

### Backend / API

No aplica directamente — US-099 es declaración estática. La integración backend (`prisma generate` dentro del módulo backend) está cubierta por dependencia a PB-P0-002.

### Frontend / UX

No aplica.

### Base de Datos

* `EventType` requiere coordinación con US-100 para migrar `event_types` con `id uuid` PK + `code` unique (no `code` como PK físico). Cubierto vía AC-09.
* Los 7 modelos con soft delete uniforme requieren coordinación con US-101 para índices parciales `WHERE deleted_at IS NULL`. Esto pertenece a US-101 (Index Strategy), no bloquea US-099.
* Los `unique parciales` y `check constraints` necesarios (ej. C-043 reviews, C-060 attachments) pertenecen a US-102.

### Seguridad / Autorización

Cubierto por SEC-01..SEC-05. No introduce endpoints ni runtime authorization en esta historia.

### IA / PromptOps

* `AIPromptVersion` declarado conforme a ADR-AI-006 (estrategia híbrida).
* `AIRecommendationStatus` cubre el flujo human-in-the-loop (compatible con ADR-AI-005).
* El enforcement append-only de `ai_prompt_versions` se documenta como intención y se delega a US-102.

### QA / Testing

Cubierto por TS-01..TS-10 y NT-01..NT-08. Estrategia QA formalizada: `prisma validate` + `prisma generate` + tests estructurales sobre `schema.prisma` con Vitest.

### Seed / Demo

`is_seed` declarado en cada modelo operativo MVP, conforme a Doc 18 §8.5, BR-SEED-005 y NFR-DEMO-003. No requiere cambios adicionales de seed en US-099 — eso pertenece a EPIC-SEED-001.

### Documentación / Trazabilidad

`Related ADR(s)` ya lista los 8 ADRs habilitantes (ADR-ARCH-001, ADR-BE-001, ADR-DB-001, ADR-DB-002, ADR-DB-003, ADR-DB-004, ADR-DB-005, ADR-AI-006). `Related Document(s)` referencia los 7 documentos fuente principales.

---

## 7. Preguntas Pendientes

No pending blocking questions.

Todas las decisiones requeridas para refinar US-099 están formalizadas en `PO/BA Decisions Applied` del User Story y en el Decision Resolution artifact. El siguiente skill recomendado es `eventflow-user-story-approval`.

---

## 8. Documentation Alignment Required

| Documento / Fuente | Conflicto detectado                                                                                                                       | Decisión vigente                                                                                              | Acción recomendada                                                                                                                | ¿Bloquea aprobación? |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| Doc 18 §11/§12     | Declara `event_types \| PK code`; US-099 usa `id UUID` PK + `code` unique.                                                                | ADR-DB-002 (Accepted) — UUID v4 para todas las tablas. PO/BA Decision Applied en US-099 + Decision Resolution §Decisión 4. | Amendar Doc 18 §11 y §12 para alinear con ADR-DB-002 (cambiar PK físico de `event_types` a `id uuid`, `code text unique`).         | No                   |
| Doc 18 §26         | Declara mecanismos mixtos (`is_active`, `status`, `deleted_at` solo en attachments); US-099 estandariza `deletedAt` para los 7 modelos.   | ADR-DB-004 (Accepted) — admite `status` o `deleted_at`. Tech Decision uniforme en `PO/BA Decisions Applied` + Decision Resolution §Decisión 8. | Amendar Doc 18 §26 para reflejar el mecanismo uniforme `deletedAt` y aclarar que `status`/`is_active` permanecen como atributos funcionales. | No                   |
| PB-P0-001 (Backlog Prioritized) — Description | Menciona `VendorWork` y `Task`.                                                                                                           | Doc 6 §6 (línea 144): `VendorPortfolioItem` se cubre con `Attachment` polimórfico. Entidad canónica: `EventTask`. | Amendar la descripción de PB-P0-001 para usar `EventTask` y eliminar `VendorWork`.                                                  | No                   |
| EPIC Map — alias `US-DB-001` | Coexisten `US-DB-001` y `US-099` como referencias a la misma historia.                                                                    | PO/BA Decision Applied: `US-099` es el ID oficial.                                                            | Mantener `US-DB-001` como alias interno o limpiar la referencia del EPIC Map en una pasada de housekeeping documental.            | No                   |

> Los 4 items son **housekeeping documental posterior al merge**. Todos están respaldados por ADRs aceptados o por decisiones PO/BA formalizadas. Ninguno bloquea la aprobación de US-099.

---

## 9. File Update Result

| Campo                                      | Valor                                                                                 |
| ------------------------------------------ | ------------------------------------------------------------------------------------- |
| User Story file updated                    | Yes (actualización mínima: `Last Updated`)                                            |
| User Story file path                       | `management/user-stories/US-099-prisma-schema.md`                                     |
| User Story ID verified                     | Yes (US-099)                                                                          |
| Decision Resolution artifact found         | Yes                                                                                   |
| Decision Resolution path                   | `management/user-stories/decision-resolutions/US-099-decision-resolution.md`          |
| Refinement review artifact created/updated | Yes (evidencia de segunda pasada de validación)                                       |
| Refinement review path                     | `management/user-stories/refinement-reviews/US-099-refinement-review.md`              |
| Final recommended status                   | Ready for Approval                                                                    |
| Next recommended skill                     | `eventflow-user-story-approval`                                                       |
| Reason                                     | Las 11 decisiones PO/BA están formalizadas y consolidadas en el Decision Resolution; AC-01..AC-11 son específicos, testables y vinculados a comportamiento físico verificable; los hallazgos restantes son Documentation Alignment Required (no bloqueantes). |

---

## 10. Cambios Aplicados o Recomendados

### Metadata

* **Aplicado en esta segunda pasada**: `Last Updated` → `2026-06-09 (second refinement validation pass — post decision resolution)`.

### Business Context

Sin cambios.

### PO/BA Decisions Applied

Sin cambios. Las 11 decisiones están consolidadas y respaldadas por el Decision Resolution artifact.

### Traceability

Sin cambios. `Related ADR(s)` ya lista los 8 ADRs habilitantes; `Related Document(s)` ya cubre los 7 documentos fuente principales.

### Scope Guardrails

Sin cambios.

### Acceptance Criteria

Sin cambios. AC-07 y AC-09 ya fueron reforzados en la primera pasada y citan ADR-DB-004 y ADR-DB-002 respectivamente.

### Technical Notes

Sin cambios estructurales.

### QA Notes

Sin cambios. Estrategia ya formalizada (TS-01..TS-10 + NT-01..NT-08 + jobs CI `prisma validate` y `prisma generate`).

### Definition of Ready

Sin cambios — todos los checkboxes están marcados.

### Definition of Done

Sin cambios — la lista DoD cubre todos los puntos requeridos para esta historia técnica.

### Notes

Sin cambios. La sub-sección `Documentation Alignment Required (no bloqueante)` ya lista los 4 items que deben amendarse en documentos fuente posteriores al merge.

---

## 11. Recomendación Final

`Ready for Approval`.

Justificación:

1. **Decision Resolution artifact existe y está consolidado** (`management/user-stories/decision-resolutions/US-099-decision-resolution.md`) con las 11 decisiones PO/BA formalizadas.
2. **Cero preguntas bloqueantes pendientes**. La sección `PO/BA Decisions Applied` del User Story es coherente con el Decision Resolution artifact y con los ADRs aceptados.
3. Los 4 items de **Documentation Alignment Required** son no bloqueantes y constituyen tareas de housekeeping documental que pueden ejecutarse después del merge sin afectar la entrega de US-099.
4. La historia respeta MVP guardrails, principios EventFlow y delegación correcta hacia US-100 (migraciones), US-101 (índices avanzados) y US-102 (constraints C-001..C-062).
5. La calidad de Acceptance Criteria es **alta**: cada AC es específico, testable y vinculado a comportamiento físico verificable.
6. QA strategy es **clara y ejecutable**: `prisma validate` + `prisma generate` + tests estructurales sobre `schema.prisma` con Vitest, cubierto por TS-01..TS-10 + NT-01..NT-08 + jobs CI.
7. La historia es **atómica**, no requiere split y queda lista para pasar por la `Approval Gate`.

---

## Próximo paso

Ejecutar el skill `eventflow-user-story-approval` sobre `management/user-stories/US-099-prisma-schema.md`.

Acciones paralelas de housekeeping documental (no bloqueantes, post-merge):

* Amendar Doc 18 §11 y §12 para alinear con ADR-DB-002 (EventType PK).
* Amendar Doc 18 §26 para reflejar el mecanismo uniforme `deletedAt`.
* Amendar PB-P0-001 (Backlog Prioritized) — Description para usar `EventTask` y eliminar `VendorWork`.
* Limpiar o explicitar el alias `US-DB-001` en el EPIC Map.
