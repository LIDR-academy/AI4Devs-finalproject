# Tareas: Realista MVP

**Input**: Documentos de diseño desde `/specs/001-realista-mvp/`

**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Tests OBLIGATORIOS (Principio II de la Constitución: Test-First). Ciclo TDD: escribir tests → fallar → implementar → verde → refactorizar. Objetivo: 80%+ cobertura en dominio.

**Organización**: Tareas agrupadas por historia de usuario para implementación y testing independiente.

## Formato: `[ID] [P?] [Historia] Descripción`

- **[P]**: Puede ejecutarse en paralelo (archivos diferentes, sin dependencias)
- **[Historia]**: A qué historia de usuario pertenece (ej: US1, US2, US3)
- Incluir rutas exactas de archivos en las descripciones

## Convenciones de Path

- **Web app**: `backend/src/`, `frontend/src/`
- **Tests**: `backend/tests/`, `frontend/tests/`, `e2e/`
- Basado en la estructura monorepo de plan.md

---

## Fase 1: Setup (Infraestructura compartida)

**Propósito**: Inicialización del proyecto, herramientas y CI skeleton

- [ ] T001 Crear estructura de monorepo con `backend/`, `frontend/`, `e2e/` según plan.md
- [ ] T002 [P] Inicializar backend package.json con TypeScript + Express en `backend/package.json`
- [ ] T003 [P] Inicializar proyecto SvelteKit con Vite en `frontend/` mediante `npm create svelte@latest`
- [ ] T004 [P] Configurar TypeScript strict mode en `backend/tsconfig.json` y `frontend/tsconfig.json`
- [ ] T005 [P] Configurar ESLint + Prettier con config compartida en `.eslintrc.json` y `.prettierrc`
- [ ] T006 [P] Crear `.env.example` con DATABASE_URL, OPENROUTER_API_KEY, PORT, FRONTEND_URL en raíz del proyecto
- [ ] T007 Crear skeleton de GitHub Action en `.github/workflows/ci.yml` (lint → typecheck → test)
- [ ] T008 Instalar Vitest en backend y frontend con archivos de config en `backend/vitest.config.ts` y `frontend/vitest.config.ts`
- [ ] T009 Instalar Playwright para E2E en `e2e/playwright.config.ts`

**Checkpoint**: El proyecto compila, lint y test runner ejecutan (incluso sin tests aún)

---

## Fase 2: Foundational (Prerequisitos bloqueantes)

**Propósito**: Infraestructura central que DEBE estar completa antes de implementar cualquier historia de usuario

**⚠️ CRÍTICO**: Ningún trabajo de historia de usuario puede empezar hasta que esta fase esté completa

- [ ] T010 Definir schema Prisma en `backend/src/infrastructure/prisma/schema.prisma` con los modelos: User, PurchaseProcess, AnalyzedListing, Checklist (según data-model.md)
- [ ] T011 Generar Prisma client y crear migración inicial con `npx prisma migrate dev --name init`
- [ ] T012 Crear singleton del PrismaClient en `backend/src/infrastructure/prisma/client.ts`
- [ ] T013 Configurar entry point de Express en `backend/src/index.ts` con CORS, JSON body parser, endpoint health
- [ ] T014 [P] Implementar middleware de sesión: generar/validar UUID v4, guardar en header `X-Session-Id` en `backend/src/api/middleware/session.ts`
- [ ] T015 [P] Implementar middleware de rate limit: 20 req/día por UUID de sesión en `backend/src/api/middleware/rateLimiter.ts`
- [ ] T016 [P] Crear loader de configuración de entorno con validación en `backend/src/infrastructure/config/env.ts`
- [ ] T017 [P] Crear middleware de manejo de errores (errores de dominio → códigos HTTP) en `backend/src/api/middleware/errorHandler.ts`
- [ ] T018 Crear agregado de dominio User con UUID id, userId opcional, createdAt en `backend/src/domain/aggregates/User.ts`
- [ ] T019 [P] Crear agregado de dominio PurchaseProcess con status, propertyPrice, sourceListingId, financialProfile JSON en `backend/src/domain/aggregates/PurchaseProcess.ts`
- [ ] T020 [P] Configurar layout shell de SvelteKit con nav tabs mobile-first en `frontend/src/routes/+layout.svelte`
- [ ] T021 [P] Crear cliente API base con wrapper fetch gestionando header X-Session-Id en `frontend/src/lib/api/client.ts`
- [ ] T022 Crear store de sesión (Svelte writable) gestionando ciclo de vida del UUID de sesión en `frontend/src/lib/stores/session.ts`

