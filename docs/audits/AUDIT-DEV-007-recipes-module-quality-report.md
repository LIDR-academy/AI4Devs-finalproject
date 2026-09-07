# 📊 Informe de Análisis de Código — Módulo de Recetas (`recipes/`)

* **ID Auditoría:** AUDIT-DEV-007
* **Fecha:** 2026-09-06
* **Reviewer:** Agente principal (análisis solicitado por el humano — "analicemos el módulo de recetas y con qué otros módulos está relacionado" → "¿cómo se podría mejorar?")
* **Alcance revisado:** módulo `recipes` de punta a punta — HTTP → Application → Domain → Infra (Prisma + InMemory + adapters IA) + Frontend (`features/recipes/`, ruta `/recetas`). Incluye los puntos de acoplamiento con `stock`, `kitchen`, `settings`, `reports` y `security`.
* **User Stories cubiertas:** `US-023` (recetario bajo ruta de operario), `US-035` (recetas de rescate anti-desperdicio dual-mode). Tickets de origen: `TK-069`/`TK-069-FE` (extracción del módulo), `TK-070-FE` (recetario), `TK-122`/`TK-122-FE` (IA + heurística), `TK-124`/`TK-124-FE` (modo dual zero-leakage).
* **Verificación:** lectura de código + revisión de `SuggestRescueRecipesUseCase.test.ts` y `RescueRecipeProposal.test.ts`. No se ejecutó stack vivo ni Stryker.

---

## 🗺️ Mapa del módulo

| Capa | Artefacto | Rol |
| :-- | :-- | :-- |
| HTTP | `recipes.routes.ts:21-25` | `POST /` (`requireRole('ADMIN')`), `GET /`, `POST /rescue-suggestions` |
| HTTP | `recipes.controller.ts` | `createRecipeSchema` + `rescueSuggestionsSchema` (Zod) + 3 handlers |
| App | `CreateRecipeUseCase.ts` | Valida insumos (loop `await`), arma `Recipe` + `RecipeIngredient[]`, `save` |
| App | `ListRecipesUseCase.ts` | `findAll()` → DTO plano |
| App | `SuggestRescueRecipesUseCase.ts` | Orquesta modo `CATALOG` (100% local, Guard 9) vs `CREATIVE` (IA + fallback heurístico); resuelve credencial IA; rankea catálogo propio |
| Domain | `Recipe.ts` / `RecipeIngredient.ts` | Entidades anémicas (structs sin comportamiento) |
| Domain | `RescueRecipeProposal.ts` | VO con invariantes (nombre, porciones>0, ≥1 ingrediente) |
| Domain | `IRecipeRepository.ts` | `findById` / `findAll` / `save` — sin `update`/`delete`/paginación |
| Domain | `IAiRecipeGeneratorGateway.ts` | Puerto de generación de propuestas |
| Infra | `PrismaRecipeRepository.ts` / `InMemoryRecipeRepository.ts` | Persistencia |
| Infra | `CompositeAiRecipeGeneratorAdapter.ts` | Router: `endpointUrl` → OpenAI-compat · `apiKey` → Gemini · si no → heurística |
| Infra | `GeminiRecipeGeneratorAdapter.ts` / `OpenAiCompatibleRecipeGeneratorAdapter.ts` / `HeuristicRecipeGeneratorAdapter.ts` / `InMemoryAiRecipeGeneratorFake.ts` | Adapters concretos (fetch nativo, timeout 5s) |
| Front | `RecipeCatalogPanel.tsx` + `CreateRecipeForm/Modal.tsx` | Recetario + alta (solo ADMIN) — ruta `/recetas` |
| Front | `RescueRecipesModal.tsx` | Generación de propuestas + guardado al catálogo — montado en `ReportsDashboard.tsx:281` |
| Front | `recipes.service.ts` | Cliente HTTP (sin fallback demo — correcto, ver AUDIT-DEV-006 F-5) |

### Relación con otros módulos

