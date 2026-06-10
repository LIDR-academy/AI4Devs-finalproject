# PO/BA Decision Resolution — US-100

## Source User Story File

`management/user-stories/US-100-prisma-migrations.md`

## Source Refinement Review File

`management/user-stories/refinement-reviews/US-100-refinement-review.md`

## Decision Date

2026-06-10

---

## 1. Resumen Ejecutivo

| Campo                                        | Valor                                                                                       |
| -------------------------------------------- | ------------------------------------------------------------------------------------------- |
| User Story ID                                | US-100                                                                                      |
| User Story file path                         | `management/user-stories/US-100-prisma-migrations.md`                                       |
| Refinement review artifact path              | `management/user-stories/refinement-reviews/US-100-refinement-review.md`                    |
| Existing decision resolution found           | No                                                                                          |
| Backlog Item                                 | PB-P0-001 — Database Schema, Migrations & Constraints                                       |
| Epic                                         | EPIC-DB-001 — Database & Prisma Physical Model                                              |
| Estado antes de decisiones                   | Needs Refinement (4 preguntas bloqueantes + 3 recomendaciones)                              |
| Cantidad de preguntas revisadas              | 7 (Q1–Q7)                                                                                   |
| Decisiones PO/BA tomadas                     | 11 decisiones formalizadas (7 respondiendo Q1–Q7 + 4 auxiliares de scope vs US-099/US-137/US-139/EPIC-SEED-001) |
| Decisiones técnicas recomendadas             | 0 abiertas — todas respaldadas por ADR-DB-005 y Doc 21 §10                                  |
| ¿Desbloquea aprobación?                      | Sí                                                                                          |
| User Story file updated                      | Yes (reescritura sustantiva del archivo)                                                    |
| Decision Resolution artifact created/updated | Yes                                                                                         |
| Decision Resolution path                     | `management/user-stories/decision-resolutions/US-100-decision-resolution.md`                |
| Próximo paso recomendado                     | Ejecutar `eventflow-user-story-refinement` en segunda pasada de validación o `eventflow-user-story-approval` directamente |

---

## 2. Decisiones Respondidas

> **Contexto:** la pasada de `eventflow-user-story-refinement` para US-100 retornó `Needs Refinement` con 4 preguntas bloqueantes (Q1–Q4) y 3 recomendaciones (Q5–Q7). Esta pasada las resuelve formalmente, aplica la decomposición operativa ya aprobada en US-099 y consolida los items de Documentation Alignment Required (no bloqueantes).

---

## Decisión 1 — Boundary raw SQL US-100 vs US-101 / US-102 (Q1)

### Pregunta original

> ¿US-100 entrega solo la baseline init migration (schema-derived, sin raw SQL) y delega raw SQL para indices/constraints a US-101/US-102 (resultando en 3-4 archivos migration separados)? ¿O sigue Doc 18 §35.2 que bundles raw SQL dentro del baseline (1 archivo migration)?

### Respuesta PO/BA

US-100 entrega **exclusivamente la baseline init migration derivada del schema declarado en US-099**, sin raw SQL. Los índices funcionales / GIN / parciales se entregan en **US-101** mediante archivo(s) migration separado(s). Los check constraints, unique parciales y enforcement append-only (`ai_prompt_versions`) se entregan en **US-102** mediante archivo(s) migration separado(s). Resulta en 3–4 archivos migration cronológicamente ordenados.

### Decisión formal

```text
US-100 = baseline schema-only migration (sin raw SQL).
US-101 = migration(s) con raw SQL para índices funcionales / GIN / parciales.
US-102 = migration(s) con raw SQL para check constraints, unique parciales, enforcement append-only.
```

### Rationale

* Alineado con la decomposición operativa aprobada en `decision-resolutions/US-099-decision-resolution.md` (Decisión 1) que delega raw SQL a US-101/US-102.
* Cada historia produce un PR atómico y revisable individualmente, con ownership claro por archivo migration.
* Mantiene el principio EventFlow de "Foundation before product": el baseline schema se aplica primero, los refinamientos físicos vienen en historias posteriores.
* Doc 18 §35.2 contradice esta decomposición al bundling raw SQL en el baseline — clasificado como **Documentation Alignment Required** en §5 (no bloqueante).

### Impacto en la User Story

