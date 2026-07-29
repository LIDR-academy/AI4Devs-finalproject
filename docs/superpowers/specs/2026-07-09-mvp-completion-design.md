# Design: Realista MVP Completion — Cierre de gaps para entrega mañana

**Date**: 2026-07-09
**Agent**: implementer
**Branch**: `feature-entrega2-DMM`
**Status**: approved (pending user review of written spec)
**Related**: `specs/001-realista-mvp/spec.md`, `docs/evidence/2026-07-08-MORTGAGE-COMPASS-UI.md`

## Context

El proyecto Realista está a un 90% de completion según la evidencia más reciente. El backend hexagonal está completo (56/56 tests), el frontend SvelteKit compila y arranca, la base de datos dockerizada funciona, y el main flow (analyze → dashboard → mortgage compass → checklist) está verificado end-to-end con MOCK_OPENROUTER.

**Lo que ya funciona** (verificado en `docs/evidence/2026-07-08-MORTGAGE-COMPASS-UI.md`):
- Backend hexagonal completo, typecheck clean, 0 violaciones hexagonales
- Frontend SvelteKit, build 2.22s, 5 rutas servidas
- DB dockerizada (Postgres 16 en puerto 5433) con Prisma + migración inicial
- Auto-attach PurchaseProcess (FR-014)
- Rate limit 20/día (FR-010)
- Mortgage Compass UI con 3 pasos + chart + insight
- Auto-attach Checklist (FR-024)
- Negotiation points endpoint (FR-026) — backend ready
- Timeline (US5), Dashboard aggregate (FR-023)

**Lo que falta** (gaps identificados en la evidencia):
1. Negotiation Assistant UI (US4) — endpoint OK, no se renderiza
2. Re-analysis con diff real (FR-022) — DiffService existe, ruta usa stub
3. PWA icons (FR-009) — `static/icons/` vacío
4. SSE real-time progress (FR-018) — server side OK, frontend simula
5. Catastro XML parsing (FR-003) — adapter retorna `PENDING-DECODE`
6. Playwright E2E (SC-004) — specs existen, no ejecutados

## Scope

### In scope (este design)

Los 6 gaps anteriores más verificación final. Cada uno se entrega como slice atómico con su propio commit.

### Out of scope (deferred)

- **Portal health cron** (FR-027) — la tabla `PortalHealthCheck` y el endpoint `/api/admin/portal-health` ya existen; el cron se reemplaza por un `setInterval` en `index.ts` que loggea "monitor disabled in MVP" y queda documentado como TODO con link al ADR para producción.
- Auth, sync entre dispositivos, i18n, tests de carga — no en spec del MVP.
- HTML de listings persistido (FR-011 prohíbe).

## Architecture

No hay cambios arquitectónicos mayores. Los slices son enhancements sobre el código existente:

- **Backend**: hexagonal + DDD sigue. Se añade un parser XML dentro de `CatastroAdapter` (puro, no toca dominio).
- **Frontend**: SvelteKit + stores + componentes. Se añade un `streamingClient.ts` para SSE.
- **DB**: schema no cambia. Se usa el campo `diff: Json` ya existente en `AnalyzedListing` (verificado en `prisma/schema.prisma`).
- **PWA**: solo se generan los assets.

## Per-slice design

### Slice 1: PWA icons (FR-009)

**Objetivo:** que el manifest apunte a PNGs reales y la app sea instalable.

**Archivos:**
- `frontend/static/icons/icon-192.png` (192×192)
- `frontend/static/icons/icon-512.png` (512×512)
- `frontend/static/icons/maskable-icon-512.png` (512×512, safe zone 25% padding)

**Generación:** script `frontend/static/icons/generate.sh` que use ImageMagick (`convert`/`magick`) si está disponible; fallback a un script Node con `canvas` si está; último fallback a un binario PNG mínimo hardcoded (color sólido + texto "R"). El script se ejecuta una vez, los PNGs se commitean.

**Verificación:** `npm run build` en frontend debe terminar sin warnings sobre iconos faltantes; inspeccionar el manifest en `.svelte-kit/output/client/manifest.webmanifest` y confirmar que apunta a rutas 200.

**Tests:** ninguno (es assets).

---

### Slice 2: Catastro XML parsing (FR-003)

**Objetivo:** cuando la SEC devuelve XML, extraer `superficie` y `antiguedad` reales.

