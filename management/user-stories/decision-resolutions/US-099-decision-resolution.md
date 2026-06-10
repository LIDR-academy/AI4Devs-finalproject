# PO/BA Decision Resolution — US-099

## Source User Story File

`management/user-stories/US-099-prisma-schema.md`

## Source Refinement Review File

`management/user-stories/refinement-reviews/US-099-refinement-review.md`

## Decision Date

2026-06-09

---

## 1. Resumen Ejecutivo

| Campo                                        | Valor                                                                                       |
| -------------------------------------------- | ------------------------------------------------------------------------------------------- |
| User Story ID                                | US-099                                                                                      |
| User Story file path                         | `management/user-stories/US-099-prisma-schema.md`                                           |
| Refinement review artifact path              | `management/user-stories/refinement-reviews/US-099-refinement-review.md`                    |
| Existing decision resolution found           | No                                                                                          |
| Backlog Item                                 | PB-P0-001 — Database Schema, Migrations & Constraints                                       |
| Epic                                         | EPIC-DB-001 — Database & Prisma Physical Model                                              |
| Estado antes de decisiones                   | Ready for Approval (con Documentation Alignment Required no bloqueante)                     |
| Cantidad de preguntas revisadas              | 0 preguntas bloqueantes + 4 items de Documentation Alignment formalizados                   |
| Decisiones PO/BA tomadas                     | 11 decisiones formalizadas (9 originales + 2 incorporadas en la pasada de refinación)       |
| Decisiones técnicas recomendadas             | 0 recomendaciones técnicas pendientes — todas respaldadas por ADRs aceptados                |
| ¿Desbloquea aprobación?                      | Sí                                                                                          |
| User Story file updated                      | Yes (actualización mínima: `Last Updated` refleja la pasada de resolución de decisiones)    |
| Decision Resolution artifact created/updated | Yes                                                                                         |
| Decision Resolution path                     | `management/user-stories/decision-resolutions/US-099-decision-resolution.md`                |
| Próximo paso recomendado                     | Ejecutar `eventflow-user-story-approval` sobre `management/user-stories/US-099-prisma-schema.md` |

---

## 2. Decisiones Respondidas

> **Contexto:** la pasada de `eventflow-user-story-refinement` para US-099 retornó `Ready for Approval` con la nota explícita `No pending blocking questions`. Por lo tanto, este artefacto no resuelve preguntas pendientes nuevas: **formaliza** todas las decisiones que ya estaban aplicadas o respaldadas por documentación / ADRs, y consolida los items de Documentation Alignment Required (no bloqueantes) para evitar que futuras pasadas de refinación reabran las mismas conversaciones.

---

## Decisión 1 — Alcance de US-099 vs US-100/US-101/US-102

### Pregunta original

> ¿Qué incluye exactamente US-099 y qué se delega a US-100 (migraciones), US-101 (índices avanzados) y US-102 (constraints C-001..C-062)?

### Respuesta PO/BA

US-099 cubre **exclusivamente** la declaración estática del archivo `prisma/schema.prisma` y la generación exitosa del Prisma Client mediante `npx prisma validate` y `npx prisma generate`. Las migraciones ejecutables, los índices funcionales / GIN / parciales y los constraints físicos avanzados quedan formalmente delegados a US-100, US-101 y US-102 respectivamente.

### Decisión formal

```text
US-099 entrega únicamente prisma/schema.prisma + Prisma Client generado.
US-100 entrega prisma migrate dev / prisma migrate deploy y migraciones SQL ejecutables.
US-101 entrega índices avanzados (funcionales, GIN, parciales).
US-102 entrega check constraints, unique parciales y enforcement C-001..C-062.
```

### Rationale

* Mantiene la historia atómica y entregable en un solo PR.
* Permite paralelizar trabajo posterior sobre la misma fundación de schema.
* Refleja la separación natural Prisma declarativo → migraciones → índices avanzados → constraints físicos descrita en Doc 18 §10 (Estrategia Prisma) y ADR-DB-005 (Prisma Migrations con Raw SQL solo para constraints no soportadas).