| Sección                 | Cambio requerido                                                                                                  |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------- |
| PO/BA Decisions Applied | Filas `Scope of US-100`, `Raw SQL boundary (Q1)`, `Relationship with US-099/101/102`.                              |
| Scope Guardrails        | `Explicitly Out of Scope` enumera raw SQL para indices/constraints como responsabilidad de US-101/US-102.          |
| Acceptance Criteria     | AC-09 declara explícitamente que `migration.sql` NO contiene raw SQL para indices/constraints.                     |
| Validation Rules        | VR-04 cubre la prohibición.                                                                                        |
| Test Scenarios          | TS-08 y NT-05/NT-06 verifican la ausencia.                                                                         |
| Notes                   | Sub-sección `Documentation Alignment Required` lista Doc 18 §35.2 para amenda post-merge.                          |

### ¿Bloqueaba aprobación?

Sí.

### Validación adicional requerida

No requiere validación adicional. (Acción Documentation Alignment: amendar Doc 18 §35.2 — ver §5.)

---

## Decisión 2 — Rollback strategy: forward-only canónico (Q2)

### Pregunta original

> ¿Rollback strategy: forward-only (canónico Prisma + ADR-DB-005 + Doc 21 §10) o up/down (sugerido por backlog PB-P0-001 "Migraciones reproducibles up/down")? Si forward-only, ¿cómo se amenda la wording del backlog?

### Respuesta PO/BA

**Forward-only canónico Prisma**. Las correcciones se aplican vía migraciones correctivas adicionales. Prisma no genera "down migrations" automáticas y EventFlow no introduce un mecanismo alternativo. La wording "up/down" en PB-P0-001 acceptance summary debe amendarse a "reproducibles" o "forward-only idempotentes".

### Decisión formal

```text
Rollback strategy: forward-only canónico Prisma.
- Correcciones via migraciones correctivas adicionales (nuevas migrations, no edición retroactiva).
- Archivos migration mergeados son inmutables.
- Snapshots / backups previos a `migrate deploy` se delegan a US-137 (RDS) y US-139 (CD pipeline).
- PB-P0-001 acceptance summary debe amendarse para reflejar forward-only (Documentation Alignment Required).
```

### Rationale

* **ADR-DB-005 (Accepted)** establece `prisma migrate` como mecanismo único; Prisma no soporta down migrations nativamente y agregar un mecanismo paralelo violaría el ADR.
* **Doc 21 §10** confirma el flujo `migrate deploy` por entorno sin mencionar down migrations.
* La frase "up/down" en backlog es coloquial para "reproducible" y no obliga a soporte de rollback automático.
* Forward-only es la práctica estándar de la industria con Prisma y simplifica el modelo mental para el equipo.

### Impacto en la User Story

| Sección                 | Cambio requerido                                                                                |
| ----------------------- | ----------------------------------------------------------------------------------------------- |
| PO/BA Decisions Applied | Fila `Rollback strategy (Q2)`.                                                                  |
| Scope Guardrails        | `Explicitly Out of Scope` incluye "Down migrations / rollback automático".                       |
| Acceptance Criteria     | AC-10 declara la política forward-only documentada en README.                                    |
| Validation Rules        | VR-05 (inmutabilidad de archivos mergeados), VR-08 (forward-only).                              |
| Edge Cases              | EC-04 cubre el caso de modificación retroactiva de migration mergeado.                          |
| Notes                   | Documentation Alignment Required lista PB-P0-001 wording.                                       |

### ¿Bloqueaba aprobación?

Sí.

### Validación adicional requerida

No requiere validación adicional. (Acción Documentation Alignment: amendar PB-P0-001 acceptance summary — ver §5.)

---

## Decisión 3 — Drift detection ownership: US-100 (Q3)

### Pregunta original

> ¿Drift detection (`prisma migrate diff --exit-code`) se implementa en US-100 (job CI `migrate-diff` en PR) o se delega a US-139 (pipeline CD)? ADR-DB-005 lo menciona genéricamente.

### Respuesta PO/BA

**US-100 introduce el job CI `prisma-migrate-diff`** que se ejecuta en cada PR (PR-time). US-139 cubre la integración con CD pipeline (deploy-time: `migrate deploy` automático en QA/Demo). Ambos coexisten: PR-time previene drift entre schema y migrations; CD-time aplica migrations al ambiente.

### Decisión formal

```text
Drift detection (`prisma migrate diff --exit-code`):
- US-100: job CI `prisma-migrate-diff` en cada PR (PR-time).
- US-139: orquestación de `migrate deploy` automático en CD a QA/Demo (deploy-time).
```