**Checkpoint**: El backend arranca, las migraciones corren, la cadena de middleware funciona, el frontend carga con layout

---

## Fase 3: Historia de Usuario 1 - Listing Lens (Prioridad: P1) 🎯 MVP

**Objetivo**: Usuario pega URL del anuncio → análisis LLM + cruce catastral → puntuación de transparencia + informe de banderas rojas

**Prueba independiente**: POST URL de anuncio simulado a `/api/listings/analyze` → verificar 200 con score, redFlags, comparativa catastral y `processSummary` con el proceso asociado

### Tests para Historia 1

> Escribir estos PRIMERO, asegurar que FALLAN antes de la implementación

- [ ] T023 [P] [US1] Test unitario TransparencyScore value object en `backend/tests/unit/domain/value-objects/TransparencyScore.test.ts`
- [ ] T024 [P] [US1] Test unitario RedFlags value object en `backend/tests/unit/domain/value-objects/RedFlags.test.ts`
- [ ] T025 [P] [US1] Test unitario AnalyzeListingUseCase con ports mockeados en `backend/tests/unit/domain/services/AnalyzeListingUseCase.test.ts`
- [ ] T026 [P] [US1] Test de integración POST /api/listings/analyze con Cheerio + LLM mockeados en `backend/tests/integration/api/listings.test.ts`
- [ ] T027 [P] [US1] Test de contrato para endpoint analyze según contracts/api.md en `backend/tests/contract/test_listings_analyze.test.ts`
- [ ] T023a [P] [US1] Test unitario LocationResolverPort chain (Declared → Geocoding → Vision) en `backend/tests/unit/domain/ports/LocationResolverPort.test.ts`
- [ ] T023b [P] [US1] Test unitario lógica de auto-attach: crea PurchaseProcess cuando no hay activa, adjunta a la existente en `backend/tests/unit/domain/services/AutoAttachService.test.ts`
- [ ] T023c [P] [US1] Test de integración endpoint analyze devolviendo `processSummary` en `backend/tests/integration/api/listings.test.ts`

### Implementación para Historia 1

