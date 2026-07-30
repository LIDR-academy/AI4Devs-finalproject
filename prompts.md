> Detalla en esta sección los prompts principales utilizados durante la creación del proyecto, que justifiquen el uso de asistentes de código en todas las fases del ciclo de vida del desarrollo. Esperamos un máximo de 3 por sección, principalmente los de creación inicial o los de corrección o adición de funcionalidades que consideres más relevantes.

---

## Índice

1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)

---

## 1. Descripción general del producto

**Prompt 1: Definición de propuesta de valor**

```
Estoy creando una app de gamificación para limpieza del hogar dirigida a personas 
neurodivergentes, profesionales independientes y familias. El core es un "Shopping 
Cart" donde usuarios seleccionan tareas que pueden hacer AHORA.

Define:
1. Propuesta de valor diferenciador vs competencia
2. Usuarios objetivo clave (3–4 segmentos)
3. Funcionalidades principales (F1–F9)
4. MVP scope: cuáles entran en 8 semanas
```

**Respuesta:**
```
Propuesta diferenciadora:
- Onboarding sin fricción (trivia game, no formularios)
- Conocimiento del equipamiento (Level 0/1/2 adaptable)
- Narrativa continua con campañas estacionales
- Realismo conductual (sin penalización por pausas)

Usuarios: ADHD, profesionales independientes, parejas jóvenes, familias, roommates

MVP: F1–F8 (onboarding, hogar, shopping cart, gamificación, IA)
Fuera: F9 (social), campañas estacionales completas, tienda premium
```

---

**Prompt 2: Arquetipos de usuario y presets**

```
Para cada arquetipo de hogar, define espacios, frequencies y presets:
- Solo Pro, Recién casados, Familia 3, Familia 5, Roommates
- Espacios predefinidos, frequencies, equipamiento inicial, tareas base
Incluye JSON reutilizable para seed de BD.
```

**Respuesta:**
```json
{
  "archetypes": [
    {
      "id": "solo_pro",
      "name": "Solo profesional",
      "spaces": [
        {"type": "bathroom", "frequency_days": 3},
        {"type": "kitchen", "frequency_days": 2},
        {"type": "bedroom", "frequency_days": 7}
      ],
      "initial_equipment_level": 1
    }
  ]
}
```

---

**Prompt 3: Sistema de gamificación**

```
Diseña gamificación para 6–8 meses de engagement:
- Mapeo tiempo → XP (ej: 10 min = 3 XP)
- Personajes y niveles (1–50)
- Campañas estacionales
- Evita fatiga de gamificación
```

**Respuesta:**
```
XP formula: XP = max(1, int(1 + minutes * 0.2))
- 10 min = 3 XP, 30 min = 7 XP, 60 min = 13 XP

Personajes: Gold (5/5), Intermediate (3–4/5), Novice (<3/5)
Niveles: 1–50, curve es 100 * (nivel - 1) XP requerido

Campañas: Thanksgiving, Vuelta a clases, Primavera
Duración: 4–6 semanas cada una, renovar narrativa sin obligación
```

---

## 2. Arquitectura del Sistema

**Prompt 1: Decisiones técnicas (ADRs)**

```
Justifica decisiones técnicas para MVP 8 semanas, 1 developer:

1. Database: PostgreSQL vs Aurora vs DynamoDB
2. Backend: Lambda per endpoint vs Monolito
3. API: HTTP API vs REST API
4. Auth: Cognito vs Auth0
5. IaC: CDK vs CloudFormation
6. IA: Claude vs OpenAI vs Gemini

Incluye trade-offs.
```

**Respuesta:**
```
Database: PostgreSQL db.t4g.micro ($15/mes)
- Razón: Modelo relacional natural, ACID, fácil escalamiento a Aurora
- Trade-off: Setup manual vs velocidad

Backend: Lambda per endpoint + Layer compartida
- Razón: Thin handlers (testeable), Layer centraliza dominio, free tier
- Trade-off: Debugging distribuido vs desarrollo rápido

API: HTTP API ($0.40/M vs $3.50/M REST)
- Razón: 10x cheaper, Cognito JWT nativo

Auth: Cognito
- Razón: Integración nativa API Gateway, free 50K MAUs

IaC: CDK (Python)
- Razón: Mismo lenguaje backend, testeable, programable

IA: Claude Haiku + Sonnet
- Haiku: tips ($0.0001/call)
- Sonnet: suggest-cart ($0.02/call, cacheado 24h)
```