**Archivos:**
- `backend/src/adapters/catastro/CatastroAdapter.ts` (modificado)
- `backend/src/adapters/catastro/xmlParser.ts` (nuevo, helper puro)
- `backend/package.json` — añadir `fast-xml-parser` (sin deps nativas, 0 transitive)
- `backend/tests/unit/adapters/catastro/xmlParser.test.ts` (3 tests)

**Decisión:** `fast-xml-parser` por ser zero-dep, ~50KB minified, modo síncrono, parseo robusto con namespace handling. La SEC usa `xmlns="http://www.catastro.meh.es/"` por lo que el parser debe estar configurado con `ignoreAttributes: false` y `removeNSPrefix: true`.

**Estructura del XML SEC (ejemplo real):**
```xml
<consulta_dnp>
  <control>
    <cucta>...</cuenta>
  </control>
  <lerrcs>
    <lrerrcs>
      <lrc>
        <rcdt>
          <bi>
            <de>
              <dt>CL EJEMPLO 123</dt>
            </de>
          </bi>
          <dft>
            <dt>...</dt>
          </dft>
          <datosEconomicos>
            <valorCatastral>...</valorCatastral>
          </datosEconomicos>
        </rcdt>
      </lrc>
    </lrerrcs>
  </lerrcs>
</consulta_dnp>
```

Y la info de unidades constructivas (donde está `superficie` y `antiguedad`):
```xml
<lcons>
  <lcons>
    <cons>
      <lcd>...</lcd>
      <superficie>78</superficie>
      <antiguedad>1995</antiguedad>
    </cons>
  </lcons>
</lcons>
```

**Comportamiento:**
1. POST a la SEC con `Formato=JSON` (como ahora).
2. Si response.ok y Content-Type es `application/json`: parsear JSON (futuro).
3. Si response.ok y Content-Type es `application/xml` o `text/xml`: parsear XML.
4. Extraer `superficie` (suma de todas las `cons.superficie` o la del primer match) y `antiguedad` (mínimo — edificio más antiguo).
5. Si no se encuentra: retornar `null` (no bloquea el análisis, como ahora).
6. Si falla el parse: log warn, retornar `null`.

**Hexagonal:** el parser XML queda en `adapters/catastro/` — NO toca `domain/`. La interfaz `CatastroPort` no cambia.

**Tests (3):**
1. `xmlParser.ts` extrae `superficie=78, antiguedad=1995` de un XML SEC real
2. XML con múltiples unidades suma superficies y toma antigüedad mínima
3. XML malformado retorna null sin throw

---

### Slice 3: Re-analysis con diff real (FR-022)

**Objetivo:** cuando el usuario re-analiza un listing, calcular diff real y persistirlo.

**Estado actual:** `AnalyzeListingUseCase.execute` líneas 105-108 tienen:
```ts
const diff = previous && previous.sourceHash !== currentHash.value
  ? { changedAt: new Date().toISOString() }
  : null;
```

**Cambio:**
1. Reemplazar el stub con llamada a `DiffService.diff()`.
2. Construir dos `SnapshotInput` con los datos del listing anterior y el actual.
3. **Siempre** crear un nuevo `AnalyzedListing` con `diff: DiffResult` (sea `unchanged: true` o con cambios) — esto cumple FR-022 literal ("lo almacena en el **nuevo** AnalyzedListing").
4. Si `diff.unchanged === true`, el nuevo registro es funcionalmente idéntico al anterior pero deja un trail auditable. La response incluye `listing.diff: { unchanged: true, ... }` para que el frontend pueda mostrar "Sin cambios desde el último análisis".
5. La response del endpoint incluye `listing.diff` para que el dashboard lo muestre.

**Archivos:**
- `backend/src/domain/services/AnalyzeListingUseCase.ts` (modificado, líneas 100-115)
- `backend/src/infrastructure/repositories/AnalyzedListingRepository.ts` (verificar que acepta `diff: DiffResult | null`)
- `backend/tests/unit/domain/services/AnalyzeListingUseCase.diff.test.ts` (4 tests, nuevo)

**Tests (4):**
1. Sin análisis previo: `diff = null`, se crea nuevo `AnalyzedListing`
2. Con análisis previo y mismo hash: `unchanged: true`, se crea nuevo `AnalyzedListing` con `diff.unchanged = true` (sin cambios), response incluye el diff
3. Con análisis previo y hash distinto + precio cambia: `diff.priceDelta = -10000`, `addedRedFlags: [...]`, se crea nuevo registro
4. Con análisis previo y hash distinto + red flag desaparece: `removedRedFlags: [...]`