- [ ] T028 [US1] Crear TransparencyScore value object con score 0-100, label, breakdown en `backend/src/domain/value-objects/TransparencyScore.ts`
- [ ] T029 [P] [US1] Crear RedFlags value object con tipos de flags y etiquetas en español en `backend/src/domain/value-objects/RedFlags.ts`
- [ ] T030 [US1] Crear interfaz ListingAnalyzerPort en `backend/src/domain/ports/ListingAnalyzerPort.ts`
- [ ] T030a [US1] Crear interfaz LocationResolverPort con `resolveLocation(parsedListing): Promise<Coordinates | null>` en `backend/src/domain/ports/LocationResolverPort.ts`
- [ ] T030b [P] [US1] Crear Coordinates value object `{ lat: number, lng: number, source: 'declared' | 'geocoded' | 'vision', confidence: number }` en `backend/src/domain/value-objects/Coordinates.ts`
- [ ] T031 [P] [US1] Crear interfaz CadastroPort en `backend/src/domain/ports/CadastroPort.ts`
- [ ] T032 [US1] Implementar CheerioAdapter (parseo HTML, extracción de texto) en `backend/src/adapters/cheerio/CheerioAdapter.ts`
- [ ] T032a [US1] Implementar DeclaredLocationAdapter (extrae dirección/barrio declarado del HTML con selectores Cheerio) en `backend/src/adapters/location/DeclaredLocationAdapter.ts`
- [ ] T032b [US1] Implementar GeocodingAdapter (Nominatim OSM, gratis, sin API key) en `backend/src/adapters/location/GeocodingAdapter.ts`
- [ ] T032c [US1] Implementar LLMVisionLocationAdapter (OpenRouter multimodal, fallback con análisis de fotos) en `backend/src/adapters/location/LLMVisionLocationAdapter.ts`
- [ ] T032d [US1] Implementar LocationResolverService que encadena los 3 adaptadores en orden en `backend/src/domain/services/LocationResolverService.ts`
- [ ] T033 [US1] Implementar OpenRouterAdapter (LLM system prompt, salida JSON estructurada) en `backend/src/adapters/openrouter/OpenRouterAdapter.ts`
- [ ] T034 [US1] Implementar AvenaScoreAdapter (@avena/score fallback) en `backend/src/adapters/avena-score/AvenaScoreAdapter.ts`
- [ ] T035 [US1] Implementar CatastroAdapter (cross-reference API, consulta por coordenadas — ahora consume Coordinates de LocationResolverService) en `backend/src/adapters/catastro/CatastroAdapter.ts`
- [ ] T036 [US1] Implementar MiraTuZonaAdapter (generación de enlace de ubicación) en `backend/src/adapters/miratuzona/MiraTuZonaAdapter.ts`
- [ ] T037 [US1] Implementar AnalyzeListingUseCase orquestando adaptadores (LLM → location resolver → cruce catastral → MiraTuZona) en `backend/src/domain/services/AnalyzeListingUseCase.ts`
- [ ] T037a [US1] Implementar AutoAttachService: si no hay PurchaseProcess activa, crear una con `propertyPrice` del listing; si existe, adjuntar en `backend/src/domain/services/AutoAttachService.ts`
- [ ] T037b [US1] Actualizar AnalyzeListingUseCase para devolver `processSummary` en la respuesta de analyze en `backend/src/domain/services/AnalyzeListingUseCase.ts`
- [ ] T038 [US1] Crear agregado de dominio AnalyzedListing (según data-model.md) en `backend/src/domain/aggregates/AnalyzedListing.ts`
- [ ] T039 [US1] Implementar ruta analyze listing POST /api/listings/analyze (ahora devuelve processSummary) en `backend/src/api/routes/listings.ts`
- [ ] T040 [US1] Crear controlador de listings gestionando validación de request y dispatch de use case en `backend/src/api/controllers/listingsController.ts`
- [ ] T041 [US1] Añadir helper de validación de URL (valida formato, comprueba accesibilidad) en `backend/src/infrastructure/utils/urlValidator.ts`
- [ ] T042 [US1] Crear UI de página Listing Lens con input URL, **estado de carga con tiempo estimado 5-12s** (FR-018), tarjeta de resultados en `frontend/src/routes/listing-lens/+page.svelte`
- [ ] T042a [US1] Crear componente AI disclaimer mostrado en resultados de análisis (FR-017) en `frontend/src/lib/components/AIDisclaimer.svelte`
- [ ] T043 [US1] Crear server-side loader que proxy la petición analyze al backend en `frontend/src/routes/listing-lens/+page.server.ts`
- [ ] T044 [US1] Crear store de listings (Svelte writable) para historial de listings analizados en `frontend/src/lib/stores/listings.ts`

**Checkpoint**: Listing Lens totalmente funcional — pegar URL, obtener score + red flags + comparativa catastral + auto-attach al PurchaseProcess con `processSummary`. Ciclo TDD completo.

---

## Fase 4: Historia de Usuario 2 - Mortgage Compass (Prioridad: P1) 🎯 MVP

**Objetivo**: Usuario introduce datos financieros → gastos ocultos revelados → preguntas de perfil → comparativa de estrategias (amortización vs inversión) → narrativa educativa

**Prueba independiente**: POST perfil financiero a `/api/purchase-processes` con `analyzedListingId` → verificar que `propertyPrice` se pre-rellena del listing, y se devuelven gastos ocultos, escenarios de estrategia y narrativa basada en plantillas

### Tests para Historia 2

> Escribir estos PRIMERO, asegurar que FALLAN antes de la implementación