### Rationale

* **ADR-DB-005** dice "Pipeline CI valida `prisma migrate diff --exit-code` contra `prisma db pull`". Esta es responsabilidad de PR-time gates, no CD.
* El boundary natural: US-100 entrega el archivo migration; US-100 hace cumplir que no exista drift. US-139 entrega el pipeline CD que ejecuta deploy.
* Implementarlo en US-100 mantiene el ciclo "edita schema → genera migration → drift detection valida → PR pasa" cohesivo en una sola historia.

### Impacto en la User Story

| Sección                 | Cambio requerido                                                                |
| ----------------------- | ------------------------------------------------------------------------------- |
| PO/BA Decisions Applied | Fila `Drift detection ownership (Q3)`.                                          |
| Acceptance Criteria     | AC-04 cubre drift detection en CI.                                              |
| Validation Rules        | VR-01 y VR-07.                                                                  |
| Test Scenarios          | TS-04 (drift detection job) y NT-01 (PR sin migration → fallar).                |
| Technical Notes         | `Environment Matrix` documenta el comando en columna CI.                        |
| Definition of Done      | Item para job CI `prisma-migrate-diff` configurado y bloqueando merge.          |

### ¿Bloqueaba aprobación?

Sí.

### Validación adicional requerida

No requiere validación adicional.

---

## Decisión 4 — QA verification approach: tres niveles (Q4)

### Pregunta original

> ¿Cómo se verifica que la baseline migration produce exactamente el schema declarado en US-099? ¿Test estructural sobre la migration SQL, smoke `migrate dev` contra DB efímera, o ambos?

### Respuesta PO/BA

**Tres niveles complementarios**:

1. **Generación**: `npx prisma migrate dev --create-only --name init` produce el archivo `prisma/migrations/<ts>_init/migration.sql`.
2. **Smoke deploy en DB ephemeral**: el job CI `prisma-migrate-smoke` levanta un service container PostgreSQL en GitHub Actions, ejecuta `prisma migrate deploy` desde cero y verifica vía `information_schema.tables` + `information_schema.types` que existen las 19 tablas + 14 enums esperados.
3. **Drift detection**: el job CI `prisma-migrate-diff` corre `prisma migrate diff --exit-code` en cada PR para garantizar consistencia entre `schema.prisma` y las migrations.

### Decisión formal

```text
QA verification approach (tres niveles):
1. Generación local: `prisma migrate dev --create-only --name init`.
2. Smoke deploy CI: PostgreSQL service container + `prisma migrate deploy` + verificación de 19 tablas + 14 enums.
3. Drift detection CI: `prisma migrate diff --from-migrations ./prisma/migrations --to-schema-datamodel ./prisma/schema.prisma --exit-code`.
```

### Rationale

* **ADR-DB-005** (implicaciones de testing) menciona "Smoke test en CI ejecuta migraciones desde cero contra base limpia" → cubierto por nivel 2.
* **Doc 21 §10** confirma `prisma migrate deploy` como comando CI → cubierto por nivel 2.
* Drift detection (nivel 3) protege contra el caso donde alguien edita `schema.prisma` y olvida generar la migration → cubierto por ADR-DB-005 y AC-04.
* Combinar los tres niveles es la práctica estándar de la industria para gates de migraciones.

### Impacto en la User Story

| Sección             | Cambio requerido                                                                                                              |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| PO/BA Decisions Applied | Fila `QA verification approach (Q4)`.                                                                                      |
| Acceptance Criteria | AC-01 (generación), AC-02 (`migrate dev` aplica), AC-03 (idempotency), AC-04 (drift), AC-05 (smoke valida 19 tablas + enums). |
| Validation Rules    | VR-01 (diff en CI), VR-02 (smoke en CI).                                                                                      |
| Test Scenarios      | TS-01..TS-05 cubren los tres niveles.                                                                                          |
| Definition of Done  | Items para jobs CI `prisma-migrate-diff` y `prisma-migrate-smoke`.                                                              |

### ¿Bloqueaba aprobación?

Sí.

### Validación adicional requerida

No requiere validación adicional.

---

## Decisión 5 — Snapshot pre-deploy: delegado a US-137/US-139 (Q5)

### Pregunta original

> ¿`prisma migrate deploy` requiere snapshot/backup automático previo en QA/Demo? Si sí, ¿es responsabilidad de US-100 o US-139/US-137?

### Respuesta PO/BA