### Impacto en la User Story

| Sección                 | Cambio requerido                                                                |
| ----------------------- | ------------------------------------------------------------------------------- |
| PO/BA Decisions Applied | Ya formalizado (filas `Scope of US-099`, `Relationship with US-100/101/102`).   |
| Scope Guardrails        | Ya formalizado en `Explicitly Out of Scope` y `Scope Notes`.                    |
| Assumptions             | Ya formalizado.                                                                 |

### ¿Bloqueaba aprobación?

No (ya estaba formalizado).

### Validación adicional requerida

No requiere validación adicional.

---

## Decisión 2 — ID oficial de la historia

### Pregunta original

> ¿`US-099` o `US-DB-001` es el ID oficial?

### Respuesta PO/BA

`US-099` es el ID oficial. `US-DB-001` queda como alias interno del Epic Map y no tiene valor funcional.

### Decisión formal

```text
ID oficial: US-099. US-DB-001 queda como alias interno del Epic Map sin impacto en trazabilidad.
```

### Rationale

* Consistencia con el formato numérico secuencial usado en el resto del backlog (`management/user-stories/US-001..US-150`).
* Evita ambigüedad cuando la historia se referencia desde PRs, tests y documentación.

### Impacto en la User Story

| Sección                 | Cambio requerido                                |
| ----------------------- | ----------------------------------------------- |
| Metadata                | Ya refleja `ID: US-099`.                        |
| PO/BA Decisions Applied | Ya formalizado en la fila `Official ID`.        |

### ¿Bloqueaba aprobación?

No.

### Validación adicional requerida

No requiere validación adicional. (Acción de housekeeping documental: limpiar la referencia `US-DB-001` en el EPIC Map cuando se haga una pasada general — ver §5.)

---

## Decisión 3 — Estrategia `AIPromptVersion` (híbrida)

### Pregunta original

> ¿`AIPromptVersion` vive en código, en BD, o en ambos?

### Respuesta PO/BA

Estrategia híbrida: el `PromptRegistry` versionado vive **en código** (con ID estable, locale, versión semántica y schema Zod asociado) y la tabla `ai_prompt_versions` vive en **BD** para trazabilidad y para que cada `AIRecommendation` referencie la versión exacta del prompt usado.

### Decisión formal

```text
PromptOps híbrido: prompt registry estático en código + tabla AIPromptVersion para trazabilidad y referencia desde AIRecommendation. ai_prompt_versions es append-only.
```

### Rationale

* Aplicación directa de **ADR-AI-006 (Accepted)** — `Version Prompts Through Prompt Registry and AIPromptVersion`.
* Combina estabilidad (código) con trazabilidad histórica (BD).
* Permite a auditorías académicas y de QA reconstruir qué versión de prompt generó cada output IA.

### Impacto en la User Story

| Sección                 | Cambio requerido                                                                  |
| ----------------------- | --------------------------------------------------------------------------------- |
| PO/BA Decisions Applied | Ya formalizado en la fila `AIPromptVersion strategy`.                             |
| Traceability            | Ya incluye `ADR-AI-006` tras la pasada de refinación.                             |
| Acceptance Criteria     | AC-10 cubre la declaración del modelo `AIPromptVersion` y su relación con `AIRecommendation`. |
| AI Behavior             | Ya documenta que el carácter append-only se documenta como intención y que el enforcement pertenece a US-102. |

### ¿Bloqueaba aprobación?

No.

### Validación adicional requerida

No requiere validación adicional.

---

## Decisión 4 — `EventType` PK (UUID PK + `code` unique)

### Pregunta original

> ¿`EventType` usa `code` como PK física (Doc 18 §11/§12) o `id UUID` PK + `code` unique?

### Respuesta PO/BA

