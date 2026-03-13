## ADDED Requirements

### Requirement: Listar tiendas activas para simulación
El sistema SHALL exponer `GET /api/admin/stores` que devuelva la lista completa de tiendas con `status = ACTIVE`, enriquecida con el nombre comercial del eCommerce propietario. No requiere parámetros de entrada, paginación ni filtros.

La respuesta SHALL tener la forma `{ "data": SimulateStore[] }` donde cada elemento incluye `id`, `name`, `url`, `platform` (valor del enum `StorePlatform`) y `ecommerceName` (nunca null).

Ordenación fija: primero por `ecommerce.commercialName ASC`, luego por `store.name ASC`.

Cuando `ecommerce.commercialName` sea null, SHALL usarse `ecommerce.legalName` como valor de `ecommerceName`.

**Respuesta `200 OK`:**
```json
{
  "data": [
    {
      "id": "uuid-store-1",
      "name": "ModaMujer Tienda Principal",
      "url": "https://modamujer.example.com",
      "platform": "WOOCOMMERCE",
      "ecommerceName": "ModaMujer"
    },
    {
      "id": "uuid-store-2",
      "name": "ModaMujer Outlet",
      "url": "https://modamujer-outlet.example.com",
      "platform": "SHOPIFY",
      "ecommerceName": "ModaMujer"
    },
    {
      "id": "uuid-store-3",
      "name": "TechGadgets Store",
      "url": "https://techgadgets.example.com",
      "platform": "PRESTASHOP",
      "ecommerceName": "TechGadgets"
    }
  ]
}
```

#### Scenario: Consulta de tiendas activas
- **WHEN** se hace `GET /api/admin/stores`
- **THEN** el sistema responde `200 OK` con `{ data: [...] }` donde cada elemento incluye `id`, `name`, `url`, `platform` y `ecommerceName`

#### Scenario: Solo aparecen tiendas con status ACTIVE
- **WHEN** existen tiendas con `status = INACTIVE` o `status = PENDING_SETUP`
- **THEN** esas tiendas NO aparecen en la respuesta

#### Scenario: Respuesta vacía cuando no hay tiendas activas
- **WHEN** no existen tiendas con `status = ACTIVE`
- **THEN** el sistema responde `200 OK` con `{ data: [] }`

#### Scenario: ecommerceName nunca es null
- **WHEN** una tienda pertenece a un eCommerce con `commercialName = null`
- **THEN** `ecommerceName` en la respuesta contiene el valor de `legalName` del eCommerce

#### Scenario: Ordenación por ecommerceName y luego por nombre de tienda
- **WHEN** existen múltiples tiendas de distintos eCommerces
- **THEN** la respuesta las ordena primero por nombre de eCommerce ASC y luego por nombre de tienda ASC dentro del mismo eCommerce
