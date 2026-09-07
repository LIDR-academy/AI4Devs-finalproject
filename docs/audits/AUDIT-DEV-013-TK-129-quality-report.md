# 📊 Informe de Auditoría de Código VSDD — Tickets TK-129 / TK-129-FE

* **ID Auditoría:** AUDIT-DEV-013
* **Fecha:** 2026-09-07
* **Reviewer:** Agente principal en rol de Reviewer Independiente Adversarial
* **Tickets:** [TK-129](../05_agile_planning/12_tickets/settings/backend/TK-129.md) (backend) + [TK-129-FE](../05_agile_planning/12_tickets/settings/frontend/TK-129-FE.md) — saneamiento del módulo de configuración de IA (AUDIT-DEV-012 L-3/L-4/L-5)

---

## 📋 Resumen por Fases

| Fase | Resultado |
| :-- | :-- |
| 0 — Reglas / cascada | PASÓ |
| 1 — Mutation ≥ 70% | PASÓ (scoped) |
| 2 — Arquitectura / SOLID | PASÓ |
| 3 — Anti-Drift / Build / Migración | PASÓ (breaking change de contrato intencional) |
| 4 — Seguridad / Sanitización | PASÓ |
| 5 — UI / WCAG | PASÓ |

## FASE 0

* `related_story: N/A (Técnico … · AUDIT-DEV-012 L-3/L-4/L-5)`. Test decisivo Guard 26: se eliminan 2 campos del contrato `/settings/ai` que **ningún caso de uso leía** — no hay cambio de comportamiento de negocio (los toggles no hacían nada). Carve-out C-DEV-006-4. Fila en índices + matriz + backlog.
* **L-3** (Guard 28): decisión del humano — "quitarlos hasta que existan" (`AUDIT-DEV-012` addendum).

## FASE 1 — Mutation (scoped)

| Archivo | Score |
| :-- | :-- |
| `resolveProviderApiKey.ts` | **100.00%** |
| `GetAiConfigUseCase.ts` | **100.00%** |
| `AiConfiguration.ts` | **87.50%** |
| `TestAiConnectionUseCase.ts` | **86.60%** |
| `UpdateAiConfigUseCase.ts` | **76.19%** |

Primera corrida agregado 52% (cobertura preexistente muy pobre de las use cases de settings — `AiConfigUseCases.test.ts` tenía 5 tests). Se añadieron `resolveProviderApiKey.test.ts` (6), `TestAiConnectionUseCase.test.ts` (11, `fetch` stubeado — HEURISTIC/sin-red, GEMINI header vs URL, fallback env, descifrado corrupto, OpenAI Bearer + endpoint, HTTP no-ok, error de red, timeout) y 7 casos más de `Get`/`Update` → todos los archivos ≥ 70 por archivo, agregado 85%.

## FASE 2 — Arquitectura

* **Aislamiento de capa (L-4):** `grep "from '.*infrastructure/" application/settings/` en código de producción → **0**. `UpdateAiConfigUseCase` y `TestAiConnectionUseCase` dependen del puerto de dominio nuevo `ICredentialCipher`; `CredentialEncryptionService implements ICredentialCipher` (sin cambio de lógica). Mismo patrón que `AUDIT-DEV-007` F-2 en recetas.
* **DRY:** `application/settings/resolveProviderApiKey.ts` es el único punto del módulo que lee `GEMINI_API_KEY`/`OPENAI_API_KEY` — unifica el `AI_API_KEY` inconsistente que usaban `Get`/`Update`/`Test`.
* **Duplicación (`check_ticket_duplication.sh`):** 19 → 19, sin clones nuevos.
* **Complejidad (`check_ticket_code_quality.sh`):** verde. El frontend `useAiSettings` (145 líneas) y `AiSettingsSection` (3 arrows > 60) — deuda preexistente que el gate diff-scoped exige pagar — se refactorizaron: `useAiConfigForm` / `useAiConnectionTest` / compositor; `ProviderSelect` / `HeuristicInfoCard` / `ProviderConfigBody` / `ApiKeyMaskedView` / `ApiKeyInputView`. Lint frontend 11 → 7 warnings.
* **Código muerto (`check_dead_code.sh`):** verde sobre el diff.