**Delegado a US-137 (Connect RDS PostgreSQL) y US-139 (Prisma migrations in pipeline)**. US-100 documenta el requisito como nota: "Snapshot RDS automático antes de `migrate deploy` en QA/Demo es responsabilidad del provisioning y del pipeline CD". US-100 NO implementa el snapshot.

### Decisión formal

```text
Snapshot pre-deploy:
- US-137 configura el snapshot automático RDS (database-level).
- US-139 invoca el snapshot antes de `migrate deploy` en pipeline CD (orquestación-level).
- US-100 documenta el requisito como nota; no lo implementa.
```

### Rationale

* US-100 opera a nivel de generación de migration + scripts npm; no toca infraestructura RDS ni pipeline CD.
* US-137 es el lugar natural para definir la política de backups/snapshots RDS (configuración del recurso).
* US-139 orquesta el ciclo CD completo incluyendo pre/post hooks.

### Impacto en la User Story

| Sección                 | Cambio requerido                                                          |
| ----------------------- | ------------------------------------------------------------------------- |
| PO/BA Decisions Applied | Fila `Snapshot pre-deploy (recommendation Q5)`.                            |
| Scope Guardrails        | `Explicitly Out of Scope` incluye snapshot/backup automático.              |
| Notes                   | Mención explícita del handoff a US-137 / US-139.                          |

### ¿Bloqueaba aprobación?

No (recomendación).

### Validación adicional requerida

No requiere validación adicional.

---

## Decisión 6 — Runbook location: README backend + Doc 21 §10 (Q6)

### Pregunta original

> ¿Se documenta el flujo de desarrollo (`prisma migrate dev`) en el README del backend o se delega a `/docs/21-Deployment-and-DevOps-Design.md`?

### Respuesta PO/BA

**Ambos**, con jerarquía clara: el **README del backend** (`apps/backend/README.md` o equivalente) tiene una sección `Database Migrations` con los comandos cotidianos (`db:migrate:dev`, `db:migrate:deploy`, `db:migrate:status`, `db:migrate:diff`) y la política forward-only + `migrate reset` block. Esta sección **cita Doc 21 §10 como source of truth operativa** para la matriz completa de entornos.

### Decisión formal

```text
Runbook location:
- README backend: sección `Database Migrations` con comandos cotidianos + política forward-only + `migrate reset` block.
- Doc 21 §10: source of truth operativa para matriz completa de entornos.
- README cita Doc 21 §10 explícitamente.
```

### Rationale

* El README backend es el primer punto de contacto para desarrolladores que clonan el repositorio.
* Doc 21 §10 ya existe y cubre la matriz multi-entorno completa.
* Evitar duplicación: comandos cotidianos en README, política completa en Doc 21.

### Impacto en la User Story

| Sección                 | Cambio requerido                                                                  |
| ----------------------- | --------------------------------------------------------------------------------- |
| PO/BA Decisions Applied | Fila `Runbook location`.                                                          |
| Technical Notes         | Topic `Runbook` apunta a README backend + Doc 21 §10.                             |
| Definition of Done      | Item para README backend documentando matriz de entornos y políticas.             |

### ¿Bloqueaba aprobación?

No (recomendación).

### Validación adicional requerida

No requiere validación adicional.

---

## Decisión 7 — `prisma migrate reset` policy (Q7)

### Pregunta original

> ¿`migrate reset` está permitido en local (desarrollo) y prohibido en CI/QA/Demo? ¿Lint/script wrapper que falle ante `migrate reset` en pipelines?

### Respuesta PO/BA

**Permitido solo en local. Bloqueado en CI/QA/Demo vía wrapper script env-aware**. US-100 implementa el wrapper script (ej. `scripts/db-migrate-reset.sh`) que detecta `CI=true` o `NODE_ENV !== "local"` y falla con exit code distinto de 0. Documentado en README backend.

### Decisión formal

```text
`prisma migrate reset` policy:
- Permitido en local (desarrollo).
- Bloqueado en CI/QA/Demo vía wrapper script env-aware (`scripts/db-migrate-reset.sh` o equivalente).
- El wrapper falla con exit code distinto de 0 si detecta CI=true o NODE_ENV !== "local".
- Política documentada en README backend.
```

### Rationale

* `prisma migrate reset` destruye datos: en QA/Demo destruiría datos seed y rompería la demo académica.
* El wrapper script es la forma más simple de enforcement sin requerir cambios en Prisma.
* Pueden coexistir CSP adicionales (ej. IAM en producción) — esa capa se cubre en US-139.