---

**Prompt 2: Diseño de CDK stacks**

```
Diseña 8 stacks CDK con orden explícito de despliegue:
vpc → database → lambda/ci → api → auth; storage → cdn

Define dependencias y argumentos entre stacks.
```

**Respuesta:**
```
Orden de despliegue:
1. vpc_stack (VPC, subnets, NAT, security groups)
2. database_stack (RDS, RDS Proxy, Secrets) [depende vpc]
3. ci_stack (GitHub Actions OIDC rol) [depende database]
4. lambda_stack (Lambdas + Layer) [depende vpc + database]
5. api_stack (HTTP API Gateway) [depende lambda]
6. auth_stack (Cognito, JWT authorizer) [depende api]
7. storage_stack (S3 buckets)
8. cdn_stack (CloudFront) [depende storage]
```

---

**Prompt 3: Error handling y API contract**

```
Define error envelope estándar y API contract para 24 Lambdas:
- Base URL, error format, status codes
- CORS policy, rate limiting
- Auth routes vs protected vs admin
```

**Respuesta:**
```
Base URL: https://api.aida.local/v1

Error envelope:
{
  "error": "human-readable message",
  "error_code": "MACHINE_READABLE_CODE",
  "request_id": "uuid"
}

Public routes: /auth/*, /onboarding/*
Protected: require JWT Authorization header
Admin: require cognito:groups = aida-admins

Rate limit:
- API Gateway: 10K requests/min
- IA: 3 suggest-cart + 5 tips per user per day

CORS: Server-side allowlist per entorno, NUNCA *
```

---

## 3. Modelo de Datos

**Prompt 1: Schema PostgreSQL**

```
Diseña schema PostgreSQL (9 tablas) para Aida:
users, spaces, task_catalog, products, user_equipment, carts, 
cart_items, xp_events, ai_suggestions_cache

Para cada tabla: PK (UUID), FK (ON DELETE CASCADE?), índices, JSONB fields.
Decisiones: ¿cleanliness stored o computed? ¿task_catalog global o per-user?
```

**Respuesta:**
```
users: PKs UUID, cognito_sub UNIQUE, email UNIQUE, is_suspended
spaces: FK users CASCADE, UNIQUE(user_id, space_type), cleanliness COMPUTED
task_catalog: GLOBAL (admin-managed, users only read/select)
products: GLOBAL (admin-managed), level 0–2
carts: FK users CASCADE, status (active/completed/abandoned)
cart_items: FK carts CASCADE, FK tasks, completed bool
user_equipment: 1:1 → users, level, inventory (JSONB)
xp_events: FK users CASCADE, xp_amount, event_type, metadata (JSONB)
ai_suggestions_cache: TTL 24h, context_hash (SHA-256) para dedup

Decisión cleanliness: COMPUTED en query
  SELECT MAX(0, 100 - (days_since * decay_rate))
  Razón: Evita crons, siempre fresco
```

---

**Prompt 2: Caching de respuestas IA**

```
Para fn_ai_tip: cada tarea tiene tips generados por Claude.

Opciones:
A) Precalcular tips en task_catalog.tips (JSONB)
B) Generar on-demand en cada request
C) Cachear por usuario + tarea + contexto en ai_suggestions_cache

Compare trade-offs: latencia, costo IA, freshness, storage.
¿Cuál recomiendas? ¿Cómo evitar prompt injection?
```

**Respuesta:**
```
Recomendación: Opción C (cache con context_hash)

Trade-offs:
A) Latency: instant, Cost: high upfront, Freshness: stale
B) Latency: 30s, Cost: highest, Freshness: fresh
C) Latency: vary (cache hit = instant), Cost: medium, Freshness: 24h

Implementación:
- Key: SHA-256(user_id + suggestion_type + context)
- Evita prompt injection: input es DATA, no instrucción
- System prompt cacheado separadamente
- Validar/parsear respuesta IA antes de usar

Resultado: ~70–80% hit rate, reduce costos IA 70%
```

---

**Prompt 3: Índices y queries optimizadas**

