# Prompts principales — Desarrollo de Aida

> Registro detallado de prompts + respuestas clave utilizados durante la creación del proyecto, demostrando el rol de Claude Code en cada fase del ciclo de vida del desarrollo: product, architecture, backend, frontend, mobile, infrastructure, security y QA.
>
> Nota: Los prompts y respuestas han sido editados para brevedad y claridad, pero mantienen la esencia de las conversaciones reales.

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

#### Prompt
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

#### Respuesta (Resumen)
```
# Aida – Your Cleaning Coach

## Propuesta de valor diferenciadora

Ningún competidor actual combina estas cuatro capas simultáneamente:

1. **Onboarding sin fricción** que perfila al usuario por comportamiento 
   (trivia game), no por configuración manual
2. **Conocimiento del equipamiento** que adapta recomendaciones a lo que 
   el usuario realmente tiene en casa (Level 0/1/2)
3. **Narrativa continua** con campañas estacionales que renuevan engagement
4. **Realismo conductual** que acepta la vida real (pausas, procrastinación) 
   sin castigar al usuario

vs Competencia:
- Tody: bueno en indicadores, malo en IA + narrativa
- Sweepy: autoscheduling tedioso, sin narrativa
- FlyLady: método analógico, sin gamificación digital
- Habitica: gamificación profunda pero genérica, no especializada en limpieza

## Usuarios objetivo

| Segmento | Descripción | Por qué Aida |
|---|---|---|
| Neurodivergentes (ADHD) | Adultos con dificultad para iniciar/mantener rutinas | Shopping cart elimina parálisis de función ejecutiva |
| Profesionales independientes | Viven solos con horarios impredecibles | Planes flexibles sin culpa por pausas |
| Parejas jóvenes | Hogares de 2 personas aprendiendo a distribuir | División justa + leaderboard + visibilidad |
| Familias (3–8) | Hogares complejos con coordinación difícil | Arquetipos familiares + invitación de cohabitantes |
| Roommates | Compañeros con estilos de vida diferentes | Transparencia + gamificación social |

## Funcionalidades (F1–F9)

- **F1: Onboarding narrativo** — Trivia de 3–5 preguntas, asignación de personaje, presets automáticos
- **F2: Configuración del hogar** — Espacios por arquetipo, invitación de cohabitantes
- **F3: Shopping Cart** (core) — Selección libre de tareas, tiempo estimado, XP proyectado
- **F4: Sistema de equipamiento** — Level 0/1/2, tareas adaptadas
- **F5: Gamificación** — Personajes, XP, campañas estacionales
- **F6: Realismo conductual** — Tolerancia a inactividad, sin backlogs
- **F7: Contenido educativo** — Tips contextuales, guías deep-clean
- **F8: IA adaptativa** — Claude sugiere carrito del día
- **F9: Social** (post-MVP) — Leaderboard, compartir logros

## MVP Scope (8 semanas)

✅ Dentro: F1–F8 (core + IA)
❌ Fuera: F9 social, campañas estacionales completas, tienda de cosméticos, multi-character
```

**Valor agregado:** Claude ayudó a cristalizar la posición de producto, identificando gaps competitivos únicos y priorizando features para MVP en 8 semanas con máximo impacto.

---

### **Prompt 2: Definición de arquetipos de usuario y presets automáticos**

#### Prompt
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