### Impacto en la User Story

| Sección                 | Cambio requerido                                                                                       |
| ----------------------- | ------------------------------------------------------------------------------------------------------ |
| PO/BA Decisions Applied | Fila `prisma migrate reset policy`.                                                                    |
| Scope Guardrails        | Scope Notes incluye la política.                                                                       |
| Acceptance Criteria     | AC-10 menciona el bloqueo en pipelines.                                                                |
| Edge Cases              | EC-03 cubre ejecución accidental.                                                                      |
| Validation Rules        | VR-06.                                                                                                 |
| Test Scenarios          | NT-03 verifica el bloqueo en CI.                                                                       |
| Definition of Done      | Item para wrapper script + documentación.                                                              |

### ¿Bloqueaba aprobación?

No (recomendación).

### Validación adicional requerida

No requiere validación adicional.

---

## Decisión 8 — `prisma/seed.ts` location: EPIC-SEED-001

### Pregunta original

> Inferida del refinement review §6 (Seed/Demo gaps) y Doc 18 §35.2 línea 1465 que sugiere incluir `prisma/seed.ts` en el baseline.

### Respuesta PO/BA

**`prisma/seed.ts` y los fixtures pertenecen a EPIC-SEED-001 (US-085, US-086, US-087, US-088), no a US-100**. US-100 puede declarar el bloque `prisma.seed` en `package.json` apuntando al script futuro, pero NO implementa el seed real.

### Decisión formal

```text
prisma/seed.ts NO se entrega en US-100.
Pertenece a EPIC-SEED-001 (US-085 Run seed script, US-086 Admin reset demo, US-087 Seed event mix, US-088 Seed confirmed booking intent).
US-100 puede declarar el bloque `prisma.seed` en package.json como placeholder.
```

### Rationale

* EPIC-SEED-001 tiene 4 historias dedicadas al seed; duplicarlo en US-100 introduciría scope creep.
* Doc 18 §35.2 menciona `prisma/seed.ts` como parte del baseline por simplicidad histórica; debe amendarse.

### Impacto en la User Story

| Sección                 | Cambio requerido                                                                  |
| ----------------------- | --------------------------------------------------------------------------------- |
| PO/BA Decisions Applied | Fila `prisma/seed.ts location`.                                                   |
| Scope Guardrails        | `Explicitly Out of Scope` incluye `prisma/seed.ts` + fixtures.                     |
| Notes                   | Documentation Alignment Required incluye Doc 18 §35.2 línea 1465.                  |

### ¿Bloqueaba aprobación?

No (auxiliar de scope).

### Validación adicional requerida

No requiere validación adicional.

---

## Decisión 9 — Owner update

### Respuesta PO/BA

El `Owner` original (`Product Owner / Business Analyst`) era inexacto para una historia 100% técnica. Se actualiza a `Tech Lead / Backend Lead`.

### Decisión formal

```text
Owner: Tech Lead / Backend Lead.
```

### Rationale

US-100 es una capacidad técnica de fundación; el ownership operativo recae en el liderazgo técnico.

### Impacto en la User Story

| Sección  | Cambio requerido                              |
| -------- | --------------------------------------------- |
| Metadata | `Owner: Tech Lead / Backend Lead`.            |

### ¿Bloqueaba aprobación?

No.

### Validación adicional requerida

No requiere validación adicional.

---

## Decisión 10 — Status transition

### Respuesta PO/BA

Tras aplicar las decisiones Q1–Q7 + auxiliares, US-100 deja `Draft` y pasa a **`Ready for Approval`**.

### Decisión formal

```text
Status: Ready for Approval (no Approved — eso pertenece al Approval Gate).
```

### Rationale

* Las 4 preguntas bloqueantes (Q1–Q4) están resueltas formalmente.
* Las 3 recomendaciones (Q5–Q7) están resueltas.
* Los 4 items de Documentation Alignment Required no bloquean (respaldados por ADR-DB-005 o decisiones PO/BA formalizadas).
* Las ACs reescritas son testeables (AC-01..AC-10).
* Las VR son enforceable (VR-01..VR-08).
* La historia respeta MVP guardrails y delega correctamente a US-099/US-101/US-102/US-137/US-139/EPIC-SEED-001.

### Impacto en la User Story

| Sección  | Cambio requerido                                                                  |
| -------- | --------------------------------------------------------------------------------- |
| Metadata | `Status: Ready for Approval`, `Last Updated: 2026-06-10 (PO/BA decision resolution pass)`. |

