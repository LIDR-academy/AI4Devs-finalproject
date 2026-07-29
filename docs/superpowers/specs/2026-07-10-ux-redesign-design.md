# Design: Realista UX Redesign — landing, logo, header, stepper, paste fallback

**Date**: 2026-07-10
**Agent**: implementer
**Branch**: `feature-entrega2-DMM`
**Status**: approved (all open questions resolved 2026-07-10)
**Related**: `specs/001-realista-mvp/spec.md`, AGENTS.md

## Context

El usuario probó la app en local y reportó 4 issues de UX que afectan a la primera impresión y a un flujo concreto:

1. **No hay landing** — la raíz `/` es directamente el dashboard. Un visitante anónimo llega al dashboard sin contexto de qué es Realista ni de por qué debería confiar en la app.
2. **El logo no existe** — la cabecera tiene tabs inferiores con iconos emoji, sin marca visual. La identidad "anti-hype / honesto" no se transmite.
3. **Las funcionalidades parecen independientes** — el ListingLens, MortgageCompass, Timeline y Checklist no se perciben como un proceso secuencial. El usuario no sabe en qué paso está ni qué viene después.
4. **El pegado de texto no se expone** — cuando Idealista bloquea el fetch, la app muestra un mensaje "pega el texto del anuncio" pero no hay ningún textarea en la UI. El usuario no sabe dónde pegarlo. Además, el bloqueo es un problema técnico (UA "Realista/1.0..." se filtra al primer request).

El branding (casa + arcoíris convergente) se trabajó con el usuario vía brainstorming visual; el resultado está descrito en este spec.

## Scope

### In scope (este design)

1. Nueva **landing** en `/` (hero + stepper 3 pasos + CTA "Analizar un anuncio").
2. Dashboard actual se mueve a **`/mi-proceso`** (decisión confirmada en review).
3. Componente **`Logo`** (SVG inline) con la marca "casa-prisma arcoíris convergente" y wordmark "Realista" en Plus Jakarta Sans 800.
4. Componente **`Header`** fijo arriba con solo el logo (YAGNI: sin hamburguesa, sin breadcrumb, sin contador).
5. **`NavTabs` reemplazado por `ProcessStepper`** — los tabs dejan de ser iconos emoji y pasan a ser un stepper numerado conectado por flechas (3 pasos del proceso de compra).
6. **`ListingLens` con tabs URL / Texto** — selector de modo; cuando la URL falla, se tacha con ✕ y el sistema salta automáticamente a Texto.
7. **Backend `CheerioAdapter`** — User-Agent de Chrome real, headers de navegador (Accept, Accept-Encoding, Accept-Language, Sec-Fetch-*, Referer), reintentos con backoff exponencial.
8. Tests unit (Vitest) y e2e (Playwright) para los componentes nuevos y los flujos modificados.

### Out of scope (deferred)

- i18n, auth, sync entre dispositivos — sigue fuera del MVP.
- Regenerar la landing como SSG o prerender — sigue siendo SvelteKit client-rendered.
- Página "Acerca de" y "Privacidad" — se omiten por YAGNI; el menú hamburguesa no existe.
- Cron de Portal Health Check (FR-027) — ya está diferido en el spec anterior.

### In scope confirmado en review (2026-07-10)

- Regenerar PWA icons (192, 512, 512-maskable) y favicon.ico desde el SVG del logo, como commit 7 del PR. Si no hay ImageMagick, fallback a Node script con `sharp` o similar.

## Architecture

Sin cambios arquitectónicos mayores. Todo es a nivel de componentes Svelte + un par de rutas + un par de cambios en el `CheerioAdapter`. La separación hexagonal se preserva: el cambio de UA vive en `infrastructure/utils/urlValidator.ts` (constante) y en `adapters/cheerio/CheerioAdapter.ts` (uso).

**Estructura de archivos a tocar:**

