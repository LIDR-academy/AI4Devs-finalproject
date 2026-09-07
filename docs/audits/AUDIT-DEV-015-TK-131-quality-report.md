# 📊 Informe de Auditoría de Código VSDD — Ticket TK-131

* **ID Auditoría:** AUDIT-DEV-015
* **Fecha:** 2026-09-07
* **Reviewer:** Agente principal en rol de Reviewer Independiente Adversarial
* **Ticket:** [TK-131](../05_agile_planning/12_tickets/recipes/backend/TK-131.md) — `PUT` / `DELETE /api/v1/recipes/:id` (US-037)

---

## 📋 Resumen por Fases

| Fase | Resultado |
| :-- | :-- |
| 0 — Reglas / cascada | PASÓ |
| 1 — Mutation ≥ 70% | PASÓ (scoped, 93.22% agregado) |
| 2 — Arquitectura / SOLID | PASÓ |
| 3 — Anti-Drift / Build | PASÓ (contrato **aditivo** en forma; cambio de **comportamiento** de `GET /recipes` documentado) |
| 4 — Seguridad / Sanitización | PASÓ |
| 5 — UI / WCAG | N/A (backend) — cubierto por `TK-131-FE` |

## FASE 0 — Reglas / cascada

* Cascada completa: **US-037** (`catalog/`, INVEST + 5 escenarios BDD + decisión Guard 28 fechada 2026-09-07), `openapi.yaml` (`PUT` + `DELETE /recipes/{id}` + `UpdateRecipeRequest`), `TK-131` (backend, `status: approved`) + `TK-131-FE`. `related_story: US-037`. Cierra `AUDIT-DEV-012` C-2 y `US-012` §[N]egociable ("edición/baja de recetas" fuera de alcance del alta).
* **Guard 28:** la decisión de negocio está literal en `US-037` §Decisiones — soft-delete por `onDelete: Restrict`, `PUT` libre salvo composición si hay `RecipePreparation` `CLOSED`. Se refleja 1:1 en `RecipeCompositionLockedException` (409) y en `UpdateRecipeUseCase.assertCompositionEditable`.
* **Carve-out C-DEV-006-4:** no aplica — hubo US/TK reales antes del código.

## FASE 1 — Mutation (scoped)

`npx stryker run --mutate "src/application/recipes/use-cases/UpdateRecipeUseCase.ts,src/application/recipes/use-cases/DeactivateRecipeUseCase.ts,src/domain/recipes/entities/Recipe.ts"`

| Archivo | Score | Umbral |
| :-- | :-- | :-- |
| `domain/recipes/entities/Recipe.ts` (`withDetails` + `deactivated`) | **100.00%** | 70 |
| `application/recipes/use-cases/DeactivateRecipeUseCase.ts` | **83.33%** | 70 |
| `application/recipes/use-cases/UpdateRecipeUseCase.ts` | **92.86%** | 70 |
| **Agregado** | **93.22%** | 70 (break) |

* Primera pasada: `UpdateRecipeUseCase` 77.78%. Superado tras: (a) **simplificar** el ternario redundante `dto.description === undefined ? undefined : dto.description` → `dto.description` (idéntico; `Recipe.withDetails` ya distingue `undefined`=conserva / `null`=limpia) — eliminó 3 mutantes supervivientes y una rama muerta; (b) 4 tests nuevos en `UpdateRecipeUseCase.test.ts`: recorte de `name`/`category`, prefijo `ri-` de los ingredientes reconstruidos, `description:null` limpia + omitir conserva, y **una `RecipePreparation` `CLOSED` de OTRA receta no bloquea** la edición de ingredientes de la receta en curso (mataba el mutante `preparation.recipeId === recipeId → true`).
* Supervivientes residuales (4): literales de string en mensajes de `EntityNotFoundException` (`'Recipe'`, `'Insumo'`) y un `StringLiteral` en el mensaje de `DeactivateRecipeUseCase` — texto de error no aseverado, sin valor de negocio. Aceptados.
* Tests: `Recipe.test.ts` (4), `UpdateRecipeUseCase.test.ts` (11 — 5 escenarios BDD + trim + ids + description + prep-de-otra-receta + OPEN-no-bloquea + 404), `ManageRecipes.test.ts` (+5 integración `PUT`/`DELETE`), `InMemoryRecipeRepository.test.ts` (+1 `isActive` desaparece de los 3 lectores).