- [ ] T045 [P] [US2] Test unitario FinancialProfile value object con validación en `backend/tests/unit/domain/value-objects/FinancialProfile.test.ts`
- [ ] T046 [P] [US2] Test unitario calculador HiddenCosts (ITP/IVA por región, notaría, registro) en `backend/tests/unit/domain/value-objects/HiddenCosts.test.ts`
- [ ] T047 [P] [US2] Test unitario calculador AmortizationScenario (30yr, amortización anticipada voluntaria) en `backend/tests/unit/domain/services/AmortizationCalculator.test.ts`
- [ ] T048 [P] [US2] Test unitario calculador InvestmentAlternative (interés compuesto) en `backend/tests/unit/domain/services/InvestmentCalculator.test.ts`
- [ ] T049 [P] [US2] Test unitario plantillas narrativas educativas (mapeo persona ↔ plantilla) en `backend/tests/unit/domain/services/NarrativeGenerator.test.ts`
- [ ] T050 [P] [US2] Test de integración POST /api/purchase-processes con perfil completo en `backend/tests/integration/api/purchaseProcesses.test.ts`
- [ ] T050a [P] [US2] Test de integración POST /api/purchase-processes con `analyzedListingId` pre-rellenando `propertyPrice` en `backend/tests/integration/api/purchaseProcesses.test.ts`
- [ ] T050b [P] [US2] Test de integración GET /api/purchase-processes/:id devolviendo campo `computed` con escenarios de amortización en `backend/tests/integration/api/purchaseProcesses.test.ts`

### Implementación para Historia 2

- [ ] T051 [US2] Crear FinancialProfile value object con validación (price, savings, income, debts, region, persona) en `backend/src/domain/value-objects/FinancialProfile.ts`
- [ ] T052 [P] [US2] Crear HiddenCosts value object con tasas ITP/IVA regionales, costes fijos en `backend/src/domain/value-objects/HiddenCosts.ts`
- [ ] T053 [US2] Implementar calculador de gastos ocultos por comunidad autónoma en `backend/src/domain/services/HiddenCostsCalculator.ts`
- [ ] T054 [US2] Implementar calculador de amortización: 30yr base, 4 escenarios (baseline, ligero €100/mes, moderado €300/mes, agresivo €500/mes) en `backend/src/domain/services/AmortizationCalculator.ts`
- [ ] T055 [US2] Implementar calculador de alternativa de inversión: compuesto 5-7% a 30 años en `backend/src/domain/services/InvestmentCalculator.ts`
- [ ] T056 [US2] Implementar generador de narrativas: plantillas educativas hardcoded mapeadas a combos persona × escenario en `backend/src/domain/services/NarrativeGenerator.ts`
- [ ] T057 [US2] Implementar ruta POST /api/purchase-processes (ahora acepta `analyzedListingId` y pre-rellena `propertyPrice`) en `backend/src/api/routes/purchaseProcesses.ts`
- [ ] T057a [US2] Implementar lógica de pre-relleno en PurchaseProcessUseCase: si `analyzedListingId` se pasa, copiar `propertyPrice` del listing y setear `sourceListingId` en `backend/src/domain/services/PurchaseProcessUseCase.ts`
- [ ] T058 [US2] Implementar ruta GET /api/purchase-processes/:id (ahora devuelve campo `computed` con escenarios de amortización y alternativa de inversión) en `backend/src/api/routes/purchaseProcesses.ts`
- [ ] T058a [US2] Implementar agregador de campos computed que ejecuta calculadores de amortización e inversión y devuelve el resultado en `backend/src/domain/services/PurchaseProcessAggregator.ts`
- [ ] T059 [US2] Implementar ruta PATCH /api/purchase-processes/:id (ahora soporta update directo de `propertyPrice` para permitir override) en `backend/src/api/routes/purchaseProcesses.ts`
- [ ] T060 [US2] Crear controlador de purchase process en `backend/src/api/controllers/purchaseProcessController.ts`
- [ ] T061 [US2] Crear UI de página Mortgage Compass: formulario multi-paso (perfil → gastos ocultos → persona → playground de estrategias). **propertyPrice pre-rellenado del listing con link a la fuente. Mostrar AI disclaimer** en `frontend/src/routes/mortgage-compass/+page.svelte`
- [ ] T062 [US2] Crear server-side loader que proxy el purchase process al backend en `frontend/src/routes/mortgage-compass/+page.server.ts`
- [ ] T063 [US2] Crear store de perfil financiero en `frontend/src/lib/stores/financialProfile.ts`

**Checkpoint**: Mortgage Compass totalmente funcional — `propertyPrice` pre-rellenado del listing, ver gastos ocultos, obtener comparativa de estrategias. Ciclo TDD completo.

---