`EventType` usa `id UUID` como Primary Key y `code String` como identificador funcional único (`@unique`).

### Decisión formal

```text
EventType: id UUID PK (@id @default(uuid()) @db.Uuid) + code text unique (@unique). La migración derivada (US-100) generará event_types con id uuid PK y code text unique, no con code como PK físico.
```

### Rationale

* Aplicación directa de **ADR-DB-002 (Accepted)** — `Use UUID v4 as Primary Identifier Strategy` para **todas** las tablas.
* IDs opacos en URLs (no enumerables), compatibles con seeds determinísticos.
* Permite mantener `code` como identificador funcional estable consumible por seed, IA y UI, pero sin atarlo a la PK física.
* Doc 18 §11/§12 contradice ADR-DB-002 en este punto — clasificado como **Documentation Alignment Required** en §5.

### Impacto en la User Story

| Sección                 | Cambio requerido                                                                     |
| ----------------------- | ------------------------------------------------------------------------------------ |
| PO/BA Decisions Applied | Ya formalizado en `EventType PK` + nueva fila `EventType PK precedence`.             |
| Acceptance Criteria     | AC-09 reforzado en la pasada de refinación: cita ADR-DB-002 y aclara implicación en US-100. |
| Validation Rules        | Ya cubierto por VR-09.                                                               |
| Technical Notes         | §`EventType` ya documenta `id UUID` PK + `code` unique.                              |
| Test Scenarios          | TS-08 y NT-07 ya cubren el caso.                                                     |

### ¿Bloqueaba aprobación?

No.

### Validación adicional requerida

No requiere validación adicional. (Acción Documentation Alignment: amendar Doc 18 §11/§12 — ver §5.)

---

## Decisión 5 — Enums Prisma separados por entidad

### Pregunta original

> ¿Un único enum genérico `Status` para múltiples entidades, o enums separados por entidad con máquinas de estado propias?

### Respuesta PO/BA

Enums separados por entidad. No se reutiliza un enum genérico `Status`.

### Decisión formal

```text
Cada entidad con máquina de estados propia declara su enum de status independiente (EventStatus, QuoteRequestStatus, QuoteStatus, BookingIntentStatus, ReviewStatus, NotificationStatus, AttachmentStatus, VendorProfileStatus, VendorServiceStatus, AIRecommendationStatus). Enums base globales: UserRole, CurrencyCode, LanguageCode, LLMProvider.
```

### Rationale

* Cada máquina de estados tiene transiciones y semánticas distintas (ej. `QuoteStatus` `draft → sent → accepted/rejected/expired` vs `EventStatus` `draft → published → cancelled`).
* Un enum genérico forzaría a la BD a aceptar transiciones inválidas o requeriría check constraints complejos.
* Aplicación directa de Doc 18 §9.1 (enums nativos por entidad) + buenas prácticas de DDD.

### Impacto en la User Story

| Sección                 | Cambio requerido                                                          |
| ----------------------- | ------------------------------------------------------------------------- |
| PO/BA Decisions Applied | Ya formalizado en `Status enums`.                                         |
| Acceptance Criteria     | AC-02 ya cubre la declaración de enums separados.                         |
| Validation Rules        | VR-08 ya cubre la prohibición del enum genérico.                          |
| Technical Notes         | §`Required Status Enums by Entity` ya enumera los 10 enums obligatorios.  |
| Test Scenarios          | TS-07 y NT-06 ya cubren el caso.                                          |

### ¿Bloqueaba aprobación?

No.

### Validación adicional requerida

No requiere validación adicional.

---

## Decisión 6 — Estrategia QA

### Pregunta original

> ¿Qué framework y qué nivel de profundidad debe tener la cobertura QA sobre `schema.prisma`?

### Respuesta PO/BA

QA debe cubrir tres niveles:

1. `npx prisma validate` en CI (validación nativa Prisma).
2. `npx prisma generate` en CI (verificación del Prisma Client).
3. Tests estructurales sobre `schema.prisma` (Vitest).

