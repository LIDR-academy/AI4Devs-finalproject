# ADR-006: SSE Progress Events for Listing Analysis

## Status
Accepted

## Date
2026-07-08

## Context
El análisis de un anuncio inmobiliario puede tardar hasta 15 segundos (SLA FR-018). Durante ese tiempo, el usuario no debe ver un spinner estático sin feedback. Necesitábamos comunicar el progreso del análisis en tiempo real.

El flujo del backend incluye múltiples etapas secuenciales:
1. Fetching (descargar HTML del portal)
2. Parsing (extraer texto del HTML)
3. Resolving (geolocalizar la dirección)
4. Cross-referencing (cruce con Catastro)
5. Analyzing (LLM procesando el texto)

## Decision
Usar **Server-Sent Events (SSE)** para emitir eventos de progreso desde el backend al frontend durante el análisis:

- **Backend**: `ProgressEmitter` emite eventos tipados (`fetching`, `parsing`, `resolving`, `cross_referencing`, `analyzing`, `done`) durante la ejecución del `AnalyzeListingUseCase`.
- **Frontend**: `streamingClient.ts` consume el stream SSE con `fetch()` + `ReadableStream` reader, parseando eventos `event:` y `data:` según el protocolo SSE.
- **Formato**: Cada evento SSE sigue el formato estándar: `event: <name>\ndata: <json>\n\n`.
- **Evento final**: `event: done\ndata: <AnalyzeListingResponse | { error: ... }>\n\n`.

La ruta `POST /api/listings/analyze` acepta un query param `?stream=true` que activa el modo SSE. Sin este flag, la respuesta es JSON estándar.

## Alternatives Considered
1. **WebSockets (Socket.io)**: Overkill para un flujo unidireccional (backend → frontend). Añade dependencia y complejidad de conexión persistente.
2. **Polling**: Ineficiente. El cliente haría múltiples requests para verificar el estado.
3. **Long polling**: Complejo de implementar, requiere gestión de timeouts.
4. **Sin feedback de progreso**: Mala UX. El usuario no sabe si el sistema está funcionando.

## Consequences
- **Positivo**: Feedback en tiempo real. El usuario ve cada etapa del análisis.
- **Positivo**: SSE es nativo del navegador (EventSource API), ligero, y unidireccional como necesitamos.
- **Positivo**: Reutiliza la misma conexión HTTP. No requiere upgrade a WebSocket.
- **Negativo**: SSE no soporta binary frames (no necesario en nuestro caso).
- **Negativo**: La implementación manual con `ReadableStream` (en vez de `EventSource`) fue necesaria para poder pasar el header `X-Session-Id` y manejar errores HTTP correctamente.

## Related
- FR-018: SLA <15s con eventos de progreso
- `backend/src/api/progressEmitter.ts`
- `frontend/src/lib/api/streamingClient.ts`
