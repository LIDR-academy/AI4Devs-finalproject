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

**Última actualización**: 2026-07-16

### Dónde quedamos

- ✅ **BACKLOG COMPLETO** — Fase 0 + las **13 US (80 SP)** mergeadas a `main` (PRs #1–#18). Última: US0011 (chatbot cotizador + depósito según cotización, `fixs/issue-007.md`).
- ✅ **Integración Flow real validada e2e contra sandbox.flow.cl** (2026-07-16, PR #19): orden firmada HMAC → checkout Webpay real con tarjeta de prueba → confirm firmado → pago `completed` y reserva `confirmed`. Guía completa (levantar proyecto, credenciales por entorno, tarjetas, confirm manual): **`docs/flow-sandbox-testing.md`**.
  - Credenciales: user-secrets o `appsettings.Development.json` (gitignored) en local; `.env` en Docker; `Flow__*` env vars en producción. Nunca en el repo.
  - En local el webhook de Flow no alcanza localhost → confirm manual (`POST /api/payments/confirm` con el token) o túnel ngrok. Documentado.
  - Hallazgos corregidos en PR #19: FK de limpieza de holds expirados con pago iniciado (bug que bloqueaba reservas del artista), FlowClient ahora expone el error de Flow, PaymentTests herméticos (fuerzan `Flow:UseMock=true`).
- Siguiente: **preparación de la entrega final** (consolidar readme §2–7, PRs en §7, demo). Mejoras opcionales: fix-search-dropdown · issue-005 (foto de reseña) · upload de referencias del chatbot a Object Storage.
- **Rechazo de pago (US0009)**: Payment queda `pending` (el modelo no tiene estado `failed`); el cliente puede reintentar mientras el hold viva y el TTL libera el slot.
- ⚠️ **Limitación conocida (US0011)**: las imágenes de referencia del paso 4 del chatbot solo tienen preview local — upload a Object Storage pendiente (como `fixs/issue-005.md`).

### Decisiones/contexto no evidentes en el repo

- Cuenta **Flow** creada (2026-07-14) y **credenciales sandbox configuradas y validadas** (2026-07-16) — viven en el `appsettings.Development.json` local del desarrollador (gitignored), no en el repo.
- **BD dev local**: la clienta seed Camila quedó con email real `rodrigo@syntaxis.cl` (login con ese email / `Test1234!`) porque el sandbox de Flow valida el email del pagador (error 1620 con `@example.cl`). Revertible con UPDATE; necesario para probar pagos reales.
- Seed actual (`backend/Seed/DatabaseSeeder.cs`): 5 artistas publicados en Santiago con coordenadas reales, 12 obras de portafolio c/u, 3 certificados, 2 premiados, 2 auspiciados (3 sponsorships cubriendo los 3 tipos de relación). `RatingAvg`/`TotalReviews` quedan en 0 (no hay reviews seed) — la vitrina "Mejor calificados" ordenará por rating aunque todos empaten; considerar seed de reviews si un CA lo exige.
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
