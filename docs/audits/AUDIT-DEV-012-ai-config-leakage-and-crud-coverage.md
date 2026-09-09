# 📊 Informe de Análisis — Fuga de Datos al Modelo de IA y Cobertura CRUD

* **ID Auditoría:** AUDIT-DEV-012
* **Fecha:** 2026-09-07
* **Reviewer:** Agente principal (análisis solicitado por el humano — "en el módulo de configuración del agente de IA … estrictamente prohibida la fuga de información del restaurante al modelo … CRUD de insumos, no sé si es necesario en otras secciones")
* **Alcance:** (1) toda llamada saliente a un modelo externo en el backend y qué transmite; (2) cobertura CRUD por recurso del sistema.

---

## Parte 1 — Superficie de fuga de datos al modelo de IA

Solo existen **3 `fetch` salientes** en todo el backend (grep exhaustivo, excluyendo tests):

| Punto | Método | Payload | ¿Fuga? |
| :-- | :-- | :-- | :-- |
| `GeminiRecipeGeneratorAdapter` / `OpenAiCompatibleRecipeGeneratorAdapter` (rescate CREATIVE) | POST | Bloque `<datos-de-inventario>` (TK-126): `insumoId` (UUID), `insumoName`, cantidad, unidad, `horasRestantes`, + lista de insumos disponibles | ⚠️ Parcial |
| `TestAiConnectionUseCase` (botón "Probar conexión") | GET `/models` o `/v1beta/models` | **Nada** — solo lista los modelos del proveedor | ✅ No |
| Rescate modo CATALOG | — | **Cero `fetch`** — 100% local (Guard 9) | ✅ No |

**Veredicto:** el pilar Zero Data Leakage **se sostiene** en lo esencial. En modo CREATIVE **nunca** salen: nombres de recetas, descripciones/fórmulas, márgenes, precios de venta, ni datos de clientes. Coherente con `US-035` §Pregunta 2.

### Hallazgos

| ID | Sev. | Descripción | Decisión humana (2026-09-07) |
| :-- | :-- | :-- | :-- |
| **L-1** | 🟡 Baja | El modo CREATIVE transmite `insumoName` literal + cantidades + los **UUID `insumoId`** (identificador interno sin valor para el modelo). `US-035` promete "nombres **genéricos**" pero nada lo garantiza. | **Dejar como está** — `US-035` se considera cumplida; se acepta el riesgo residual de un nombre de insumo revelador. Documentado. |
| **L-2** | 🟡 Baja | `endpointUrl` configurable por el admin sin allowlist de dominios ni aviso en la UI de "este endpoint verá tus insumos y cantidades". | Cubierto por la decisión de L-1 (sin cambio). |
| **L-3** | 🟠 Media | `replenishmentOn` y `anomalyAuditOn` son toggles de la UI que **no están cableados a ningún código** — se guardan/validan/devuelven pero ningún caso de uso los lee. Features "configurables pero inexistentes" que engañan al admin. | **Quitarlos** del schema / DTO / UI + migración. → `TK-129` |
| **L-4** | 🟡 Baja | `TestAiConnectionUseCase` importa `CredentialEncryptionService` de `infrastructure/` (misma violación de capa que `AUDIT-DEV-007` F-2, ya corregida en recetas) y usa `process.env.AI_API_KEY` — nombre **distinto** al `GEMINI_API_KEY`/`OPENAI_API_KEY` del resolver de recetas. | Remediación técnica → `TK-129` |
| **L-5** | 🟡 Baja | La API key de Gemini viaja en la query string (`?key=…`) en `TestAiConnectionUseCase` — mismo patrón `AUDIT-DEV-007` F-3, quedó fuera de `TK-126`. | Remediación técnica → `TK-129` |

---

## Parte 2 — Cobertura CRUD por recurso

