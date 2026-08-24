# ERP webservice contract (provisional)

> Assumed request/response shapes for the ADMIN and PEOPLE REST webservices.
> The real webservices do not exist yet — fixtures in `fixtures/` are derived
> from this contract, and `rest.py` implements it. When the real contract is
> published, only this document and `rest.py` should need to change; the
> `ERPGateway` interface and DTOs stay stable.

## Conventions

- Base URL per ERP: `ADMIN_API_URL` / `PEOPLE_API_URL`.
- Auth: `Authorization: Bearer <token>` (`ADMIN_API_TOKEN` / `PEOPLE_API_TOKEN`).
- All responses are JSON. Errors use `4xx` for validation, `5xx` for server-side failure.
- Identity: every company-scoped resource carries `id_externo` (string); the ERP
  itself is identified by which base URL answered the request — EyeMaster tags it
  with `proyecto` (`ADMIN`/`PEOPLE`) when building the DTO.

## `GET /companies?query=<text>`

Search companies by name or external id.

```json
{
  "results": [
    {
      "id_externo": "1001",
      "app": "SUITE_A",
      "razon_social": "Comercializadora Demo SA de CV",
      "nombre_comercial": "Demo",
      "estado": "activa"
    }
  ]
}
```

`estado` in `activa | inactiva | baja_erp`.

## `GET /companies/{id_externo}`

Single company detail, same shape as one item of the search results above.
`404` if not found or deregistered beyond retrieval.

## `GET /companies/{id_externo}/plans`

```json
{
  "results": [
    {
      "id_externo": "5001",
      "empresa_id_externo": "1001",
      "plan_nombre": "Plan Basico",
      "tipo_contrato": 2,
      "estatus": 1,
      "fecha_inicio": "2026-01-01",
      "fecha_final": "2026-02-01",
      "prorroga": 0,
      "precio_unitario": "499.00"
    }
  ]
}
```

`tipo_contrato`: `1` freemium, `2` paid. `estatus`: `1` current, `4` blocked, `0` expired.

## `GET /companies/{id_externo}/payments`

```json
{
  "results": [
    {
      "id_externo": "9001",
      "empresa_id_externo": "1001",
      "empresa_plan_id_externo": "5001",
      "estatus": 2,
      "subtotal": "499.00",
      "importe_descuento": "0.00",
      "impuesto": "79.84",
      "total": "578.84",
      "fecha": "2026-02-01"
    }
  ]
}
```

`estatus`: `0` deleted, `1` paid, `2` outstanding, `3` invoiced.

## `GET /companies/{id_externo}/billing-cycles`

```json
{
  "results": [
    {
      "id_externo": "7001",
      "empresa_plan_id_externo": "5001",
      "complemento_clave": "COMP-REC-A",
      "cantidad": "120.00",
      "excedente": "0.00",
      "periodo_inicio": "2026-01-01",
      "periodo_final": "2026-02-01"
    }
  ]
}
```

## `GET /clients?rfc=<rfc>` (ADMIN only — `catalogo_clientes`)

```json
{
  "found": true,
  "client": {
    "id_externo": "cli-001",
    "rfc": "XAXX010101000",
    "razon_social": "Comercializadora Demo SA de CV"
  }
}
```

`found: false` (no `client` key) when the RFC does not exist.

## `POST /clients` (ADMIN only — `catalogo_clientes`)

Request:

```json
{ "rfc": "XAXX010101000", "razon_social": "Comercializadora Demo SA de CV" }
```

Response `201`:

```json
{ "id_externo": "cli-002", "rfc": "XAXX010101000", "razon_social": "Comercializadora Demo SA de CV" }
```

Response `400` on ERP-side validation failure:

```json
{ "error": "rfc invalido" }
```

## Error semantics used by the gateway

| Situation | Gateway error |
|---|---|
| Connection error, timeout, or `5xx` after retries | `ERPUnavailableError` |
| `4xx` response body | `ERPValidationError` (carries the ERP message) |
