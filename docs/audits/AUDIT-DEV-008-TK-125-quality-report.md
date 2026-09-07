# 📊 Informe de Auditoría de Código VSDD — Ticket TK-125

* **ID Auditoría:** AUDIT-DEV-008
* **Fecha de Auditoría:** 2026-09-06
* **Reviewer:** Agente principal en rol de Reviewer Independiente Adversarial (mismo encuadre que `AUDIT-DEV-006`)
* **Ticket Evaluado:** [TK-125](../05_agile_planning/12_tickets/recipes/backend/TK-125.md) — Aislamiento Hexagonal y De-duplicación del Caso de Uso de Recetas de Rescate (remediación de `AUDIT-DEV-007` G-A: F-2/F-6/F-13)

---

## 📋 Resumen por Fases

- **Fase 0 (Descubrimiento de Reglas):** PASÓ
- **Fase 1 (Mutation Testing ≥ 70%):** PASÓ (scoped)
- **Fase 2 (Arquitectura Hexagonal / SOLID):** PASÓ
- **Fase 3 (Anti-Drift Arquitectónico / Build):** PASÓ
- **Fase 4 (Seguridad, Entornos y Sanitización):** PASÓ
- **Fase 5 (UI / WCAG):** N/A (ticket 100% backend, sin cambios de UI)

---

## FASE 0 — Descubrimiento de reglas y cascada Spec-antes-que-código

* Reglas activas leídas: `docs/04_governance_and_quality/rules/{domain,backend,testing,security}_rules.md`. Runner: Vitest 1.x. Linter: ESLint 9 flat + `tsc --noEmit`. Persistencia: Prisma 5 / InMemory fakes.
* **Guard 26 (Cascada):** existe `docs/05_agile_planning/12_tickets/recipes/backend/TK-125.md` con `related_story: N/A (Técnico … · AUDIT-DEV-007 F-2/F-6/F-13)` y frontmatter citando el informe de auditoría que lo motiva. Test decisivo aplicado: **¿el dueño de producto o un usuario notaría una diferencia en las reglas de negocio o el comportamiento de cara al usuario?** → La respuesta HTTP de `POST /api/v1/recipes/rescue-suggestions` es estructuralmente idéntica; los tests de integración `tests/recipes/RescueRecipes.test.ts` pasan **sin cambiar una sola aserción**. Carve-out C-DEV-006-4 aplica correctamente — no requiere cascada PRD/US. Fila añadida a `indice_tickets.md`. **PASÓ.**
* Excepción documentada: un único cambio de comportamiento en el campo `source` (reporta el motor efectivamente usado, no el preferido) — más veraz, sin test previo que lo fijara, ningún test existente alterado. Registrado en el ticket y abajo (Fase 3.5).

## FASE 1 — Anti-tautología / Mutation

Stryker (scoped a los archivos del ticket, `coverageAnalysis: perTest`):

| Archivo | Score | Killed | Survived / NoCov |
| :-- | :-- | :-- | :-- |
| `rescueSuggestionsMapper.ts` | **100.00%** | 6 | 0 / 0 |
| `rescueProposalJsonParser.ts` | **85.19%** | 23 | 3 / 1 |
| `AiRecipeGenerationOptionsResolver.ts` | **78.79%** | 26 | 7 / 0 |
| `CompositeAiRecipeGeneratorAdapter.ts` | **74.36%** | 29 | 10 / 0 |
| `SuggestRescueRecipesUseCase.ts` | **71.43%** | 50 | 17 / 3 |
| **Agregado** | **75.74%** | 128 | 37 / 4 |

≥ 70% en cada archivo y en agregado. Mutantes sobrevivientes concentrados en literales de string por defecto y en los desempates del ranking del catálogo (lógica preexistente movida sin cambio, ver F-16 de `AUDIT-DEV-007`). Sin tests vacíos ni tautológicos: cada test nuevo afirma una salida concreta. **PASÓ.**

> Nota: Stryker sigue sin estar wireado en CI (`docs/00_stack_manifest.md` §5, nota 2026-09-06). Esta corrida es manual y scoped; el número es real (7.76 tests/mutante de media, 0 timeouts contabilizados como "detectados").

## FASE 2 — Arquitectura Hexagonal y SOLID