### ¿Bloqueaba aprobación?

—

### Validación adicional requerida

Opcional: segunda pasada de `eventflow-user-story-refinement` para validación adicional. Recomendado: `eventflow-user-story-approval` directamente.

---

## Decisión 11 — Traceability ampliada

### Respuesta PO/BA

La sección Traceability original era insuficiente (`ADR-ARCH-001, ADR-BE-001`, `NFR-PERF-API-001, NFR-OBS-001`). Se amplía con los ADRs y NFRs realmente aplicables.

### Decisión formal

```text
Related ADR(s): ADR-ARCH-001, ADR-BE-001, ADR-DB-001, ADR-DB-002, ADR-DB-003, ADR-DB-004, ADR-DB-005.
NFR Reference(s): NFR-DATA-001..NFR-DATA-008, NFR-DEMO-003, NFR-OBS-001.
Related Document(s): /docs/14-Backend-Technical-Design.md, /docs/18-Database-Physical-Design.md §10/§35.2, /docs/21-Deployment-and-DevOps-Design.md §10, /docs/22-Architecture-Decision-Records.md (ADR-DB-005).
```

### Rationale

ADR-DB-001..ADR-DB-005 son las decisiones arquitectónicas habilitantes. NFR-DATA-001..008 y NFR-DEMO-003 son los NFRs realmente afectados por la gestión de migraciones. Doc 14, Doc 18 §10/§35.2 y Doc 21 §10 son las fuentes operativas.

### Impacto en la User Story

| Sección      | Cambio requerido                                                                  |
| ------------ | --------------------------------------------------------------------------------- |
| Traceability | Reescrita con la lista ampliada.                                                  |

### ¿Bloqueaba aprobación?

No (housekeeping de trazabilidad).

### Validación adicional requerida

No requiere validación adicional.

---

## 3. Consolidated Decision Table

|  # | Tema                                              | Decisión                                                                                                            | Tipo                              | ¿Bloqueaba aprobación? | Validación adicional |
| -: | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | --------------------------------- | ---------------------- | -------------------- |
|  1 | Boundary raw SQL US-100 vs US-101/US-102 (Q1)     | US-100 baseline schema-only sin raw SQL. US-101 indices. US-102 constraints.                                        | Tech + PO                         | Sí                     | —                    |
|  2 | Rollback strategy (Q2)                            | Forward-only canónico Prisma. Snapshots delegados a US-137/US-139.                                                  | PO + Tech (ADR-DB-005)            | Sí                     | —                    |
|  3 | Drift detection ownership (Q3)                    | US-100 introduce job CI `prisma-migrate-diff` (PR-time). US-139 cubre CD.                                           | Tech (ADR-DB-005)                 | Sí                     | —                    |
|  4 | QA verification approach (Q4)                     | Tres niveles: generación local + smoke deploy CI (DB ephemeral) + drift detection CI.                                | QA + Tech                         | Sí                     | —                    |
|  5 | Snapshot pre-deploy (Q5)                          | Delegado a US-137 (RDS) + US-139 (CD pipeline).                                                                     | Tech Recommendation               | No                     | —                    |
|  6 | Runbook location (Q6)                             | README backend + cita a Doc 21 §10 como source of truth operativa.                                                  | PO Recommendation                 | No                     | —                    |
|  7 | `prisma migrate reset` policy (Q7)                | Permitido en local; bloqueado en pipelines vía wrapper script env-aware.                                            | Tech Recommendation               | No                     | —                    |
|  8 | `prisma/seed.ts` location                         | Pertenece a EPIC-SEED-001 (US-085..US-088), no a US-100.                                                            | PO + BA                           | No                     | —                    |
|  9 | Owner update                                      | `Tech Lead / Backend Lead` (no `Product Owner / Business Analyst`).                                                 | BA                                | No                     | —                    |
| 10 | Status transition                                 | `Draft` → `Ready for Approval`.                                                                                     | BA                                | —                      | —                    |
| 11 | Traceability ampliada                             | ADR-DB-001..005 + NFR-DATA-001..008 + NFR-DEMO-003 + Doc 14/18/21/22 referenciados.                                  | BA                                | No                     | —                    |

---

## 4. Cambios Aplicados a la User Story

> El archivo `management/user-stories/US-100-prisma-migrations.md` fue **reescrito sustantivamente** porque el estado original era una plantilla genérica sin contenido aplicable. La reescritura aplica las 11 decisiones formalizadas en §2.