```
frontend/
├── src/
│   ├── app.html                                      [modificado: añade link a Google Fonts]
│   ├── app.css                                       [modificado: variables color, fuente]
│   ├── routes/
│   │   ├── +layout.svelte                           [modificado: usa Header + ProcessStepper]
│   │   ├── +page.svelte                              [modificado: nueva landing]
│   │   ├── mi-proceso/+page.svelte                    [nuevo: contenido del antiguo /]
│   │   ├── listing-lens/+page.svelte                 [modificado: tabs URL/Texto]
│   │   ├── mortgage-compass/+page.svelte             [sin cambio de contenido, stepper se actualiza]
│   │   ├── timeline/+page.svelte                     [sin cambio de contenido]
│   │   └── checklist/+page.svelte                   [sin cambio de contenido]
│   ├── lib/
│   │   ├── components/
│   │   │   ├── Logo.svelte                           [nuevo]
│   │   │   ├── Header.svelte                         [nuevo]
│   │   │   ├── ProcessStepper.svelte                 [nuevo, reemplaza NavTabs]
│   │   │   ├── ListingTabs.svelte                    [nuevo: tabs URL/Texto]
│   │   │   ├── LandingHero.svelte                    [nuevo]
│   │   │   ├── LandingStepper.svelte                 [nuevo]
│   │   │   └── NavTabs.svelte                        [eliminado]
│   │   └── stores/
│   │       └── process.ts                            [verificado: ya tiene currentStep, encaja]
│   └── tests/
│       └── unit/components/
│           ├── Logo.test.ts                          [nuevo]
│           ├── Header.test.ts                        [nuevo]
│           ├── ProcessStepper.test.ts                [nuevo]
│           ├── LandingHero.test.ts                   [nuevo]
│           ├── LandingStepper.test.ts                [nuevo]
│           └── ListingTabs.test.ts                   [nuevo]
├── e2e/
│   └── flows/
│       ├── full-flow.spec.ts                         [modificado: aserciones para header, stepper, landing]
│       └── ux-redesign.spec.ts                       [nuevo: e2e del flujo de paste fallback]

backend/
├── src/
│   ├── adapters/cheerio/
│   │   └── CheerioAdapter.ts                         [modificado: UA Chrome, headers, retry]
│   └── infrastructure/utils/
│       └── urlValidator.ts                           [modificado: constante BROWSER_HEADERS + CHROME_UA]
├── tests/
│   └── unit/adapters/cheerio/
│       ├── CheerioAdapter.headers.test.ts            [nuevo]
│       └── CheerioAdapter.retry.test.ts              [nuevo]
```

**Pruebas adicionales no listadas por brevedad**: tests unit del backoff exponencial, tests de la transición de tab en `ListingTabs` cuando llega el error, tests del `ProcessStepper` para la lógica de completado/activo.

## Branding: el logo (casa-prisma arcoíris)

Decisión visual del brainstorming: **casa con paredes achatadas + 3 haces arcoíris convergentes → 1 salida azul con punto**. Wordmark "Realista" en Plus Jakarta Sans 800, color `#1e3a8a`.

**SVG final (inline en `Logo.svelte`):**

```svg
<svg viewBox="0 0 64 44" width="100%" height="100%" fill="none" aria-hidden="true">
  <!-- Casa achatada (paredes 12u, roof 16u) -->
  <path d="M10 34 L10 22 L28 6 L46 22 L46 34 Z" stroke="#1e3a8a" stroke-width="3" stroke-linejoin="round" fill="none"/>
  <line x1="10" y1="34" x2="46" y2="34" stroke="#1e3a8a" stroke-width="3" stroke-linecap="round"/>

  <!-- 3 entradas arcoíris convergentes (rojo, amarillo, azul) -->
  <line x1="0" y1="4"  x2="19" y2="14" stroke="#ef4444" stroke-width="1.8" stroke-linecap="round"/>
  <line x1="0" y1="9"  x2="19" y2="14" stroke="#eab308" stroke-width="1.8" stroke-linecap="round"/>
  <line x1="0" y1="14" x2="19" y2="14" stroke="#3b82f6" stroke-width="1.8" stroke-linecap="round"/>

  <!-- Salida única: 1 línea azul grueso con punto -->
  <line x1="37" y1="14" x2="58" y2="14" stroke="#1e3a8a" stroke-width="3" stroke-linecap="round"/>
  <circle cx="60" cy="14" r="3" fill="#1e3a8a"/>
</svg>
```

