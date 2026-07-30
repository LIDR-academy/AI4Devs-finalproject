# Prompts principales — Desarrollo de Aida

> Registro de prompts clave utilizados durante la creación del proyecto, demostrando el rol de Claude Code en cada fase del ciclo de vida del desarrollo: product, architecture, backend, frontend, mobile, infrastructure, security y QA.

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

### **Prompt 1: Definición de propuesta de valor y usuarios objetivo**

```
Estoy creando una app de gamificación para limpieza del hogar dirigida a personas 
neurodivergentes (ADHD), profesionales independientes y familias. El core es un 
"Shopping Cart" donde usuarios seleccionan tareas que pueden hacer AHORA, 
no una lista de todo-debe-estar-hecho.

Define:
1. Propuesta de valor diferenciador (vs Tody, Sweepy, Habitica, FlyLady)
2. 3–4 segmentos de usuarios clave con perfiles detallados
3. 6–9 funcionalidades principales (F1–F9) con descripción de cada una
4. MVP scope: cuáles funcionalidades SÍ entran en 8 semanas, cuáles NO
5. Método de onboarding sin formularios tediosos (gamificado)

Incluye tabla comparativa vs competencia.
```

**Valor agregado:** Claude ayudó a cristalizar la posición de producto, identificando gaps competitivos (combinación de onboarding sin fricción + conocimiento de equipamiento + narrativa continua + realismo conductual) y priorizando features para MVP en 8 semanas.

---

### **Prompt 2: Definición de arquetipos de usuario y presets automáticos**

```
Para cada arquetipo de hogar, define:
1. Personajes/arquetipos (ej: Solo Pro, Recién casados, Familia 3, Familia 5, Roommates)
2. Espacios predefinidos por arquetipo (baño, dormitorios, cocina, sala...)
3. Frequencies de limpieza por espacio (baño cada 3 días, cocina cada 2, etc.)
4. Niveles de equipamiento iniciales (Level 0/1/2)
5. Presets de tareas iniciales por espacio

Todo debe ser configurable pero con defaults que eviten onboarding manual.
Incluye JSON de ejemplo para cada arquetipo.
```

**Valor agregado:** Claude estructuró los presets automáticos en JSON reutilizable, reduciendo fricción de setup. El JSON se usa directamente en seed de la BD y en el trivia de onboarding.

---

### **Prompt 3: Matriz de gamificación (XP, niveles, campañas estacionales)**

```
Diseña un sistema de gamificación sostenible para 6–8 meses de engagement:
1. Sistema de XP: mapeo tiempo-superficie → puntos (ej: 10"=1pt, 30"=5pts)
2. Personajes: 3 tipos (Gold/Intermedio/Novato) + niveles (1–50)
3. Campañas estacionales: 4–5 narrativas temáticas (Thanksgiving, vuelta a clases...)
4. Leaderboard (opcional, no punitivo)
5. Recompensas visuales (cosméticos, badges, desbloques)

Evita "fatiga de gamificación" — mantén engagement sin crear obligación.
```

**Valor agregado:** Claude diseñó la curva de XP que incentiva sesiones cortas y frecuentes (10–15 minutos diarios) sin penalizar pausas, alineado con realismo conductual del producto.

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura**

### **Prompt 1: Decisiones técnicas (ADRs) para arquitectura serverless**

```
Necesito justificar decisiones técnicas para un MVP en 8 semanas, 1 developer, 
~50K€ de presupuesto AWS/IA:

1. Database: RDS PostgreSQL (db.t4g.micro) vs Aurora Serverless vs DynamoDB
   - Justifica relacional + costo + escalamiento
   
2. Backend: Lambda per endpoint + Layer compartida vs Monolito vs GraphQL
   - Justifica patrón, ventajas, sacrificios
   
3. API: HTTP API vs REST API vs GraphQL
   - Justifica simplicidad, costo, autorización JWT
   
4. Auth: Cognito vs Auth0 vs custom JWT
   - Justifica integración nativa + costo
   
5. IaC: AWS CDK (Python) vs CloudFormation vs SAM
   - Justifica expresividad, testing, mantenimiento
   
6. IA: Claude API vs OpenAI vs Gemini
   - Justifica costo, latencia, modelo para cada use case (Haiku vs Sonnet)

Incluye tabla de ADRs con trade-offs.
```