| Módulo | Naturaleza | Puntos de acoplamiento |
| :-- | :-- | :-- |
| **stock / insumos** | Fuerte, directo | `RecipeIngredient.insumoId → Insumo`; `CreateRecipeUseCase` valida vía `IInsumoRepository`; `RecipeIngredient` usa el VO `DecimalQuantity` del dominio de stock; `SuggestRescueRecipesUseCase` usa `insumoRepo.findAll()`; el router recibe `stockRepo` como `insumoRepository` (`app.ts:291`) |
| **kitchen / remanentes** | Fuerte, bidireccional | Prisma: `RecipePreparation ← Recipe`, `Remanente.recipePreparationId`, `RecipePreparationItem`; `ConsumeRecipeUseCase`, `GetRecipeAvailabilityUseCase`, `ClosePreparationUseCase`, `AbandonPreparationUseCase` (todos en `kitchen/`) dependen de `IRecipeRepository`; `RecordExtractionUseCase` (stock) con `purpose=RECIPE` abre `RecipePreparation`; `SuggestRescueRecipesUseCase` depende de `IRemanenteQueryRepository` |
| **settings / AI config** | Solo modo CREATIVE | `SuggestRescueRecipesUseCase → IAiConfigurationRepository` (`provider`, `modelName`, `temperature`, `encryptedApiKey`, `endpointUrl`, `rescueRecipesOn`); `CredentialEncryptionService` para descifrar |
| **reports** | Consumidor | `GetPreparationWasteReportUseCase` agrega `RecipePreparationItem` por receta→ingrediente→motivo; `RescueRecipesModal` vive dentro de `ReportsDashboard` |
| **security** | RBAC | `requireRole('ADMIN')` en alta; permiso `kitchen:recipe_prepare` en consumir/cerrar preparación; `CredentialEncryptionService` |

> **Observación de frontera:** el "módulo recipes" es deliberadamente delgado (catálogo + sugerencias). Toda la trazabilidad de preparación (ADR-003) vive en `kitchen/` aunque referencia `recipeId`. `Recipe` es solo la plantilla.

---

## 🚨 Hallazgos

