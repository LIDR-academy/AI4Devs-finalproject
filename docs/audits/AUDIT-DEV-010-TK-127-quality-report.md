# 📊 Informe de Auditoría de Código VSDD — Ticket TK-127

* **ID Auditoría:** AUDIT-DEV-010
* **Fecha:** 2026-09-07
* **Reviewer:** Agente principal en rol de Reviewer Independiente Adversarial
* **Ticket Evaluado:** [TK-127](../05_agile_planning/12_tickets/recipes/backend/TK-127.md) — Deuda de Calidad y Eficiencia del Módulo de Recetas (AUDIT-DEV-007 G-C: F-5/F-7/F-8/F-10)

---

## 📋 Resumen por Fases

| Fase | Resultado |
| :-- | :-- |
| 0 — Reglas / cascada | PASÓ |
| 1 — Mutation ≥ 70% | PASÓ (scoped) |
| 2 — Arquitectura / SOLID | PASÓ |
| 3 — Anti-Drift / Build | PASÓ |
| 4 — Seguridad / Sanitización / Entornos | PASÓ |
| 5 — UI / WCAG | N/A (backend puro) |

## FASE 0

* Guard 26: `TK-127.md` con `related_story: N/A (Técnico … · AUDIT-DEV-007 F-5/F-7/F-8/F-10)`, cita el informe. Test decisivo: el contrato de forma de `POST /recipes` y `GET /recipes` no cambia. **F-10 endurece la validación de entradas ya malformadas** — `quantity: "abc"` / `0` pasa de HTTP 500 (revienta en `new DecimalQuantity`) a 400; una receta con el mismo `insumoId` dos veces pasa de 201 a 400. Ambos son endurecimiento de un comportamiento mal implementado (carve-out C-DEV-006-4), no una regla de negocio nueva — un `quantity` no numérico y una línea de ingrediente duplicada nunca fueron entradas válidas de la spec. Filas en `indice_tickets.md` (matriz + backend + prosa), `13_matriz_trazabilidad.md`, `14_backlog_map.md`. **PASÓ.**
* `backend_rules.md §3` (Precisión Decimal Exacta en Zod, TK-078) aplicada: el regex `^\d{1,8}(\.\d{1,4})?$` coincide con `RecipeIngredient.quantity Decimal(12,4)` — más estricto que el `DecimalString` genérico del contrato, que es exactamente lo que la regla exige.

## FASE 1 — Mutation (scoped)

| Archivo | Score | Nota |
| :-- | :-- | :-- |
| `CreateRecipeUseCase.ts` | **88.89%** | 16 killed / 2 survived |
| `InMemoryRecipeRepository.ts` | **87.50%** | |
| `SuggestRescueRecipesUseCase.ts` | **73.02%** | primera corrida bajó a 66% al quitar el guard muerto `matching.length === 0`; se añadieron tests de desempate por merma (F-16), fallback `Insumo`/`UNIDAD`, descripción propia y umbral `hoursRemaining === 48` → 73% |

`recipes.controller.ts` es infraestructura y queda fuera del `mutate` scope de `stryker.conf.json` por diseño (`backend_rules.md`, nota TK-078) — el schema Zod se cubre con los tests de integración de `ManageRecipes.test.ts` (9 casos, incluye los 2 nuevos de 400). Sin tests tautológicos: `CreateRecipeUseCase.test.ts` (nuevo, co-locado, Guard 21) ejercita ids inyectados, no-persistencia ante insumo inexistente, y dedupe de lookups; `InMemoryRecipeRepository.test.ts` ejercita `findByInsumoIds` (unión, lista vacía, sin match) y el reemplazo de composición al re-guardar. **PASÓ.**

## FASE 2 — Arquitectura

* **Aislamiento:** `CreateRecipeUseCase` deja de llamar `crypto.randomUUID()` — depende del puerto `IdGenerator` (mismo patrón que `RecordExtractionUseCase`/`DiscardRemanenteUseCase` tras AUDIT-DEV-006). `SuggestRescueRecipesUseCase` sigue dependiendo solo de `IRecipeRepository`.
* **ISP:** `IRecipeRepository` gana `findByInsumoIds` — método específico, no interfaz monolítica; ambos adaptadores (Prisma + InMemory) lo implementan (LSP).
* **DIP en routers:** `recipes.routes.ts` inyecta `cryptoIdGenerator` (constante compartida, no `new` en la ruta) — Guard 18 OK.
* **Cálculo fuera de infra:** `findByInsumoIds` solo filtra/transporta filas (`where … some … in`), no calcula reglas de negocio — cumple `backend_rules.md §2`.
* **Duplicación (`check_ticket_duplication.sh`):** 20 → 20, sin clones nuevos.
* **Complejidad (`check_ticket_code_quality.sh`):** verde. `assertInsumosExist` extraído como método privado; `createRecipeSchema` con `quantitySchema` factorizado.
* **Código muerto (`check_dead_code.sh`):** verde sobre el diff.