## FASE 2 — Arquitectura

* **Dominio:** `Recipe` gana `isActive` como **6º parámetro con default `= true`** — no rompe ningún `new Recipe(...)` existente. `withDetails(patch)` es inmutable y copia **exhaustiva** (id, ingredients y `isActive` sobreviven a la edición de metadatos). `deactivated()` preserva id/nombre/categoría/composición para la trazabilidad histórica. Sin imports de infra.
* **Application:**
  * `UpdateRecipeUseCase` depende solo de puertos (`IRecipeRepository`, `IInsumoRepository`, `IdGenerator`, `IRecipePreparationRepository`). `assertInsumosExist` valida en batch (`Promise.all` sobre ids únicos) — mismo criterio que `CreateRecipeUseCase` (F-7/TK-127). `execute` complejidad 8 (≤10) gracias a `assertCompositionEditable` / `assertInsumosExist` / `buildIngredients` extraídos.
  * `DeactivateRecipeUseCase` mínimo: `findById` → 404 → `save(recipe.deactivated())`.
  * `RecipeCompositionLockedException extends DomainError` con `statusCode 409` — `errorHandler.ts` lo mapea sin cambios.
* **Infra:**
  * `InMemoryRecipeRepository` y `PrismaRecipeRepository` filtran `isActive: true` en `findById` / `findAll` / `findByInsumoIds`. Prisma pasa de `findUnique` a `findFirst` (compuesto `id + isActive`). `save` persiste `isActive` en ambas ramas del `upsert`; `toDomain` lo lee.
  * `recipes.routes.ts` recibe `preparationRepository?` como parámetro nuevo (patrón de `kitchen.routes.ts`); `updateRecipeUseCase` solo se construye si está presente → `PUT` se registra condicionalmente; `DELETE` siempre (no necesita preparaciones). `app.ts` pasa `recipePreparationRepo` ya en scope.
  * `recipes.controller.ts`: `updateRecipeSchema` con `.strict('Ese campo no se puede editar en una receta.')`, todos los campos opcionales, `minProperties` implícito por `.superRefine`. **Duplicación:** la 1ª pasada de `check_ticket_duplication.sh` marcó 2 clones nuevos (bloque `catch (ZodError)` vs. `stock.controller.ts`, y el loop `superRefine` de-dupe interno). Resueltos extrayendo `rejectDuplicateInsumoId(ingredients, ctx)` + constantes `ingredientSchema` / `ingredientsArraySchema` compartidas entre `createRecipeSchema` y `updateRecipeSchema`, y unificando los `catch` de los 3 handlers de body en `handleZodOrNext(req, res, next, error)`. Clones repo 18 → **17** (bajó uno).
  * `check_ticket_code_quality.sh` (13 archivos): verde — complejidad/longitud/profundidad.
  * `check_dead_code.sh`: verde en el diff del ticket (6 hallazgos preexistentes fuera de scope, informativos).

## FASE 3 — Anti-Drift / Build

* **Contrato:** `PUT` + `DELETE /api/v1/recipes/{id}` + `UpdateRecipeRequest` (`additionalProperties: false`, `minProperties: 1`, `description` `nullable`, `ingredients` `minItems:1`/`maxItems:50` reusando `CreateRecipeIngredient`). `oasdiff` → **sin breaking changes** (rutas y schema nuevos). `check_contract_drift.sh` verde (Zod ↔ OpenAPI alineados). Spectral **0 errores** (75 warnings preexistentes de `operation-tag-defined`).
* **Cambio de comportamiento documentado:** `GET /api/v1/recipes` ahora **oculta** las recetas `isActive:false`. Es un cambio de *comportamiento*, no de *forma* del contrato — `oasdiff` no lo detecta; queda anotado en la fila de trazabilidad de TK-131 y en `US-037` Escenario 4.
* **Migración:** `20260907140000_add_recipe_is_active` — `ALTER TABLE "Recipe" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true` (aditiva, filas existentes quedan activas). `check_migration_schema_parity.sh` → Postgres efímero, `migrate deploy`, **sin drift** contra `schema.prisma`. `check_seed_idempotency.sh` → 2 corridas, 0 duplicados.
* **Build/Lint:** `pnpm run build` Done (backend + frontend). `pnpm run lint` 0 errores. `pnpm test` → **565 backend / 237 frontend** verdes.