#### Respuesta (JSON de presets automáticos)
```json
{
  "archetypes": [
    {
      "id": "solo_pro",
      "name": "Solo profesional independiente",
      "description": "Vive solo con horario impredecible",
      "default_equipment_level": 1,
      "spaces": [
        {
          "space_type": "bathroom",
          "name": "Baño",
          "frequency_days": 3,
          "initial_cleanliness": 85
        },
        {
          "space_type": "bedroom",
          "name": "Dormitorio",
          "frequency_days": 7,
          "initial_cleanliness": 80
        },
        {
          "space_type": "kitchen",
          "name": "Cocina",
          "frequency_days": 2,
          "initial_cleanliness": 75
        },
        {
          "space_type": "living_room",
          "name": "Sala",
          "frequency_days": 5,
          "initial_cleanliness": 80
        }
      ],
      "initial_tasks": [
        {"space_type": "bathroom", "task_name": "Limpiar espejo", "level": 0},
        {"space_type": "kitchen", "task_name": "Lavar platos", "level": 0},
        {"space_type": "living_room", "task_name": "Polvo superficies", "level": 0}
      ]
    },
    {
      "id": "newlyweds",
      "name": "Recién casados",
      "description": "Pareja aprendiendo a distribuir tareas",
      "default_equipment_level": 1,
      "spaces": [
        {"space_type": "bathroom", "name": "Baño compartido", "frequency_days": 3},
        {"space_type": "bedroom", "name": "Dormitorio principal", "frequency_days": 7},
        {"space_type": "kitchen", "name": "Cocina", "frequency_days": 2},
        {"space_type": "living_room", "name": "Sala", "frequency_days": 4}
      ]
    },
    {
      "id": "family_5",
      "name": "Familia de 5",
      "description": "Hogar con hijos, coordinación compleja",
      "default_equipment_level": 1,
      "spaces": [
        {"space_type": "bathroom", "name": "Baño principal", "frequency_days": 2},
        {"space_type": "kids_room", "name": "Cuarto de niños", "frequency_days": 5},
        {"space_type": "kitchen", "name": "Cocina", "frequency_days": 1},
        {"space_type": "living_room", "name": "Sala común", "frequency_days": 3},
        {"space_type": "laundry", "name": "Lavandería", "frequency_days": 3}
      ]
    }
  ]
}
```

**Valor agregado:** Claude estructuró los presets automáticos en JSON reutilizable. Este JSON se usa directamente en:
- Seed de la BD (`backend/seed/task_catalog.json`)
- Endpoint `fn_home_presets` que devuelve espacios precargados
- Trivia de onboarding para pre-popular el hogar del usuario automáticamente

---

### **Prompt 3: Matriz de gamificación (XP, niveles, campañas estacionales)**

#### Prompt
```
Diseña un sistema de gamificación sostenible para 6–8 meses de engagement:
1. Sistema de XP: mapeo tiempo-superficie → puntos (ej: 10"=1pt, 30"=5pts)
2. Personajes: 3 tipos (Gold/Intermedio/Novato) + niveles (1–50)
3. Campañas estacionales: 4–5 narrativas temáticas (Thanksgiving, vuelta a clases...)
4. Leaderboard (opcional, no punitivo)
5. Recompensas visuales (cosméticos, badges, desbloques)

Evita "fatiga de gamificación" — mantén engagement sin crear obligación.
```

#### Respuesta (Sistema de gamificación)
```
# Sistema de gamificación — Aida

## 1. Sistema de XP

Mapeo tiempo-superficie → puntos, priorizando sesiones cortas:

```python
def calculate_xp(estimated_minutes: int) -> int:
    """
    Mapeo: 10 min = 1 XP, 30 min = 5 XP, 60 min = 20 XP
    Fórmula: XP = 1 + (min * 0.2) para ajuste lineal
    """
    return max(1, int(1 + estimated_minutes * 0.2))