### Metadata

* `Backlog Item: PB-P0-001 — Database Schema, Migrations & Constraints` (agregada).
* `Owner: Tech Lead / Backend Lead` (antes: `Product Owner / Business Analyst`).
* `Status: Ready for Approval` (antes: `Draft`).
* `Last Updated: 2026-06-10 (PO/BA decision resolution pass)`.

### User Story Statement

Reescrito desde el placeholder de plantilla: `As the sistema EventFlow, I want generar la baseline init migration derivada de prisma/schema.prisma (US-099) y operar el flujo prisma migrate dev (local) + prisma migrate deploy (CI/QA/Demo) forward-only, con drift detection en CI, So that los entornos Local / CI / QA / Demo mantengan el schema sincronizado de forma reproducible, idempotente, auditada y libre de SQL crudo no controlado.`

### Business Context

* `Context Summary` reescrito con scope concreto y entregables (baseline migration, scripts npm, jobs CI, smoke test, matriz de entornos).
* `Related Domain Concepts` enlazado a los 19 modelos + 14 enums de US-099 y a las convenciones físicas.

### PO/BA Decisions Applied

Nueva tabla con 13 decisiones formalizadas (Q1–Q7 + 6 auxiliares de scope vs US-099/US-137/US-139/EPIC-SEED-001 + `prisma migrate reset` + baseline naming + runbook).

### Assumptions

Reescritas con 7 asunciones específicas (schema US-099 mergeado, `DATABASE_URL` en env, PostgreSQL 14+, módulo backend disponible, sin pooling especial, Prisma versionado, Prisma Client validado en CI).

### Dependencies

* US-099 (precondición fuerte).
* PB-P0-002 (backend bootstrap).
* `DATABASE_URL` env.
* Doc 14, Doc 18 §10/§35.2, Doc 21 §10, Doc 22 (ADR-DB-001, ADR-DB-005).

### Traceability

Reescrita con ADR-DB-001..005 + NFR-DATA-001..008 + NFR-DEMO-003 + Doc 14/18/21/22.

### Scope Guardrails

* `MVP Scope` reescrito con scope boundary explícito.
* `Explicitly Out of Scope` enumera US-101, US-102, US-139, US-137, EPIC-SEED-001, down migrations, etc.
* `Scope Notes` cubre flujo por entorno + política forward-only + `migrate reset` block.

### Acceptance Criteria

Reescritos completamente: AC-01..AC-10 testeables (antes: AC-01/AC-02 genéricos no testeables).

### Edge Cases

Reescritos: EC-01 (drift no detectado), EC-02 (migration parcialmente aplicada), EC-03 (migrate reset accidental en pipeline), EC-04 (modificación retroactiva de migration mergeado).

### Validation Rules

Ampliadas de VR-01 (única) a VR-01..VR-08 cubriendo diff/smoke/secret-scan/raw-SQL-ausente/inmutabilidad/migrate-reset-block/include-migration-en-PR/forward-only.

### Authorization & Security Rules

Reescritas: SEC-01..SEC-05 cubren ausencia de secretos en migration, env vars para DATABASE_URL, logs sin secretos, ejecución limitada a pipeline, `migrate reset` block.

### Technical Notes

* `Backend`: scripts, runbook, `migrate reset` policy.
* `Database`: baseline migration path, environment matrix, forward-only policy, raw SQL boundary.

### Test Scenarios

Reescritos: TS-01..TS-08 + NT-01..NT-06.

### Definition of Ready

Actualizada con 7 checkboxes para Q1–Q7 + checkboxes estándar. Todos marcados.

### Definition of Done

Lista expandida con items específicos para baseline migration, scripts, CI jobs, secret scan, wrapper script, README, ausencia de raw SQL, tests TS/NT.

### Notes

Sub-sección `Documentation Alignment Required (no bloqueante)` con 3 items: Doc 18 §35.2 (raw SQL bundle), Doc 18 §35.2 línea 1465 (`prisma/seed.ts`), PB-P0-001 (wording "up/down").

---

## 5. Documentation Alignment Required