## FASE 3 — Anti-Drift / Build / Migración

* **Migración `20260907120000_drop_inert_ai_toggles`** (`DROP COLUMN` ×2) — verificada contra Postgres 15 real: `check_migration_schema_parity.sh` (sin drift) + `check_seed_idempotency.sh` (migrate+seed ×2, idempotente).
* **Contrato:** `oasdiff` reporta la remoción de propiedades requeridas de `AiConfigurationResponse` y del request de `UpdateAiConfigurationRequest` — **intencional**, campos inertes. `openapi.yaml` `6.0.0 → 7.0.0` con comentario que documenta el bump y el único consumidor (frontend propio). Mismo criterio que `TK-108`/`TK-128`.
* **Spectral:** 0 errores.
* **Build:** `pnpm run build` Done (ambos workspaces).

## FASE 4 — Seguridad

* **L-5:** la sonda de conexión de Gemini pasa la API key en el header `x-goog-api-key` (antes en la query string `?key=`). Test dedicado con `fetch` stubeado.
* **Superficie de fuga:** sin cambio — `TestAiConnectionUseCase` sigue siendo un `GET /models` que no envía datos del restaurante. Modo CATALOG de rescate intacto (100% local). L-1/L-2 (nombres de insumo en modo CREATIVE) — riesgo residual aceptado por el humano, sin trabajo.
* Sin `catch` vacío nuevo, sin secreto hardcodeado, sin dependencia nueva. `resolveProviderApiKey` lee `process.env` en la capa de aplicación — mismo patrón que `Get`/`Update` ya tenían (no es una regresión de capa; `process.env` de aplicación está aceptado en el repo).

## FASE 5 — Frontend / A11y

* `CognitiveModulesControl` deja solo el toggle de recetas de rescate (el de reabastecimiento, inerte, se retira). Sin cambio de layout ni de tokens; sin `style` inline (Guard 29). RTL de `AiSettingsSection` verde (5 tests).

---

## 🚨 Defectos Detectados

Ninguno bloqueante.

* **O-1 (Info):** `AiConfigDto` (frontend) espera `apiKeyConfigured`/`apiKeyMasked` mientras el backend devuelve `hasApiKey` — desincronización **preexistente** (el backend nunca devolvió `apiKeyMasked`). Fuera del alcance de TK-129; registrar como deuda del módulo settings.
* **O-1b (Info):** `TestAiConnectionUseCase.resolveApiKey` **no** cae a la env var cuando el descifrado falla (devuelve `''`), a diferencia de `AiRecipeGenerationOptionsResolver` que sí. Inconsistencia menor entre los dos módulos; preservada en TK-129 (comportamiento anterior). Un ticket futuro podría unificar ambos con `resolveProviderApiKey` como fallback tras un descifrado fallido.
* **O-2 (Info):** `resolveProviderApiKey` / `CredentialEncryptionService` leen env vars (`GEMINI_API_KEY`, `OPENAI_API_KEY`, `ENCRYPTION_KEY`) que **no están en el validador `environment.ts`** — deuda de `SK-33` (auditor de entorno), común a todo el repo, no específica de este ticket.

## 🔁 Candidatos a Regla Permanente

Ninguno nuevo. TK-129 aplica reglas existentes (AGENTS §4 / Guard 18 para L-4; Guard 14 para L-5).

---

## ⚖️ VEREDICTO FINAL

**APROBADO PARA COMMIT** (TK-129 + TK-129-FE)

Se eliminan 2 toggles que engañaban al admin (no hacían nada), el módulo de configuración de IA deja de violar el aislamiento de capa, la API key de la sonda de Gemini sale de la URL, y el nombre de variable de entorno se unifica. Migración verificada contra Postgres real; contrato breaking intencional y documentado (`7.0.0`). Sin cambio en la superficie de fuga de datos al modelo.
