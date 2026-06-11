# Investigación: Realista MVP

## 1. API del Catastro (Sede Electrónica del Catastro)

**Decisión**: Usar la API REST pública de la Sede Electrónica del Catastro para consultas por referencia catastral y coordenadas.

**Justificación**:
- API REST documentada y accesible sin autenticación para consultas básicas
- Devuelve datos estructurados: superficie construida, año de construcción, uso, referencia catastral
- Permite consulta por coordenadas (necesaria tras estimar ubicación del anuncio vía LocationResolver)
- Sin rate limiting documentado para uso moderado (<20 consultas/día)

**Alternativas consideradas**:
- API ATOS (portal de servicios catastrales): requiere autenticación, más complejo para MVP
- Web scraping de la sede electrónica: frágil, cambios en el HTML rompen el adaptador
- Idealista Maps API: datos de propiedad privada, no oficiales

**Implementación**: `CatastroAdapter` implementa `CadastroPort`. Endpoint: `https://ovc.catastro.meh.es/ovcservweb/ovcswlocalizacionrc/ovccallejero.asmx`. Parseo XML a JSON estructurado. Solo se invoca cuando `LocationResolverService` ha devuelto coordenadas GPS válidas.

---

## 2. OpenRouter LLM Gateway

**Decisión**: OpenRouter como puerta de enlace unificada para el análisis de anuncios con LLM.

**Justificación**:
- Una sola API key para acceder a múltiples modelos (OpenAI, Anthropic, Google, Meta)
- Permite cambiar de modelo sin cambiar código (variable de entorno)
- Precios más bajos que las APIs directas para desarrollo
- Soporta JSON mode en modelos compatibles (GPT-4o, Claude 3.5 Sonnet)
- SDK JavaScript/TypeScript disponible

**Estrategia de selección de modelo**:
- Primario: Claude 3.5 Sonnet (mejor análisis de subtexto y manipulación lingüística en español)
- Multimodal fallback: Claude 3.5 Sonnet con capacidad de visión (para `LLMVisionLocationAdapter`)
- Alternativo: GPT-4o (mejor structured JSON output)
- Configurable vía `OPENROUTER_MODEL` env var

**Alternativas consideradas**:
- OpenAI direct API: más caro, vendor lock-in
- Anthropic direct API: sin acceso a otros modelos como fallback
- Ollama (local): calidad inferior, requiere GPU, no viable para POC desplegada

**Implementación**: `OpenRouterAdapter` implementa `ListingAnalyzerPort`. System prompt en español con schema JSON de salida. El mismo adapter se usa también para visión en `LLMVisionLocationAdapter`.

---

## 3. Fuente del Euríbor

**Decisión**: Valor por defecto hardcodeado actualizado manualmente. Campo editable por el usuario.

**Justificación**:
- No existe API pública oficial gratuita del Euríbor en tiempo real
- El Euríbor cambia mensualmente (publicado por el Banco de España)
- El usuario puede consultar el valor actual en su banco y sobrescribirlo
- Evita dependencia externa frágil para el MVP

**Alternativas consideradas**:
- Scraping del Banco de España: frágil, mantenimiento constante
- API de terceros (euribor-api, investing.com): no oficial, posible cierre
- Bankinter/Evo API: requieren ser cliente, no públicas

**Implementación**: Valor por defecto en constante `DEFAULT_EURIBOR_RATE`. Campo `interestRate` en el perfil financiero permite sobrescritura.

---

## 4. Integración de @avena/score

**Decisión**: Usar `@avena/score` como fallback cuando el LLM no está disponible o devuelve JSON malformado.

**Justificación**:
- Paquete MIT, ligero, validado matemáticamente
- Scoring numérico objetivo (0-100) basado en presencia/ausencia de datos en el anuncio
- Sin dependencia de red (funciona offline en el servidor)
- Crédito en NOTICE.md requerido por la licencia MIT

**Alternativas consideradas**:
- Sistema de scoring propio: reinventar la rueda, sin validación externa
- Solo LLM: punto único de fallo, sin fallback si la API no responde
- Idealista Trust Shield: proyecto MIT pero requiere scraping complejo

**Implementación**: `AvenaScoreAdapter` implementa `ListingAnalyzerPort`. Se invoca automáticamente cuando `OpenRouterAdapter` falla. Devuelve score numérico pero no banderas rojas cualitativas.

