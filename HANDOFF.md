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

- ✅ **Fase 0**, **US0001**, **US0003–US0010**, **US0012–US0014** mergeadas a `main` (PRs #1–#17). Las **9 Must-Have (52 SP) están completas**.
- 🟣 **US0011 en revisión** — rama `feature/us0011-chatbot-cotizador`, **PR #18 abierto** (última US del backlog):
  - **Decisión previa** (`fixs/issue-007.md`, CA9): el depósito deja de ser fijo — si la reserva viene de una cotización, el hold recalcula la fórmula server-side y deposit = deposit_percentage × máx(mínimo cotizado, min_session_price). Sin cotización, fallback 30% × min_session_price.
  - **Backend**: `QuoteCalculatorService` (fuente única de la fórmula: base = max(min, hourly × horas por tamaño coin/palm/hand/arm = 1/2/4/6h); factores multiplicativos cover-up +30%, color +20%, zona difícil +15%; rango [×0.8, ×1.3]) · `POST /api/quotes/calculate` (público, 404/422) · `GET /api/styles` (catálogo id/name/slug, nuevo en api-spec) · hold de US0008 integra la cotización.
  - **Frontend**: `QuoteChatbotComponent` (overlay 5 pasos, conversación derivada del estado → atrás = limpiar respuesta) + `QuoteService` (draft en memoria + localStorage si autenticado; el hold del perfil adjunta el draft). CTAs del hero "Cotizar"/"Reservar" ahora funcionales.
  - **Verificado e2e en dev**: cotización costillas+color+mano con Matías → rango $264.960–$430.560, depósito $79.488 heredado por el resumen de reserva (antes: $24.000 fijo).
  - ⚠️ **Limitación conocida**: las imágenes de referencia del paso 4 solo tienen preview local — el upload a Object Storage sigue pendiente (misma limitación mock-first que `fixs/issue-005.md`).
- Siguiente: mergear PR #18 → **backlog completo (13 US / 80 SP)**. Luego: deferred (Flow sandbox, fix-search-dropdown, issue-005, upload referencias) y preparación de la entrega final (readme.md §2–7).
- **Rechazo de pago (US0009)**: Payment queda `pending` (el modelo no tiene estado `failed`); el cliente puede reintentar mientras el hold viva y el TTL libera el slot.
- **Flow real**: ⏸️ deferred por decisión del 2026-07-15 — se seguirá con el mock. Al retomar: obtener credenciales sandbox → `Flow:ApiKey/SecretKey` + `Flow:UseMock=false` + prueba end-to-end contra sandbox.flow.cl. El resto del código no cambia.
- **Pendiente deferred**: `fix-search-dropdown` (dropdown de sugerencias se superpone con "Resultados").

### Decisiones/contexto no evidentes en el repo

- Cuenta **Flow** de producción ya creada (2026-07-14, rubro: reserva/depósitos de servicios de tatuaje). Credenciales sandbox pendientes; US0009 usa mock hasta tenerlas.
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
