## ADDED Requirements

### Requirement: Listar direcciones con datos de usuario desde AdminModule
El sistema SHALL exponer `GET /api/admin/addresses` mediante el `AdminController` existente, delegando en el `AdminService` la lógica de consulta. El endpoint es aditivo: no modifica los endpoints existentes de pedidos, usuarios, tiendas ni conversaciones.

El endpoint implementa el mismo patrón arquitectónico que `GET /api/admin/users`:
- DTO de query `AddressesQuery` con decoradores `class-validator` (`@IsOptional`, `@IsIn`, `@IsString`)
- Método `getAddresses(page, limit, params)` en `AdminService`
- Métodos privados `buildAddressesOrderBy(sortBy, dir)` y `buildAddressesWhere(params)`
- Misma transacción `prisma.$transaction([findMany, count])` con el mismo `where`

La especificación completa del contrato del endpoint (parámetros, respuesta JSON, comportamiento de filtros y ordenación) está en `specs/addresses-admin-api/spec.md`.

#### Scenario: Endpoint addresses aditivo — no rompe endpoints existentes
- **WHEN** se registra el nuevo endpoint en `AdminController` y se ejecuta `pnpm test` en `apps/api`
- **THEN** todos los tests existentes de `admin.service.spec.ts` y `admin.controller.spec.ts` siguen pasando

#### Scenario: DTO AddressesQuery rechaza propiedades no declaradas
- **WHEN** se hace `GET /api/admin/addresses?campoDesconocido=valor`
- **THEN** el sistema responde `400 Bad Request` (comportamiento del `ValidationPipe` global con `forbidNonWhitelisted: true`)

#### Scenario: DTO AddressesQuery acepta todos los params válidos
- **WHEN** se hace `GET /api/admin/addresses?page=1&limit=50&sortBy=city&sortDir=asc&q=madrid&favorite=true`
- **THEN** el sistema responde `200 OK` sin errores de validación

#### Scenario: buildAddressesWhere incluye isDeleted=false como condición base
- **WHEN** se invoca `buildAddressesWhere({})` (sin parámetros)
- **THEN** el objeto `where` resultante incluye `{ AND: [{ isDeleted: false }] }`

#### Scenario: buildAddressesOrderBy devuelve defaults cuando sortBy es inválido
- **WHEN** se invoca `buildAddressesOrderBy('invalido', 'asc')`
- **THEN** devuelve la ordenación por defecto: `[{ user: { firstName: { sort: 'asc', nulls: 'last' } } }, { user: { lastName: { sort: 'asc', nulls: 'last' } } }]`
