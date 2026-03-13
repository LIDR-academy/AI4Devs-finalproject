## MODIFIED Requirements

### Requirement: Endpoint GET /admin/orders acepta parámetros de ordenación
El endpoint `GET /api/admin/orders` SHALL aceptar los query params opcionales `sortBy` y `sortDir` para controlar el orden de los resultados devueltos.

Valores válidos de `sortBy`: `ref` | `store` | `user` | `amount` | `date`  
Valores válidos de `sortDir`: `asc` | `desc`  
Valor por defecto cuando no se proporcionan params: `sortBy=date`, `sortDir=desc`

#### Scenario: Solicitud sin parámetros de ordenación
- **WHEN** el cliente llama a `GET /api/admin/orders` sin `sortBy` ni `sortDir`
- **THEN** la respuesta devuelve los pedidos ordenados por `webhookReceivedAt DESC`
- **THEN** el status HTTP es 200

#### Scenario: Solicitud con sortBy y sortDir válidos
- **WHEN** el cliente llama a `GET /api/admin/orders?sortBy=store&sortDir=asc`
- **THEN** la respuesta devuelve los pedidos ordenados por nombre de tienda ASC con subsort por referencia ASC
- **THEN** el status HTTP es 200

#### Scenario: sortBy inválido — fallback silencioso
- **WHEN** el cliente llama a `GET /api/admin/orders?sortBy=foobar&sortDir=asc`
- **THEN** la respuesta devuelve los pedidos con el orden por defecto (`date DESC`)
- **THEN** el status HTTP es 200 (sin error 400)

#### Scenario: Ordenación por importe numérico
- **WHEN** el cliente llama a `GET /api/admin/orders?sortBy=amount&sortDir=desc`
- **THEN** los pedidos se ordenan por `totalAmount` de mayor a menor (tipo Decimal en Prisma)

#### Scenario: Ordenación por referencia con nulls al final
- **WHEN** el cliente llama a `GET /api/admin/orders?sortBy=ref&sortDir=asc`
- **THEN** los pedidos con `externalOrderNumber` nulo aparecen al final de la lista