| ID | Sev. | Ubicación | Descripción | Clasificación Guard 26 |
| :-- | :-- | :-- | :-- | :-- |
| **F-1** | 🟠 Media | `SuggestRescueRecipesUseCase.ts:114-117`, `:226-228`; los 3 adapters | **`preventedWasteEstimate` suma cantidades de unidades heterogéneas.** `preventedWaste.add(ing.quantity)` acumula KG + L + UNIDAD en un único `Decimal`. La métrica que justifica todo el feature anti-desperdicio no significa nada, y el DTO la expone sin unidad (`preventedWasteEstimate: string`). | ⚠️ **Decisión humana** — la corrección (valorizar en `unitCost` / agrupar por unidad / quitar del DTO) cambia lo que ve el usuario |
| **F-2** | 🟠 Media | `SuggestRescueRecipesUseCase.ts:11-12`, `:45-46` | **Violación de Arquitectura Hexagonal (AGENTS §4).** La capa Application importa de Infrastructure: `HeuristicRecipeGeneratorAdapter`, `CredentialEncryptionService`. Además el constructor instancia infra como default param (`= new HeuristicRecipeGeneratorAdapter()`, `= new CredentialEncryptionService()`) — roza Guard 18. La resolución de credencial (config cifrada → `process.env.GEMINI_API_KEY`) y el segundo nivel de fallback IA→heurística viven en el use case cuando `CompositeAiRecipeGeneratorAdapter` ya hace ese routing. | ✅ Técnico (misma conducta, mal construida) |
| **F-3** | 🟡 Baja | `GeminiRecipeGeneratorAdapter.ts:36` | **API key en la query string de la URL** (`?key=${options.apiKey}`). Queda en logs de proxy/APM y en cualquier traza de error de `fetch`. Gemini acepta el header `x-goog-api-key`. | ✅ Técnico (hardening, roza Guard 14) |
| **F-4** | 🟠 Media | `GeminiRecipeGeneratorAdapter.ts:115-132`, `OpenAiCompatibleRecipeGeneratorAdapter.ts:117-134` | **El modo CREATIVE confía en los `insumoId` que devuelve la IA.** `parseProposals` no valida que cada `insumoId` exista en la lista `insumos` pasada al prompt. Un UUID alucinado llega al frontend; si el operario guarda la propuesta, `CreateRecipeUseCase` recién ahí devuelve 404 — o casa por azar contra otro insumo. Contradice la regla del propio prompt ("usa EXCLUSIVAMENTE insumos de la lista"). | ⚠️ **Decisión humana** — descartar ingrediente vs. descartar propuesta vs. mapear por nombre cambia las propuestas visibles |
| **F-5** | 🟡 Baja | `PrismaRecipeRepository.ts:27-32` | **La rama `update` del `upsert` no persiste `ingredients`** — solo `name`/`category`/`description`. Latente (no hay endpoint de edición hoy), pero el primer `PUT /recipes/:id` que se apoye en `save()` "editará" una receta sin cambiar su composición y sin error. | ✅ Técnico (deuda latente) |
| **F-6** | 🟡 Baja | `SuggestRescueRecipesUseCase.ts:134-161`, `:210-231`; `parseProposals` × 3 | **Shaping de DTO duplicado en ≥3 lugares** (`formatCatalogProposal`, `formatResponse`, y `RawProposalJson→RescueRecipeProposal` en cada adapter — este último idéntico byte a byte entre Gemini y OpenAI). Candidato a mapper único `RescueRecipeProposal → RescueSuggestionsDto`. | ✅ Técnico (C-1 duplicación) |
| **F-7** | 🟡 Baja | `IRecipeRepository.ts`; `SuggestRescueRecipesUseCase.ts:94-96`; `GetRecipeAvailabilityUseCase.ts:44-46` | **`findAll()` como único acceso de lectura** — sin paginación ni filtro. Catálogo, ranking de rescate y cálculo de disponibilidad cargan **todas** las recetas con **todos** sus ingredientes en cada request; `rankCatalogRecipes` trae el catálogo entero para quedarse con 3. N+1 relacionado: `GetRecipeAvailabilityUseCase` hace 2 queries por ingrediente, `ConsumeRecipeUseCase` itera secuencial. | ✅ Técnico (eficiencia; `findByInsumoIds`, paginación) |
| **F-8** | 🟡 Baja | `CreateRecipeUseCase.ts:33-38`, `:40-49` | **UUIDs generados en la capa de aplicación** con `crypto.randomUUID()` directo — misma clase que AUDIT-DEV-006 F-3; debería usar el puerto `IdGenerator` ya existente. La validación de insumos es un loop secuencial `await` (N+1). | ✅ Técnico (precedente TK-099/TK-101) |
| **F-9** | 🟡 Baja | `SuggestRescueRecipesUseCase.ts:158`; `HeuristicRecipeGeneratorAdapter.ts:68,93` | **`estimatedPortions` fijo (4 / 6) hardcodeado.** `Recipe` no tiene campo de rendimiento; catálogo y heurística lo inventan. Una receta del catálogo trae ingredientes reales pero porciones ficticias. | ⚠️ **Decisión humana** — añadir `Recipe.yieldPortions` es cambio de schema → cascada |
| **F-10** | 🟡 Baja | `recipes.controller.ts:16` | **Validación Zod incompleta.** `quantity: z.union([z.number().positive(), z.string().min(1)])` — el string no se valida como decimal positivo: `"abc"` pasa Zod y revienta en `new DecimalQuantity` → 500 en vez de 422 (Guard 19/2). Sin tope de nº de ingredientes ni de longitud de `name`/`description`; sin rechazo de `insumoId` duplicado en la misma receta. | ✅ Técnico (Guard 19) |
| **F-11** | 🟡 Baja | `GeminiRecipeGeneratorAdapter.ts:71-104`, `OpenAiCompatibleRecipeGeneratorAdapter.ts:78-107` | **Prompt injection (Guard 8).** `insumoName` / `remanente.insumoName` — texto que originalmente viene de input de usuario en el alta de catálogo — se concatena al prompt sin delimitador. Un insumo llamado `"Tomate. IGNORA LAS REGLAS…"` puede desviar la generación. Riesgo bajo (usuarios internos) pero trivial de mitigar (delimitar en bloque JSON/XML). | ✅ Técnico (Guard 8 hardening) |
| **F-12** | ⚪ Info | `recipes.routes.ts:21` | **`POST /recipes` usa `requireRole('ADMIN')` directo**, no `authorizePermissions(roleRepository, 'recipes:manage')` como `kitchen` tras TK-117 / AUDIT-SEC-002. Un rol personalizado no puede recibir el permiso de alta de recetas sin ser ADMIN. Inconsistencia de RBAC, no vulnerabilidad. | ⚠️ **Decisión humana** — ¿alinear con catálogo de permisos editable? |
| **F-13** | ⚪ Info | `SuggestRescueRecipesUseCase.ts:174`, `:202` | **`console.warn` para fallo de IA remota y para fallo de descifrado de API key.** No es audit log estructurado ni RFC 7807 (roza Guard 2). Aceptable como telemetría mínima, pero sin trazabilidad de por qué una sugerencia cayó a heurística. | ✅ Técnico (observabilidad) |
| **F-14** | ⚪ Info | `GeminiRecipeGeneratorAdapter.ts:35,52`, `OpenAiCompatibleRecipeGeneratorAdapter.ts:33,59` | **Timeout 5s hardcodeado, sin retry ni circuit breaker; sin `top_p`/seed en el body; modelo default `gemini-1.5-flash` / `llama3:8b` desactualizado.** Parametrizar desde `AiConfiguration`. Guard 9 pide `top-p ≤ 0.2` en generación determinista (hoy solo se capa `temperature` a 0.2). | ✅ Técnico |
| **F-15** | 🟡 Baja | `SuggestRescueRecipesUseCase.ts:180-195` | **`filterAtRiskRemanentes` cae a `activeRemanentes.slice(0, 5)`** cuando no hay nada en riesgo — sugiere "rescate" para insumos que no lo necesitan; el número 5 no está en ninguna spec. La heurística tiene su propia rama preventiva paralela (`generatePreventiveProposals`). | ⚠️ **Decisión humana** — ¿comportamiento cuando no hay riesgo? |
| **F-16** | 🟡 Baja | `SuggestRescueRecipesUseCase.ts` `rankCatalogRecipes` (desempate) | **El desempate por `preventedWaste` está invertido.** `b.preventedWaste.greaterThan(a.preventedWaste) ? -1 : 1` ordena **ascendente** (menos merma evitada primero) a igualdad de nº de insumos cubiertos — al revés de la intención "prioriza la receta que evita más merma". Descubierto durante la caracterización con tests de `TK-125`. `TK-125` **preserva** el comportamiento actual (refactor puro); el fix corresponde a G-D junto con F-1. | ✅ Técnico (corrección de ranking, va con G-D) |