* **Aislamiento del Dominio:** `grep -rn "infrastructure/|application/" apps/backend/src/domain/recipes/` → **0 coincidencias**. Los dos puertos nuevos (`IRescueRecipeGenerationGateway`, `IAiRecipeGenerationOptionsResolver`) solo dependen de tipos de dominio.
* **Aislamiento de Aplicación (objetivo del ticket / F-2):** `grep -rn "infrastructure/" apps/backend/src/application/recipes/` → solo `SuggestRescueRecipesUseCase.test.ts` (imports de InMemory fakes — patrón mandatado por `.agents/rules/02_testing_architecture_standard.md`). **El código de producción ya no importa infraestructura** (antes: 2 imports). El constructor del caso de uso pasó de tener 2 default params que instanciaban infra (`new HeuristicRecipeGeneratorAdapter()`, `new CredentialEncryptionService()`) a 5 parámetros, todos puertos, sin defaults.
* **DIP:** el caso de uso depende de `IRescueRecipeGenerationGateway` + `IAiRecipeGenerationOptionsResolver` (puertos). `CompositeAiRecipeGeneratorAdapter` depende de `IAiRecipeGeneratorGateway` (puerto de hoja) para sus 3 colaboradores — antes dependía de las 3 clases concretas.
* **Mappers de persistencia / DTO:** `toRescueSuggestionsDto` centraliza el shaping dominio→DTO antes triplicado (`formatCatalogProposal`, `formatResponse`, parser de cada adapter). `parseRescueProposalsJson` unifica el bloque `RawProposalJson → RescueRecipeProposal` idéntico entre Gemini y OpenAI.
* **Duplicación (`check_ticket_duplication.sh`):** clones en HEAD 21 → working tree **19**. El ticket **no introduce** ningún clon; reduce dos. **PASÓ.**
* **Complejidad (`check_ticket_code_quality.sh`):** verde. `SuggestRescueRecipesUseCase.execute` deja la lista de 8 funciones en severidad `warn` del manifiesto §5.1 (antes concentraba catálogo + resolución de credencial + fallback).
* **Código muerto (`check_dead_code.sh`):** verde sobre el diff. `InMemoryAiRecipeGeneratorFake.ts` eliminado (no comentado); métodos `parseProposals`/`resolveApiKey`/`formatResponse`/`generateWithFallback`/`formatCatalogProposal` eliminados por completo. Dos interfaces del mapper sin `export` (solo uso interno) tras el primer pase de knip. **PASÓ.**

## FASE 3 — Anti-Drift Arquitectónico y Build

* **Contrato:** `check_contract_drift.sh` → *"Sin drift detectado"*. No se tocó `openapi.yaml`. El `RescueSuggestionsDto` conserva forma (`source`, `proposals[]` con `name/description/category/estimatedPortions/ingredients[]/preventedWasteEstimate`). Se re-exporta desde el use case (`export type { RescueSuggestionsDto }`) para no romper importadores.
* **Esquema físico:** sin cambios en `schema.prisma` ni migraciones.
* **Build:** `pnpm run build` → `Done` en ambos workspaces. `dist/` coincide con `package.json#main` (sin tocar `tsconfig.json`).
* **Seed / CLI:** no aplica (el ticket no toca seed, Docker ni CI).

### FASE 3.5 — Cambio "en caliente" no reflejado en docs

Único cambio de comportamiento: con `provider` remoto configurado pero **sin credencial resoluble** (ni cifrada válida ni en env), el campo `source` de la respuesta ahora reporta `HEURISTIC` (motor efectivo) en lugar del proveedor preferido. Antes `generateWithFallback` reportaba siempre `preferredSource`. Comportamiento nuevo = más correcto; **sin cobertura de test previa**, ningún test existente cambia. `openapi.yaml` describe `source` como enum `CATALOG|GEMINI|OPENAI_COMPATIBLE|HEURISTIC` — el valor sigue dentro del enum, sin drift de contrato. **PASÓ** (documentado en el ticket §Resultado y en `AUDIT-DEV-007` addendum).

## FASE 4 — Seguridad, Sanitización, Entornos, Resiliencia