**Valor agregado:** Claude ayudó a documentar decisiones arquitectónicas de forma justificada (DI-02), facilitando reviews y futuro mantenimiento. El análisis de costos IA (Claude Haiku para tips, Sonnet para suggest-cart) optimizó presupuesto.

---

### **Prompt 2: Diseño de CDK stacks con dependencias explícitas**

```
Diseña 8 stacks CDK en Python con orden de despliegue explícito:

1. VPC stack: VPC, subnets (pública + privada), NAT Gateway, security groups
2. Database stack: RDS PostgreSQL, RDS Proxy, Secrets Manager
3. Lambda stack: Layer + 24 funciones (18 user + 6 admin)
4. API stack: HTTP API Gateway, rutas, integraciones
5. Auth stack: Cognito User Pool, Google IdP, JWT authorizer
6. Storage stack: S3 buckets (assets, web)
7. CDN stack: CloudFront distribution
8. CI stack: GitHub Actions OIDC rol para Alembic migrations

Define dependencias explícitas (add_dependency) y argumentos entre stacks.
Incluye comentarios sobre por qué cada stack existe y qué hace.
```

**Valor agregado:** Claude estructuró los 8 stacks con dependencias claras en código CDK (Python), evitando circular dependencies y facilitando despliegue incremental. El CI stack (OIDC + Alembic) resuelve el problema de ejecutar migrations desde GitHub Actions sin hardcodear secretos.

---

### **Prompt 3: Diagrama y descripción de flujo de request**

```
Dibuja el flujo completo de un request desde cliente (Flutter/React) hasta BD:

1. Cliente envía request autenticado a API Gateway
2. Cognito JWT authorizer valida token
3. Router API Gateway dirige a Lambda específica
4. Lambda handler extrae user_id del JWT
5. Handler invoca use case (Clean Architecture)
6. Use case llama a repository
7. Repository ejecuta query parametrizada a RDS via RDS Proxy
8. Respuesta regresa con envelope estándar + CORS headers

Incluye:
- Diagrama ASCII o Mermaid
- Detalles de seguridad (IDOR checks, input validation)
- Error handling (envelope estándar, sin stack traces)
- Caching (IA suggestions cache 24h)
```

**Valor agregado:** Claude definió el flujo de seguridad de extremo a extremo (authentication → authorization → validation → execution → response), facilitando code reviews y auditorías.

---

### **2.2. Descripción de componentes principales**

### **Prompt 1: Especificación de Clean Architecture en Lambda Layer**

```
Define la estructura de Clean Architecture en backend/layer/python/shared/:

1. domain/
   - entities/ (User, Space, Cart, CartItem, Task, Equipment...)
   - value_objects/ (Xp, CleanlinessScore, EquipmentLevel...)
   - services/ (XpCalculator, CleanlinessPolicy, validadores puros)
   - errors.py (DomainError, NotFoundError, ValidationError, ConflictError)

2. use_cases/
   - ports/ (interfaces ABC: UserRepositoryPort, AiGatewayPort...)
   - cart/, onboarding/, ai/, (carcasa de casos de uso)

3. adapters/
   - repositories/ (SqlUserRepository, SqlCartRepository...)
   - gateways/ (AiGatewayImplementation, CognitoGateway...)
   - presenters/ (user_presenter, cart_presenter...)

4. infrastructure/
   - db.py, auth.py, response.py, config.py, logging.py, errors_map.py

5. schemas/
   - DTOs Pydantic v2 (CartCreateRequest, CartCreateResponse...)

6. orm/
   - SQLAlchemy models (solo para repositories, nunca en use cases)

Justifica la dependency rule: domain → use_cases → adapters → infrastructure.
Incluye ejemplo de handler thin + use case.
```

**Valor agregado:** Claude estructuró Clean Architecture de forma testeable y mantenible. Los handlers thin (10–15 líneas) sin lógica de negocio facilitan testing sin BD y claridad de responsabilidades.

---

### **2.6. Tests**