### Decisión formal

```text
QA strategy para US-099: prisma validate (CI) + prisma generate (CI) + tests estructurales con Vitest que inspeccionan schema.prisma como texto o estructura parseada ligera.
```

### Rationale

* `prisma validate` y `prisma generate` son las puertas oficiales del CLI Prisma.
* Tests estructurales en Vitest aseguran que las convenciones EventFlow específicas (`isSeed`, `deletedAt`, `@@map`, `@map`, `@db.Decimal(14,2)`, `@db.Timestamptz(6)`, `@db.JsonB`) no se omitan en futuras edicions del schema.
* Vitest es el stack de testing aprobado para EventFlow (Doc 20 — Testing Strategy).

### Impacto en la User Story

| Sección                 | Cambio requerido                                                       |
| ----------------------- | ---------------------------------------------------------------------- |
| PO/BA Decisions Applied | Ya formalizado en `QA strategy`.                                       |
| Acceptance Criteria     | AC-01, AC-11 cubren `prisma validate` y `prisma generate`.             |
| Test Scenarios          | TS-01..TS-10 + NT-01..NT-08 cubren la matriz de pruebas estructurales. |
| Definition of Done      | Ya lista los jobs CI verdes y los tests estructurales.                 |

### ¿Bloqueaba aprobación?

No.

### Validación adicional requerida

No requiere validación adicional.

---

## Decisión 7 — Inclusión de `Location` y `ServiceCategory`

### Pregunta original

> ¿`Location` y `ServiceCategory` se declaran desde US-099 o se posponen?

### Respuesta PO/BA

Se incluyen desde US-099 como modelos MVP obligatorios.

### Decisión formal

```text
Location y ServiceCategory forman parte del schema MVP inicial declarado en US-099.
```

### Rationale

* Doc 6 §6/§9 los lista como entidades MVP explícitas.
* Doc 18 §11/§12 los confirma como tablas físicas (`locations`, `service_categories`).
* Posponerlos bloquearía Vendor Directory (EPIC-VND-001), Quote Flow (EPIC-QR-001), filtros de búsqueda y categorías sugeridas por IA.

### Impacto en la User Story

| Sección                 | Cambio requerido                                                                       |
| ----------------------- | -------------------------------------------------------------------------------------- |
| PO/BA Decisions Applied | Ya formalizado en `Location and ServiceCategory`.                                      |
| Acceptance Criteria     | AC-01 los incluye en los 19 modelos MVP.                                               |
| Technical Notes         | §`Main Models` y §`Soft Delete` los listan.                                            |
| Definition of Done      | Ya lista `Location y ServiceCategory declarados como modelos MVP`.                     |

### ¿Bloqueaba aprobación?

No.

### Validación adicional requerida

No requiere validación adicional.

---

## Decisión 8 — Mecanismo uniforme de soft delete (`deletedAt`)

### Pregunta original

> ¿Soft delete se implementa con mecanismos mixtos por entidad (`is_active`, `status`, `deleted_at` solo en attachments — Doc 18 §26) o con un mecanismo uniforme (`deletedAt` para los 7 modelos)?

### Respuesta PO/BA

Mecanismo uniforme: los 7 modelos con soft delete declaran un campo canónico `deletedAt DateTime? @map("deleted_at") @db.Timestamptz(6)`. Los atributos funcionales `status` y `is_active` permanecen en cada entidad para representar su máquina de estados de visibilidad, pero **la marca canónica de soft delete es `deletedAt`** y los filtros estándar usan `deletedAt IS NULL`.

### Decisión formal

```text
Mecanismo uniforme de soft delete: deletedAt DateTime? @map("deleted_at") @db.Timestamptz(6) en los 7 modelos (Review, Attachment, VendorProfile, VendorService, ServiceCategory, EventType, Location). Filtro estándar: deletedAt IS NULL. status / is_active coexisten como atributos funcionales pero NO son el marcador canónico de soft delete.
```