## FASE 3 — Anti-Drift / Build

* `check_contract_drift.sh` → *"Sin drift detectado"*. `openapi.yaml` y `schema.prisma` sin cambios. El Zod más estricto que `DecimalString` es una restricción del subconjunto aceptado, no un cambio de path ni de forma — `oasdiff` no aplica (no se tocó `openapi.yaml`).
* `pnpm run build` → Done.
* **Persistencia CLI:** no aplica (no toca seed/Docker/CI). El fix de `PrismaRecipeRepository.save` (F-5, rama `update`) no tiene test unitario dedicado — patrón del proyecto (los `Prisma*Repository` no se testean unitariamente, `testing_rules.md`); se cubre con el test de `InMemoryRecipeRepository` que fija el contrato "re-guardar reemplaza la composición" y se valida en el smoke de despliegue. **NO bloqueante** — el cambio Prisma es una alineación mecánica al mismo contrato (`deleteMany: {}` + `create`).

## FASE 4 — Seguridad

* **Sanitización (Guard, F-10):** `createRecipeSchema` — `quantity` con regex + `> 0`; `name` ≤ 120, `category` ≤ 60, `description` ≤ 500, `ingredients` ≤ 50; `.superRefine` rechaza `insumoId` duplicado con mensaje explicativo → `respondValidationError` (RFC 7807, `title: ValidationError`, 400). Cierra el hueco de `quantity: "abc"` → 500 no capturado (Guard 2/19).
* **RBAC:** sin cambios (`requireRole('ADMIN')` en el alta).
* **IDs:** `IdGenerator` (uuid v4) elimina la colisión de PK por milisegundo que tendría `crypto.randomUUID()`… en realidad `randomUUID` no colisiona; el valor real del cambio es la pureza hexagonal y la testabilidad determinista. Sin regresión.
* **Precisión (Guard 17):** `DecimalQuantity` en toda cantidad; regex alineado a la escala física.
* Sin `catch` vacío, sin secreto hardcodeado, sin dependencia nueva.

## FASE 5 — N/A

Backend puro.

---

## 🚨 Defectos Detectados

Ninguno bloqueante.

* **O-1 (Info):** `PrismaRecipeRepository.save` (F-5) sin test unitario — mitigado por el contrato fijado en `InMemoryRecipeRepository.test.ts` + patrón del proyecto. Se recomienda un test de integración con Postgres real cuando se implemente el endpoint `PUT /recipes` (que es el que realmente ejercita esta rama).
* **O-2 (Resuelto durante la auditoría):** el guard `matching.length === 0` de `rankCatalogRecipes` quedó muerto tras el cambio a `findByInsumoIds` (código muerto → Guard 5, y mutantes inmatables). Se eliminó; `rankCatalogRecipes` documenta ahora que su input viene pre-filtrado.

## 🔁 Candidatos a Regla Permanente

Ninguno nuevo. TK-127 aplica reglas existentes (`backend_rules.md §2/§3`, patrón `IdGenerator` de AUDIT-DEV-006). El gate determinista "regex de campo decimal debe coincidir con la escala física de su columna" ya está en `backend_rules.md §3` desde TK-078; su promoción a script (`check_zod_decimal_scale.sh`) sigue siendo deuda de tooling común a todo el repo, no específica de este ticket.

---

## ⚖️ VEREDICTO FINAL

**APROBADO PARA COMMIT**

TK-127 cierra G-C de `AUDIT-DEV-007`: el `CreateRecipeUseCase` usa el puerto `IdGenerator` y valida insumos en batch, el schema Zod del alta rechaza en la frontera lo que antes reventaba con 500, la rama `update` de Prisma ya reconstruye la composición, y el ranking de rescate deja de cargar todo el catálogo. Contrato HTTP intacto, gates verdes, `CreateRecipeUseCase` gana su primer test (mutation 88.89%). La paginación del listado y los N+1 de disponibilidad quedan explícitamente diferidos con justificación.
