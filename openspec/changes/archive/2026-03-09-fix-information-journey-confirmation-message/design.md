## Context

El Worker procesa el job `process-conversation` con `conversationType: 'INFORMATION'` para compras tradicionales. Hoy carga la Order con `include: { store: true }` (relación para el nombre de la tienda) pero no la relación `orderAddress`. El mensaje de confirmación se construye con nombre completo, `externalOrderNumber ?? 'N/A'` y texto fijo sin dirección. La API ya crea Order + OrderAddress en compra tradicional; el Worker solo debe leer y mostrar esos datos.

## Goals / Non-Goals

**Goals:**
- Cargar Order con `orderAddress` para poder mostrar la dirección en el mensaje.
- Ajustar el contenido del primer mensaje del journey INFORMATION: saludo solo por nombre, número de pedido con `externalOrderId`, dirección completa cuando exista OrderAddress, mensaje con saltos de línea.

**Non-Goals:**
- Cambiar endpoints de la API, DTOs o frontend. No migraciones de base de datos.

## Decisions

- **Incluir `orderAddress` en la misma query para todos los conversationTypes**: Se añade `orderAddress: true` al `include` existente (`store: true`) en `conversationProcessor()`. Alternativa: bifurcar la query solo cuando `conversationType === 'INFORMATION'`; se descarta para no duplicar lógica y porque el coste del join 1:1 es mínimo.
- **Saludo con `user.firstName ?? 'Cliente'`**: Alineado con `processGetAddressJourney`. Fallback «Cliente» si no hay nombre.
- **Número de pedido con `order.externalOrderId`**: Es el identificador obligatorio de la tienda; `externalOrderNumber` es opcional y en mock suele no enviarse.
- **Dirección solo si existe `order.orderAddress`**: En compra tradicional siempre existirá; si por edge case no existiera, se mantiene texto neutro sin dirección explícita.

## Risks / Trade-offs

- [Query con un include más] → Impacto despreciable (join 1:1). Sin N+1.
- [OrderAddress null en compra no tradicional] → El journey INFORMATION solo se dispara en compra tradicional; no aplica.

## Migration Plan

Despliegue estándar: desplegar Worker con el nuevo código. Sin pasos de migración ni rollback de datos. Rollback: revertir commit del Worker.