### Rationale

* **ADR-DB-004 (Accepted)** — `Use Soft Delete for Historical or Moderated Entities` explícitamente admite `status` **o** `deleted_at`. La elección uniforme es válida bajo el ADR.
* Un mecanismo uniforme reduce la complejidad cognitiva en repositorios, simplifica el filtro implícito `where: { deletedAt: null }` y evita errores por inconsistencia entre entidades.
* Doc 18 §26 propone mecanismos mixtos — clasificado como **Documentation Alignment Required** en §5 (no bloqueante).
* La set de 7 entidades coincide exactamente con Doc 18 §26 (no introduce nuevos modelos con soft delete).

### Impacto en la User Story

| Sección                 | Cambio requerido                                                                                                          |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| PO/BA Decisions Applied | Ya formalizado en la fila `Soft delete mechanism` (incorporada en la pasada de refinación).                              |
| Acceptance Criteria     | AC-07 reforzado: cita ADR-DB-004, aclara que `status`/`is_active` coexisten y que `deletedAt` es el marcador canónico.   |
| Validation Rules        | VR-07 ya cubre la obligatoriedad.                                                                                         |
| Technical Notes         | §`Soft Delete` ya enumera los 7 modelos y la declaración Prisma.                                                          |
| Test Scenarios          | TS-05 y NT-05 ya cubren el caso.                                                                                          |
| Notes                   | Documentation Alignment Required: Doc 18 §26 debe amendarse para reflejar el mecanismo uniforme.                          |

### ¿Bloqueaba aprobación?

No.

### Validación adicional requerida

No requiere validación adicional. (Acción Documentation Alignment: amendar Doc 18 §26 — ver §5.)

---

## Decisión 9 — Marca `is_seed` obligatoria

### Pregunta original

> ¿`is_seed` es obligatorio en todos los modelos MVP operativos?

### Respuesta PO/BA

Sí, obligatorio en todos los modelos MVP operativos.

### Decisión formal

```text
Cada modelo MVP operativo declara isSeed Boolean @default(false) @map("is_seed"). Habilita reset quirúrgico del entorno demo vía DELETE WHERE is_seed = true.
```

### Rationale

* Doc 18 §8.5 — `is_seed boolean NOT NULL DEFAULT false` en todas las tablas operativas.
* BR-SEED-005 — flag `seed: true` o equivalente para distinguir datos seed de datos de demo.
* NFR-DEMO-003 — el seed debe poder ejecutarse idempotente vía un comando documentado.
* Sin esta marca, el reset quirúrgico del entorno demo deja de funcionar.

### Impacto en la User Story

| Sección                 | Cambio requerido                                                              |
| ----------------------- | ----------------------------------------------------------------------------- |
| PO/BA Decisions Applied | Implícito en `QA strategy` y `Scope Notes`.                                   |
| Acceptance Criteria     | AC-06 cubre la declaración obligatoria.                                       |
| Validation Rules        | VR-06 ya cubre la obligatoriedad.                                             |
| Technical Notes         | §`Seed Convention` ya documenta la declaración.                               |
| Test Scenarios          | TS-04 y NT-03 ya cubren el caso.                                              |
| Edge Cases              | EC-03 cubre la omisión de `isSeed`.                                           |

### ¿Bloqueaba aprobación?

No.

### Validación adicional requerida

No requiere validación adicional.

---

## Decisión 10 — Estrategia de relaciones (`@relation` + `onDelete`)

### Pregunta original

> ¿Qué estrategia `onDelete` se aplica a las FKs del schema?

### Respuesta PO/BA

* Toda relación FK usa `@relation` explícito.
* `onDelete: Restrict` por defecto.
* `onDelete: Cascade` se permite **únicamente** en composición pura `Budget → BudgetItem`.

### Decisión formal