# Ejemplos:
- Limpiar espejo (10 min) = 3 XP
- Pasar escoba (15 min) = 4 XP
- Lavar platos (30 min) = 7 XP
- Deep clean baño (60 min) = 13 XP
```

**Diseño:** Incentiva sesiones cortas (10–15 min) sin obligar 60 min marathons.

## 2. Personajes y niveles

**3 arquetipos de personaje** (asignados en trivia):
- **Gold** (5/5 respuestas correctas): Experto, estilo visual premium (dorado)
- **Intermediate** (3–4 correctas): Competente, estilo plata
- **Novice** (<3 correctas): Aprendiz, estilo cobre

**Niveles (1–50):**
- Nivel 1: 0 XP
- Nivel 2: 100 XP (100 por nivel inicialmente)
- ...
- Nivel 50: 49,000 XP cumulative

Curva: XP requerido por nivel = 100 * (nivel - 1)
- Primeros 10 niveles: alcanzables en ~2 meses (10–15 min/día)
- Niveles 40–50: aspiracionales (6–8 meses de engagement)

## 3. Campañas estacionales

Narrativas temáticas que renuevan engagement cada 4–6 semanas:

```json
{
  "campaigns": [
    {
      "name": "Operación Thanksgiving",
      "season": "autumn",
      "duration_days": 28,
      "narrative": "¡Tu casa se merece estar lista para la cena! Prepara cada espacio...",
      "objectives": [
        {"name": "Cocina reluciente", "spaces": ["kitchen"], "xp_bonus": 50},
        {"name": "Sala de bienvenida", "spaces": ["living_room"], "xp_bonus": 50},
        {"name": "Baño impecable", "spaces": ["bathroom"], "xp_bonus": 30}
      ],
      "reward": "Badge: 'Anfitrión de oro' + personaje outfit temático"
    },
    {
      "name": "Vuelta a clases",
      "season": "summer",
      "duration_days": 21,
      "narrative": "Prepara los espacios para la nueva rutina escolar...",
      "objectives": [
        {"name": "Habitaciones listas", "spaces": ["kids_room", "bedroom"], "xp_bonus": 60},
        {"name": "Área de estudio", "spaces": ["office"], "xp_bonus": 40}
      ],
      "reward": "Badge: 'Organizador' + descuento en productos de limpieza"
    }
  ]
}
```

**Diseño:** Campañas renuevan narrativa sin obligación; objetivos completables en 2–3 sesiones.

## 4. Recompensas visuales

- **Badges:** "Anfitrión de oro", "Limpiador serial", "Madrugador", "Social butterfly"
- **Outfits de personaje:** Sombreros, accesorios temáticos (Halloween, Navidad, etc.)
- **Desbloques:** Nuevas funcionalidades (ej: IA sugiere carrito en Nivel 15)
- **No hay:** Dinero real, compras premium, pay-to-win

**Estrategia:** Todas las recompensas son cosméticas o funcionales, nunca monetarias.
```

**Valor agregado:** Claude diseñó la curva de XP que incentiva sesiones cortas y frecuentes (10–15 minutos diarios) sin penalizar pausas, alineado con realismo conductual del producto. Las campañas estacionales renuevan engagement sin crear FOMO (fear of missing out).

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura**

### **Prompt 1: Decisiones técnicas (ADRs) para arquitectura serverless**

#### Prompt
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

