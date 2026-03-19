## ADDED Requirements

### Requirement: Listar direcciones con datos de usuario
El sistema SHALL exponer `GET /api/admin/addresses` que devuelva direcciones paginadas con soporte de ordenación y filtrado. Solo se devuelven direcciones con `isDeleted = false` (condición base invariable). Cada dirección incluye los datos básicos del usuario al que pertenece.

El endpoint SHALL aceptar los siguientes query params (todos opcionales):

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `page` | entero ≥ 1 | Página (defecto: 1) |
| `limit` | entero 1–100 | Tamaño de página (defecto: 50) |
| `sortBy` | `name\|alias\|postalCode\|city\|province\|country\|favorite` | Columna de ordenación (defecto: `name`) |
| `sortDir` | `asc\|desc` | Dirección de ordenación (defecto: `asc`) |
| `q` | string | Búsqueda libre en 13 campos (case-insensitive, OR entre campos): `user.firstName`, `user.lastName`, `label`, `street`, `number`, `block`, `staircase`, `floor`, `door`, `postalCode`, `city`, `province`, `country` |
| `favorite` | `true\|false` | Filtrar por `isDefault`. Ausente = todas. Valores inválidos se ignoran silenciosamente |

Los filtros `q` y `favorite` se combinan con lógica AND.

`meta.total` refleja siempre el número de direcciones que cumplen los filtros activos (no el total global).

La consulta Prisma usa `buildAddressesWhere(params)` (método privado de `AdminService`) para construir el `where`. La condición `isDeleted: false` es siempre el primer elemento del array `AND`. El mismo `where` se aplica en `findMany` y en `count`.

La ordenación se delega en `buildAddressesOrderBy(sortBy, dir)`. Para columnas con valores nullable (`label`, `province`), se usa `nulls: 'last'`. La ordenación por `name` usa `user.firstName` + `user.lastName` con `nulls: 'last'`. La ordenación por `favorite` usa el campo booleano `isDefault` directamente.

**Respuesta `200 OK`:**
```json
{
  "data": [
    {
      "id": "uuid-addr-1",
      "userId": "uuid-user-1",
      "label": "Casa",
      "street": "Calle Mayor",
      "number": "5",
      "block": null,
      "staircase": null,
      "floor": "3º",
      "door": "A",
      "postalCode": "28013",
      "city": "Madrid",
      "province": "Madrid",
      "country": "España",
      "isDefault": true,
      "createdAt": "2026-02-21T10:00:00Z",
      "user": {
        "id": "uuid-user-1",
        "firstName": "Juan",
        "lastName": "García"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 1
  }
}
```

El DTO `AddressesQuery` en `admin.controller.ts` SHALL declarar todas sus propiedades con decoradores de `class-validator` (mínimo `@IsOptional()`) para cumplir con el `ValidationPipe` global (`whitelist: true, forbidNonWhitelisted: true`).

#### Scenario: Consulta sin params usa defaults
- **WHEN** se hace `GET /api/admin/addresses` sin parámetros
- **THEN** el sistema responde `200 OK` con direcciones ordenadas por `user.firstName ASC` luego `user.lastName ASC`, nulls al final, filtrando `isDeleted = false`

#### Scenario: Paginación funciona correctamente
- **WHEN** se hace `GET /api/admin/addresses?page=1&limit=50`
- **THEN** el sistema responde `200 OK` con un array `data` de hasta 50 direcciones y un objeto `meta` con `page`, `limit` y `total`

#### Scenario: Cada dirección incluye datos del usuario
- **WHEN** se hace `GET /api/admin/addresses` y existen direcciones
- **THEN** cada item del array `data` incluye `user.id`, `user.firstName`, `user.lastName`

#### Scenario: Direcciones eliminadas no aparecen
- **WHEN** existen direcciones con `isDeleted = true`
- **THEN** esas direcciones NO aparecen en la respuesta

#### Scenario: Ordenación por ciudad
- **WHEN** se hace `GET /api/admin/addresses?sortBy=city&sortDir=asc`
- **THEN** la respuesta devuelve direcciones ordenadas por `city ASC`

#### Scenario: Ordenación por favorita — favoritas primero
- **WHEN** se hace `GET /api/admin/addresses?sortBy=favorite&sortDir=desc`
- **THEN** las direcciones con `isDefault = true` aparecen antes que las de `isDefault = false`

#### Scenario: Ordenación por alias con nulls al final
- **WHEN** se hace `GET /api/admin/addresses?sortBy=alias&sortDir=asc`
- **THEN** las direcciones con `label = null` aparecen al final de la lista

#### Scenario: sortBy inválido hace fallback silencioso
- **WHEN** se hace `GET /api/admin/addresses?sortBy=invalido&sortDir=asc`
- **THEN** el sistema responde `200 OK` con el orden por defecto (`name ASC`) sin error 400

#### Scenario: Búsqueda de texto libre OR en 13 campos
- **WHEN** se hace `GET /api/admin/addresses?q=garcia`
- **THEN** la respuesta incluye solo direcciones donde al menos uno de los 13 campos contiene "garcia" (case-insensitive)

#### Scenario: Búsqueda por ciudad
- **WHEN** se hace `GET /api/admin/addresses?q=madrid`
- **THEN** la respuesta incluye direcciones cuyo campo `city` contiene "madrid" (y cualquier otro de los 13 campos)

#### Scenario: Filtro favorite=true
- **WHEN** se hace `GET /api/admin/addresses?favorite=true`
- **THEN** la respuesta incluye solo direcciones con `isDefault = true`

#### Scenario: Filtro favorite=false
- **WHEN** se hace `GET /api/admin/addresses?favorite=false`
- **THEN** la respuesta incluye solo direcciones con `isDefault = false`

#### Scenario: Combinación AND de q y favorite
- **WHEN** se hace `GET /api/admin/addresses?q=madrid&favorite=true`
- **THEN** la respuesta incluye solo direcciones favoritas que además contienen "madrid" en alguno de sus 13 campos

#### Scenario: favorite inválido se ignora silenciosamente
- **WHEN** se hace `GET /api/admin/addresses?favorite=invalido`
- **THEN** el sistema responde `200 OK` con todas las direcciones sin filtro de favorita

#### Scenario: meta.total refleja el count filtrado
- **WHEN** se hace `GET /api/admin/addresses?favorite=true` y hay 5 direcciones favoritas de un total de 20
- **THEN** la respuesta tiene `meta.total = 5`

#### Scenario: Respuesta vacía cuando no hay direcciones
- **WHEN** no existen direcciones con `isDeleted = false`
- **THEN** el sistema responde `200 OK` con `data: []` y `meta.total: 0`
