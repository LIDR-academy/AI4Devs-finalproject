## Context

El flujo GET_ADDRESS actualmente invoca OpenAI para preguntar la dirección en todos los casos. Tras CU03-B1 y CU03-A3, el Worker puede acceder a Prisma (Address, User) y recibe `context.buyerEcommerceAddress` en el job. Este cambio aprovecha esos datos para proponer la dirección cuando ya la conocemos.

## Goals / Non-Goals

**Goals:**
- Reducir fricción para usuarios con dirección conocida (Adresles o eCommerce).
- Añadir fase `WAITING_ADDRESS_PROPOSAL_CONFIRM` sin nuevos campos en `ConversationState`.
- Mantener compatibilidad con sub-journeys 2.2 y 2.4 (pregunta estándar).

**Non-Goals:**
- No modificar el contrato de colas ni el API.
- No tocar frontend; la simulación existente sirve para verificación.

## Decisions

### 1. Reutilizar `pendingAddress` en lugar de `proposedAddress`

**Decisión**: Usar `pendingAddress` para la dirección propuesta en `WAITING_ADDRESS_PROPOSAL_CONFIRM`.

**Alternativa descartada**: Añadir `proposedAddress` como campo nuevo.

**Rationale**: Ambas fases (`WAITING_CONFIRMATION` y `WAITING_ADDRESS_PROPOSAL_CONFIRM`) representan "dirección pendiente de confirmación del usuario". Un solo campo evita redundancia y posibles bugs de usar el campo equivocado.

### 2. Orden de evaluación: 2.1 → 2.3 → 2.2/2.4

**Decisión**: Evaluar en ese orden dentro de `processGetAddressJourney`. Si 2.1 aplica, salir; si no, evaluar 2.3; si no, flujo estándar.

**Rationale**: Los sub-journeys son mutuamente excluyentes por condiciones (isRegistered, hasAddress, context). El orden no altera el resultado pero simplifica la lógica.

### 3. Mapeo eCommerce → PendingAddress sin validación GMaps

**Decisión**: El `PendingAddress` construido desde `context.buyerEcommerceAddress` tiene `gmapsPlaceId`, `latitude`, `longitude` en `null`.

**Rationale**: La dirección ya viene del eCommerce (presumiblemente validada). Para el MVP mock no realizamos geocoding adicional. `finalizeAddress` y `simulateEcommerceSync` funcionan con esa estructura.

## Risks / Trade-offs

- **[Riesgo]** Dirección eCommerce mal formateada o incompleta → **Mitigación**: El DTO `MockAddressDto` valida campos requeridos; el Worker asume valores por defecto para campos opcionales.
- **[Trade-off]** No validamos la dirección Adresles con GMaps al proponerla → **Aceptado**: Ya está en DB y fue validada previamente.