| Documento / Fuente                                                 | Conflicto detectado                                                                                                                              | Decisión vigente                                                                                                                                  | Acción recomendada                                                                                                                          | ¿Bloquea aprobación? |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| Doc 18 §35.2 (línea 1385–1387)                                     | Declara baseline `20260601000000_init` con raw SQL para unique parciales, check constraints, índice funcional email, default `valid_until`.       | US-099 + US-100 split aprobado: raw SQL en migrations separadas (US-101 índices, US-102 constraints).                                              | Amendar Doc 18 §35.2 para reflejar el split. No bloquea US-100.                                                                              | No                   |
| Doc 18 §35.2 (línea 1465)                                          | Menciona `prisma/seed.ts` como parte del baseline.                                                                                              | Decision §8: `prisma/seed.ts` pertenece a EPIC-SEED-001 (US-085..US-088), no a US-100.                                                            | Amendar Doc 18 §35.2 para excluir `prisma/seed.ts` de US-100.                                                                                | No                   |
| PB-P0-001 (`management/artifacts/4-Product-Backlog-Prioritized.md`) — Acceptance Summary | Wording: "Migraciones reproducibles up/down".                                                                                                  | Decision §2: forward-only canónico Prisma (ADR-DB-005).                                                                                            | Amendar wording a "Migraciones reproducibles forward-only con `migrate deploy` idempotente".                                                  | No                   |

> Ninguno de estos items bloquea la aprobación de US-100. Todos están respaldados por ADRs aceptados (ADR-DB-005) o por decisiones PO/BA formalizadas en este artefacto. Son **tareas de housekeeping documental** posteriores al merge.

---

## 6. File Update Result

| Campo                                        | Valor                                                                                       |
| -------------------------------------------- | ------------------------------------------------------------------------------------------- |
| User Story file updated                      | Yes (reescritura sustantiva del archivo)                                                    |
| User Story file path                         | `management/user-stories/US-100-prisma-migrations.md`                                       |
| Decision Resolution artifact created/updated | Yes                                                                                         |
| Decision Resolution path                     | `management/user-stories/decision-resolutions/US-100-decision-resolution.md`                |
| New User Story status                        | Ready for Approval                                                                          |
| Remaining blockers                           | No                                                                                          |
| Reason                                       | Las 4 preguntas bloqueantes (Q1–Q4) están resueltas formalmente. Las 3 recomendaciones (Q5–Q7) están resueltas. Los 4 items de Documentation Alignment Required son housekeeping documental no bloqueante. |

---

## 7. Estado recomendado después de aplicar decisiones

`Ready for Approval`.

Justificación:

1. Las 11 decisiones PO/BA críticas para US-100 están **formalizadas** en `PO/BA Decisions Applied` del User Story y consolidadas en este Decision Resolution artifact.
2. Las 4 preguntas bloqueantes (Q1–Q4) están resueltas con respaldo de ADR-DB-005, Doc 21 §10 y la decomposición operativa aprobada en US-099.
3. Las 3 recomendaciones (Q5–Q7) están resueltas; ninguna abre nueva incógnita técnica.
4. Los 3 items de **Documentation Alignment Required** son no bloqueantes (respaldados por ADR-DB-005 o decisiones PO/BA formalizadas).
5. La historia respeta MVP guardrails, principios EventFlow y delegación correcta hacia US-099, US-101, US-102, US-137, US-139, EPIC-SEED-001.
6. La calidad de la historia es **alta**: AC-01..AC-10 son específicos y testables, VR-01..VR-08 son enforceable, NFRs y BRs referenciados existen en la documentación.

---

## 8. Próximo Paso Recomendado

`Run User Story Approval Gate`.

Secuencia recomendada:

```text
1. (Opcional) Ejecutar nuevamente `eventflow-user-story-refinement` sobre US-100 para una segunda pasada de validación.
   Resultado esperado: Ready for Approval con `No pending blocking questions`.

2. Ejecutar `eventflow-user-story-approval` sobre:
   management/user-stories/US-100-prisma-migrations.md

3. Una vez aprobada, ejecutar `eventflow-user-story-technical-spec` para generar el Technical Specification en
   management/technical-specs/P0/PB-P0-001/US-100-technical-spec.md

4. Ejecutar `eventflow-user-story-to-development-tasks` para generar el desglose técnico de tareas.

5. (Housekeeping documental, paralelo y no bloqueante) Programar la corrección de los 3 items de Documentation Alignment Required:
   - Doc 18 §35.2 línea 1385–1387 (split US-100/US-101/US-102 para raw SQL).
   - Doc 18 §35.2 línea 1465 (`prisma/seed.ts` → EPIC-SEED-001).
   - PB-P0-001 acceptance summary (wording "up/down" → forward-only).
```