## FASE 4 — Seguridad / Sanitización

* **RBAC:** `router.put('/:id', requireRole('ADMIN'), ...)` y `router.delete('/:id', requireRole('ADMIN'), ...)` — mismo guard que el alta. Tests `403` para `KITCHEN_STAFF` en ambos verbos (`ManageRecipes.test.ts` Escenario 5).
* **Sanitización:** `updateRecipeSchema` — `name` `min(1).max(120)`, `category` `min(1).max(60)`, `description` `max(500).nullable()`, `quantity` regex `^\d{1,8}(\.\d{1,4})?$` (escala `RecipeIngredient.quantity Decimal(12,4)`, `backend_rules.md §3`), de-dupe de `insumoId` en `.superRefine`. `.strict()` → `isActive` u otra clave desconocida responde **400** (test explícito), nunca se aplica en silencio → no hay vía de reactivación ni de forzado de `isActive` por el body.
* **Integridad referencial:** ningún `PUT` persiste una composición con `insumoId` inexistente (`assertInsumosExist` → `EntityNotFoundException` 404). El soft-delete nunca toca `RecipePreparation` (`onDelete: Restrict` sigue vigente; solo cambia `isActive`).
* **Regla de negocio de trazabilidad:** editar `ingredients` de una receta con preparación `CLOSED` → **409**, sin cambio parcial (la excepción se lanza antes de cualquier `save`). Verificado con test que asevera que los ingredientes originales siguen intactos tras el 409.
* Sin secreto hardcodeado, sin `catch` vacío, sin dependencia nueva. **Sin fuga de datos del restaurante al modelo** — este ticket no toca la ruta de IA; las recetas dadas de baja además **desaparecen** del ranking CATALOG de rescate (`findByInsumoIds` filtra `isActive`).

## FASE 5 — N/A (backend puro). La UI de edición/baja va en `TK-131-FE`.

---

## 🚨 Defectos Detectados

Ninguno bloqueante.

* **O-1 (Info):** `assertCompositionEditable` hace `preparationRepository.findByStatus('CLOSED')` y filtra en memoria por `recipeId`. Carga **todas** las preparaciones cerradas del sistema para responder una pregunta booleana sobre una. Aceptable hoy (volumen bajo, mismo patrón que otros consumidores de `findByStatus`); el óptimo sería un `existsClosedForRecipe(recipeId)` en el puerto — anotado como deuda, no se crea regla.
* **O-2 (Info):** `PrismaRecipeRepository.save` en la rama `update` hace `ingredients: { deleteMany: {}, create: ... }` **también** para un `deactivated()` — un soft-delete recicla las filas `RecipeIngredient` (mismo id, borrado + recreación). Resultado final correcto e idempotente; es churn innecesario. Heredado de F-5/TK-127. Optimizable separando "editar metadatos" de "reemplazar composición" en el repo.
* **O-3 (Info):** `updateRecipeUseCase` / `deactivateRecipeUseCase` se inyectan como parámetros **opcionales** (`?`) al `RecipesController` con `throw new Error('...no configurado')` en el handler — `backend_rules.md §3` lo desaconseja, pero es el patrón **preexistente** del controller (`suggestRescueRecipesUseCase`). Uniformidad > divergencia; el saneo del controller es un ticket aparte (mismo O-1 que AUDIT-DEV-014).

## 🔁 Candidatos a Regla Permanente

Ninguno nuevo. O-1 podría consolidarse con futuros casos de "existencia de un agregado por estado" en una regla de `backend_rules.md`, pero un solo caso no basta.

---

## ⚖️ VEREDICTO FINAL

**APROBADO PARA COMMIT**

`PUT` / `DELETE /api/v1/recipes/:id` cierra la última brecha de CRUD del recetario (`AUDIT-DEV-012` C-2): una receta mal cargada dejó de ser permanente. La regla de trazabilidad de `US-029` queda protegida por `RecipeCompositionLockedException` (409) y la composición congelada; el soft-delete respeta `onDelete: Restrict` y saca la receta del recetario, del rescate CATALOG y de la disponibilidad sin tocar el histórico de preparaciones. Contrato aditivo en forma, cambio de comportamiento de `GET /recipes` documentado, migración aditiva verificada contra Postgres real, gates verdes, mutation scoped 93.22% (todos los archivos ≥ 83%).
