# Contract — Correlation ID

**Feature**: `002-nucleo-compartido-seguridad`

## Header

- Nombre: `X-Correlation-Id`.

## Comportamiento del `CorrelationIdFilter`

| Entrada | Acción |
|---|---|
| Petición **sin** `X-Correlation-Id` | Genera un UUID nuevo |
| Petición **con** `X-Correlation-Id` | Propaga el valor recibido (saneado/acotado) |

En ambos casos:
- El valor se coloca en el **MDC** con la clave `correlationId` durante todo el request.
- El valor se devuelve en el header `X-Correlation-Id` de la respuesta.
- El MDC se limpia al finalizar el request (evitar fugas entre hilos).

## Integración con logging

- El `logback-spring.xml` del andamiaje ya incluye `correlationId` en el MDC del encoder JSON; este filtro es quien lo puebla.