### Gaps de cobertura de tests

* `SuggestRescueRecipesUseCase.test.ts` y `RescueRecipeProposal.test.ts` existen. **Sin tests:** `CreateRecipeUseCase`, `ListRecipesUseCase`, `PrismaRecipeRepository` (camino real), y los 3 adapters IA (`fetch` real — F-4/F-11 no tienen red de seguridad). Relevante para Guard 11 (mutation ≥ 70%).

---

## ✅ Aspectos correctos (no requieren acción)

* **Zero Data Leakage real:** modo `CATALOG` es 100% local, nunca invoca `fetch` (Guard 9). Verificado en `execute()` — el `return this.generateFromCatalog(...)` corta antes de tocar `aiConfigRepo`/`aiGateway`.
* `recipes.service.ts` **no** tiene fallback "modo demo" — cierre correcto del patrón AUDIT-DEV-006 F-5, documentado en el propio archivo.
* `RescueRecipeProposal` valida invariantes en el constructor (nombre no vacío, porciones > 0, ≥ 1 ingrediente).
* `decimal.js` vía `DecimalQuantity` en toda la capa backend (Guard 17) — el problema de F-1 es semántico (unidades), no de precisión.
* `CreateRecipeUseCase` valida existencia de cada `insumoId` antes de persistir (`EntityNotFoundException` → RFC 7807).
* DIP respetado en el grueso: use cases dependen de `IRecipeRepository` / `IAiRecipeGeneratorGateway` (la excepción es F-2).
* `CompositeAiRecipeGeneratorAdapter` encapsula el routing de proveedor correctamente en infra.
* Alta de recetas restringida a ADMIN en backend (`requireRole`) y frontend (`canManage={role === 'ADMIN'}`).

---

## 🎟️ Agrupación de tickets propuesta (PENDIENTE DE APROBACIÓN HUMANA DE ALCANCE)

> Ningún ticket se ha creado todavía. La numeración correlativa libre es **TK-125** en adelante. Los tickets técnicos se enmarcarían en `US-023` + `US-035` (capacidades ya existentes) con patrón `N/A (Técnico) · AUDIT-DEV-007` (precedente `TK-091`/`TK-094`/`TK-097`/`TK-098-101`).