### **Prompt 1: Estrategia de testing TDD para backend + coverage gates**

```
Define estrategia TDD (Red → Green → Refactor) para backend con coverage ≥95%:

1. Unit tests
   - Domain: entidades, value objects, servicios puros (sin BD/network)
   - Use cases: contra fakes (FakeUserRepository, FakeAiGateway)
   - Adapters: repositories contra testcontainers (PostgreSQL real)
   - Handlers: sin BD (inyección de dependencias)

2. Integration tests
   - Contra PostgreSQL real via testcontainers (Docker required)
   - Transactions rollbacked después de cada test
   - Datos de prueba mediante factories (FactoryBoy)

3. Coverage gates
   - ≥95% en shared/domain, shared/use_cases, shared/adapters
   - Threshold en pyproject.toml
   - CI bloquea PR si cae debajo

4. Fixtures y fakes
   - FakeUserRepository, FakeAiGateway (implementan ports)
   - Factories de entidades (user_factory, space_factory...)
   - Fixtures de pytest para BD, requests

5. Nomenclatura
   - test_*_should_*_when_*.py (test_create_cart_should_calculate_xp_when_given_valid_items.py)

Incluye ejemplos de test unitario y test de handler.
```

**Valor agregado:** Claude diseñó una estrategia TDD donde los tests son especificaciones ejecutables. El 95% coverage + fixtures reutilizables aceleran development iterativo y facilitan refactoring seguro.

---

## 3. Modelo de Datos

### **Prompt 1: Schema PostgreSQL + decisiones de data model**

```
Diseña schema PostgreSQL (9 tablas) para Aida con decisiones justificadas:

Tablas: users, spaces, task_catalog, products, user_equipment, carts, 
cart_items, xp_events, ai_suggestions_cache

Para cada tabla:
1. Columnas (nombre, tipo, constraints, default, descripción)
2. Primary key: UUID via gen_random_uuid()
3. Foreign keys: ON DELETE CASCADE si es apropiado
4. Índices: qué campos indexar para queries frecuentes
5. Constraints: UNIQUE, NOT NULL, CHECK si procede
6. Especial: JSONB para datos semi-estructurados (tips, inventory)

Decisiones clave:
- cleanliness: ¿stored o computed? → Computed en query (dinámico)
- task_catalog: ¿global o por user? → Global (usuarios solo leen/seleccionan)
- ai_suggestions_cache: TTL 24h, context_hash para deduplication
- ON DELETE CASCADE para user → spaces, carts, xp_events (limpiar al borrar user)

Incluye:
- Diagrama ERD (Mermaid)
- Consideraciones de escalamiento
- Plan de migraciones Alembic
```

**Valor agregado:** Claude definió un schema relacional limpio y escalable, con decisiones justificadas (computed cleanliness evita crons, task_catalog global reduce redundancia). Las migraciones Alembic automatizan cambios de schema.

---

### **Prompt 2: Decisión de cómo almacenar tips de IA y metadata**

```
Para fn_ai_tip: cada tarea tiene tips contextuales generados por Claude.

Opciones:
A) Guardar tips en task_catalog.tips (JSONB), precalculados
B) Generar tips on-demand en cada request a fn_ai_tip
C) Cachear tips por usuario + tarea + contexto en ai_suggestions_cache

Compara trade-offs:
- Latencia: A (instant), B (30s Claude call), C (vary)
- Costo IA: A (high upfront), B (highest ongoing), C (medium + cache hits)
- Freshness: A (stale), B (fresh), C (24h)
- Storage: A (task_catalog grows), B (none), C (cache table grows)

¿Cuál recomiendas para MVP? Justifica.

Bonus: ¿Cómo evitar prompt injection en tips generados?
```

**Valor agregado:** Claude recomendó cachear tips con context_hash (SHA-256), balanceando costo, latencia y frescura. La decisión resultó en 70–80% hit rate del cache, reduciendo costos IA.

---

## 4. Especificación de la API

### **Prompt 1: Diseño de API contract (/v1, error envelope, CORS)**