| Recurso | C | R | U | D | Estado |
| :-- | :-: | :-: | :-: | :-: | :-- |
| **Insumo** (catálogo maestro) | ✅ | ✅ | ❌ | ❌ | + `PATCH /:id/restock` (solo cantidad). **Sin editar `name` / `unitOfMeasure` / `unitCost` / `barcode`, sin desactivar.** |
| **Recipe** | ✅ | ✅ | ❌ | ❌ | Deuda reconocida en `US-012` §[N]egociable |
| StorageLocation | ✅ | ✅ | ✅ | ✅ | Completo |
| Role (RBAC) | ✅ | ✅ | ✅ | ✅ | Completo |
| ConsumptionReason | ✅ | ✅ | ✅ | soft (`isActive`) | Por diseño ("desactiva, nunca borra") |
| User | ✅ | ✅ | ✅ | soft (`BLOCK`) | Por diseño |
| TemperatureLog | ✅ | ✅ | ❌ | ❌ | Por diseño (append-only) |
| SystemSettings / AiConfiguration | — | ✅ | ✅ | — | Singleton |

### Gaps reales (los demás son decisiones de diseño correctas)

| ID | Recurso | Gap | Impacto | Ticket |
| :-- | :-- | :-- | :-- | :-- |
| **C-1** | Insumo | No existe `PUT /stock/insumos/:id`. `unitCost` solo se fija al **crear**; `restock` no lo toca. | 🔴 **Agravado por `TK-128`**: todo insumo creado sin `unitCost` muestra "Valor de merma no disponible" para siempre en las recetas de rescate, sin pantalla para corregirlo. También: nombre mal escrito o unidad equivocada = inmutables. | `US-036` + `TK-130` + `TK-130-FE` |
| **C-2** | Recipe | Sin `PUT` ni `DELETE`. Una receta mal cargada u obsoleta no se puede corregir ni retirar. `RecipePreparation.recipe` es `onDelete: Restrict` → obliga a soft-delete. | 🟠 Media | `US-037` + `TK-131` + `TK-131-FE` |

### Decisiones humanas (Guard 28, 2026-09-07)

| Pregunta | Respuesta |
| :-- | :-- |
| **C-1** — ¿qué campos de un insumo se pueden editar? | `name`, `unitCost`, `barcode`. **`unitOfMeasure` inmutable** (cambiarla con stock/remanentes reinterpreta cantidades). `unitCost` afecta solo valorizaciones futuras; el histórico (`StockMovement`) conserva su snapshot. |
| **C-2** — ¿cómo se maneja el borrado/edición de recetas? | **Soft-delete** (`Recipe.isActive`). `PUT` edita libre si la receta **no** aparece en ninguna `RecipePreparation` `CLOSED`; si aparece, solo metadatos (`name`/`category`/`description`), **no** ingredientes — preserva el "teórico vs real" de los reportes de preparaciones cerradas. |
| **L-3** — ¿toggles inertes? | Quitarlos. |

---

## Plan de tickets

| Ticket | Tipo | Alcance | Schema |
| :-- | :-- | :-- | :-- |
| **TK-129** | Remediación técnica (`N/A (Técnico) · AUDIT-DEV-012 L-3/L-4/L-5`) | Elimina `AiConfiguration.replenishmentOn` / `anomalyAuditOn`; `TestAiConnectionUseCase` deja de importar infra (resolución de credencial a un servicio de infra), alinea env var, API key de Gemini al header. + `TK-129-FE` (quitar toggles de `AiSettingsSection`). | Migración: `DROP COLUMN` ×2 |
| **US-036 / TK-130 / TK-130-FE** | Cascada | `PUT /api/v1/stock/insumos/:id` (`name`, `unitCost`, `barcode`; `unitOfMeasure` → `400`). Cierra deuda de `US-012` §[N]. | Sin cambio (`Insumo` ya tiene los campos) |
| **US-037 / TK-131 / TK-131-FE** | Cascada | `PUT /api/v1/recipes/:id` + `DELETE /api/v1/recipes/:id` (soft-delete). `isActive` filtra listado, ranking de rescate y `findByInsumoIds`. Cierra deuda de `US-012` §[N]. | Migración: `Recipe.isActive Boolean @default(true)` |

---

## Conclusión

La configuración de IA **no filtra secretos del restaurante**: modo CATALOG es 100% local, modo CREATIVE envía solo insumos genéricos + cantidades (riesgo residual aceptado), y el test de conexión no envía nada. La deuda real de este módulo son 2 toggles que no hacen nada (L-3) y deuda técnica menor de capa/secretos (L-4/L-5). La brecha de producto de mayor impacto es la **imposibilidad de editar un insumo** — que la valorización de `TK-128` acaba de volver urgente.