| Grupo | Sev. | Alcance | Hallazgos | Tipo |
| :-- | :-- | :-- | :-- | :-- |
| **G-A** | 🟠 Media | backend | F-2 (extraer resolución de credencial + fallback a infra; use case depende solo de puertos), F-6 (mapper único de DTO), F-13 (log estructurado del fallback) | Remediación técnica |
| **G-B** | 🟠 Media | backend | F-4 (validar `insumoId` de la IA contra el catálogo), F-11 (delimitar prompt), F-3 (key en header), F-14 (parametrizar timeout/modelo) + tests de los 3 adapters | Remediación técnica (F-4 requiere respuesta a Q2) |
| **G-C** | 🟡 Baja | backend | F-8 (`IdGenerator` + batch de validación), F-10 (Zod estricto + dedupe), F-5 (`save` persiste ingredientes), F-7 (`findByInsumoIds` + paginación) | Remediación técnica |
| **G-D** | 🟠 Media | backend | **F-1** — corrección de la métrica `preventedWasteEstimate` | ⚠️ Técnico **o** cascada según Q1 |
| **G-E** | — | — | F-9 (`Recipe.yieldPortions`), CRUD de recetas (`GET/:id`, `PUT`, soft-delete), costeo por porción, persistir sugerencia aceptada + medir merma evitada real, descubribilidad de `RescueRecipesModal` | **Cascada completa** (`01_cascading_spec_workflow.md`) — nuevas reglas de negocio |
| **G-F** | ⚪ Info | backend | F-12 (RBAC fino), F-15 (comportamiento sin riesgo) | Según Q4 / Q5 |

---

## ❓ Preguntas abiertas al humano (Guard 28 — resolver ANTES de crear US/TK o escribir código)

| # | Hallazgo | Pregunta | Impacto |
| :-- | :-- | :-- | :-- |
| **Q1** | F-1 | ¿`preventedWasteEstimate` se **valoriza en dinero** (`insumo.unitCost × cantidad`, coherente con el reporte de merma US-019/US-029), se **agrupa por unidad de medida**, o se **elimina del DTO**? | Cambia lo que ve el operario en el modal |
| **Q2** | F-4 | Cuando la IA (modo CREATIVE) devuelve un `insumoId` que no existe en el catálogo: ¿**descartar ese ingrediente** de la propuesta, **descartar la propuesta entera**, o **intentar mapear por `insumoName`**? | Cambia las propuestas visibles; define si es técnico o cascada |
| **Q3** | F-9 | ¿Se añade el campo `Recipe.yieldPortions` (rendimiento) al schema — con su cascada PRD/US/schema/OpenAPI — o se deja el `4` como default documentado en la spec de US-035? | Schema change vs. constante documentada |
| **Q4** | F-15 | Cuando **no hay remanentes en riesgo**, ¿el endpoint de rescate devuelve **lista vacía**, o un **modo preventivo explícito** (como hace hoy la heurística)? ¿Cuál es el criterio y el límite? | Comportamiento de cara al usuario no especificado en US-035 |
| **Q5** | F-12 | ¿Se promueve `POST /recipes` a `authorizePermissions(roleRepository, 'recipes:manage')` (catálogo de permisos editable, coherente con `kitchen` post-TK-117) o se mantiene `requireRole('ADMIN')`? | Alineación RBAC |
| **Q6** | — | ¿Qué grupos (G-A…G-F) entran en alcance ahora y en qué prioridad? (precedente AUDIT-DEV-006: el humano eligió "A+B+C") | Define el trabajo |

---

## 🔁 Candidatos a Regla Permanente (Filtro de Sistemicidad, FASE 6.1)