---

## 5. Estrategia de Parseo HTML con Cheerio

**Decisión**: Cheerio como parser HTML principal con fallback a subdominio móvil `.m.`.

**Justificación**:
- Ligero (sin navegador headless), rápido (<1s de parseo)
- Suficiente para portales inmobiliarios que renderizan en servidor
- Idealista, Fotocasa y Habitaclia sirven contenido HTML server-side
- El subdominio `.m.` (ej: `m.idealista.com`) suele tener menos JS
- Puppeteer/Playwright serían excesivos para el MVP (requieren binario de Chromium)

**Alternativas consideradas**:
- Puppeteer: +300MB de binario, lento, overkill para HTML server-side
- Raw HTML → LLM: más tokens consumidos, mismo resultado que Cheerio + LLM
- API no oficial de Idealista: TOS violation más grave que scrapeo educativo

**Implementación**: `CheerioAdapter` extrae título, descripción, precio, características, ubicación declarada, y número de fotos. `DeclaredLocationAdapter` (en `adapters/location/`) reutiliza el HTML parseado para extraer la dirección declarada. El texto limpio se pasa al LLM para análisis semántico.

---

## 6. PWA con SvelteKit

**Decisión**: `@vite-pwa/sveltekit` para service worker y manifiesto.

**Justificación**:
- Integración nativa con Vite (SvelteKit usa Vite)
- Service worker con estrategia network-first (datos frescos de la API)
- Cache de assets estáticos para carga rápida en visita recurrente
- Manifiesto PWA con iconos, nombre, tema oscuro/claro
- Instalable en iOS (Safari) y Android (Chrome)

**Alternativas consideradas**:
- Workbox manual: más control pero más boilerplate
- `vite-plugin-pwa`: versión anterior, `@vite-pwa/sveltekit` es el sucesor oficial
- Sin PWA: el cohort requiere "PWA instalable", requisito obligatorio

**Implementación**: Configuración en `vite.config.ts` con `SvelteKitPWA`. Iconos generados desde SVG base. Estrategia de cache: network-first con fallback a cache.

---

## 7. Gestión del UUID de Sesión

**Decisión**: UUID v4 generado por el servidor en la primera petición, almacenado en localStorage del navegador, enviado como header `X-Session-Id` en todas las peticiones API.

**Justificación**:
- Sin dependencia de cookies (más simple, explícito)
- Compatible con CORS si frontend y backend en dominios distintos
- `localStorage` persiste entre recargas de página
- UUID v4 criptográficamente aleatorio (sin dependencia de IP)

**Alternativas consideradas**:
- Cookies: automáticas pero requieren SameSite/secure para CORS, más configuración
- IP-based: frágil en redes móviles (CGNAT, IPs compartidas)
- Client-generated UUID: vulnerable a manipulación (rate limit bypass)

**Implementación**: Middleware `sessionMiddleware.ts` en Express. Primera petición sin header → genera UUID → lo devuelve en respuesta. Peticiones posteriores → extrae del header para rate limiting y asociación de datos.

---

## 8. Location Resolver Chain (añadido tras revisión crítica)

**Decisión**: Cadena de responsabilidad con 3 adaptadores para resolver coordenadas GPS del anuncio.

**Justificación**:
- Un LLM solo de texto NO puede generar coordenadas GPS precisas
- Necesitamos un método multi-fallback para robustez
- El método más fiable es la dirección declarada en el HTML (gratis, determinista)
- Si falla, Nominatim OSM es gratis, sin API key, sin rate limiting estricto
- Como último recurso, visión multimodal del LLM (más caro, más lento)

**Alternativas consideradas**:
- Solo LLM visión desde el principio: caro, innecesario en mayoría de casos
- Solo Nominatim: falla cuando el anuncio no tiene dirección declarada
- Google Geocoding API: requiere API key, no free
- Mapbox Geocoding: requiere API key, free tier limitado

**Implementación**: `LocationResolverService` orquesta 3 adaptadores (`DeclaredLocationAdapter`, `GeocodingAdapter`, `LLMVisionLocationAdapter`) en orden. Cada uno implementa `LocationResolverPort` con un método `resolveLocation(parsedListing)`. El primero que devuelve coordenadas válidas las propaga. El `CatastroAdapter` solo se invoca cuando hay coordenadas válidas (FR-016).
