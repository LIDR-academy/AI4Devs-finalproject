# HANDOFF — Prompt de continuación para cualquier IA

> **Propósito**: permitir que cualquier asistente de IA (Claude, Cursor, Codex, Gemini, etc.) retome el trabajo exactamente donde quedó, sin depender del historial de una conversación anterior.
> **Protocolo**: este archivo y `PROJECT_STATUS.md` deben actualizarse **al cerrar cada task, US o hito**, y también al interrumpir el trabajo a mitad de una task (registrar qué quedó a medias).

---

## Prompt de continuación (copiar y pegar a la IA)

```text
Eres un desarrollador senior trabajando en INK·LINK, un marketplace de tatuajes en Chile
(Angular 20 + .NET 10 + PostgreSQL 16/PostGIS), proyecto final del máster AI4Devs.

ANTES DE ESCRIBIR CÓDIGO, lee en este orden:
1. PROJECT_STATUS.md          → estado actual, US en curso, bloqueos
2. HANDOFF.md (sección "Estado detallado") → punto exacto donde quedó el trabajo
3. DEVELOPMENT_PLAN.md        → roadmap, orden de US, flujo obligatorio por US
4. CONTRIBUTING.md            → flujo Git, convención de commits, Definition of Done
5. docs/base-standards.md     → reglas para agentes IA (TDD, idiomas, baby steps)
6. La US en curso y sus tickets: docs/us/usXXXX/ (la US marcada "En desarrollo"
   en PROJECT_STATUS.md)

FUENTES DE VERDAD (prevalecen sobre cualquier otro documento):
- docs/api-spec.yml     → contrato oficial de la API (OpenAPI 3.0)
- docs/data-model.md    → modelo de datos (13 entidades)
- docs/us/all-us.md     → backlog vigente (13 US)

REGLAS INQUEBRANTABLES:
- Una US a la vez; dentro de la US, una task a la vez (baby steps).
- TDD: test que falla → implementación mínima → refactor.
- Código/tests/schemas en INGLÉS; documentación/commits en ESPAÑOL.
- Trabajar en rama feature/usXXXX-descripcion (nunca directo en main).
- Mock-first para Flow y Object Storage hasta US0009.
- Al terminar cada task: commit con formato convencional
  (feat(usXXXX): TASKYYYY — descripción).
- Al cerrar la US: actualizar PROJECT_STATUS.md, HANDOFF.md, registrar prompts
  (prompts/00-all-prompts.md), sincronizar api-spec.yml si cambió, PR a main.
- Si interrumpes el trabajo a medias: registra en HANDOFF.md §"Estado detallado"
  qué archivo estabas tocando, qué tests pasan/fallan y cuál es el siguiente paso.

Retoma el trabajo desde el punto indicado en "Estado detallado" de HANDOFF.md.
```

---

## Estado detallado (actualizar SIEMPRE antes de cerrar sesión)

**Última actualización**: 2026-07-15

### Dónde quedamos

- ✅ **Fase 0**, **US0001**, **US0003–US0008** mergeadas a `main` (PRs #1–#12).
- 🟣 **US0009 lista para PR** — rama `feature/us0009-pago-flow`.
  - **TASK0001** ✅ Backend: `IFlowClient` (FlowClient real con firma HMAC-SHA256 + `MockFlowClient` activo con `Flow:UseMock=true`), `POST /api/payments/create` (fee 7% configurable `Platform:CommissionRate`), `POST /api/payments/confirm` (webhook idempotente: pago OK → booking `confirmed`), `GET /api/payments/return`, `POST /api/payments/mock-outcome` (solo mock), `GET /api/bookings/{id}` (owner-only). 9 tests; suite backend 68/68.
  - **TASK0002** ✅ Frontend: "Pagar depósito" → `/payments/create` → redirect al checkout; `/pago-simulado` (checkout simulado con botones pagar/rechazar); `/reservas/:bookingId` (confirmación CA4 o error con reintento CA5; confía en el estado real del booking si el webhook llega tarde). 7 tests; suite frontend 61/61.
- **Rechazo de pago**: Payment queda `pending` (el modelo no tiene estado `failed`); el cliente puede reintentar mientras el hold viva y el TTL libera el slot (CA6).
- **Flow real**: ⏸️ deferred por decisión del 2026-07-15 — se seguirá con el mock. Al retomar: obtener credenciales sandbox → `Flow:ApiKey/SecretKey` + `Flow:UseMock=false` + prueba end-to-end contra sandbox.flow.cl. El resto del código no cambia.
- **Pendiente deferred**: `fix-search-dropdown` (dropdown de sugerencias se superpone con "Resultados").

### Decisiones/contexto no evidentes en el repo

- Cuenta **Flow** de producción ya creada (2026-07-14, rubro: reserva/depósitos de servicios de tatuaje). Credenciales sandbox pendientes; US0009 usa mock hasta tenerlas.
- Seed actual (`backend/Seed/DatabaseSeeder.cs`): 5 artistas publicados en Santiago con coordenadas reales, 12 obras de portafolio c/u, 3 certificados, 2 premiados, 2 auspiciados. `RatingAvg`/`TotalReviews` quedan en 0 (no hay reviews seed) — la vitrina "Mejor calificados" ordenará por rating aunque todos empaten; considerar seed de reviews si un CA lo exige.
- El equipo usa la skill `prompt-registry` (`ai-specs/skills/prompt-registry/SKILL.md`) para registrar prompts en `prompts/00-all-prompts.md` al cerrar cada US.

### Comandos útiles

```bash
# Infra local (servicios: db=PostgreSQL, storage=MinIO, create-bucket)
docker-compose up -d

# Backend (desde backend/)
dotnet test                        # requiere Docker corriendo (Testcontainers)
dotnet run --seed                  # migra + seed
dotnet run                         # API en http://localhost:5000

# Frontend (desde frontend/)
npm ci && npm test -- --watch=false
npm start                          # http://localhost:4200
```
