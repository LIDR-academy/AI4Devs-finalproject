# ADR-004: Location Resolver Minimalista — Eliminación de LLMVisionLocationAdapter

**Fecha**: 2026-06-04

**Estado**: Aceptada

**Deprecates**: ADR-002 (cadena de 3 adaptadores con visión LLM)

## Contexto

La spec original (FR-016 v1) definía una cadena de 3 adaptadores para resolver la ubicación de un anuncio:

1. `DeclaredLocationAdapter` — extrae dirección/barrio del HTML con Cheerio
2. `GeocodingAdapter` — convierte dirección a coordenadas con Nominatim (OSM)
3. `LLMVisionLocationAdapter` — analiza fotos del anuncio con OpenRouter multimodal para estimar ubicación cuando no hay dirección declarada

Durante la revisión crítica del E2E, el autor identificó que el adaptador de visión LLM es **técnicamente inviable** para el caso de uso real.

## Decisión

Reducir el Location Resolver a **2 adaptadores** y eliminar el `LLMVisionLocationAdapter`:

1. `DeclaredLocationAdapter` — extrae dirección del HTML (Cheerio + regex)
2. `GeocodingAdapter` — Nominatim OSM (coords GPS)
3. Si no hay dirección declarada → **no se intenta alternativa**. El sistema marca la verificación catastral como no disponible y el análisis continúa con el resto de red flags.

El `CatastroAdapter` consulta por **dirección de texto** (no por coordenadas) usando el endpoint público de la Sede Electrónica del Catastro.

## Justificación

- Las fotos de anuncios de apartamentos son **interiores** (baños, cocinas, salones). No contienen señal GPS visual ni landmarks reconocibles.
- Un LLM de visión no puede inferir una calle a partir de la foto de un baño. Las herramientas de geolocalización con visión (CLIP, GeoGuessr) funcionan con paisajes exteriores, no interiores.
- El conocimiento de dominio humano (saber qué portal esconde la dirección en qué campo, cómo interpretar referencias de barrio) no es replicable con ML/LLM genérico.
- Lo único que funciona en la práctica: **dirección declarada en texto** → Nominatim → coordenadas.

## Alternativas consideradas y rechazadas

### CLIP / geolocalización con visión
- Requiere dataset de interiores españoles etiquetados
- Accuracy ~50% incluso con dataset
- Meses de trabajo para un fallback que funciona peor que pedir al usuario

### ML sobre texto del anuncio
- Redundante con Cheerio regex
- No añade información que el HTML no contenga ya

### Google Geocoding API
- Funciona si hay dirección, igual que Nominatim pero con API key
- No resuelve el problema de "sin dirección declarada"

### Cross-reference con DB propia de edificios
- No existe tal base de datos
- Construirla es meses de trabajo

## Consecuencias

- **Positivas**: arquitectura más simple (2 adaptadores vs 3). Honestidad sobre las limitaciones reales. ~4-6h ahorradas invertidas en Negotiation Assistant (US-04).
- **Negativas**: cuando un anuncio no tiene dirección declarada, la verificación catastral no está disponible. El usuario ve "verificación catastral no disponible" en lugar de un intento fallido.
- **Mitigación**: el análisis del listing sigue siendo válido con todas las demás red flags. La ausencia de verificación catastral es una limitación honesta, no un fallo del sistema.

## Impacto en otros artefactos

- `spec.md` FR-016: actualizado para reflejar la cadena de 2 adaptadores
- `tasks.md`: T032c (LLMVisionLocationAdapter) y T032d (LocationResolverService de 3 adaptadores) eliminados
- `data-model.md`: `Coordinates.source` reducido a `'declared' | 'geocoded'` (sin `'vision'`)
- `research.md` sección 8: documenta la decisión completa