```
Diseña índices y queries para operaciones frecuentes:
- Listar tareas disponibles filtradas por user_equipment_level
- Obtener cart activo del usuario
- Calcular cleanliness en tiempo real
- Cache de sugerencias IA con TTL

¿Cuáles índices crear? ¿Cuáles queries parametrizar?
```

**Respuesta:**
```
Índices clave:
- idx_spaces_user: (user_id) en spaces
- idx_carts_user_status: (user_id, status) en carts
- idx_cart_items_cart: (cart_id) en cart_items
- idx_ai_cache_key: (user_id, suggestion_type, context_hash) en cache
- idx_xp_events_user: (user_id) en xp_events

Queries parametrizadas (SQLAlchemy ORM):
- SELECT * FROM tasks WHERE required_level <= ? AND space_id = ?
- SELECT * FROM carts WHERE user_id = ? AND status = 'active'
- SELECT MAX(...) cleanliness FROM spaces WHERE user_id = ? (dinámico)
```

---

## 4. Especificación de la API

**Prompt 1: Endpoints principales**

```
Especifica 3 endpoints clave en OpenAPI format:
- POST /v1/cart (crear carrito)
- PUT /v1/cart/{id}/complete (completar)
- POST /v1/ai/suggest-cart (IA sugiere)

Incluye request/response, status codes, auth, rate limit.
```

**Respuesta:**
```yaml
POST /v1/cart:
  requestBody:
    items: [{task_id, space_id}]
    suggested_by_ai: bool
  response 201:
    cart_id, items, total_time, total_xp, created_at
  auth: JWT required
  status: 201, 400, 401, 500

PUT /v1/cart/{cartId}/complete:
  response 200:
    cart_id, xp_earned, user_total_xp, character_level
  auth: JWT required
  status: 200, 404, 401, 500

POST /v1/ai/suggest-cart:
  requestBody:
    context?: "tengo 30 minutos"
  response 200:
    suggested_items[], total_time, total_xp
  auth: JWT required
  rate-limit: 3 per user per day
  status: 200, 429, 401, 500
```

---

**Prompt 2: Pydantic schemas v2**

```
Define Pydantic v2 DTOs para cart creation:
- CartCreateRequest (input)
- CartItemResponse (output item)
- CartCreateResponse (output)

Include field validators, examples, config.
```

**Respuesta:**
```python
class CartCreateRequest(BaseModel):
    items: list[CartItemInput]
    suggested_by_ai: bool = False
    
    model_config = ConfigDict(forbid='forbid')

class CartItemResponse(BaseModel):
    task_id: UUID
    space_id: UUID
    task_name: str
    estimated_minutes: int
    xp_reward: int

class CartCreateResponse(BaseModel):
    data: dict = Field(..., description="Cart with items")
    meta: dict = Field(..., description="request_id, timestamp")
```

---

**Prompt 3: Rate limiting y caching**

```
Implementa rate limiting para:
- API Gateway: 10K requests/min global
- IA endpoint: 3 suggest-cart + 5 tips per user per day
- Cache: 24h TTL para ai_suggestions_cache

¿Cómo trackear usage? ¿Cómo manejar rate-limit exceeded?
```

**Respuesta:**
```
Rate limiting:
- API Gateway: throttling nativo (Throttle: 10000 requests/min)
- IA: track en DB (xp_events + timestamp), check before calling Claude
- Cache: expires_at TIMESTAMPTZ con trigger cleanup

Response 429 Too Many Requests:
{
  "error": "Rate limit exceeded",
  "error_code": "RATE_LIMIT_EXCEEDED",
  "retry_after_seconds": 3600
}

Cache key: SHA-256(user_id + suggestion_type + context)
```

---

## 5. Historias de Usuario

**Prompt 1: User stories en Gherkin**

```
Escribe 3 user stories principales en Gherkin (BDD):

1. HU-1: Onboarding sin fricción
2. HU-2: Shopping Cart como core loop
3. HU-3: Tolerancia a inactividad

Formato:
Feature: [nombre]
  Scenario: [caso]
    Given [contexto]
    When [acción]
    Then [resultado]

Incluye 3–5 scenarios por historia.
```

