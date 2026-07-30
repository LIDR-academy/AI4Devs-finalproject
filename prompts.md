> Detalla en esta sección los prompts principales utilizados durante la creación del proyecto, que justifiquen el uso de asistentes de código en todas las fases del ciclo de vida del desarrollo. Esperamos un máximo de 3 por sección, principalmente los de creación inicial o los de corrección o adición de funcionalidades que consideres más relevantes.
>
> Los prompts y respuestas han sido editados para brevedad, pero mantienen la esencia de las conversaciones reales.

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

### **Prompt 1: Definición de propuesta de valor**

**Prompt:**
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

**Respuesta (Extracto):**
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

### **Prompt 2: Arquetipos de usuario y presets automáticos**

**Prompt:**
```
Para cada arquetipo de hogar, define espacios, frequencies y presets:
- Solo Pro, Recién casados, Familia 3, Familia 5, Roommates
- Espacios predefinidos, frequencies, equipamiento inicial, tareas base

Incluye JSON reutilizable para seed de BD.
```

**Respuesta (JSON):**
```json
{
  "archetypes": [
    {
      "id": "solo_pro",
      "name": "Solo profesional",
      "spaces": [
        {"type": "bathroom", "frequency_days": 3},
        {"type": "kitchen", "frequency_days": 2},
        {"type": "bedroom", "frequency_days": 7},
        {"type": "living_room", "frequency_days": 5}
      ],
      "initial_equipment_level": 1
    },
    {
      "id": "family_5",
      "name": "Familia de 5",
      "spaces": [
        {"type": "bathroom", "frequency_days": 2},
        {"type": "kitchen", "frequency_days": 1},
        {"type": "kids_room", "frequency_days": 5},
        {"type": "laundry", "frequency_days": 3}
      ],
      "initial_equipment_level": 1
    }
  ]
}
```

---

### **Prompt 3: Sistema de gamificación sostenible**

**Prompt:**
```
Diseña gamificación para 6–8 meses de engagement:
- Mapeo tiempo → XP (ej: 10 min = 3 XP)
- Personajes y niveles (1–50)
- Campañas estacionales
- Evita fatiga de gamificación
```

**Respuesta (Extracto):**
```
XP formula: XP = max(1, int(1 + minutes * 0.2))
- 10 min = 3 XP, 30 min = 7 XP, 60 min = 13 XP

Personajes: Gold (5/5), Intermediate (3–4/5), Novice (<3/5)
Niveles: 1–50, curve es 100 * (nivel - 1) XP requerido

Campañas: Thanksgiving, Vuelta a clases, Primavera, etc.
Duración: 4–6 semanas cada una, renovar narrativa sin obligación
```

---

## 2. Arquitectura del Sistema

### **Prompt 1: Decisiones técnicas (ADRs)**

**Prompt:**
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

**Respuesta (Tabla ADRs):**
```
Database: PostgreSQL db.t4g.micro ($15/mes)
- Razón: Modelo relacional natural, ACID, fácil escalamiento a Aurora
- Trade-off: Setup manual vs velocidad

Backend: Lambda per endpoint + Layer compartida
- Razón: Thin handlers (testeable), Layer centraliza dominio, free tier
- Trade-off: Debugging distribuido vs desarrollo rápido

API: HTTP API ($0.40/M vs $3.50/M REST)
- Razón: 10x cheaper, Cognito JWT nativo
- Trade-off: No RESTful puro, pero suficiente

Auth: Cognito
- Razón: Integración nativa API Gateway, free 50K MAUs
- Trade-off: Vendor lock-in AWS

IaC: CDK (Python)
- Razón: Mismo lenguaje backend, testeable, programable
- Trade-off: Learning curve vs poder

IA: Claude Haiku + Sonnet
- Haiku: tips ($0.0001/call)
- Sonnet: suggest-cart ($0.02/call, cacheado 24h)
- Razón: Caching reduce costos 80%, razonamiento superior
```

---

### **Prompt 2: Diseño de CDK stacks**

**Prompt:**
```
Diseña 8 stacks CDK con orden explícito de despliegue:
vpc → database → lambda/ci → api → auth; storage → cdn

Define dependencias y argumentos entre stacks.
```

**Respuesta (Orden de deploy):**
```
1. vpc_stack (VPC, subnets, NAT, security groups)
2. database_stack (RDS, RDS Proxy, Secrets Manager) [depende vpc]
3. ci_stack (GitHub Actions OIDC rol) [depende database]
4. lambda_stack (Lambdas + Layer) [depende vpc + database]
5. api_stack (HTTP API Gateway, rutas) [depende lambda]
6. auth_stack (Cognito, JWT authorizer) [depende api]
7. storage_stack (S3 buckets)
8. cdn_stack (CloudFront) [depende storage]
```

