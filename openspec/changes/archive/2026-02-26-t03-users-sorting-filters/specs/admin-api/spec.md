## MODIFIED Requirements

### Requirement: Listar usuarios con conteos
El sistema SHALL exponer `GET /api/admin/users` que devuelva usuarios paginados con soporte de ordenación y filtrado. Solo se devuelven usuarios con `isDeleted = false` (condición base invariable). Incluye teléfono y conteo de pedidos y direcciones.

El endpoint SHALL aceptar los siguientes query params (todos opcionales):

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `page` | entero ≥ 1 | Página (defecto: 1) |
| `limit` | entero 1–100 | Tamaño de página (defecto: 50) |
| `sortBy` | `name\|email\|orders\|addresses\|lastInteraction` | Columna de ordenación (defecto: `lastInteraction`) |
| `sortDir` | `asc\|desc` | Dirección de ordenación (defecto: `desc`) |
| `q` | string | Búsqueda libre en `firstName`, `lastName`, `email` (case-insensitive, OR entre campos) |
| `registered` | `true\|false` | Filtrar por `isRegistered`. Ausente = todos. Valores inválidos se ignoran silenciosamente |

Los filtros `q` y `registered` se combinan con lógica AND.

`meta.total` SHALL reflejar siempre el número de usuarios que cumplen los filtros activos (no el total global).

La consulta Prisma SHALL usar `buildUsersWhere(params)` (método privado de `AdminService`) para construir el `where` y aplicar el mismo filtro en `findMany` y en `count`:
```typescript
const where = this.buildUsersWhere(params);
prisma.$transaction([
  prisma.user.findMany({ include: { ... }, where, orderBy, skip, take }),
  prisma.user.count({ where }),
])
```

`buildUsersWhere` SHALL incluir siempre `{ isDeleted: false }` como condición base del array `AND`.

**Respuesta `200 OK`:** (igual que antes — misma estructura, `meta.total` ahora filtrado)
```json
{
  "data": [ ... ],
  "meta": { "page": 1, "limit": 50, "total": 3 }
}
```

#### Scenario: Consulta sin params usa defaults
- **WHEN** se hace `GET /api/admin/users` sin params
- **THEN** el sistema responde `200 OK` con usuarios ordenados por `lastInteractionAt DESC`, nulls al final, filtrando `isDeleted = false`

#### Scenario: sortDir se ignora cuando sortBy es inválido
- **WHEN** se hace `GET /api/admin/users?sortBy=invalido&dir=asc`
- **THEN** la respuesta usa los defaults completos (`lastInteraction DESC`), ignorando `dir=asc`

> **Comportamiento de diseño:** `sortDir` solo se respeta cuando `sortBy` también es válido. Si `sortBy` cae al fallback, `sortDir` también se fuerza a `desc` (el default). Esto aplica tanto en el servicio (`admin.service.ts`) como en el Server Component (`users/page.tsx`). Es el comportamiento deseado: un sort inválido implica defaults completos, no sort-default con dirección arbitraria.

#### Scenario: Ordenación por nombre con nulls al final
- **WHEN** se hace `GET /api/admin/users?sortBy=name&sortDir=asc`
- **THEN** la respuesta devuelve usuarios ordenados por `firstName ASC` luego `lastName ASC`, con usuarios sin nombre al final

#### Scenario: Ordenación por conteo de pedidos
- **WHEN** se hace `GET /api/admin/users?sortBy=orders&sortDir=desc`
- **THEN** la respuesta devuelve usuarios con más pedidos primero

#### Scenario: sortBy inválido hace fallback silencioso
- **WHEN** se hace `GET /api/admin/users?sortBy=invalido&sortDir=asc`
- **THEN** la respuesta usa el orden por defecto (`lastInteraction DESC`) y el status HTTP es 200

> **Nota de implementación:** El fallback silencioso ocurre en `AdminService.buildUsersOrderBy` (nivel de servicio). El DTO `UsersQuery` usa `@IsIn` con `ValidationPipe`, lo que significa que clientes externos que envíen `sortBy` inválido recibirán un **400** en lugar del 200 especificado. El único cliente actual (frontend `web-admin`) valida los params antes de llamar al API, por lo que el comportamiento observable es correcto. **Deuda técnica pendiente:** eliminar `@IsIn` de `UsersQuery.sortBy` y de `OrdersQuery.sortBy` (y `UsersQuery.registered`) en `admin.controller.ts`, delegando toda la validación de valores al servicio. Afecta a `apps/api/src/admin/admin.controller.ts` y los tests de integración correspondientes.

#### Scenario: Búsqueda de texto libre OR en tres campos
- **WHEN** se hace `GET /api/admin/users?q=garcia`
- **THEN** la respuesta incluye solo usuarios donde `firstName`, `lastName` o `email` contiene "garcia" (case-insensitive)

#### Scenario: Filtro por registered=true
- **WHEN** se hace `GET /api/admin/users?registered=true`
- **THEN** la respuesta incluye solo usuarios con `isRegistered = true`

#### Scenario: Filtro por registered=false
- **WHEN** se hace `GET /api/admin/users?registered=false`
- **THEN** la respuesta incluye solo usuarios con `isRegistered = false`

#### Scenario: Combinación AND de q y registered
- **WHEN** se hace `GET /api/admin/users?q=garcia&registered=true`
- **THEN** la respuesta incluye solo usuarios registrados cuyo nombre o email contiene "garcia"

#### Scenario: registered inválido se ignora silenciosamente
- **WHEN** se hace `GET /api/admin/users?registered=invalido`
- **THEN** la respuesta devuelve todos los usuarios (sin filtro de registro) y status HTTP 200

#### Scenario: meta.total refleja el count filtrado
- **WHEN** se hace `GET /api/admin/users?registered=true` y hay 3 registrados de un total de 10
- **THEN** la respuesta tiene `meta.total = 3`

#### Scenario: isDeleted siempre excluido
- **WHEN** existen usuarios con `isDeleted = true` y se hace `GET /api/admin/users` con cualquier combinación de filtros
- **THEN** esos usuarios NO aparecen en la respuesta
