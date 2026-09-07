---
document: technical_ticket
id: TK-129-FE
related_story: N/A (Técnico — AUDIT-DEV-012 L-3)
points: 2
type: frontend
status: done
inputs:
  - docs/05_agile_planning/12_tickets/settings/backend/TK-129.md
---

# 🎟️ TK-129-FE: Quitar el Toggle de Reabastecimiento Inerte de la Pantalla de Configuración de IA

> **Navegación:** [📖 Índice de Tickets](../../indice_tickets.md) | [Backend: TK-129](../backend/TK-129.md)

---

## 📝 Descripción

`TK-129` eliminó `replenishmentOn` / `anomalyAuditOn` del contrato `/settings/ai`. El frontend refleja el cambio:

* `aiSettings.service.ts` — `AiConfigDto` / `UpdateAiConfigDto` sin `replenishmentOn`.
* `useAiSettings.ts` — sin el estado `replenishmentOn` / `setReplenishmentOn`. Refactorizado en `useAiConfigForm` + `useAiConnectionTest` + compositor para bajar de los límites de longitud de función (el gate diff-scoped lo exige al tocar el archivo).
* `AiSettingsSection.tsx` — `CognitiveModulesControl` deja solo el toggle de recetas de rescate. Componente descompuesto (`ProviderSelect` / `HeuristicInfoCard` / `ProviderConfigBody` / `ApiKeyMaskedView` / `ApiKeyInputView`) por el mismo motivo.

*   **Módulo:** `settings` (frontend) · **2 SP** · **Should Have** · **Prerrequisitos:** TK-129.

---

## ✅ DoD

1. `pnpm test` (RTL de `AiSettingsSection`) verde sin el toggle de reabastecimiento.
2. `pnpm run build` / `pnpm run lint` — 0 errores; el gate `check_ticket_code_quality.sh` verde sobre los archivos tocados.
3. Sin `style` inline (Guard 29).
4. **Commit atómico:** `refactor(settings): drop inert replenishment toggle from AI settings screen (TK-129-FE)`.

---

## 📌 Nota

`AiConfigDto` (frontend) sigue esperando `apiKeyConfigured` / `apiKeyMasked` mientras el backend devuelve `hasApiKey` — desincronización **preexistente** (el backend nunca devolvió `apiKeyMasked`), fuera del alcance de este ticket.