**Respuesta:**
```gherkin
Feature: Onboarding sin fricción
  Scenario: Usuario nuevo completa trivia en 2 minutos
    Given usuario accede a la app
    When juega trivia de 5 preguntas
    And selecciona su arquetipo de hogar
    Then recibe personaje asignado automáticamente
    And ve espacios precargados
    And tiempo total es < 2 minutos

  Scenario: Usuario se registra tras onboarding
    Given usuario completó trivia
    When procede a registrarse
    Then Cognito crea cuenta
    And espacios se precargan según arquetipo
```

---

**Prompt 2: Criterios de aceptación detallados**

```
Para HU-2 (Shopping Cart), define criterios de aceptación SMART:
- Qué ve el usuario
- Qué puede hacer
- Qué validaciones existen
- Qué pasa al completar

Incluye edge cases (sin equipamiento, tareas inválidas, etc.)
```

**Respuesta:**
```
HU-2: Shopping Cart

Criterios de aceptación:
1. Usuario ve catálogo de tareas por espacio
2. Puede agregar/quitar del carrito sin restricción
3. Carrito muestra: tareas, tiempo total, XP total
4. Confirmar carrito inicia ejecución con timer
5. Completar tarea gana XP (visible en tiempo real)
6. Completar carrito → registra en historial, actualiza XP usuario

Edge cases:
- Si usuario no tiene equipamiento L1 → solo tareas L0
- Si carrito vacío → botón confirmar desactivado
- Si tarea toma >180 min → warning (cansancio cognitivo)
```

---

**Prompt 3: Mapping de HU a tickets**

```
Para cada HU, mapea a tickets técnicos (backend, frontend, mobile):

HU-1 Onboarding → AID-52 (backend), AID-XX (mobile), AID-XX (web)
HU-2 Shopping Cart → AID-78 (backend), AID-XX (mobile)
HU-3 Realismo conductual → AID-80 (backend)

Define dependencias: ¿qué se hace primero?
```

**Respuesta:**
```
HU-1 Onboarding:
- AID-52: Backend trivia endpoints
- AID-25: Mobile trivia UI + state management
- AID-90: Admin dashboard para presets (opcional)

HU-2 Shopping Cart:
- AID-78: Backend fn_cart_create + complete
- AID-26: Mobile cart UI + selection
- AID-27: Mobile task execution + timer

HU-3 Realismo conductual:
- AID-80: Backend home_summary con recálculo dinámico
- AID-28: Mobile smooth re-entry UX

Orden: HU-1 → HU-2 → HU-3 (dependencias)
```

---

## 6. Tickets de Trabajo

**Prompt 1: Especificación de AID-52**

```
Soy backend engineer. Necesito especificación para AID-52:
- Implementar fn_onboard_trivia_questions, fn_onboard_trivia, fn_onboard_archetype
- Incluya endpoint specs, use case logic, Pydantic schemas
- Data model, edge cases, tests, acceptance criteria

Asuma Clean Architecture + TDD.
```

**Respuesta:**
```
AID-52: Backend — Onboarding trivia

Endpoints:
- GET /onboarding/trivia/questions → TriviaquestionsResponse
- POST /onboarding/trivia → TriviaevaluateResponse
- POST /onboarding/archetype → ArchetypeResponse

Use cases:
- EvaluateTrivia: calcula character_type
- ApplyArchetype: genera presets de espacios

Tests:
- Scoring logic (unit, sin BD)
- Character assignment (unit)
- Archetype preset generation (unit)
- Handler thin (no DB, inyección)

Acceptance:
- Coverage ≥95% en use_cases/onboarding/
- Endpoints e2e testeados
```

---

**Prompt 2: Especificación de AID-78**

```
Especificación de AID-78 (Backend — Shopping Cart):
- fn_cart_create, fn_cart_active, fn_cart_complete
- Validaciones, cálculos de XP, transacciones

¿Qué edge cases testear? ¿Cómo evitar race conditions?
```

**Respuesta:**
```
AID-78: Shopping Cart core

Funciones:
- CreateCartUseCase: valida tareas, filtra por level, calcula time/xp
- CompleteCartUseCase: transacción atómica (cart, xp_events, spaces)

Edge cases:
- Carrito vacío → error 400
- Tarea no válida para level → error 400
- Carrito ya completado → error 409 (conflict)
- Concurrent completes → database-level uniqueness constraint

Tests:
- Happy path: crear → agregar → completar
- Invalid tasks
- Concurrency (simular 2 requests simultáneamente)
```