**Frontend diff display:**
- `frontend/src/lib/components/DiffBadge.svelte` (nuevo) — muestra "Precio: -10.000€" en verde/rojo
- `frontend/src/routes/+page.svelte` (Dashboard) — si `latestListing.diff` existe, mostrar `<DiffBadge>` debajo del score
- `frontend/src/routes/listing-lens/+page.svelte` — después del resultado, si hay diff, mostrar sección "Cambios desde el último análisis"

**AC satisfecho:** US3 AC #4 ("Dado un listing previamente analizado en el mismo proceso, Cuando el usuario pulsa 're-analizar', Entonces se ejecuta un nuevo análisis, el backend computa el diff contra el previousHash y lo almacena en el nuevo AnalyzedListing").

---

### Slice 4: Negotiation Assistant UI (US4)

**Objetivo:** mostrar las 5-8 preguntas generadas por el backend tras un análisis.

**Archivos:**
- `frontend/src/lib/components/NegotiationPoints.svelte` (nuevo, 80-100 líneas)
- `frontend/src/lib/api/types.ts` (añadir `NegotiationPoint` interface)
- `frontend/src/lib/api/client.ts` (añadir `getNegotiationPoints(listingId)` helper)
- `frontend/src/routes/listing-lens/+page.svelte` (modificado, +30 líneas)
- `frontend/tests/unit/components/NegotiationPoints.test.ts` (1 test, smoke)

**Componente `NegotiationPoints.svelte`:**
- Props: `listingId: string`
- Estado: `points: NegotiationPoint[] | null`, `loading: boolean`, `error: string | null`
- Effect: `onMount(() => fetchPoints())`
- Render: si `loading`, skeleton; si `error`, mensaje; si `points`, lista de `<details>` colapsables con `<summary>pregunta</summary>` y `<p>rationale</p>` (justificación con la frase del anuncio)
- Color de borde por categoría de red flag (mapeo: `euphemistic_language` → amarillo, `suspicious_price` → rojo, etc.)
- AI disclaimer inline: "Puntos generados desde plantillas educativas, no son consejo financiero"

**Integración en `/listing-lens`:**
- Después del bloque de result, si `result.listing.redFlags.length > 0`, renderizar `<NegotiationPoints listingId={result.listing.id} />`
- Si no hay red flags (score excelente), no se renderiza (o se renderiza con mensaje "Anuncio transparente, solo verificaciones generales")

**Test (1):**
- Mock fetch, verificar que llama a `/api/listings/:id/negotiation-points`
- Verificar que muestra loading state inicial
- Verificar que muestra las preguntas tras respuesta

**AC satisfecho:** US4 AC #1 ("Dado un AnalyzedListing con red flags detectadas, Cuando el usuario pulsa 'Generar puntos de negociación', Entonces se devuelven entre 5 y 8 preguntas específicas") — nota: la UI no requiere botón porque la generación es automática post-análisis (decisión de UX: menos fricción).

---

### Slice 5: SSE real-time progress (FR-018)

**Objetivo:** progreso real en vez de simulación con `setInterval`.

**Decisión arquitectónica:** mantener el endpoint JSON existente y añadir un query param `?stream=true` que cambia a SSE. Esto evita CORS pre-flight de SSE puro (los browsers no mandan OPTIONS para `text/event-stream` cuando el content type es correcto, pero algunos proxies sí).

**Backend:**
- `backend/src/api/routes/listings.ts`:
  - Si `req.query.stream === 'true'`: crear `ProgressEmitter`, pasar `onProgress` al use case, mantener conexión abierta, emitir `done` con el JSON final
  - Si no: comportamiento actual (JSON normal)
- `backend/src/api/lib/analyzeStream.ts` (nuevo, helper que conecta use case con emitter)

**Frontend:**
- `frontend/src/lib/api/streamingClient.ts` (nuevo, 60 líneas):
  - Función `analyzeListingStream(url: string, onProgress: (event, payload) => void): Promise<AnalyzeListingResponse>`
  - Usa `fetch` con `method: POST`, parsea `ReadableStream` línea por línea
  - Parser SSE-like: extrae `event:` y `data:` de cada línea, dispara `onProgress(event, JSON.parse(data))`
  - Cuando recibe `event: done`, resuelve la promise con `JSON.parse(data)`
- `frontend/src/routes/listing-lens/+page.svelte`:
  - Reemplazar `setInterval` simulado por `analyzeListingStream`
  - `onProgress` actualiza `currentStep`
  - Mantener el resto del flujo (loading, error, result)