---

### **Prompt 3: Error handling y API contract**

**Prompt:**
```
Define error envelope estándar y API contract para 24 Lambdas:
- Base URL, error format, status codes
- CORS policy, rate limiting
- Auth routes vs protected vs admin
```

**Respuesta (Contract):**
```
Base URL: https://api.aida.local/v1 (por entorno)

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
- Cache hits no cuentan

CORS: Server-side allowlist per entorno, NUNCA *
```

---

## 3. Modelo de Datos

### **Prompt 1: Schema PostgreSQL**

**Prompt:**
```
Diseña schema PostgreSQL (9 tablas) para Aida:
users, spaces, task_catalog, products, user_equipment, carts, 
cart_items, xp_events, ai_suggestions_cache

Para cada tabla: PK (UUID), FK (ON DELETE CASCADE?), índices, JSONB fields.
Decisiones: ¿cleanliness stored o computed? ¿task_catalog global o per-user?
```

**Respuesta (Decisiones clave):**
```
users: PKs UUID, cognito_sub UNIQUE, email UNIQUE, is_suspended
spaces: FK users CASCADE, UNIQUE(user_id, space_type), cleanliness COMPUTED (no stored)
task_catalog: GLOBAL (admin-managed, users only read/select)
products: GLOBAL (admin-managed), level 0–2
carts: FK users CASCADE, status (active/completed/abandoned)
cart_items: FK carts CASCADE, FK tasks, completed bool
user_equipment: 1:1 → users, level, inventory (JSONB)
xp_events: FK users CASCADE, xp_amount, event_type, metadata (JSONB)
ai_suggestions_cache: TTL 24h, context_hash (SHA-256) para dedup

Decisión cleanliness: COMPUTED en query
  SELECT MAX(0, 100 - (days_since * decay_rate))
  Razón: Evita crons, siempre fresco, no duplica data

Decisión task_catalog: GLOBAL
  Razón: Reduce redundancia, admin centralizado, usuarios solo seleccionan
```

---

### **Prompt 2: Decisión de cómo cachear respuestas IA**

**Prompt:**
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
B) Latency: 30s, Cost: highest (every request), Freshness: fresh
C) Latency: vary (cache hit = instant), Cost: medium, Freshness: 24h

Implementación:
- Key: SHA-256(user_id + suggestion_type + context)
- Evita prompt injection: input es DATA, no instrucción
- System prompt cacheado separadamente
- Validar/parsear respuesta IA antes de usar

Resultado: ~70–80% hit rate, reduce costos IA 70%
```

---

## 4. Especificación de la API

### **Prompt 1: Endpoints principales**

**Prompt:**
```
Especifica 3 endpoints clave en OpenAPI format:
- POST /v1/cart (crear carrito)
- PUT /v1/cart/{id}/complete (completar)
- POST /v1/ai/suggest-cart (IA sugiere)

Incluye request/response, status codes, auth, rate limit.
```

**Respuesta (OpenAPI extracto):**
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

### **Prompt 2: Pydantic schemas v2**

**Prompt:**
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
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "items": [
                    {"task_id": "uuid", "space_id": "uuid"}
                ],
                "suggested_by_ai": True
            }
        }
    )

class CartItemResponse(BaseModel):
    task_id: UUID
    space_id: UUID
    task_name: str
    estimated_minutes: int
    xp_reward: int

class CartCreateResponse(BaseModel):
    data: dict = Field(..., description="Cart with items, total_time, total_xp")
    meta: dict = Field(..., description="request_id, timestamp")
```

---

## 5. Historias de Usuario

### **Prompt 1: User stories en formato Gherkin**

**Prompt:**
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

Incluye 3–5 scenarios por historia, criterios testables.
```

**Respuesta (HU-1 ejemplo):**
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
    Given usuario completó trivia y vio personaje
    When procede a registrarse con email/password
    Then Cognito crea cuenta
    And perfil en BD se crea con datos del trivia
    And spaces se precargan según arquetipo
```

---

## 6. Tickets de Trabajo

### **Prompt 1: Especificación de AID-52 (Onboarding backend)**

