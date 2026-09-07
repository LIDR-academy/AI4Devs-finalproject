# 📊 Informe de Auditoría de Código VSDD — Tickets TK-128 / TK-128-FE

* **ID Auditoría:** AUDIT-DEV-011
* **Fecha:** 2026-09-07
* **Reviewer:** Agente principal en rol de Reviewer Independiente Adversarial
* **Tickets Evaluados:** [TK-128](../05_agile_planning/12_tickets/recipes/backend/TK-128.md) (backend) + [TK-128-FE](../05_agile_planning/12_tickets/recipes/frontend/TK-128-FE.md) (frontend) — Valorización monetaria de la merma evitada (US-035 Esc. 5/6, AUDIT-DEV-007 F-1/F-16)

---

## 📋 Resumen por Fases

| Fase | Resultado |
| :-- | :-- |
| 0 — Reglas / cascada | PASÓ |
| 1 — Mutation ≥ 70% | PASÓ (scoped) |
| 2 — Arquitectura / SOLID | PASÓ |
| 3 — Anti-Drift / Build | PASÓ (breaking change de contrato **intencional y documentado**) |
| 4 — Seguridad / Sanitización | PASÓ |
| 5 — UI / WCAG | PASÓ |

## FASE 0 — Reglas y cascada

* **Guard 26 — este SÍ requiere cascada:** F-1 cambia el contrato (`preventedWasteEstimate` → `preventedWasteCost`) y lo que ve el usuario en el modal. No es remediación técnica pura. Se ejecutó la cascada acotada: **US-035** gana la Pregunta 5 (Guard 28, decisión Q1 del humano documentada explícitamente — FASE 1.5) y los Escenarios 5-6; **`openapi.yaml`** se actualiza (`RescueRecipeProposal`); tickets `TK-128` (backend) + `TK-128-FE` (frontend). `related_story: US-035` (no `N/A (Técnico)`).
* **Guard 28:** la única decisión de negocio (valorizar en dinero vs. agrupar por unidad vs. eliminar) fue consultada vía `AskUserQuestion` el 2026-09-06 → "valorizar en dinero"; queda en `US-035` §Pregunta 5.
* Aplica `C-DEV-007-1` (`domain_rules.md §2`): la merma pasa de una suma dimensionalmente inválida a dinero (magnitud homogénea).

## FASE 1 — Mutation (scoped)

| Archivo | Score |
| :-- | :-- |
| `domain/recipes/services/preventedWasteCost.ts` | **100.00%** (13/13) |
| `application/recipes/mappers/rescueSuggestionsMapper.ts` | **100.00%** (6/6) |
| `application/recipes/use-cases/SuggestRescueRecipesUseCase.ts` | **72.94%** |

Los tres ≥ 70. `preventedWasteCost.test.ts` cubre: suma solo de `isAtRisk`, `null` por costo faltante, `null` por 0 en riesgo, ausencia de flotante (`0.1 × 0.2 = 0.02` exacto). Los sobrevivientes del use case están en el mapeo del camino CREATIVE y en bordes de `filterAtRiskRemanentes` / `compareCostDescending` (deuda compartida con TK-125/127). **PASÓ.**

## FASE 2 — Arquitectura

* **Dominio puro:** `computePreventedWasteCost` es una función pura en `domain/recipes/services/`, sin dependencias de infra. `RescueRecipeProposal` **pierde** el campo `preventedWasteEstimate` — la entidad deja de cargar una métrica que ninguna capa podía calcular con fiabilidad.
* **Cálculo fuera de infra (`backend_rules.md §2`):** la valorización vive en el mapper de aplicación + la función de dominio, no en un repositorio. El use case construye `unitCostByInsumoId` desde `allInsumos` una vez y lo inyecta.
* **DRY:** el mapper es el único punto que serializa `preventedWasteCost`; la función de dominio el único que lo calcula. Los 6 sitios de construcción de `RescueRecipeProposal` (parser, heurístico ×3, fake, sanitizer) se simplifican al perder el argumento.
* **Duplicación (`check_ticket_duplication.sh`):** clones 20 → **19**. Sin clones nuevos.
* **Complejidad (`check_ticket_code_quality.sh`):** verde. `RescueRecipesModal.tsx` se **refactorizó** (deuda preexistente que el gate diff-scoped exige pagar al tocar el archivo): `useCurrencySymbol`, `useCatalogSaver`, `useRescueRecipes` (compositor), `ModeSelector`, `SourceBar`, `PreventedWasteBadge` — `useRescueRecipes` y el componente principal quedan bajo 60 líneas.
* **Código muerto (`check_dead_code.sh`):** verde. `recipes.service.ts` — se quitó `export` de `CreateRecipeIngredientInput` y `RescueIngredientItem` (solo uso interno). Frontend lint bajó de 13 a 11 warnings.