**Razonamiento de marca (lo que se explicó al usuario):**
- "Casa + prisma" mantiene el dominio (vivienda) sin ser literal gracias al prisma.
- "3 entradas → 1 salida" es la promesa de Realista: muchas opciones/listings se concentran en una decisión/claridad.
- "Arcoíris convergente" refuerza la idea: los datos vienen en colores (precios, m², energéticas, riesgos), convergen en una respuesta.
- Color `#1e3a8a` es la familia del `--color-primary-dark` existente (`#1e40af`); se añade `--color-brand: #1e3a8a` para no desviarse del sistema.

**Variantes del Logo:**
- **Full** (icon + wordmark) → header en todas las páginas.
- **Icon only** → favicon, futuros iconos PWA (no en scope ahora), estados donde el espacio es muy pequeño.
- El componente acepta una prop `variant: 'full' | 'icon'` (default `'full'`).

## Decisiones (1 por pregunta del brainstorming)

### D1. Landing en `/`, dashboard en `/mi-proceso`

**Decisión**: `/` es la nueva landing. El dashboard actual (resumen de proceso, último anuncio, hipoteca, checklist) se mueve a `/mi-proceso`.

**Razonamiento**: la primera visita de un usuario anónimo merece una pantalla de marca y dos CTAs, no un dashboard de datos vacíos. La landing también es la pantalla a la que vuelve el usuario para "ver el siguiente paso". El nombre `/mi-proceso` (en español, personal) se eligió frente a `/dashboard` (frío, técnico) y `/app` (genérico) en la review del spec.

**Migración**: añadir `/mi-proceso/+page.svelte` con el contenido actual de `/+page.svelte`. Cambiar el contenido de `/+page.svelte` por la nueva landing. Actualizar los enlaces que apunten a `/` desde otros sitios (botón "Volver al inicio" del ListingLens si existe, etc.) para que apunten a la landing.

### D2. Header fijo arriba, logo only

**Decisión**: header sticky arriba con solo el `Logo` (variant `full`). Sin hamburguesa, sin breadcrumb, sin contador de uso, sin icono de ayuda.

**Razonamiento (YAGNI aplicado explícitamente)**: el usuario pidió "header fijo con logo y quizá un breadcrumb". Cuando le ofrecí opciones para la derecha del header, identificamos que:
- Un link "‹ Inicio" sería redundante (el logo es tocable + tab "Inicio" del stepper ya llevan ahí).
- Una hamburguesa sería overkill para un MVP sin Ajustes/Cuenta/Notificaciones.
- Un contador de uso (12/20 hoy) sería útil pero FR-010 ya tiene su propio contador en el `AIDisclaimer` y meterlo en el header competiría con el logo.
- Un "?" de ayuda es descubrible pero no hay FAQ ni contacto en el MVP.

Resultado: logo + espacio vacío a la derecha. Si en el futuro se añaden Ajustes, se reevalúa.

### D3. Tabs de abajo = ProcessStepper (3 pasos)

**Decisión**: `NavTabs` se elimina. En su lugar va `ProcessStepper` con 3 círculos numerados (1·Anuncio, 2·Hipoteca, 3·Proceso) conectados por líneas. El paso actual se resalta con el color primario; los completados se marcan con ✓; los pendientes quedan en gris claro.

**Razonamiento**: el usuario mismo pidió "tabs inferiores numéricos, o dividen en pasos secuenciales en forma de flecha como un proceso de compra". Y descartó el breadcrumb para móvil ("poco usables en mobile"). El stepper es a la vez navegación y breadcrumb, lo cual resuelve el issue #3 de un solo golpe.