* **Sanitización / RBAC:** sin cambios de ruta ni de esquema Zod (`rescueSuggestionsSchema` intacto). `POST /recipes/rescue-suggestions` sigue tras el `authMiddleware` global.
* **Secretos / Fail-Fast:** la resolución de API key (descifrado → `process.env.GEMINI_API_KEY`/`OPENAI_API_KEY` → `null`) se movió intacta de `application` a `infrastructure/recipes/gateways/AiRecipeGenerationOptionsResolver.ts`. Sin fallback de secreto hardcodeado nuevo (Guard 14). `CredentialEncryptionService` se inyecta desde `app.ts` (`encryptionService` de `buildDefaultRepositories`); el default param `= new CredentialEncryptionService()` vive ahora en infra, no en el caso de uso (Guard 18 no aplica — no es ruta ni controller).
* **No Silent Catches (Guard 2):** los dos `catch` (descifrado fallido en el resolver, IA remota fallida en el composite) **loguean de forma estructurada** (`console.warn('[recipes:rescue]', JSON.stringify({ event, provider, reason }))`) antes de continuar con el fallback — no tragan el error. F-13 resuelto: el logging salió de la capa de aplicación. Sin dependencia de logger nueva (Guard 24 — el proyecto no tiene logger, solo `console`).
* **Precisión aritmética (Guard 17):** `DecimalQuantity` en todo el flujo, sin cambios. El ticket **no** toca el cálculo de `preventedWasteEstimate` (queda para G-D).
* **RFC 7807:** las rutas de error del controller no se tocaron.
* **Untrusted context (Guard 8):** F-4/F-11 (validar `insumoId` de la IA, delimitar prompt) están **fuera de alcance** (G-B) — el ticket no empeora nada aquí.

**PASÓ.**

## FASE 5 — Frontend / A11y

**N/A** — TK-125 es 100% backend. `apps/frontend` sin cambios (los 13 warnings de lint de frontend son deuda preexistente §5.1).

---

## 🚨 Defectos Detectados

Ninguno bloqueante. Observaciones menores:

* **O-1 (Info):** `SuggestRescueRecipesUseCase.ts` mutation 71.43% — los 17 sobrevivientes son en su mayoría los desempates de `rankCatalogRecipes` (lógica preexistente movida). Cubierto parcialmente por los tests nuevos de ranking; el resto se atará en G-D con el fix de F-16.
* **O-2 (Info):** `AiRecipeGenerationOptionsResolver` tiene un default param `= new CredentialEncryptionService()`. Aceptable en infra y consistente con el estilo del repo (InMemory repos con defaults), pero el wiring real de `app.ts` siempre lo inyecta.

## 🔁 Candidatos a Regla Permanente (Filtro de Sistemicidad, FASE 6.1)

| # | Hallazgo de origen | ¿Sistémico? | Destino propuesto | Estado |
| :-- | :-- | :-- | :-- | :-- |
| C-DEV-007-1 | `AUDIT-DEV-007` F-1 (magnitud física sin unidad) | Sí | `domain_rules.md` | ⏳ Pendiente aprobación humana (ya listado en AUDIT-DEV-007) |
| C-DEV-007-2 | `AUDIT-DEV-007` F-4/F-11 (frontera de confianza en salida de LLM) | Sí | `backend_rules.md` §Guard 8 | ⏳ Pendiente aprobación humana (ya listado en AUDIT-DEV-007) |
| — | F-2 (app importa infra) | No | Ya cubierto por AGENTS §4 + Guard 18 — solo faltaba aplicarlo. `SuggestRescueRecipesUseCase` era el caso de prueba. | Ninguno nuevo |

**Ninguna Guard/regla nueva emerge de TK-125 en sí** — es la aplicación de reglas existentes. Los 2 candidatos sistémicos ya están registrados en `AUDIT-DEV-007` a la espera de la decisión humana.

---

## ⚖️ VEREDICTO FINAL

**APROBADO PARA COMMIT**

TK-125 cumple su alcance (F-2/F-6/F-13 de `AUDIT-DEV-007` G-A): el caso de uso queda aislado de infraestructura, el shaping de DTO y el parseo de propuestas quedan unificados, y el logging del fallback vive en infra con forma estructurada. Contrato HTTP intacto (tests de integración sin cambios). Todos los gates deterministas en verde; mutation scoped 75.74% ≥ 70. El único cambio de comportamiento (`source` más veraz) es una mejora, no una regresión, y queda documentado.