## Fase 5: Historia de Usuario 3 - Dashboard (Prioridad: P2)

**Objetivo**: Usuario ve dashboard con el `PurchaseProcess` activo — listing más reciente, perfil financiero, gastos ocultos, estado del checklist, acceso a herramientas. Soporta re-análisis con detección de diff.

**Prueba independiente**: Analizar un listing (crea proceso), completar perfil financiero, recargar dashboard → verificar que el estado completo del proceso persiste y se muestra correctamente.

### Tests para Historia 3

> Escribir estos PRIMERO, asegurar que FALLAN antes de la implementación

- [ ] T064 [P] [US3] Test de integración GET /api/purchase-processes/:id devolviendo `computed` con escenarios de amortización y listings en `backend/tests/integration/api/purchaseProcesses.test.ts`
- [ ] T065 [P] [US3] Test de integración de detección de diff en re-análisis (snapshot anterior vs nuevo) en `backend/tests/integration/api/listings.test.ts`
- [ ] T066 [P] [US3] Test de componente Dashboard renderizando proceso activo, listings y checklist en `frontend/tests/unit/routes/Dashboard.test.ts`

### Implementación para Historia 3

- [ ] T067 [US3] Implementar ruta GET /api/listings devolviendo todos los listings del proceso activo en `backend/src/api/routes/listings.ts`
- [ ] T068 [US3] Implementar ruta GET /api/listings/:id devolviendo detalle de un listing con diff vs snapshot anterior en `backend/src/api/routes/listings.ts`
- [ ] T069 [US3] Implementar servicio de comparación de snapshots (SHA-256 diff detection) para re-análisis en `backend/src/domain/services/SnapshotService.ts`
- [ ] T070 [US3] Implementar ruta GET /api/session devolviendo/creando UUID de sesión en `backend/src/api/routes/session.ts`
- [ ] T071 [US3] Crear UI de página Dashboard: tarjetas de listing, instantánea financiera, CTAs, estado vacío (sin proceso activo) en `frontend/src/routes/+page.svelte` (sobreescribe el home por defecto)
- [ ] T072 [US3] Crear server-side loader que obtiene el purchase process activo con `computed` para el dashboard en `frontend/src/routes/+page.server.ts`
- [ ] T073 [US3] Implementar flujo de re-análisis: botón dispara nuevo análisis, muestra highlight del diff en `frontend/src/lib/stores/listings.ts`

**Checkpoint**: Dashboard totalmente funcional — estado del proceso, instantánea financiera, re-análisis con diff. Las historias P1+P2 funcionando independientemente.

---

## Fase 6: Historia de Usuario 4 - Cronograma Interactivo (Prioridad: P3)

**Objetivo**: Usuario visualiza línea temporal de 60-90 días desde arras hasta escritura con detalles de hitos

**Prueba independiente**: Abrir página del cronograma → verificar todos los hitos mostrados con descripciones y duraciones

### Implementación para Historia 4

- [ ] T074 [US4] Crear BureaucraticMilestone value object con etapas, duraciones, requisitos documentales en `backend/src/domain/value-objects/BureaucraticMilestone.ts`
- [ ] T075 [US4] Crear datos estáticos del cronograma: arras → verificación legal → tasación → hipoteca → notaría → registro → escritura en `frontend/src/lib/data/timelineData.ts`
- [ ] T076 [US4] Crear UI de página Timeline con línea temporal vertical, hitos expandibles en `frontend/src/routes/timeline/+page.svelte`

**Checkpoint**: Timeline totalmente funcional — visual, interactivo, todos los hitos detallados

---

## Fase 7: Historia de Usuario 5 - Checklist Documental (Prioridad: P3)

**Objetivo**: Usuario hace seguimiento de qué documentos tiene/qué necesita por etapa. El progreso persiste.

**Prueba independiente**: Abrir checklist → marcar ítems → recargar → verificar progreso persistido

### Tests para Historia 5

> Escribir estos PRIMERO, asegurar que FALLAN antes de la implementación

- [ ] T077 [P] [US5] Test de integración PATCH /api/checklist/:processId/items/:itemId toggle de completado en `backend/tests/integration/api/checklist.test.ts`

### Implementación para Historia 5