**Modelo de estado**:
- `currentStep` se obtiene de la ruta actual (`/listing-lens` → paso 1, `/mortgage-compass` → paso 2, etc.).
- `completedSteps` se obtiene derivando del endpoint `/api/dashboard` (ya existe, lo consume el dashboard actual): paso 1 está completo si `data.latestListing !== null`; paso 2 si `data.process?.propertyPrice !== null` (el `FinancialProfile` se persiste en `PurchaseProcess`); paso 3 si `data.process?.currentStage !== null`. Se cachea en el store `process.ts` que ya existe; se reusa el fetch del dashboard.

**Interacción**:
- Click en un paso completado → navega a esa ruta.
- Click en el paso actual → no-op.
- Click en un paso futuro → no-op (con un pequeño shake si el usuario insiste, fuera de scope MVP).

### D4. Landing = Hero + Stepper + CTA único

**Decisión**: la landing es un único scroll vertical con tres bloques:
1. **Hero**: H1 "Compra una casa con los ojos abiertos" + sub "Análisis honesto de anuncios y simulación de hipoteca. Sin humo." + botón primario "Empezar por el paso 1" + `AIDisclaimer` debajo.
2. **Stepper visual**: 3 pasos numerados con el mismo visual que el `ProcessStepper` pero más grande, sin click, solo descriptivo ("1. Analiza un anuncio", "2. Simula tu hipoteca", "3. Sigue tu proceso").
3. **Footer mini**: nota "⚠️ Análisis orientativo. No constituye asesoramiento financiero ni jurídico." (esto ya está en el `AIDisclaimer` global, se reitera aquí para que se vea sin scroll).

**Razonamiento**: el usuario eligió opción C (la de stepper) en el brainstorming, frente a "minimal" y "hero + 3 funciones". El stepper visual anticipa el proceso, que es el "story" de la app. Se descartó la sección de 3 features separadas porque era redundante con el stepper (cada feature ya tiene su paso).

**Nota sobre el copy**: el copy propuesto es provisional. El usuario puede ajustar el headline o el sub durante la implementación. La estructura (hero + stepper + CTA) está cerrada.

### D5. ListingLens: tabs URL / Texto, URL tachada al fallar

**Decisión**: el formulario de `ListingLens` es un selector de tabs con dos opciones: "URL" (por defecto) y "Texto". Al hacer submit, si la URL falla con error de bloqueo, el sistema:
1. Marca la pestaña "URL" como tachada con un ✕ rojo en la esquina.
2. Cambia automáticamente a la pestaña "Texto" (el focus visual salta).
3. Muestra un banner explicativo: "URL no disponible — Este portal bloqueó la petición. Pega el texto del anuncio."

El usuario puede volver a la pestaña "URL" si quiere (por ejemplo, probar con otro portal) — el tachado se quita al cambiarla manualmente.

**Razonamiento**: el backend ya acepta `manualText` (lo usan los tests e2e y el `streamingClient` ya lo envía). La UI nunca lo había expuesto. El usuario eligió tabs (no textarea siempre visible) porque "más limpio visualmente, oculta opciones tras un click". El sombreado al fallar resuelve la confusión "no sé dónde pegar" del flujo actual.

**Implementación**:
- Componente `ListingTabs.svelte` con dos estados: `activeTab: 'url' | 'text'` y `urlBlocked: boolean`.
- `activeTab` se inicializa a `'url'`.
- Al recibir `ApiError` con `code === 'PORTAL_BLOCKED'`, se setea `urlBlocked = true` y `activeTab = 'text'`.
- El componente `<form>` del ListingLens se simplifica para delegar el render del campo a `ListingTabs`.

### D6. Backend: UA Chrome + headers + retry

**Decisión**: el `CheerioAdapter` pasa a usar un UA de Chrome real (Mac/Win/Linux indistintamente — fija uno solo) y headers de navegador. Se añade reintento con backoff exponencial (3 intentos: 0s, 1s, 2s, 4s; abort total a los 8s). Si tras los 3 intentos sigue fallando, lanza `PortalBlockedError` como ahora.

