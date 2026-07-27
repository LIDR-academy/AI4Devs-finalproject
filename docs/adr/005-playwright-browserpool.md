# ADR-005: Playwright + BrowserPool Strategy

## Status
Accepted

## Date
2026-07-08

## Context
Portales inmobiliarios como Idealista y Fotocasa usan DataDome (anti-bot basado en JavaScript fingerprinting y headers de navegador). Cheerio (parser HTML server-side sin JS) no puede ejecutar JavaScript, por lo que las páginas protegidas devuelven páginas vacías o captchas en lugar del contenido del anuncio.

Necesitábamos una estrategia para acceder al contenido de estos portales sin depender exclusivamente de Cheerio.

## Decision
Implementar una **cadena de fallback con dos adaptadores**:

1. **CheerioAdapter** (primario): rápido, ligero, sin dependencies de navegador. Funciona para portales sin anti-bot (Habitaclia, Fotocasa sin DataDome).
2. **PlaywrightAdapter** (fallback): Chromium real con JavaScript. Se activa cuando Cheerio detecta página vacía o DataDome captcha.

El PlaywrightAdapter usa un **BrowserPool** para gestionar instancias de Chromium:
- Pool configurable con `PLAYWRIGHT_POOL_SIZE` (default: 2)
- Timeout por página: `PLAYWRIGHT_TIMEOUT_MS` (default: 15000ms)
- Headless mode configurable: `PLAYWRIGHT_HEADLESS` (default: true)
- Instalación separada: `npx playwright install chromium`

La decisión entre adaptadores la toma `ChainedFetchAdapter` que orquesta la cadena.

## Alternatives Considered
1. **Solo Playwright**: Más lento para portales que no necesitan JS. Mayor consumo de recursos.
2. **Solo Cheerio**: No funciona con portales protegidos con DataDome.
3. **Puppeteer**: API similar, pero Playwright tiene mejor soporte multi-navegador y es más moderno.
4. **API de terceros (scraping-as-a-service)**: Coste recurrente, dependencia externa.

## Consequences
- **Positivo**: Acceso a contenido de los portales principales (Idealista, Fotocasa). Cheerio sigue siendo el camino rápido para portales sin anti-bot.
- **Positivo**: BrowserPool evita crear/destruir navegadores en cada request.
- **Negativo**: Playwright requiere instalar Chromium (~200MB). No todos los entornos de deploy lo soportan sin configuración adicional.
- **Negativo**: Mayor latencia cuando se usa el fallback de Playwright (~2-5s adicionales por el arranque del navegador).

## SLA Impact
Con CheerioAdapter: <5s. Con PlaywrightAdapter: <15s (dentro del SLA de FR-018).

## Related
- FR-012: User-Agent `Realista/1.0 (analizador educativo)`
- FR-011: No se almacena contenido de terceros
- ADR-003: No-scraping (educational analysis, not commercial scraping)