- [ ] T078 [US5] Crear agregado de dominio Checklist (según data-model.md) en `backend/src/domain/aggregates/Checklist.ts`
- [ ] T079 [US5] Implementar ruta GET /api/checklist/:processId en `backend/src/api/routes/checklist.ts`
- [ ] T080 [US5] Implementar ruta PATCH /api/checklist/:processId/items/:itemId para toggle en `backend/src/api/routes/checklist.ts`
- [ ] T081 [US5] Crear controlador de checklist en `backend/src/api/controllers/checklistController.ts`
- [ ] T082 [US5] Crear datos seed de checklist estático (documentos por etapa: pre-arras, post-arras, pre-escritura, post-escritura) en `backend/src/infrastructure/prisma/seed.ts`
- [ ] T083 [US5] Crear UI de página Checklist: ítems agrupados por etapa, barras de progreso, interacción de toggle en `frontend/src/routes/checklist/+page.svelte`

**Checkpoint**: Checklist totalmente funcional — agrupado por etapa, toggle persiste, progreso tracked

---

## Fase 8: Polish & Cross-Cutting Concerns

**Propósito**: PWA, E2E, validación final, AI disclaimers globales

- [ ] T084 Configurar PWA con `@vite-pwa/sveltekit`: service worker, manifest, iconos en `frontend/vite.config.ts`
- [ ] T085 [P] Generar iconos PWA (192px, 512px) desde SVG base en `frontend/static/`
- [ ] T086 [P] Añadir skeletons de carga y estados de error a todas las páginas (Listing Lens, Mortgage Compass, Dashboard)
- [ ] T087 [P] Añadir mensajes de error y etiquetas de UI en español consistentes en todas las páginas
- [ ] T088 Crear test E2E: flujo completo (pegar URL → score → perfil financiero → gastos ocultos → estrategia → dashboard) en `e2e/flows/full-flow.spec.ts`
- [ ] T089 Ejecutar validación de quickstart.md: verificar que todos los comandos de setup y test funcionan desde cero
- [ ] T090 TypeScript typecheck + lint pass final en todos los paquetes
- [ ] T091 Añadir script de seed de Prisma con datos de checklist de muestra y valor por defecto del Euríbor
- [ ] T091a [P] Añadir banner global de AI disclaimer en el layout principal (`+layout.svelte`) explicando que el análisis es generado por IA en `frontend/src/routes/+layout.svelte`
- [ ] T091b [P] Añadir página estática `/aviso-legal` con disclaimer completo de IA y no-consejo-financiero en `frontend/src/routes/aviso-legal/+page.svelte`

---

## Dependencias y Orden de Ejecución

### Dependencias entre Fases

- **Setup (Fase 1)**: Sin dependencias — empezar inmediatamente
- **Foundational (Fase 2)**: Depende de Setup completo — BLOQUEA todas las historias
- **US1 Listing Lens (Fase 3)**: Depende de Foundational
- **US2 Mortgage Compass (Fase 4)**: Depende de Foundational. Independiente de US1 (diferentes servicios de dominio, rutas, páginas). El pre-fill por listing es una integración posterior.
- **US3 Dashboard (Fase 5)**: Depende de Foundational. Necesita rutas de US1+US2 para visualización, pero independientemente testeable vía API
- **US4 Timeline (Fase 6)**: Depende de Foundational. Contenido estático, no necesita backend. Independiente
- **US5 Checklist (Fase 7)**: Depende de Foundational. Independiente de otras historias
- **Polish (Fase 8)**: Depende de todas las historias deseadas completas

### Dependencias entre Historias de Usuario

- **US1 (P1)**: Sin dependencias de otras historias. Empezar tras Fase 2
- **US2 (P1)**: Sin dependencias en código. Puede correr en paralelo con US1
- **US3 (P2)**: Idealmente tras US1+US2 para visualización completa de datos, pero la API es independientemente testeable
- **US4 (P3)**: Estática, sin dependencias de API. Puede correr en cualquier momento tras Fase 2
- **US5 (P3)**: Sin dependencias de otras historias. Puede correr en cualquier momento tras Fase 2

### Dentro de cada Historia de Usuario

- Los tests DEBEN escribirse PRIMERO y FALLAR antes de la implementación
- Value objects de dominio → servicios de dominio → adaptadores → rutas API → controladores
- Backend completo antes de las páginas frontend de esa historia
- Historia completa e independientemente testeada antes de pasar a la siguiente prioridad