**Razonamiento**: el usuario eligió "UA de Chrome real" sobre las otras dos opciones. La marca sigue presente en el dominio (`realista.app`) y en el copy de la UI; el UA es un detalle de transporte. Idealista filtra al UA anterior por fingerprinting, no por el string en sí. Un UA de Chrome reduce el fingerprint "rare".

**Headers a enviar** (estilo Chrome 120 en macOS):
```
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8
Accept-Encoding: gzip, deflate, br
Accept-Language: es-ES,es;q=0.9,en;q=0.8
Sec-Fetch-Dest: document
Sec-Fetch-Mode: navigate
Sec-Fetch-Site: none
Sec-Fetch-User: ?1
Upgrade-Insecure-Requests: 1
```

**Retry**:
- Solo se reintenta ante errores de red (`fetch` throws) o respuestas 5xx. 4xx (incluido 403/429) NO se reintenta — son bloqueos explícitos.
- Backoff exponencial: 3 reintentos (4 fetches totales). Esperas entre fetches: 1s, 2s, 4s. Tiempo total máximo: ~7s más los timeouts de cada fetch (10s cada uno → abort total ~47s en el peor caso; acceptable para no degradar la SLA de 15s del analyze endpoint, porque el timeout del cliente se mantiene en 15s).
- El `.m.` fallback existente se queda dentro del mismo `tryFetch`; no se reintenta a `m.` por separado. Si el fetch a `www.` falla tras los reintentos, se prueba `m.` UNA vez (sin más reintentos).

**Configurabilidad**:
- Las constantes `CHROME_USER_AGENT` y `BROWSER_HEADERS` viven en `infrastructure/utils/urlValidator.ts` (donde ya está `REALISTA_USER_AGENT`). Esto permite cambiarlas en tests sin tocar el adapter.

## Per-slice design (orden de commits, 1 PR con N commits)

### Commit 1: branding — Logo + tipografía

- Añadir `frontend/src/lib/components/Logo.svelte` con el SVG final.
- Añadir link a Google Fonts en `frontend/src/app.html` para Plus Jakarta Sans.
- Añadir `--color-brand: #1e3a8a` y `--font-display: 'Plus Jakarta Sans', system-ui, sans-serif` en `frontend/src/app.css`.
- **Tests**: `Logo.test.ts` verifica que el SVG se renderiza con la prop `variant: 'full'` (icon + wordmark) y `variant: 'icon'` (solo el SVG).
- **Verificación**: `npm run check` limpio, `npm run test:unit` verde.

### Commit 2: Header fijo

- Añadir `frontend/src/lib/components/Header.svelte` — wrapper sticky con `position: sticky; top: 0;` que renderiza `<Logo variant="full" />` y un slot a la derecha (vacío por ahora).
- Modificar `frontend/src/routes/+layout.svelte` para incluir `<Header />` arriba de `<slot />` y ajustar el `padding-top` del main.
- **Tests**: `Header.test.ts` verifica que el header es sticky (clase CSS), que contiene el Logo, y que el slot derecho renderiza cuando se le pasa contenido.

### Commit 3: ProcessStepper (reemplaza NavTabs)

- Añadir `frontend/src/lib/components/ProcessStepper.svelte`.
- Eliminar `frontend/src/lib/components/NavTabs.svelte`.
- Actualizar `+layout.svelte` para usar `<ProcessStepper :currentStep="..." :completedSteps="..." />`. `currentStep` se deriva de `$page.url.pathname`; `completedSteps` viene de un nuevo fetch a `/api/dashboard` (cachear con `+page.ts` load function o un store).
- **Tests**: `ProcessStepper.test.ts` — renderiza 3 pasos, marca el actual, marca los completados, los pendientes están en gris, los completados son clickeables (navegan).
- **E2E**: el test `full-flow.spec.ts` se actualiza para asertar que tras un análisis, el stepper muestra paso 1 como completado.