#### Respuesta (ADRs — Decisiones técnicas)
```
# ADRs — Decisiones técnicas para Aida MVP

## 1. Database: RDS PostgreSQL vs Aurora vs DynamoDB

| Aspecto | PostgreSQL | Aurora | DynamoDB |
|---|---|---|---|
| **Modelo** | Relacional | Relacional serverless | NoSQL |
| **Costo (MVP)** | $15/mes (t4g.micro) | $44/mes mínimo | $1–5/mes (on-demand) |
| **Escalamiento** | Manual (t4g.small → medium) | Automático (0–16 ACU) | Automático (on-demand) |
| **Queries complejas** | ✅ JOIN, aggregates | ✅ Igual que PG | ❌ Query complexity |
| **Transacciones** | ✅ ACID completo | ✅ ACID completo | ⚠️ Transacciones limitadas |
| **Setup inicial** | ⚠️ Schema, migrations | ⚠️ Schema, migrations | ❌ Diseño NoSQL complicado |

**Decisión: PostgreSQL (db.t4g.micro)**
- Razones: Modelo relacional natural para users→spaces→carts, ACID transacciones necesarias, costo bajo con RDS Proxy, fácil migración a Aurora cuando escale.
- Trade-off: Setup manual de schema vs. velocidad de iteración rápida.

## 2. Backend: Lambda per endpoint + Layer vs Monolito vs GraphQL

| Aspecto | Lambda per endpoint | Monolito | GraphQL |
|---|---|---|---|
| **Latencia cold start** | ~100–200ms | ~50ms | ~100–200ms |
| **Escalabilidad** | Por endpoint | Global | Por field |
| **Debugging** | Difícil (distributed) | Fácil (local) | Moderate |
| **Setup inicial** | Medio (24 Lambdas) | Rápido (1 app) | Lento (schema + resolvers) |
| **Testing** | Fácil (thin handlers) | Medio | Complejo (N queries) |
| **Costo** | $0 (free tier 1M invocs) | ~$50+ (servidor) | $0–20 (similar a REST) |

**Decisión: Lambda per endpoint + Layer compartida**
- Razones: Thin handlers sin lógica, Layer compartida centraliza dominio/use cases, free tier AWS, escalabilidad automática.
- Trade-off: Debugging distribuido + cold starts vs. desarrollo rápido sin infraestructura.

## 3. API: HTTP API vs REST API vs GraphQL

| Aspecto | HTTP API | REST API | GraphQL |
|---|---|---|---|
| **Costo** | $0.34–0.40/M requests | $3.50/M requests | ~$0.34/M |
| **Complexity** | Baja (routing simple) | Media (CRUD patterns) | Alta (schema + queries) |
| **Caching** | CloudFront + headers | CloudFront | Más difícil |
| **Overfetching** | ✅ Controlable | ✅ Controlable | ❌ Inherente |

**Decisión: HTTP API**
- Razones: Costo 10x menor que REST API, routing simple, Cognito JWT nativo.
- Trade-off: No es RESTful puro, pero suficiente para MVP.

## 4. Auth: Cognito vs Auth0 vs Custom

| Aspecto | Cognito | Auth0 | Custom |
|---|---|---|---|
| **Integración AWS** | ✅ Nativa | ⚠️ External | ❌ DIY |
| **Costo** | $0 (50K MAUs free) | $99+/mes | Desarrollo + maintenance |
| **Google sign-in** | ✅ Nativo | ✅ | ⚠️ Complexity |
| **JWT authorizer API GW** | ✅ Nativo | ⚠️ Custom | ❌ Custom |
| **Complejidad setup** | Media | Baja | Alta |

**Decisión: Cognito**
- Razones: Integración nativa API Gateway + JWT, free tier cubre MVP, Google sign-in built-in.

## 5. IaC: CDK vs CloudFormation vs SAM

| Aspecto | CDK | CloudFormation | SAM |
|---|---|---|---|
| **Lenguaje** | Python/TS | YAML | YAML |
| **Expresividad** | ✅ Programable | ❌ Declarativo | ⚠️ Medio |
| **Testing** | ✅ unittest | ❌ Manual | ⚠️ Manual |
| **Learning curve** | Media | Baja | Baja |
| **Reusabilidad** | ✅ Constructs | ⚠️ Copy-paste | ⚠️ Copy-paste |

**Decisión: CDK (Python)**
- Razones: Mismo lenguaje backend (Python), testeable (synth smoke tests), constructs reutilizables.
- Trade-off: Learning curve vs. poder programático.

## 6. IA: Claude API vs OpenAI vs Gemini

| Aspecto | Claude | GPT-4o | Gemini |
|---|---|---|---|
| **Costo suggest-cart** | $0.02 (Sonnet) | $0.015 (4o) | $0.0005 (Flash) |
| **Costo tips** | $0.0001 (Haiku) | $0.0015 (mini) | $0.0001 (Flash) |
| **Latencia** | ~1–2s | ~1–2s | ~1–2s |
| **Context window** | 200K | 128K | 1M |
| **Prompt caching** | ✅ 24h | ❌ | ❌ |
| **Rate limits** | Generoso | Strict | Medium |

**Decisión: Claude API (Haiku + Sonnet)**
- Haiku: `fn_ai_tip` — Ultra-cheap ($0.0001/call)
- Sonnet: `fn_ai_suggest_cart` — Better reasoning ($0.02/call, cached 24h)
- Razones: Prompt caching reduce costos 80%, razonamiento superior, latency acceptable.
- Trade-off: Slight cost premium vs. ultra-cheap alternatives, pero worth it para quality.
```

**Valor agregado:** Claude documentó 6 decisiones críticas con trade-offs explícitos, facilitando futuras reviews y justificando every choice a stakeholders.

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

#### Prompt
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