```
Define API contract vinculante para backend (24 Lambdas):

1. Base URL: https://api.aida.local/v1 (por entorno)

2. Error envelope estándar
   {
     "error": "human-readable message",
     "error_code": "MACHINE_READABLE_CODE",
     "request_id": "uuid for tracing"
   }
   Status codes: 200, 201, 400 (input validation), 401 (auth), 
   403 (authorization), 404, 409 (conflict), 429 (rate limit), 500

3. Success envelope
   {
     "data": { ... },
     "meta": { "request_id": "...", "timestamp": "..." }
   }

4. CORS
   - No "Access-Control-Allow-Origin: *" NUNCA
   - Server-side allowlist por entorno
   - Preflight requests manejados por API Gateway

5. Rate limiting
   - API Gateway throttling: 10K requests/min
   - IA endpoint: 3 suggest-cart + 5 tips per user per day
   - Cache hits no cuentan hacia límite

6. Autenticación
   - JWT Bearer token (Cognito)
   - Public routes allowlist: /auth/*, /onboarding/*
   - Protected routes: require Authorization header
   - Admin routes: require cognito:groups claim = aida-admins

7. Request/Response format
   - Content-Type: application/json
   - Campos en request: camelCase o snake_case? → snake_case (Python convention)
   - Fechas: ISO 8601
   - UUIDs: lowercase string (no hyphens? → with hyphens for clarity)

Incluye ejemplos de requests/responses para 3 endpoints principales.
```

**Valor agregado:** Claude definió un contrato de API consistente y defensivo (error envelope estandarizado, CORS seguro, rate limiting claro), evitando sorpresas y facilitando cliente mobile/web.

---

### **Prompt 2: Diseño de Pydantic schemas para DTOs**

```
Define DTOs Pydantic v2 para cart creation:

1. CartCreateRequest (input)
   - items: list[CartItemRequest] con task_id, space_id
   - suggested_by_ai: bool
   - max_items: validación (ej: max 10 items/carrito)
   - Field validations: task_id es UUID válido, space_id es UUID válido

2. CartItemResponse (output en carrito)
   - task_id, space_id
   - task_name, task_description
   - estimated_minutes, xp_reward
   - completed: bool

3. CartCreateResponse (output)
   - cart_id, items (list[CartItemResponse])
   - total_time, total_xp
   - created_at

Considera:
- Validadores custom (ej: verificar que task es válida para level del user)
- Serialización (exclude campos internos, alias para camelCase/snake_case)
- Ejemplos en docstring (para OpenAPI/Swagger)
- Config: forbid extra fields (validate_assignment=True)

¿Dónde validar: Pydantic (input) o handler (lógica de negocio)?
→ Pydantic valida tipos/formato; handler valida lógica (anti-IDOR, equipamiento)
```

**Valor agregado:** Claude estructuró Pydantic schemas con validaciones de entrada robustas, facilitando OpenAPI generation y reduciendo bugs de tipo/formato. El forbid de extra fields previene mass-assignment attacks.

---

## 5. Historias de usuario

### **Prompt 1: Escritura de user stories en formato Gherkin (BDD)**

```
Escribe 3 user stories principales usando formato Gherkin (behavior-driven):

HU-1: Onboarding sin fricción
HU-2: Shopping Cart como core loop
HU-3: Tolerancia a inactividad (realismo conductual)

Formato:
Feature: [nombre]
  Scenario: [caso de uso específico]
    Given [contexto inicial]
    When [acción del usuario]
    Then [resultado esperado]

Incluye:
- 3–5 scenarios por historia
- Criterios de aceptación claros y testables
- Edge cases (ej: user sin equipamiento, tareas inválidas)
- Notas técnicas (qué endpoints, qué tablas)

Bonus: Write scenario outlines con ejemplos (data-driven tests).
```

**Valor agregado:** Claude escribió historias en Gherkin reutilizable como acceptance tests. El formato BDD facilita alineación product-engineering y automated testing.

---

## 6. Tickets de trabajo

### **Prompt 1: Especificación de AID-52 (Onboarding trivia backend)**