**Manejo de errores:**
- Si el stream se corta antes de `done`, mostrar error "Análisis interrumpido, inténtalo de nuevo"
- Si el browser no soporta `ReadableStream` (muy raro hoy), fallback al modo JSON sin progress events

**Tests (1):**
- Unit test de `streamingClient.ts` con `Response` mockeado que emite 4 eventos + done
- Verificar que se llaman `onProgress` con cada evento en orden y que la promise resuelve con el payload de `done`

**AC satisfecho:** FR-018 ("La UI DEBE mostrar un estado de carga claro durante el análisis del listing con progress events"). SLA 8-15s sigue cumpliéndose (los eventos son decorativos, el use case ya está paralelizado).

---

### Slice 6: Playwright E2E happy path

**Objetivo:** un test E2E que ejecute el main flow de extremo a extremo, automatizado, reproducible.

**Estado actual:** `e2e/flows/full-flow.spec.ts` tiene 3 tests que verifican UI estática pero no llaman a la API.

**Cambios:**
- `e2e/flows/full-flow.spec.ts` (expandido, +100 líneas):
  - Test 1: dashboard empty state (existente)
  - Test 2: navigate to listing-lens + see AI disclaimer (existente)
  - Test 3: timeline shows milestones (existente)
  - **Test 4 (nuevo): full happy path**
    - Setup: clear localStorage, goto `/listing-lens`
    - Fill URL + manualText
    - Click analyze
    - Wait for result (score visible)
    - Verify red flags count
    - Click "Configurar perfil manualmente" link → navigate to `/mortgage-compass`
    - Fill savings, income, debts
    - Click "Calcular"
    - Wait for computed visible
    - Verify 4 amortization scenarios rendered
    - Verify 3 investment scenarios rendered
    - Goto `/checklist`, verify 21 items, mark first, verify progress=1/21
- `e2e/README.md` (nuevo, 50 líneas): cómo arrancar docker, backend con mocks, frontend, ejecutar playwright
- `e2e/playwright.config.ts`: añadir `webServer` config para arrancar backend + frontend automáticamente

**Configuración:**
- Backend arrancado con `MOCK_OPENROUTER=true MOCK_NOMINATIM=true MOCK_CATASTRO=true` para que no requiera red
- DB requerida: docker compose up
- `webServer.command`: `npm run dev` (root) arranca ambos

**AC satisfecho:** SC-004 ("Las 5 historias de usuario tienen cobertura de pruebas independiente + al menos 1 test E2E del flujo principal").

---

### Slice 7: Evidence + final verification

**Objetivo:** documentar todo y verificar que el MVP cumple los criterios.

**Archivos:**
- `docs/evidence/2026-07-09-MVP-COMPLETION.md` (nuevo, ~200 líneas):
  - Por cada slice: qué se hizo, commits, tests añadidos
  - Smoke test final: docker up → backend up → frontend up → curl `/health` → analyze con mockText → dashboard → mortgage compass → checklist → marcar item
  - Tabla de ACs satisfechos por historia
  - Lista de TODOs para Entrega Final (portal cron, real LLM key, etc.)
- Ejecutar y documentar:
  - `cd backend && npx tsc --noEmit` → 0 errores
  - `cd backend && npx vitest run` → todos pasan (target: 60+)
  - `cd frontend && npx tsc --noEmit` → 0 errores
  - `cd frontend && npm run build` → OK
  - `bash .opencode/skills/hexagonal-check/run.sh` → PASS
  - `npx playwright test` → 4/4 pass

**Criterio de éxito del MVP:**
- ✅ Backend, frontend y DB conectados
- ✅ Main flow funciona end-to-end (analyze → dashboard → mortgage → checklist)
- ✅ Test E2E automatizado pasa
- ✅ PWA instalable (manifest + icons)
- ✅ Lint + typecheck + tests + hexagonal-check todos verdes
- ✅ AI disclaimer persistente en todas las vistas con contenido IA
- ✅ Rate limit funcional
- 🟡 Portal health cron = stub documentado
- 🟡 Re-análisis real con LLM (no MOCK) requiere OPENROUTER_API_KEY

## Data flow

No hay cambios en el modelo de datos. El campo `diff: Json?` en `AnalyzedListing` ya existe y se usa con datos reales en este slice.

## Test strategy

| Slice | Test type | Cobertura objetivo |
|---|---|---|
| 1 | n/a (assets) | — |
| 2 | unit | xmlParser: 3 tests, CatastroAdapter: 1 test integration |
| 3 | unit | AnalyzeListingUseCase diff: 4 tests |
| 4 | unit + component | NegotiationPoints: 1 test |
| 5 | unit | streamingClient: 1 test |
| 6 | E2E | full-flow: 1 happy path |
| 7 | n/a (verification) | — |