### Commit 4: Landing + dashboard reubicado

- Crear `frontend/src/routes/mi-proceso/+page.svelte` con el contenido actual de `+page.svelte`.
- Crear `frontend/src/lib/components/LandingHero.svelte` (H1 + sub + CTA + AIDisclaimer).
- Crear `frontend/src/lib/components/LandingStepper.svelte` (3 pasos visuales, sin click, descriptivos).
- Reemplazar `frontend/src/routes/+page.svelte` por la nueva landing que renderiza `<LandingHero />` + `<LandingStepper />`.
- **Tests**: `LandingHero.test.ts` y `LandingStepper.test.ts` — renderizan los elementos esperados.
- **E2E**: nuevo test `ux-redesign.spec.ts` que visita `/`, ve el H1, ve el stepper, hace click en "Empezar por el paso 1" y verifica que navega a `/listing-lens`.

### Commit 5: ListingTabs + paste fallback

- Añadir `frontend/src/lib/components/ListingTabs.svelte` con dos tabs y la lógica de bloqueo.
- Modificar `frontend/src/routes/listing-lens/+page.svelte`:
  - Eliminar el input URL directo.
  - Sustituir por `<ListingTabs bind:activeTab bind:url bind:manualText />`.
  - El submit envía `{ url, manualText }` donde `manualText` solo se incluye si el tab activo es "Texto" (o si URL está bloqueada).
  - Al recibir `ApiError` con código de bloqueo, se propaga al `ListingTabs` vía `bind:urlBlocked`.
- **Tests**: `ListingTabs.test.ts` — verifica que el cambio de tab es correcto, que el tachado se aplica cuando se setea `urlBlocked = true`, y que el foco salta a Texto en ese caso.
- **E2E**: extensión de `ux-redesign.spec.ts` que simula un bloqueo de URL y verifica el comportamiento del UI.

### Commit 6: Backend — UA + headers + retry

- Modificar `backend/src/infrastructure/utils/urlValidator.ts`:
  - Añadir constante `CHROME_USER_AGENT` (string completo del UA).
  - Añadir constante `BROWSER_HEADERS` (objeto con todos los headers).
  - Mantener `REALISTA_USER_AGENT` por compatibilidad (puede usarse en otros adapters que no necesitan "ser Chrome").
- Modificar `backend/src/adapters/cheerio/CheerioAdapter.ts`:
  - `tryFetch` usa `BROWSER_HEADERS` en vez de los headers ad-hoc.
  - Añadir lógica de retry con backoff. Solo reintenta ante `fetch` throws o `res.status >= 500`. 4xx son inmediatos.
  - Extraer el retry a un helper privado `fetchWithRetry(url, maxAttempts=3)`.
- **Tests**:
  - `CheerioAdapter.headers.test.ts` — mockea `node-fetch` y verifica que el primer request lleva los headers completos.
  - `CheerioAdapter.retry.test.ts` — mockea `node-fetch` para que falle 2 veces y luego funcione; verifica que hay 3 calls totales y que el tiempo total respeta el backoff (con `vi.useFakeTimers()`).
  - Test adicional: 4xx (403) NO se reintenta.

### Commit 7: PWA icons + favicon (confirmado en review)

- Generar PNG 192, 512, 512-maskable a partir del SVG del logo con ImageMagick (`magick -background none -density 300 ...`). Fallback a Node script con `sharp` si ImageMagick no está disponible.
- Reemplazar los archivos en `frontend/static/icons/`.
- Generar `favicon.ico` (32×32) también — puede ser el mismo PNG renombrado o un .ico multi-resolución.
- **Verificación**: `npm run build` sin warnings de iconos; el manifest apunta a rutas 200.
- **Tests**: ninguno (assets).

## Test strategy (resumen)