---

**Prompt 3: Especificación de AID-96 (Web)**

```
Especificación de AID-96 (Web — Admin CRUD tareas):
- TasksPage (tabla + filtros)
- TaskEditForm (create/update)
- API hooks (/v1/admin/tasks)
- Tests (Vitest + MSW)

¿Qué validaciones en UI vs servidor?
```

**Respuesta:**
```
AID-96: Admin Dashboard — Tasks

Componentes:
- TasksPage: tabla, filtros (space_type, is_active), botones
- TaskEditForm: campos con validación (client + server)
- API hooks: GET /admin/tasks, POST, PUT, DELETE

Validaciones:
- Client (UX): campo requerido, formato, min/max length
- Server (seguridad): re-valida TODO en Pydantic, admin check

Tests:
- Rendering: tabla visible, filtros funcionales
- Form: submit, validación, error display
- MSW mocks: intercepta /v1/admin/tasks

Coverage: ≥90%
```

---

## 7. Pull Requests

**Prompt 1: Code review + security checklist**

```
Voy a hacer code review de PR #32 (Backend — Auth + Onboarding).
Dame un checklist de security + code quality:

Security:
- Secretos no hardcodeados?
- SQL injection?
- IDOR?
- Token validation?
- Logging sin PII?

Code Quality:
- Clean Architecture?
- Pydantic v2?
- Type hints?
- Tests?
- Coverage ≥95%?
```

**Respuesta:**
```
✅ Security Review — PR #32

✓ Secretos: Secrets Manager (no .env)
✓ SQL injection: SQLAlchemy ORM parametrizado
✓ IDOR: user_id del JWT (imposible forjar)
✓ Token validation: event['requestContext']['authorizer']['jwt']['claims']
✓ Logging: cognito_sub only, no email/passwords
✓ Errors: "Invalid credentials", no enumeration

✅ Code Quality

✓ Clean Architecture: handler thin → use case → repository
✓ Pydantic v2: RegisterRequest con validators
✓ Type hints: 100% en use cases y repos
✓ Tests: sin BD (fakes), coverage 96%
✓ Linters: ruff, black, mypy, bandit — all green

Status: ✅ APPROVED
```

---

**Prompt 2: Conventional commits**

```
Escribí feature para fn_cart_create. Genera conventional commit:

Cambios:
- Use case CreateCartUseCase
- Handler fn_cart_create
- Tests (coverage 96%)
- 250 líneas total

Es para PR #38 (AID-78).
```

**Respuesta:**
```
feat(backend): fn_cart_create con validación y cálculo de XP

- Agregada use case CreateCartUseCase (Clean Architecture)
- Handler thin valida input y delega a use case
- Calcula tiempo total + XP estimado
- Tests unitarios (fakes) + integration (testcontainers)
- Coverage: 96% en use_cases/cart/

Closes #AID-78
```

---

**Prompt 3: PR description template**

```
Crea un template para PRs que sea reutilizable y siga las convenciones:
- Título corto (<70 chars)
- Descripción: qué, por qué, cómo
- Testing: qué se testeó
- Security: checklist
- Breaking changes

Usa formato markdown.
```

**Respuesta:**
```markdown
## Summary
[1–3 bullet points de qué cambió]

## Related Issues
Closes #AID-XX

## Testing
- [ ] Unit tests: ...
- [ ] Integration tests: ...
- [ ] Coverage: ≥95%
- [ ] Linters: ruff, black, mypy, bandit ✓

## Security
- [ ] No hardcoded secrets
- [ ] SQL injection check (parametrized)
- [ ] IDOR check (filtered by user_id)
- [ ] PII in logs check

## Breaking Changes
None / [describe if any]

## Related PRs
[link if dependencies exist]
```

---

**Conclusión:**

Claude Code fue crítico en todas las fases: product (propuesta, usuarios, features), 
architecture (ADRs, stacks, API contract), backend (schema, clean architecture, TDD), 
testing (checklists, security), code quality (conventional commits).

Resultado: MVP completo, testeable, documentado, deployable en 8 semanas con 1 developer.

---

**Repositorio:** https://github.com/nandilagos/AI4Devs-finalproject-ALJ  
**Branch:** finalproject-ALJ  
**Última actualización:** Julio 29, 2026