**Total tests añadidos:**
- Backend: 3 (xmlParser) + 1 (CatastroAdapter integration) + 4 (Diff) = **8 nuevos** (56 → 64)
- Frontend: 1 (NegotiationPoints) + 1 (streamingClient) = **2 nuevos** (13 → 15)

## Risks & mitigations

| Riesgo | Probabilidad | Mitigación |
|---|---|---|
| PWA icons no se generan (ImageMagick no disponible) | Media | Fallback a script Node con `canvas` o PNG hardcoded mínimo |
| Catastro XML schema cambia | Baja | Parser defensivo con `try/catch`, retorna `null` en fallo (no rompe análisis) |
| SSE bloqueado por CORS o proxy | Media | Mantener endpoint JSON como fallback; frontend detecta y degrada |
| Playwright requiere DB + servicios corriendo | Media | `webServer` config en playwright.config.ts + mocks en backend para que no requiera red |
| Time overrun (es para mañana) | Alta | Plan de reducción: si slice 5 (SSE) se atrasa, dejar stub documentado como "simulated progress" en evidencia |

## Verification criteria (antes de declarar MVP listo)

Cada uno debe ser verde:

```bash
# Backend
cd backend && npx tsc --noEmit               # 0 errors
cd backend && npx vitest run                 # 64/64 passing
bash .opencode/skills/hexagonal-check/run.sh # PASS

# Frontend
cd frontend && npx tsc --noEmit              # 0 errors
cd frontend && npm run build                 # OK
cd frontend && npx vitest run                # 15/15 passing

# E2E
cd e2e && npx playwright install --with-deps # one-time
cd e2e && npx playwright test                # 4/4 passing

# Manual smoke
docker compose up -d
cd backend && MOCK_OPENROUTER=true npm run dev &
cd frontend && npm run dev &
# curl /health, analyze, dashboard, mortgage, checklist
```

## Files modified summary

**Backend (6 archivos):**
- `backend/package.json` (+1 dep: fast-xml-parser)
- `backend/src/api/routes/listings.ts` (SSE branch)
- `backend/src/api/lib/analyzeStream.ts` (new, ~40 lines)
- `backend/src/adapters/catastro/CatastroAdapter.ts` (XML parse branch)
- `backend/src/adapters/catastro/xmlParser.ts` (new, ~60 lines)
- `backend/src/domain/services/AnalyzeListingUseCase.ts` (real diff)
- `backend/src/index.ts` (portal health stub + log)

**Backend tests (3 archivos, 8 tests nuevos):**
- `backend/tests/unit/adapters/catastro/xmlParser.test.ts` (new, 3 tests)
- `backend/tests/unit/adapters/catastro/CatastroAdapter.test.ts` (new, 1 test integration)
- `backend/tests/unit/domain/services/AnalyzeListingUseCase.diff.test.ts` (new, 4 tests)

**Frontend (7 archivos):**
- `frontend/static/icons/icon-192.png` (new)
- `frontend/static/icons/icon-512.png` (new)
- `frontend/static/icons/maskable-icon-512.png` (new)
- `frontend/static/icons/generate.sh` (new, helper)
- `frontend/src/lib/components/NegotiationPoints.svelte` (new)
- `frontend/src/lib/components/DiffBadge.svelte` (new)
- `frontend/src/lib/api/streamingClient.ts` (new)
- `frontend/src/lib/api/client.ts` (+1 method)
- `frontend/src/lib/api/types.ts` (+2 types)
- `frontend/src/routes/listing-lens/+page.svelte` (integrate NegotiationPoints + SSE)
- `frontend/src/routes/+page.svelte` (DiffBadge)

**Frontend tests (2 archivos):**
- `frontend/tests/unit/components/NegotiationPoints.test.ts` (new)
- `frontend/tests/unit/api/streamingClient.test.ts` (new)

**E2E (2 archivos):**
- `e2e/flows/full-flow.spec.ts` (expanded)
- `e2e/README.md` (new)
- `e2e/playwright.config.ts` (webServer config)

**Docs (1 archivo):**
- `docs/evidence/2026-07-09-MVP-COMPLETION.md` (new)

**Total: ~20 archivos modificados/creados.**

## Open questions

Ninguna — todas resueltas en la sesión de brainstorming.

## Next step

Invocar `writing-plans` skill para descomponer este design en tasks ejecutables (Phase 2 del SDD workflow).