| # | Hallazgo de origen | Destino propuesto | Estado |
| :-- | :-- | :-- | :-- |
| **C-DEV-007-1** | F-1 | `docs/04_governance_and_quality/rules/domain_rules.md` — *"Magnitud física sin unidad = defecto de dominio"*: prohibido sumar/agregar `DecimalQuantity` de distinta `unitOfMeasure` en un acumulador único, y prohibido exponer una magnitud física en un DTO sin su unidad acompañante. `decimal.js` garantiza precisión, no homogeneidad dimensional. | ⏳ Pendiente de aprobación humana |
| **C-DEV-007-2** | F-4, F-11 | `docs/04_governance_and_quality/rules/backend_rules.md` §Untrusted Content (Guard 8) — *"Frontera de confianza en salidas de LLM"*: toda respuesta de un LLM externo DEBE re-validarse contra la fuente de verdad local (los IDs/enums que el prompt ofreció) con un esquema Zod antes de cruzar a la capa de aplicación; todo texto de origen-usuario embebido en un prompt DEBE ir en un bloque de datos delimitado, nunca concatenado a las instrucciones. | ⏳ Pendiente de aprobación humana |
| **C-DEV-007-3** | F-2 | Ya cubierto por AGENTS §4 + Guard 18 — no requiere regla nueva, solo aplicación. `SuggestRescueRecipesUseCase` es el caso de prueba. | N/A (regla existente) |

Los gates deterministas asociados (grep de imports `infrastructure/` desde `application/`; verificación de que cada adapter IA tenga un test de contrato) quedan como deuda de tooling a evaluar tras la implementación.

---

## 📌 Addendum de Decisiones del Humano (2026-09-06)

Consultado vía `AskUserQuestion` (Guard 28):

| # | Pregunta | Respuesta del humano |
| :-- | :-- | :-- |
| **Q1** (F-1) | Cálculo de `preventedWasteEstimate` | **Valorizar en dinero** (`insumo.unitCost × cantidad`); `null` si el insumo no tiene `unitCost`. Coherente con US-019/US-029. |
| **Q2** (F-4) | `insumoId` alucinado por la IA | **Descartar ese ingrediente** de la propuesta. Si la propuesta queda sin ingredientes válidos, se descarta entera (invariante `RescueRecipeProposal`). |
| **Q3** (F-9) | Campo de rendimiento de receta | **Añadir `Recipe.yieldPortions`** — requiere cascada completa (`01_cascading_spec_workflow.md`): PRD → US → `schema.prisma` + migración → OpenAPI → tickets. |
| **Q6** | Alcance ahora | **Solo G-A** (F-2, F-6, F-13) — remediación técnica de arquitectura. |
| Q4 (F-15), Q5 (F-12) | — | Sin responder — quedan como deuda registrada, fuera del alcance actual. |

### Plan resultante

| Ticket | Grupo | Alcance | Tipo | Estado |
| :-- | :-- | :-- | :-- | :-- |
| **TK-125** | G-A | F-2 (use case depende solo de puertos; resolución de credencial IA + fallback de error a infra), F-6 (mapper único `RescueRecipeProposal → DTO` + parser JSON de propuestas compartido entre adapters), F-13 (logging del fallback movido a infra con forma estructurada, sin dependencia de logger nueva) | Remediación técnica — `N/A (Técnico) · AUDIT-DEV-007` (precedente `TK-098`/`TK-099`/`TK-101`) | ⏳ Draft — pendiente de aprobación humana |
| *(futuro)* | G-B | F-4 (Q2), F-11, F-3, F-14 | Remediación técnica | No iniciado |
| *(futuro)* | G-C | F-8, F-10, F-5, F-7 | Remediación técnica | No iniciado |
| *(futuro)* | G-D | **F-1** (Q1 — valorización en dinero) + **F-16** (desempate de ranking invertido) | Remediación técnica | No iniciado |
| *(futuro)* | cascada | F-9 `Recipe.yieldPortions` (Q3), CRUD de recetas, costeo por porción, persistir sugerencia aceptada, descubribilidad de `RescueRecipesModal` | Cascada de especificación completa | No iniciado |

---

## ⚖️ Conclusión

El módulo cumple funcionalmente los criterios BDD de `US-023` y `US-035`, y el pilar de privacidad (Zero Data Leakage en modo CATALOG) está **correctamente implementado y verificable**. Los defectos son de calidad y semántica, no de integridad de datos como en AUDIT-DEV-006:

* **F-1 es el más relevante para el negocio:** la métrica de "merma evitada" que da sentido al feature suma peras con litros. Debe resolverse (Q1).
* **F-2 y F-4** son deuda arquitectónica y de robustez de la integración IA — acotadas, con precedente claro de remediación técnica.
* El resto es deuda menor y de eficiencia.

**Prioridad recomendada:** G-D/Q1 (métrica) → G-A (arquitectura) → G-B (robustez IA) → G-C (deuda menor). G-E requiere cascada de especificación aparte.
