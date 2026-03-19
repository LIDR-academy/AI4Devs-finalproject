## MODIFIED Requirements

### Requirement: Listar pedidos con contexto completo

El sistema SHALL exponer `GET /api/admin/orders` que devuelva pedidos paginados con soporte de ordenación y filtrado, incluyendo datos de tienda, usuario (con teléfono) y lista de IDs de conversación asociadas.

El endpoint SHALL aceptar los siguientes query params (todos opcionales):

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `page` | entero ≥ 1 | Página (defecto: 1) |
| `limit` | entero 1–100 | Tamaño de página (defecto: 50) |
| `sortBy` | `ref\|store\|user\|amount\|date` | Columna de ordenación (defecto: `date`) |
| `sortDir` | `asc\|desc` | Dirección (defecto: `desc`) |
| `q` | string | Búsqueda de texto libre en `store.name`, **`externalOrderId`**, `user.firstName`, `user.lastName` (case-insensitive, OR entre columnas) |
| `status` | string CSV | Estados a filtrar. Valores inválidos se ignoran silenciosamente |
| `mode` | string CSV | Modos a filtrar. Valores inválidos se ignoran silenciosamente |
| `from` | `YYYY-MM-DD` | Fecha inicio (inclusiva desde `00:00:00.000Z`). Formato incorrecto → HTTP 400 |
| `to` | `YYYY-MM-DD` | Fecha fin (inclusiva hasta `23:59:59.999Z`). Mismo comportamiento que `from` |

Los filtros se combinan con lógica AND entre sí. Dentro de `status` y `mode`, la lógica es OR.

`meta.total` refleja siempre el número de pedidos que cumplen los filtros activos.

**Cambio respecto a la spec anterior**: el parámetro `q` busca por `externalOrderId` (NOT NULL) en lugar de `externalOrderNumber` (nullable). La columna "Referencia" en la UI siempre mostrará `externalOrderId`.

La ordenación por `sortBy=ref` usa `{ externalOrderId: dir }` (sin `nulls: 'last'` porque el campo es NOT NULL).

#### Scenario: Consulta paginada de pedidos

- **WHEN** se hace `GET /api/admin/orders?page=1&limit=50`
- **THEN** el sistema responde `200 OK` con un array `data` de pedidos y un objeto `meta` con `page`, `limit` y `total`

#### Scenario: Filtro de texto libre busca por externalOrderId

- **WHEN** se hace `GET /api/admin/orders?q=100`
- **THEN** la respuesta incluye solo pedidos donde `store.name`, `externalOrderId`, `user.firstName` o `user.lastName` contiene "100" (case-insensitive)
- **AND** no se busca por `externalOrderNumber`

#### Scenario: Ordenación por ref usa externalOrderId sin nulls

- **WHEN** se hace `GET /api/admin/orders?sortBy=ref&sortDir=asc`
- **THEN** `buildOrderBy` produce `[{ externalOrderId: 'asc' }]` (sin clave `nulls`)

#### Scenario: Ordenación por store incluye externalOrderId como subsort

- **WHEN** se hace `GET /api/admin/orders?sortBy=store&sortDir=asc`
- **THEN** `buildOrderBy` produce `[{ store: { name: 'asc' } }, { externalOrderId: 'asc' }]`

---

### Requirement: Obtener mensajes de una conversación

El sistema SHALL exponer `GET /api/admin/conversations/:conversationId/messages` que devuelva todos los mensajes de la conversación desde DynamoDB, ordenados cronológicamente (ASC por timestamp).

La respuesta incluye el campo `order` con `externalOrderId` (NOT NULL) en lugar de `externalOrderNumber` (nullable). La estructura del campo `order` en la respuesta de contexto de conversación es `{ externalOrderId: string }`.

**Respuesta `200 OK`:**
```json
{
  "conversationId": "conv-uuid",
  "messages": [...],
  "order": {
    "externalOrderId": "100"
  }
}
```

#### Scenario: Conversación existente con mensajes

- **WHEN** se hace `GET /api/admin/conversations/conv-uuid/messages` y la conversación existe
- **THEN** el sistema responde `200 OK` con `{ conversationId, messages: [...] }`

#### Scenario: Campo order devuelve externalOrderId directamente

- **WHEN** se hace `GET /api/admin/conversations/:id/messages` para una conversación con pedido asociado
- **THEN** el campo `order` en la respuesta contiene `{ externalOrderId: "<valor>" }` (nunca null, sin fallback)
- **AND** no aparece el campo `externalOrderNumber` en la respuesta