```text
@relation explícito en todas las FKs. onDelete: Restrict por defecto. onDelete: Cascade solo en Budget → BudgetItem (composición pura).
```

### Rationale

* Doc 18 §10.4 y §26.1 — FKs a tablas con soft delete usan `ON DELETE RESTRICT` para forzar la disciplina.
* `Budget → BudgetItem` es la única composición 1:N donde el padre y los hijos comparten un único ciclo de vida (un evento solo tiene un presupuesto, y borrar el presupuesto implica borrar sus items).
* Cualquier otra cascada (ej. borrar `Event` y eliminar `EventTask`, `Budget`, `QuoteRequest`) sería destructiva y rompería la auditoría y la trazabilidad.

### Impacto en la User Story

| Sección                 | Cambio requerido                                                |
| ----------------------- | --------------------------------------------------------------- |
| Acceptance Criteria     | AC-08 ya cubre la estrategia.                                   |
| Validation Rules        | VR-03 ya cubre la obligatoriedad de `@relation` explícito.      |
| Technical Notes         | §`Relation Strategy` ya documenta la decisión.                  |
| Test Scenarios          | NT-04 cubre el caso de FK sin `@relation`.                      |

### ¿Bloqueaba aprobación?

No.

### Validación adicional requerida

No requiere validación adicional.

---

## Decisión 11 — Modelado de `Role`, `Currency`, `Language` como enums (no tablas)

### Pregunta original

> ¿`Role`, `Currency` y `Language` se modelan como tablas o como enums?

### Respuesta PO/BA

Se modelan como **enums Prisma** (`UserRole`, `CurrencyCode`, `LanguageCode`), no como tablas.

### Decisión formal

```text
Role → enum UserRole (organizer, vendor, admin). Currency → enum CurrencyCode (GTQ, EUR, MXN, COP, USD, mínimo). Language → enum LanguageCode (es-LATAM, es-ES, pt, en). Sin tablas físicas para estos catálogos cerrados.
```

### Rationale

* Doc 18 §11 (líneas 277, 296, 297) — `Role`, `Currency` y `Language` se modelan como enums sin tabla.
* Doc 6 §6 — `Role` es "enum cerrado"; `Currency` y `Language` son catálogos derivados con conjunto finito conocido.
* Los enums Prisma proveen validación de tipo en tiempo de compilación y eliminan la necesidad de JOINs para catálogos cerrados.
* `Location` y `ServiceCategory` SÍ se modelan como tablas porque crecen y tienen atributos no constantes (Doc 18 §11 nota 299).

### Impacto en la User Story

| Sección                 | Cambio requerido                                                                          |
| ----------------------- | ----------------------------------------------------------------------------------------- |
| Acceptance Criteria     | AC-02 declara `UserRole`, `CurrencyCode`, `LanguageCode` como enums base.                 |
| Technical Notes         | §`Required Base Enums` ya enumera los 4 enums base obligatorios.                          |
| Related Domain Concepts | Ya describe el conjunto de 19 entidades MVP físicas (sin `Role` como tabla).              |

### ¿Bloqueaba aprobación?

No.

### Validación adicional requerida

No requiere validación adicional.

---

## 3. Consolidated Decision Table

