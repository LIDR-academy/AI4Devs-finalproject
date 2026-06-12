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

**Implementación**: `CatastroAdapter` implementa `CatastroPort`. Endpoint: `https://ovc.catastro.meh.es/ovcservweb/ovcswlocalizacionrc/ovccallejero.asmx`. Parseo XML a JSON estructurado. Solo se invoca cuando `LocationResolverService` ha devuelto coordenadas GPS válidas.

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
- Multimodal: descartado — `LLMVisionLocationAdapter` eliminado por inviabilidad técnica (ver sección 8)
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

## 8. Location Resolver — Decisión Final Minimalista (revisada tras brainstorming con el autor)

**Decisión**: El Location Resolver se reduce a **2 adaptadores** (DeclaredLocation + Geocoding). **Se elimina el `LLMVisionLocationAdapter`** por inviabilidad técnica.

**Justificación**:
- El autor tenía experiencia personal con un algoritmo manual de triangulación que funcionaba porque **incorporaba conocimiento de dominio humano** (saber qué plataformas esconden direcciones en qué campos, cómo interpretar fotos, contraste de barrios).
- Ese conocimiento **no es replicable con ML/LLM genérico**. Un apartamento es una foto de un baño o cocina — sin señal GPS visual.
- Las herramientas de geolocalización con visión (CLIP, GeoGuessr-style) funcionan con paisajes, no con interiores de pisos.
- Lo único que funciona: **dirección declarada en texto** → Nominatim → coords.
- Si no hay dirección → no se intenta alternativa. El sistema es honesto con el failure mode.

**Alternativas consideradas y rechazadas**:
- **CLIP / geolocalización con visión**: requiere dataset de interiores españoles etiquetados, meses de trabajo, accuracy del ~50% incluso así.
- **ML sobre texto del anuncio**: redundante con Cheerio regex. No añade información.
- **Google Geocoding API**: funciona si hay dirección, igual que Nominatim pero con API key.
- **Cross-reference con DB propia de edificios**: no existe, construirla es meses.

**Implementación**: `DeclaredLocationAdapter` (Cheerio regex) + `GeocodingAdapter` (Nominatim OSM) en orden. Si no hay dirección declarada, el sistema marca la verificación catastral como no disponible y el análisis del listing sigue siendo válido con el resto de red flags. `CatastroAdapter` query por dirección de texto (no coordenadas) usando el endpoint público de la Sede Electrónica.

**Tiempo ahorrado vs cadena de 3 adaptadores**: ~4-6h. Invertido en Negotiation Assistant (ver §9).

---

## 9. Negotiation Assistant — Nuevo Diferenciador

**Decisión**: Añadir como **US-04 (P2, Should-Have)**. Generación template-based de 5-8 preguntas concretas para hacer al inmobiliario, basadas en las red flags detectadas en el AnalyzedListing.

**Justificación**:
- El Listing Lens te dice **qué falla** pero no te empodera para la negociación. El siguiente paso natural es: "y ahora qué pregunto al inmobiliario?"
- Es un **diferenciador real**: ninguna herramienta existente en España hace esto para anuncios de compra de vivienda.
- Implementación simple (plantillas hardcoded por (redFlag, listingSituation)), sin LLM en la generación → mantiene consistencia educativa, sin riesgo de advice personalizado.
- **Punch en la demo**: el usuario ve "esto es lo que tienes que preguntar al inmobiliario cuando vayas" — el insight es memorable.

**Alternativas consideradas y rechazadas**:
- **Generar puntos con LLM**: riesgo de advice personalizado, tono inconsistente, alucinaciones en preguntas.
- **Mostrar solo la lista de red flags**: ya lo hace Listing Lens. Aporta poco.
- **Generar PDF/email para enviar al agente**: scope creep, no aporta al E2E de demo.

**Implementación**: `NegotiationTemplateRepository` (mapa hardcoded, 3+ templates por cada red flag) + `NegotiationAssistantService` (selecciona templates relevantes según red flags presentes, añade el `reasoning` del LLM, completa con 3-5 puntos preventivos generales si hay menos de 5 específicos). Endpoint: `GET /api/listings/:id/negotiation-points`. UI: sección expandible en Listing Lens con accordion por punto, color/etiqueta de la red flag asociada.

**Tiempo estimado**: ~4-6h (1 servicio + 1 repositorio + 1 endpoint + 1 componente + tests).
