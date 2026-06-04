# Research: Realista MVP

## 1. Cadastro API (Sede Electrónica del Catastro)

**Decision**: Usar la API REST pública de la Sede Electrónica del Catastro para consultas por referencia catastral y coordenadas.

**Rationale**:
- API REST documentada y accesible sin autenticación para consultas básicas
- Devuelve datos estructurados: superficie construida, año de construcción, uso, referencia catastral
- Permite consulta por coordenadas (necesaria tras estimar ubicación del anuncio)
- Sin rate limiting documentado para uso moderado (<20 consultas/día)

**Alternatives considered**:
- ATOS API (portal de servicios catastrales): requiere autenticación, más complejo para MVP
- Web scraping de la sede electrónica: frágil, cambios en el HTML rompen el adaptador
- Idealista Maps API: datos de propiedad privada, no oficiales

**Implementation**: `CatastroAdapter` implementa `CatastroPort`. Endpoint: `https://ovc.catastro.meh.es/ovcservweb/ovcswlocalizacionrc/ovccallejero.asmx`. Parseo XML a JSON estructurado.

---

## 2. OpenRouter LLM Gateway

**Decision**: OpenRouter como puerta de enlace unificada para el análisis de anuncios con LLM.

**Rationale**:
- Una sola API key para acceder a múltiples modelos (OpenAI, Anthropic, Google, Meta)
- Permite cambiar de modelo sin cambiar código (variable de entorno)
- Precios más bajos que las APIs directas para desarrollo
- Soporta JSON mode en modelos compatibles (GPT-4o, Claude 3.5 Sonnet)
- SDK JavaScript/TypeScript disponible

**Model selection strategy**:
- Primario: Claude 3.5 Sonnet (mejor análisis de subtexto y manipulación lingüística en español)
- Alternativo: GPT-4o (mejor structured JSON output)
- Configurable vía `OPENROUTER_MODEL` env var

**Alternatives considered**:
- OpenAI direct API: más caro, vendor lock-in
- Anthropic direct API: sin acceso a otros modelos como fallback
- Ollama (local): calidad inferior, requiere GPU, no viable para POC desplegada

**Implementation**: `OpenRouterAdapter` implementa `ListingAnalyzerPort`. System prompt en español con schema JSON de salida.

---

## 3. Euribor Rate Source

**Decision**: Valor por defecto hardcodeado actualizado manualmente. Campo editable por el usuario.

**Rationale**:
- No existe API pública oficial gratuita del Euríbor en tiempo real
- El Euríbor cambia mensualmente (publicado por el Banco de España)
- El usuario puede consultar el valor actual en su banco y sobrescribirlo
- Evita dependencia externa frágil para el MVP

**Alternatives considered**:
- Scraping del Banco de España: frágil, mantenimiento constante
- API de terceros (euribor-api, investing.com): no oficial, posible cierre
- Bankinter/Evo API: requieren ser cliente, no públicas

**Implementation**: Valor por defecto en constante `DEFAULT_EURIBOR_RATE`. Campo `interestRate` en el perfil financiero permite sobrescritura.

---

## 4. @avena/score Integration

**Decision**: Usar `@avena/score` como fallback cuando el LLM no está disponible o devuelve JSON malformado.

**Rationale**:
- Paquete MIT, ligero, validado matemáticamente
- Scoring numérico objetivo (0-100) basado en presencia/ausencia de datos en el anuncio
- Sin dependencia de red (funciona offline en el servidor)
- Crédito en NOTICE.md requerido por la licencia MIT

**Alternatives considered**:
- Sistema de scoring propio: reinventar la rueda, sin validación externa
- Solo LLM: punto único de fallo, sin fallback si la API no responde
- Idealista Trust Shield: proyecto MIT pero requiere scraping complejo

**Implementation**: `AvenaScoreAdapter` implementa `ListingAnalyzerPort`. Se invoca automáticamente cuando `OpenRouterAdapter` falla. Devuelve score numérico pero no banderas rojas cualitativas.

---

## 5. Cheerio HTML Parsing Strategy

**Decision**: Cheerio como parser HTML principal con fallback a subdominio móvil `.m.`.

**Rationale**:
- Ligero (sin navegador headless), rápido (<1s de parseo)
- Suficiente para portales inmobiliarios que renderizan en servidor
- Idealista, Fotocasa y Habitaclia sirven contenido HTML server-side
- El subdominio `.m.` (ej: `m.idealista.com`) suele tener menos JS
- Puppeteer/Playwright serían excesivos para el MVP (requieren binario de Chromium)

**Alternatives considered**:
- Puppeteer: +300MB de binario, lento, overkill para HTML server-side
- Raw HTML → LLM: más tokens consumidos, mismo resultado que Cheerio + LLM
- API no oficial de Idealista: TOS violation más grave que scrapeo educativo

**Implementation**: `CheerioAdapter` extrae título, descripción, precio, características, ubicación declarada, y número de fotos. El texto limpio se pasa al LLM para análisis semántico.

---

## 6. PWA with SvelteKit

**Decision**: `@vite-pwa/sveltekit` para service worker y manifiesto.

**Rationale**:
- Integración nativa con Vite (SvelteKit usa Vite)
- Service worker con estrategia network-first (datos frescos de la API)
- Cache de assets estáticos para carga rápida en visita recurrente
- Manifiesto PWA con iconos, nombre, tema oscuro/claro
- Instalable en iOS (Safari) y Android (Chrome)

**Alternatives considered**:
- Workbox manual: más control pero más boilerplate
- `vite-plugin-pwa`: versión anterior, `@vite-pwa/sveltekit` es el sucesor oficial
- Sin PWA: el cohort requiere "PWA instalable", requisito obligatorio

**Implementation**: Configuración en `vite.config.ts` con `SvelteKitPWA`. Iconos generados desde SVG base. Estrategia de cache: network-first con fallback a cache.

---

## 7. Session UUID Management

**Decision**: UUID v4 generado por el servidor en la primera petición, almacenado en localStorage del navegador, enviado como header `X-Session-Id` en todas las peticiones API.

**Rationale**:
- Sin dependencia de cookies (más simple, explícito)
- Compatible con CORS si frontend y backend en dominios distintos
- `localStorage` persiste entre recargas de página
- UUID v4 criptográficamente aleatorio (sin dependencia de IP)

**Alternatives considered**:
- Cookies: automáticas pero requieren SameSite/secure para CORS, más configuración
- IP-based: frágil en redes móviles (CGNAT, IPs compartidas)
- Client-generated UUID: vulnerable a manipulación (rate limit bypass)

**Implementation**: Middleware `sessionMiddleware.ts` en Express. Primera petición sin header → genera UUID → lo devuelve en respuesta. Peticiones posteriores → extrae del header para rate limiting y asociación de datos.