```
Soy backend engineer. Necesito especificación detallada para implementar 
fn_onboard_trivia_questions, fn_onboard_trivia, fn_onboard_archetype.

AID-52: Backend — Onboarding trivia

Dame:
1. Endpoint specs (ruta, método, request, response, status codes)
2. Use case logic (EvaluateTrivia, ApplyArchetype)
3. Pydantic schemas (TriviaquestionRequest, TriviaquestionResponse, ...)
4. Data model (trivia questions en BD vs hardcoded)
5. Edge cases (respuesta inválida, usuario ya onboarded, etc.)
6. Tests (qué testear: scoring, character assignment, archetype presets)
7. Acceptance criteria
8. Estimated story points

Asume Clean Architecture + TDD.
```

**Valor agregado:** Claude generó especificación detallada (no ambigua) que aceleró estimación e implementación. La especificación de tests garantizó coverage ≥95%.

---

## 7. Pull requests

### **Prompt 1: Checklist de security review + code review**

```
Voy a hacer code review de PR #32 (Backend — Auth + Onboarding).
Dame un checklist de security + code quality:

Security:
- [ ] Secretos (DB credentials, API keys) no hardcodeados
- [ ] SQL injection: queries parametrizadas via SQLAlchemy?
- [ ] IDOR: queries filtradas por user_id?
- [ ] Token validation: JWT claim `sub` extraído del event?
- [ ] Password: hash seguro? (Cognito maneja, pero verificar)
- [ ] Logging: sin PII (email/passwords)?
- [ ] Error messages: sin stack traces / detalles internos?

Code Quality:
- [ ] Clean Architecture respetada (handler → use case → repository)?
- [ ] Pydantic v2 para input validation?
- [ ] Error envelope estándar?
- [ ] Type hints en funciones?
- [ ] Docstrings en use cases?
- [ ] Tests: handler testeable sin BD? Use case con fakes?
- [ ] Coverage: ≥95%?
- [ ] Linters: ruff, black, mypy, bandit, pip-audit green?

Aplica checklist a PR #32, reporta findings.
```

**Valor agregado:** Claude automatizó code + security review, evitando merge de código inseguro. El checklist es reutilizable para todas las PRs.

---

### **Prompt 2: Generación de commit message en convencional commit**

```
Escribí un feature para fn_cart_complete. Genera commit message en formato
conventional commit:

Cambios:
- Agregué use case CreateCartUseCase en backend/layer/python/shared/use_cases/cart/
- Agregué handler fn_cart_complete/handler.py
- Agregué tests en backend/tests/unit/use_cases/cart/test_create_cart.py
- Coverage ahora es 96% en use_cases/cart/
- XP es registrado en xp_events
- Cleanliness de spaces es actualizado

El cambio es 250 líneas en total, testea 3 funcionalidades clave.
Asume que PR es #38.
```

**Valor agregado:** Claude generó commit message claro y searchable:
```
feat(backend): fn_cart_create con validación y cálculo de XP

- Agregada use case CreateCartUseCase (Clean Architecture)
- Handler thin valida input y delega a use case
- Calcula tiempo total + XP estimado por items
- Tests unitarios (fakes) + integration (testcontainers)
- Coverage: 96% en use_cases/cart/

Closes #AID-78
```

Este formato facilita changelog automático, git blame legible, reversion segura.

---

## Conclusión

Claude Code fue crítico en **todas las fases** del MVP:

1. **Product Phase:** Ayudó a cristalizar propuesta de valor, definir arquetipo y priorizar features para 8 semanas.
2. **Architecture Phase:** Justificó decisiones técnicas (CDK, serverless, PostgreSQL), diseñó structure de Clean Architecture.
3. **Backend Phase:** Especificó API contract, DTOs, error handling, security patterns.
4. **Frontend/Mobile Phase:** Definió state management (Zustand, Riverpod), integración de API.
5. **Infrastructure Phase:** Estructuró 8 stacks CDK con dependencias explícitas, CI/CD setup.
6. **Testing Phase:** Diseñó estrategia TDD, especificó fixtures, automatizó security review.
7. **Code Quality Phase:** Generó checklists, commit messages, PRs documentadas.

**Resultado:** MVP completo, testeable, documentado, deployable en 8 semanas con 1 developer.

---

**Repositorio:** https://github.com/nandilagos/AI4Devs-finalproject-ALJ  
**Última actualización:** Julio 29, 2026