### Oportunidades de Paralelización

- T002, T003, T004, T005, T006 en Setup pueden correr en paralelo
- T014, T015, T016, T017 en Foundational pueden correr en paralelo
- T023-T027 y T023a-T023c (tests US1) pueden correr en paralelo
- T045-T050 y T050a-T050b (tests US2) pueden correr en paralelo
- T028-T029, T031, T030a, T030b (modelos/puertos US1) pueden correr en paralelo
- T032-T036, T032a-T032c (adaptadores US1) son independientes y pueden correr en paralelo
- T051-T052 (modelos US2) pueden correr en paralelo
- US1 (Fase 3) y US2 (Fase 4) pueden correr en paralelo tras Foundational
- US4 (Fase 6) y US5 (Fase 7) pueden correr en paralelo

---

## Ejemplo Paralelo: Tests + Modelos de Historia 1

```bash
# Lanzar todos los tests de US1 en paralelo:
Task: "T023: Test unitario TransparencyScore en backend/tests/unit/domain/value-objects/TransparencyScore.test.ts"
Task: "T024: Test unitario RedFlags en backend/tests/unit/domain/value-objects/RedFlags.test.ts"
Task: "T025: Test unitario AnalyzeListingUseCase en backend/tests/unit/domain/services/AnalyzeListingUseCase.test.ts"
Task: "T026: Test de integración endpoint analyze en backend/tests/integration/api/listings.test.ts"

# Lanzar todos los adaptadores de US1 en paralelo:
Task: "T032: Implementar CheerioAdapter en backend/src/adapters/cheerio/CheerioAdapter.ts"
Task: "T032a: Implementar DeclaredLocationAdapter en backend/src/adapters/location/DeclaredLocationAdapter.ts"
Task: "T032b: Implementar GeocodingAdapter en backend/src/adapters/location/GeocodingAdapter.ts"
Task: "T033: Implementar OpenRouterAdapter en backend/src/adapters/openrouter/OpenRouterAdapter.ts"
Task: "T034: Implementar AvenaScoreAdapter en backend/src/adapters/avena-score/AvenaScoreAdapter.ts"
```

---

## Estrategia de Implementación

### MVP Primero (Historias 1 + 2)

1. Completar Fase 1: Setup
2. Completar Fase 2: Foundational (CRÍTICO — bloquea todas las historias)
3. Completar Fase 3: Historia 1 (Listing Lens) + Fase 4: Historia 2 (Mortgage Compass) en paralelo
4. **PARAR y VALIDAR**: Probar ambas independientemente vía API + frontend
5. Desplegar/demo — esto ES un MVP viable con las dos features principales

### Entrega Incremental

1. Setup + Foundational → Foundation ready
2. US1 Listing Lens → Test independiente → Demo
3. US2 Mortgage Compass → Test independiente → Demo
4. US3 Dashboard → une US1+US2 → Demo experiencia completa
5. US4 Timeline → Demo con contexto
6. US5 Checklist → Demo herramienta práctica
7. Polish + E2E → Entrega final

### Estrategia Paralela

Con las dos historias P1 (US1, US2) sin dependencias de código entre sí:
- Tras Foundational, implementar US1 y US2 en paralelo
- US1: dominio (listings, scoring, catastral) → adaptadores → API → frontend
- US2: dominio (finance, mortgage, plantillas) → API → frontend
- US3 (Dashboard) integra ambos cuando estén listos

---

## Notas

- Las tareas [P] = archivos diferentes, sin dependencias
- La etiqueta [Historia] mapea la tarea a la historia de usuario específica (requisito de trazabilidad del cohort)
- Cada historia de usuario es independientemente completable y testeable
- Los tests DEBEN escribirse y FALLAR antes de la implementación (TDD según constitución)
- Commit tras cada tarea o grupo lógico
- Parar en cualquier checkpoint para validar la historia independientemente
- El backend usa arquitectura hexagonal: domain/ → adapters/ → api/
- El frontend usa routing basado en archivos de SvelteKit con loaders `+page.server.ts`
- Todos los IDs de tarea son secuenciales (T001–T091b) para referencia cruzada con tickets del cohort
