# ADR-002: @avena/score como Fallback de Análisis (DEPRECATED)

**Fecha**: 2026-06-03

**Estado**: **DEPRECADA** — ver ADR-004

## Contexto

El análisis de anuncios inmobiliarios usa LLM (OpenRouter) como motor principal para detectar manipulación lingüística, omisiones y banderas rojas. Pero el LLM es un punto único de fallo: puede estar caído, devolver JSON malformado, o superar el límite de rate de la API. Necesitamos un fallback que garantice que el análisis siempre devuelve algo útil.

## Decisión

Usar `@avena/score` como fallback cuando el LLM no está disponible. El paquete `@avena/score` (MIT, ligero) proporciona un scoring numérico objetivo (0-100) basado en la presencia/ausencia de datos en el anuncio, sin depender de red ni APIs externas.

**Cadena de responsabilidad**:
1. OpenRouter (LLM) — análisis semántico completo
2. `@avena/score` — scoring numérico si el LLM falla
3. Texto manual — si no se puede acceder a la URL

## Alternativas consideradas

### Sistema de scoring propio
- **Ventaja**: control total sobre los criterios
- **Desventaja**: reinventar la rueda, sin validación externa, más tiempo de desarrollo
- **Rechazada porque**: `@avena/score` ya está validado y cubre exactamente lo que necesitamos

### Solo LLM, sin fallback
- **Ventaja**: arquitectura más simple
- **Desventaja**: punto único de fallo, el análisis depende de una API externa
- **Rechazada porque**: el Constitution Principle IV exige robustez. Una herramienta educativa no puede dejar al usuario sin respuesta si la API falla

### Análisis manual como fallback principal
- **Ventaja**: sin dependencias externas
- **Desventaja**: el usuario tiene que pegar el texto, fricción en la UX
- **Rechazada como fallback principal porque**: `@avena/score` puede procesar el texto automáticamente sin intervención del usuario

## Consecuencias

- **Positivas**: el análisis nunca falla completamente. Dos fuentes de verdad complementarias (LLM cualitativo + scoring numérico). `@avena/score` corre localmente, sin coste.
- **Negativas**: el fallback devuelve solo score numérico sin banderas rojas cualitativas. La UX debe comunicar claramente cuándo se está usando el fallback vs el análisis completo.
- **Mitigación**: el adapter de `@avena/score` se implementa con la misma interfaz `ListingAnalyzerPort` que el adapter de LLM, haciendo el cambio transparente para el dominio.

## Razón de la Deprecación

El proyecto Avena Terminal pivotó de un paquete npm ligero de scoring (`@avena/score`) a una plataforma de datos inmobiliarios institucional. El paquete npm ya no está disponible públicamente. Su API REST actual (100 peticiones/día en el plan gratuito, requiere API key, depende de red) no es adecuada como fallback offline. La decisión se documenta en ADR-004.

**Nueva cadena de responsabilidad**:
1. OpenRouter (LLM) — análisis semántico completo
2. Texto manual — si el LLM falla tras reintentos, el usuario pega el texto del anuncio