## FASE 3 — Anti-Drift / Build

* **Breaking change de contrato — INTENCIONAL y documentado.** `oasdiff breaking` reporta `response-required-property-removed` (`preventedWasteEstimate`) en `POST /api/v1/recipes/rescue-suggestions`. Es deliberado: la métrica anterior era **incorrecta por construcción** (sumaba unidades heterogéneas). `openapi.yaml` `version: 5.0.0 → 6.0.0` con comentario explicando el cambio y el bump mayor (mismo criterio y formato que `TK-108`). Único consumidor de la API es el frontend de este monorepo, actualizado en `TK-128-FE` (mismo commit-pair). `check_contract_drift.sh` reporta el breaking change como corresponde — no es un falso rojo, es el gate haciendo su trabajo sobre un cambio que el humano aprobó.
* **Spectral:** 0 errores (72 warnings preexistentes, ninguno introducido).
* **Build:** `pnpm run build` → Done (ambos workspaces). `schema.prisma` sin cambios.

## FASE 4 — Seguridad

* Sin cambios de RBAC, sanitización de entrada (el `mode` del body no cambia), ni secretos.
* **Precisión (Guard 17 / `C-DEV-007-1`):** `computePreventedWasteCost` usa `DecimalQuantity` / `decimal.js` en toda la cadena; serialización monetaria a 2 decimales (`toFixed(2)`), coherente con `US-019` (`wastedCost`, `totalDiscardedCost`). Test dedicado de no-flotante.
* **`null` explícito, nunca `"0.00"`:** un ingrediente en riesgo sin `unitCost` → toda la propuesta reporta `null` (no una cifra parcial engañosa). Misma regla que `US-019`.

## FASE 5 — Frontend / A11y

* `RescueRecipesModal` — `PreventedWasteBadge` renderiza `{símbolo}{monto} de merma evitada` o `Valor de merma no disponible`. Sin `NaN`/`null`/`undefined` en pantalla. `currencySymbol` de `SettingsService.fetchSettings()` con default `"$"` y `.catch` (mismo patrón que `ReportsDashboard`).
* **Sin `style` inline** (Guard 29) — se reutiliza la clase `waste-saved-badge` existente.
* RTL: 7 tests de `RescueRecipesModal` verdes, incluyendo el caso monetario (`$4.50 de merma evitada`) y el caso `null` (`Valor de merma no disponible`).
* Ergonomía táctil / contraste: sin cambios de layout ni de tokens.

---

## 🚨 Defectos Detectados

Ninguno bloqueante.

* **O-1 (Info):** `estimatedPortions` sigue fijo en `4` para propuestas de catálogo — `Recipe.yieldPortions` (Q3) es una cascada aparte pendiente, registrada en `AUDIT-DEV-007`.
* **O-2 (Info):** el `preventedWasteEstimate` que devuelve el modelo de IA en modo CREATIVE ahora se ignora por completo (el valor autoritativo se calcula desde `unitCost`). El campo sigue en `RawRescueProposalJson` como parseo tolerante; podría eliminarse en una limpieza futura.

## 🔁 Candidatos a Regla Permanente

Ninguno nuevo. TK-128 **aplica** `C-DEV-007-1` (ya escrita). Un gate determinista "ninguna suma de `DecimalQuantity` de distinta unidad" sería valioso pero es difícil de expresar sin análisis semántico; queda como deuda de tooling con la nota de que la revisión de código lo cubre.

---

## ⚖️ VEREDICTO FINAL

**APROBADO PARA COMMIT** (TK-128 + TK-128-FE)

La "merma evitada" deja de ser una suma sin sentido de peras y litros y pasa a ser su valor monetario, con la semántica de valorización ya establecida en `US-019` y el `null` honesto cuando falta un costo. El desempate del ranking se corrige (F-16). El cambio de contrato es breaking, intencional, documentado con bump mayor (`6.0.0`), y su único consumidor —el frontend propio— se actualiza en el mismo par de commits. Gates deterministas verdes; mutation 100% en las dos piezas nuevas de lógica.
