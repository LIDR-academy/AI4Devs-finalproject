# DEVELOPMENT_PLAN — INKSPIRE

> Roadmap y orden de implementación de la Entrega 2. **Actualizar al cerrar cada fase o al cambiar el alcance.**
> Fuente del backlog: `docs/us/all-us.md` (13 US · 80 SP). Última actualización: 2026-07-14.

## Principios

- **Una US a la vez** — nunca desarrollar dos historias simultáneamente.
- **Mock-first** — Flow, Object Storage e imágenes se mockean primero y se reemplazan por implementaciones reales después.
- **TDD** — test que falla → implementación → refactor, según `docs/base-standards.md` y los tickets de cada US.
- **API-first** — `docs/api-spec.yml` es la especificación oficial; debe sincronizarse antes/junto con cada endpoint implementado.
- **Docker desde el inicio** — todo debe poder ejecutarse con `docker-compose`.

## Fase 0 — Fundaciones (sin US, prerequisito de todo)

| # | Tarea | Resultado |
|---|---|---|
| 0.1 | `docker-compose.yml`: PostgreSQL 16 + PostGIS, MinIO | Infra local reproducible (`docs/development_guide.md`) |
| 0.2 | Scaffolding backend .NET 10: solución por capas (Api / Application / Domain / Infrastructure) + xUnit | `backend/` compilando con test de humo |
| 0.3 | Scaffolding frontend Angular 20: workspace, core/shared/features, Angular Material | `frontend/` con `ng serve` funcionando |
| 0.4 | Dockerfiles backend y frontend + integración en compose | `docker-compose up` levanta el sistema completo |
| 0.5 | CI GitHub Actions: build + tests backend y frontend en cada PR | `.github/workflows/ci.yml` |
| 0.6 | Sincronizar `api-spec.yml` (requiere aprobación — issue-004 §E1) | Spec alineada con backlog y modelo |

## Fases de implementación (orden de `all-us.md`)

| Fase | Capa | US | SP | Notas |
|---|---|---|---|---|
| 1 | Capa 0 — Auth | US0001 | 3 | Incluye task0001: migración EF Core completa + seed (desbloquea todo) |
| 2 | Capa 1 — Vitrina | US0003 → US0004 → US0005 → US0007 | 21 | Vitrina, filtros, búsqueda, badge |
| 3 | Capa 2 — Detalle | US0006 | 5 | Perfil público del artista |
| 4 | Capa 3 — Reserva | US0008 → US0009 | 18 | Slot + hold TTL, pago Flow (mock → sandbox) |
| 5 | Capa 4 — Post-venta | US0010 → US0013 | 10 | Historial, confirmar asistencia, calificar |
| 6 | Capa 5 — Extras (Should-Have) | US0011 → US0012 → US0014 | 23 | Chatbot, mapa, auspicios |

## Grafo de dependencias

```
SEED ──► US0001 ──► US0008 ──► US0009 ──► US0010 ──► US0013
  │
  └────► US0003 ──► US0004 ──► US0005
            │            └───► US0012
            └──► US0006 ──► US0007 / US0011 / US0014
                    └─────► US0008
```

## Flujo por US (obligatorio)

Analizar → Planificar → Preguntar si hay dudas → Crear rama (`feature/usXXXX-descripcion`) → Implementar tickets de la US → Tests → Refactor → Actualizar documentación → Actualizar `api-spec.yml` si aplica → Registrar prompts (skill `prompt-registry`) → PR + Merge → Actualizar `PROJECT_STATUS.md`.

## Definition of Done (resumen — detalle en `CONTRIBUTING.md`)

Una US está terminada solo cuando: cumple criterios de aceptación, compila, pasa pruebas, documentación actualizada, prompts registrados, OpenAPI sincronizada y lista para revisión.
