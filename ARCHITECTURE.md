# ARCHITECTURE — INKSPIRE

> Resumen de arquitectura para incorporación rápida de cualquier agente o desarrollador.
> Detalle completo (C4, decisiones, diagramas de secuencia): `docs/documentacion.md` §4–5. Última actualización: 2026-07-14.

## Visión general

Monolito modular con SPA desacoplada:

```
┌─────────────┐   HTTPS/JSON   ┌──────────────────┐        ┌────────────────┐
│ Angular 20  │ ─────────────► │ .NET 10 Web API  │ ─────► │ PostgreSQL 16  │
│ SPA (4200)  │                │ (5000)           │        │ + PostGIS      │
└─────────────┘                │                  │ ─────► │ MinIO (S3)     │
                               │                  │ ─────► │ Flow (pagos)   │
                               └──────────────────┘        └────────────────┘
```

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | Angular 20, Angular Material, signals, Leaflet + OpenStreetMap (mapa) |
| Backend | .NET 10 / C#, ASP.NET Core Web API, EF Core (Npgsql + NetTopologySuite) |
| Base de datos | PostgreSQL 16 + PostGIS (geo), JSONB |
| Object Storage | MinIO (dev) / compatible S3 (prod) — imágenes de portafolio |
| Pagos | Flow Chile (sandbox en dev; mock en primeras iteraciones) |
| Auth | JWT Bearer (24 h), roles: client / artist / admin |
| Tests | xUnit + TestContainers (backend) · Karma/Jest + Cypress (frontend) |

## Capas del backend

```
backend/
├── Api / Controllers      → endpoints REST (contrato: docs/api-spec.yml)
├── Application            → casos de uso, DTOs, validaciones
├── Domain                 → entidades y reglas de negocio (13 entidades: docs/data-model.md)
├── Infrastructure         → EF Core, repositorios, Flow, MinIO
└── Seed                   → datos iniciales (usuarios, artistas, certificaciones, premios, auspicios)
```

Principios: arquitectura por capas, inyección de dependencias, DTOs en los bordes, validaciones en Application, logging estructurado, manejo de errores centralizado (middleware → schema `Error` de la spec).

## Frontend

```
frontend/src/app/
├── core       → guards, interceptors (JWT), servicios base
├── shared     → componentes reutilizables (ArtistCard, CertificationBadge, …)
└── features   → módulos por funcionalidad (showcase, artist-profile, booking, reviews, map, chatbot)
```

## Decisiones arquitectónicas clave

1. **Flujo 100 % cliente**: el artista es solo datos seed en el MVP; no hay UI ni endpoints de gestión de artista (issue-003, decisión 1D).
2. **Datos seed**: certificaciones, premios y auspicios se pre-cargan; solo lectura.
3. **Booking state machine**: `pending_payment → confirmed → completed | cancelled`; el cliente confirma asistencia (no el artista).
4. **Hold de slot**: reserva temporal con TTL 5 min (`expires_at`) mientras se paga.
5. **Contrato API-first**: `docs/api-spec.yml` es la fuente de verdad del contrato REST; se actualiza junto con cada cambio de endpoint.
6. **Sin OpenSpec como fuente de verdad**: la carpeta `openspec/` existe pero no se usa (directriz vigente del bootstrap).

## Documentos relacionados

- `docs/data-model.md` — modelo de datos y diagrama ER
- `docs/api-spec.yml` — especificación oficial OpenAPI
- `docs/backend-standards.md` / `docs/frontend-standards.md` — estándares por área
- `DEVELOPMENT_PLAN.md` — roadmap de implementación