|  # | Tema                                                       | Decisión                                                                                                          | Tipo  | ¿Bloqueaba aprobación? | Validación adicional |
| -: | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ----- | ---------------------- | -------------------- |
|  1 | Alcance US-099 vs US-100/US-101/US-102                     | US-099 = schema declarativo. US-100/101/102 = migraciones/índices/constraints.                                    | PO    | No                     | —                    |
|  2 | ID oficial                                                 | `US-099`. `US-DB-001` es alias interno.                                                                           | PO    | No                     | —                    |
|  3 | `AIPromptVersion` estrategia                               | Híbrida (código + tabla). Aplica ADR-AI-006.                                                                      | PO + Tech (ADR) | No           | —                    |
|  4 | `EventType` PK                                             | `id UUID` PK + `code` unique. Aplica ADR-DB-002.                                                                  | PO + Tech (ADR) | No           | —                    |
|  5 | Enums Prisma                                               | Enums separados por entidad. Prohibido enum genérico `Status`.                                                    | PO + BA | No                   | —                    |
|  6 | Estrategia QA                                              | `prisma validate` + `prisma generate` + tests estructurales Vitest.                                               | QA + PO | No                   | —                    |
|  7 | Inclusión `Location` + `ServiceCategory`                   | Incluidos en schema MVP inicial.                                                                                  | PO    | No                     | —                    |
|  8 | Mecanismo uniforme soft delete                             | `deletedAt` uniforme en los 7 modelos. Aplica ADR-DB-004 (que admite `status` o `deleted_at`).                    | Tech + PO | No                 | —                    |
|  9 | `is_seed` obligatorio                                      | `isSeed Boolean @default(false) @map("is_seed")` en cada modelo MVP operativo.                                    | PO + BA | No                   | —                    |
| 10 | Relaciones (`@relation`, `onDelete: Restrict` por defecto) | `@relation` explícito; `onDelete: Restrict` por defecto; `Cascade` solo en `Budget → BudgetItem`.                 | Tech + PO | No                 | —                    |
| 11 | `Role`/`Currency`/`Language` como enums                    | `UserRole`, `CurrencyCode`, `LanguageCode` como enums Prisma; sin tablas físicas.                                 | Tech + PO | No                 | —                    |

---

## 4. Cambios Aplicados a la User Story

> La pasada de refinación previa ya aplicó los cambios estructurales al archivo `management/user-stories/US-099-prisma-schema.md` (extensión del `PO/BA Decisions Applied`, refuerzo de AC-07 y AC-09, ampliación de `Related ADR(s)`, nueva sub-sección `Documentation Alignment Required (no bloqueante)` en `Notes`). Esta pasada de resolución de decisiones aplica un cambio mínimo de metadata:

### Metadata

* `Last Updated` → `2026-06-09 (PO/BA decision resolution pass)`.

### Business Context

Sin cambios adicionales.

### PO/BA Decisions Applied

Sin cambios adicionales. Las 11 decisiones están formalizadas y reflejadas en la sección.

### Assumptions

Sin cambios adicionales.

### Scope Guardrails

Sin cambios adicionales.

### Acceptance Criteria

Sin cambios adicionales. AC-07 y AC-09 ya fueron reforzados en la pasada de refinación.

### Technical Notes

Sin cambios adicionales.

### QA Notes

Sin cambios adicionales.

### Definition of Ready

Sin cambios adicionales. Todos los checkboxes ya están marcados.

### Definition of Done

Sin cambios adicionales.

### Notes

Sin cambios adicionales. La sub-sección `Documentation Alignment Required (no bloqueante)` ya cubre los 4 items.

---

## 5. Documentation Alignment Required

| Documento / Fuente | Conflicto detectado | Decisión vigente | Acción recomendada | ¿Bloquea aprobación? |
| ------------------ | ------------------- | ---------------- | ------------------ | -------------------- |
| Doc 18 §11 / §12   | Declara `event_types` con PK `code`. | US-099 + ADR-DB-002 (Accepted): `id UUID` PK + `code` unique. | Amendar Doc 18 §11 y §12 para alinear con ADR-DB-002 (cambiar PK físico de `event_types` a `id uuid`, `code text unique`). | No |
| Doc 18 §26         | Declara mecanismos mixtos de soft delete (`is_active`, `status`, `deleted_at` solo en attachments). | US-099 + ADR-DB-004 (Accepted, que admite `status` o `deleted_at`): mecanismo uniforme `deletedAt`. | Amendar Doc 18 §26 para reflejar el mecanismo uniforme `deletedAt` y aclarar que `status`/`is_active` permanecen como atributos funcionales. | No |
| PB-P0-001 (`management/artifacts/4-Product-Backlog-Prioritized.md`) — Description | Menciona `VendorWork` y `Task`. | Doc 6 §6 (línea 144): `VendorPortfolioItem` se cubre con `Attachment` polimórfico. Entidad canónica: `EventTask`. | Amendar la descripción de PB-P0-001 para usar `EventTask` y eliminar `VendorWork`. | No |
| EPIC Map (`management/artifacts/1-EventFlow-Epic-Map.md`) — Alias `US-DB-001` | Coexisten `US-DB-001` y `US-099` como referencias a la misma historia. | PO/BA Decision Applied: `US-099` es el ID oficial. | Limpiar la referencia del EPIC Map en una pasada de housekeeping documental, o mantener `US-DB-001` explícitamente como alias interno. | No |