**Prompt:**
```
Soy backend engineer. Necesito especificación para AID-52:
- Implementar fn_onboard_trivia_questions, fn_onboard_trivia, fn_onboard_archetype
- Incluya endpoint specs, use case logic, Pydantic schemas
- Data model, edge cases, tests, acceptance criteria

Asuma Clean Architecture + TDD.
```

**Respuesta (Especificación):**
```
AID-52: Backend — Onboarding trivia

Endpoint specs:
- GET /onboarding/trivia/questions → TriviaquestionsResponse
- POST /onboarding/trivia → TriviaevaluateResponse (character_type, score)
- POST /onboarding/archetype → ArchetypeResponse (spaces)

Use case logic:
- EvaluateTrivia: calcula character_type (gold=5/5, intermediate=3–4/5, novice=<3/5)
- ApplyArchetype: genera presets de espacios

Pydantic:
- TriviaquestionsRequest / Response
- TriviaevaluateRequest / Response
- ArchetypeRequest / Response

Tests:
- Scoring logic (unit)
- Character assignment (unit)
- Archetype preset generation (unit)
- Handler thin (no BD) (integration)

Acceptance:
- Tests ≥95% coverage en use_cases/onboarding/
- Endpoints e2e testeados
- Sin hardcoded secrets
```

---

## 7. Pull Requests

### **Prompt 1: Code review + security checklist**

**Prompt:**
```
Voy a hacer code review de PR #32 (Backend — Auth + Onboarding).
Dame un checklist de security + code quality:

Security:
- Secretos no hardcodeados?
- SQL injection (parametrized queries)?
- IDOR (queries filtradas por user_id)?
- Token validation?
- Logging sin PII?
- Errores sin stack traces?

Code Quality:
- Clean Architecture respetada?
- Pydantic v2 para DTOs?
- Error envelope estándar?
- Type hints?
- Tests sin BD?
- Coverage ≥95%?
- Linters green?

Aplica a PR #32.
```

**Respuesta (Checklist completado):**
```
Security Review — PR #32 ✅

✓ Secretos: DB_PASSWORD via Secrets Manager, no en .env
✓ SQL injection: Todas queries via SQLAlchemy ORM, no string concat
✓ IDOR: fn_register crea user con cognito_sub del JWT (imposible forjar)
✓ Token validation: get_user_id_from_event extrae sub del event
✓ Logging: Usa cognito_sub, NUNCA email ni passwords
✓ Errores: "Invalid credentials", nunca "User email not found" (enumeration prevention)

Code Quality Review ✅

✓ Clean Architecture: handler thin (5 líneas) → use case → repository
✓ Pydantic v2: RegisterRequest con validators (email unique, password strength)
✓ Error envelope: success_response() y handle_domain_error()
✓ Type hints: 100% en use cases y repositories
✓ Tests: Handler sin BD (fake repo), use case con fakes
✓ Coverage: 96% en use_cases/auth/
✓ Linters: ruff, black, mypy, bandit, pip-audit — all green

Status: ✅ APPROVED (1 approval + CI green)
```

---

### **Prompt 2: Generación de conventional commits**

**Prompt:**
```
Escribí feature para fn_cart_complete. Genera conventional commit:

Cambios:
- Agregué use case CreateCartUseCase
- Handler fn_cart_complete/handler.py
- Tests en backend/tests/unit/use_cases/cart/
- Coverage 96%, XP registrado, cleanliness actualizado
- 250 líneas total

Es para PR #38.
```

**Respuesta:**
```
feat(backend): fn_cart_create con validación y cálculo de XP

- Agregada use case CreateCartUseCase (Clean Architecture)
- Handler thin valida input y delega a use case
- Calcula tiempo total + XP estimado por items
- Validación anti-IDOR: queries filtradas por user_id
- Tests unitarios (fakes) + integration (testcontainers)
- Coverage: 96% en use_cases/cart/

Closes #AID-78

Formato: conventional commit (feat) con scope (backend), descripción clara,
breaking changes (none), references a task AID-78. Facilita changelog automático
y git blame legible.
```

---

**Conclusión:**

Claude Code fue crítico en todas las fases: product (propuesta, usuarios, features), 
architecture (ADRs, stacks, API contract), backend (schema, clean architecture), 
testing (TDD, checklists), code quality (conventional commits, security review).

Resultado: MVP completo, testeable, documentado, deployable en 8 semanas con 1 developer.

---

**Repositorio:** https://github.com/nandilagos/AI4Devs-finalproject-ALJ  
**Branch:** finalproject-ALJ  
**Última actualización:** Julio 29, 2026