**Unit (Vitest)**:
- `Logo.test.ts` — render del SVG, props `variant` y `size`.
- `Header.test.ts` — sticky, slot, contiene Logo.
- `ProcessStepper.test.ts` — paso activo/completado/pendiente, click navega.
- `LandingHero.test.ts` — H1, CTA apunta a `/listing-lens`, AIDisclaimer presente.
- `LandingStepper.test.ts` — 3 pasos con número y label correctos.
- `ListingTabs.test.ts` — cambio de tab, prop `urlBlocked` marca la tab, foco.
- `CheerioAdapter.headers.test.ts` — headers enviados.
- `CheerioAdapter.retry.test.ts` — backoff exponencial, no retry en 4xx, abort tras N.

**E2E (Playwright)**:
- `full-flow.spec.ts` (modificado) — añade aserciones: header visible, stepper actualizado, landing visible en `/`.
- `ux-redesign.spec.ts` (nuevo) — flujo completo de paste fallback: simular bloqueo de URL, ver URL tachada, pegar texto, ver análisis correcto.

**Cobertura objetivo**: 80%+ en lógica de adapters, services, use cases (igual que el resto del proyecto). Componentes Svelte: cobertura de "estructura" (props, render condicional, eventos) — no se exige cobertura de pixel/CSS.

## Verificación end-to-end antes de mergear

1. `npm run check` en frontend limpio.
2. `npm run test` en backend verde (unit + retry + headers tests nuevos).
3. `npm run test` en frontend verde (unit + nuevos).
4. `npm run build` en frontend sin warnings de iconos (los PWA icons ya existen).
5. `npm run test:e2e` con backend levantado: el happy path completo sigue funcionando, y el nuevo test de paste fallback pasa.
6. Smoke test manual en navegador: visitar `/` (ver landing), click CTA → `/listing-lens`, pegar URL conocida → resultado, simular bloqueo pegando una URL que sabemos que falla (o con un test que la mockee) → ver URL tachada → pegar texto → resultado.
7. Comprobar el responsive en mobile (DevTools): header sticky, stepper 3 columnas, landing legible sin scroll horizontal, listing-lens tabs accesibles.

## Open questions

Todas las preguntas abiertas iniciales quedaron cerradas en la review del 2026-07-10:

- ✅ **PWA icons con el nuevo logo** → regenerados en este PR (commit 7).
- ✅ **Nombre del wordmark / dashboard reubicado** → `/mi-proceso` (en español, personal). El wordmark "Realista" se mantiene en Plus Jakarta Sans 800 con color `--color-brand: #1e3a8a`.
- ✅ **Sub-hero de la landing** → se mantiene la propuesta: *"Análisis honesto de anuncios y simulación de hipoteca. Sin humo."* Si durante la implementación se quiere ajustar, se cambia en un solo string en `LandingHero.svelte` sin tocar estructura.
- ✅ **Color exacto de los haces arcoíris** → `#ef4444` (red-500), `#eab308` (yellow-500), `#3b82f6` (blue-500) — sistema Tailwind consistente con la paleta existente.

**Preguntas residuales para la fase de implementación** (no bloquean el plan):

- ¿El `AIDisclaimer` se muestra en todas las páginas o solo donde hay output AI? El spec actual asume que se muestra en todas las páginas que tengan análisis (FR-016). Si se quiere más restrictivo, se ajusta en commit 4.
- ¿El stepper muestra los labels completos ("1. Anuncio") o solo números en mobile? El spec dice labels completos para que se entienda el proceso. Si en mobile se ve apretado, fallback a números.

## Migración / rollout

- 1 PR único, 6-7 commits segmentados (orden del "Per-slice design").
- No hay migración de base de datos ni de datos persistidos.
- Los usuarios con sesión activa que tenían `/` en su historial acabarán en la landing (es el comportamiento intencionado — el dashboard vive en `/mi-proceso` ahora).
- El `NavTabs.svelte` se elimina — cualquier referencia se actualiza en este PR.
- El `REALISTA_USER_AGENT` se mantiene como constante exportada (puede usarse en tests o en otros adapters) pero el `CheerioAdapter` deja de usarla.