> Ninguno de estos items bloquea la aprobación de US-099. Todos están respaldados por ADRs aceptados o por decisiones PO/BA formalizadas. Son **tareas de housekeeping documental** posteriores al merge.

---

## 6. File Update Result

| Campo                                        | Valor                                                                                       |
| -------------------------------------------- | ------------------------------------------------------------------------------------------- |
| User Story file updated                      | Yes (actualización mínima: `Last Updated` refleja la pasada de resolución de decisiones)    |
| User Story file path                         | `management/user-stories/US-099-prisma-schema.md`                                           |
| Decision Resolution artifact created/updated | Yes                                                                                         |
| Decision Resolution path                     | `management/user-stories/decision-resolutions/US-099-decision-resolution.md`                |
| New User Story status                        | Ready for Approval                                                                          |
| Remaining blockers                           | No                                                                                          |
| Reason                                       | No quedaban preguntas bloqueantes pendientes. Las 11 decisiones PO/BA están formalizadas y respaldadas por ADRs aceptados. Los items de Documentation Alignment Required son housekeeping documental no bloqueante. |

---

## 7. Estado recomendado después de aplicar decisiones

`Ready for Approval`.

Justificación:

1. Las 11 decisiones PO/BA críticas para US-099 están **formalizadas** en `PO/BA Decisions Applied`, replicadas en este artefacto de Decision Resolution y respaldadas por ADRs aceptados (ADR-DB-001..ADR-DB-005, ADR-AI-006) o por documentos fuente vinculantes (Doc 6, Doc 18).
2. **No quedan preguntas bloqueantes pendientes** ni decisiones técnicas, QA o de seguridad que requieran validación adicional.
3. Los 4 items de **Documentation Alignment Required** son no bloqueantes y constituyen tareas de housekeeping documental que pueden ejecutarse después del merge sin afectar la entrega de US-099.
4. La historia respeta MVP guardrails, principios EventFlow y delegación correcta hacia US-100, US-101 y US-102.
5. La calidad de la historia es **alta**: cada AC es testable, cada VR es enforceable, cada NFR y BR referenciada existe en la documentación.

---

## 8. Próximo Paso Recomendado

`Run User Story Approval Gate`.

Secuencia recomendada:

```text
1. Revisar el archivo actualizado:
   management/user-stories/US-099-prisma-schema.md

2. (Opcional) Ejecutar nuevamente `eventflow-user-story-refinement` si se desea una segunda pasada de validación.
   Resultado esperado: Ready for Approval con `No pending blocking questions`.

3. Ejecutar `eventflow-user-story-approval` sobre:
   management/user-stories/US-099-prisma-schema.md

4. Una vez aprobada, ejecutar `eventflow-user-story-to-development-tasks` para generar el desglose de tareas técnicas.

5. (Housekeeping documental, paralelo y no bloqueante) Programar la corrección de los 4 items de Documentation Alignment Required:
   - Doc 18 §11/§12 (EventType PK).
   - Doc 18 §26 (soft delete uniforme).
   - PB-P0-001 (VendorWork / Task → EventTask).
   - EPIC Map (alias US-DB-001).
```