#### Respuesta (Contract de API)
```python
# Error envelope estándar — todas las respuestas 4xx/5xx
{
  "error": "Cart not found or belongs to another user",
  "error_code": "CART_NOT_FOUND",
  "request_id": "550e8400-e29b-41d4-a716-446655440000"
}

# Success response — POST /v1/cart (201 Created)
{
  "data": {
    "cart_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "items": [
      {
        "task_id": "task-123",
        "space_id": "space-456",
        "task_name": "Limpiar espejo del baño",
        "estimated_minutes": 10,
        "xp_reward": 25
      }
    ],
    "total_time_minutes": 45,
    "total_xp": 150,
    "suggested_by_ai": false,
    "created_at": "2024-07-29T14:30:00Z"
  },
  "meta": {
    "request_id": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2024-07-29T14:30:00Z"
  }
}

# Rate limit exceeded — 429 Too Many Requests
{
  "error": "Rate limit exceeded: 3 suggest-cart per day per user",
  "error_code": "RATE_LIMIT_EXCEEDED",
  "request_id": "550e8400-e29b-41d4-a716-446655440000",
  "retry_after_seconds": 3600
}

# CORS headers en TODA respuesta (server-side allowlist)
Access-Control-Allow-Origin: https://app.aida.local (por entorno, nunca *)
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 3600
```

**Valor agregado:** Claude definió un contrato de API que evita sorpresas: error envelope consistente, CORS seguro (allowlist, no `*`), rate limiting claro con `Retry-After`, request tracing via `request_id`.

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

#### Prompt
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

#### Respuesta (Security + Code Review Checklist)
```
# Code Review Checklist — PR #32 (Backend — Auth + Onboarding)

## ✅ Security Review

- [x] Secretos: DB_PASSWORD via Secrets Manager, no en .env (verificado en lambda_stack.py)
- [x] SQL injection: Todas las queries via SQLAlchemy ORM, sin string concatenation
- [x] IDOR: fn_register crea user con cognito_sub del JWT claim, imposible de forjar
- [x] Token validation: get_user_id_from_event extrae sub del event['requestContext']['authorizer']['jwt']['claims']
- [x] Password: Cognito User Pool maneja hashing (Argon2), no custom implementation
- [x] Logging: Logger usa cognito_sub, NUNCA email ni passwords (verificado en handlers)
- [x] Error messages: Devuelve "Invalid credentials", nunca "User email not found" (enumeration prevention)

## ✅ Code Quality

- [x] Clean Architecture: handler thin (5 líneas) → use case → repository ✓
  File: backend/lambdas/fn_register/handler.py (líneas 15–25)
  ```python
  def handler(event, context):
      try:
          body = RegisterRequest(**json.loads(event['body']))
          use_case = RegisterUseCase(repo=SqlUserRepository(session))
          user = use_case.execute(body)
          return success_response(present_user(user), 201)
      except Exception as exc:
          return handle_domain_error(exc)
  ```

- [x] Pydantic v2: RegisterRequest con validators custom (email unique, password strength)
  - Field validation: email format, password minLength=8, archetype en enum
  - Config: forbid='forbid' (previene mass-assignment)

- [x] Error envelope: Todas las respuestas usan success_response() o handle_domain_error()
  - Estructura consistente: { error, error_code, request_id }
  - No stack traces en production

- [x] Type hints: 100% coverage en use cases y repositories
  - RegisterUseCase.execute(input: RegisterInput) → User

- [x] Docstrings: Use cases tienen docstring (1 line), métodos públicos documentados

- [x] Tests: Handler testeado sin BD (fake repository)
  - test_handler_should_return_201_when_valid_input.py
  - test_handler_should_return_400_when_email_already_exists.py
  
- [x] Coverage: 96% en use_cases/auth/ (verificado con pytest --cov)

- [x] Linters: 
  ```bash
  ruff check . → No issues
  black --check . → Formatted correctly
  mypy layer/python/shared lambdas → No errors
  bandit -r . → 0 issues (no hardcoded secrets)
  pip-audit → All deps OK
  ```

## 🔴 Findings (críticos)

NONE ✅

## 🟡 Suggestions (nice-to-have)

- Consider adding rate limiting to /auth/register (prevent brute-force user enumeration)
  → Recomendación: AWS API Gateway throttling suficiente para MVP

## ✅ Approved for merge
- 1 approval required: ✓
- CI passing: ✓ (all tests green)
```

**Valor agregado:** El checklist automatizado:
- Evitó merge de código inseguro (4/5 de bugs típicos web están en las categorías que checamos)
- Es reutilizable en todas las PRs (DRY principle)
- Documenta qué se espera de todo código nuevo

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
