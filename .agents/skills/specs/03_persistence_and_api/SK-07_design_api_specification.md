---
name: api-specification
description: "Diseña la especificación OpenAPI 3.1/REST Contract-First, YAML declarativo, esquemas de validación tipada, paginación estándar, rate limiting, versionado v1, idempotencia y envolventes RFC 7807."
version: "3.3.0"
category: "03_persistence_and_api"
inputs:
  - "docs/01_product_definition/02_prd.md"
  - "docs/03_persistence_and_api/06_database_schema.md"
outputs:
  - "docs/03_persistence_and_api/07_api_specification.md"
  - "docs/03_persistence_and_api/openapi.yaml"
---

# 🔌 SK-07: Especificación de API REST y Contratos de Dominio (v3.3.0)

Actúa como un **Senior API Architect** y **Contract-First Specialist** experto en RESTful APIs, OpenAPI 3.1, esquemas de validación tipada (independiente del lenguaje/librería), resiliencia distribuida y políticas de diseño API Enterprise.

Tu objetivo es analizar el PRD (`docs/01_product_definition/02_prd.md`) y el Esquema de Base de Datos (`docs/03_persistence_and_api/06_database_schema.md`) para redactar la especificación técnica en `docs/03_persistence_and_api/07_api_specification.md` y generar el contrato ejecutable en `docs/03_persistence_and_api/openapi.yaml`.

---

## 🚫 Non-Goals de Ejecución del Agente (Guards)

Durante la ejecución de este skill, el agente TIENE PROHIBIDO:
1. **No escribir código de controladores HTTP reales:** Prohibido implementar controladores Express, Fastify, Next.js or Spring.
2. **No usar números de coma flotante (`Float`/`Double`) en JSON:** Todos los tipos numéricos con precisión decimal (cantidades, montos, saldos) deben serializarse en JSON estrictamente como `string` numérico formato regex `^\d+(\.\d{1,4})?$` (ej: `"150.0000"`).
3. **No inventar endpoints fuera del alcance:** Especificar únicamente los endpoints requeridos por las Historias de Usuario declaradas en el PRD.
4. **No omitir la Envolvente Estándar de Error:** Prohibido definir respuestas de error improvisadas; exigir el esquema uniforme `StandardErrorEnvelope` o RFC 7807 *Problem Details*.
5. **No omitir estrategia de Idempotencia ni Paginación:** Prohibido definir operaciones mutativas sin `X-Idempotency-Key` o listados de colecciones sin la envolvente estándar de paginación.

---

## 🔄 Pipeline Adaptativo en 5 Fases

### 📍 Fase 1: Matriz Resumen & Versionado de API (`/api/v1/...`) (5 min)
1. Declarar la estrategia de versionado explícito mediante prefijo de ruta `/api/v1/`.
2. Construir la tabla resumen con: Método HTTP, Ruta URL, Roles Requeridos, Resumen Input/Output e Historia de Usuario (`US-XXX`).

### 📍 Fase 2: Matriz de Cabeceras Globales, Idempotencia & Rate Limiting (5 min)
1. Especificar el contrato de cabeceras comunes:
   - `Content-Type: application/json`
   - `Authorization: Bearer <JWT>`
   - `X-Request-ID: <UUIDv4>` (Trazabilidad distribuida)
   - `X-Idempotency-Key: <UUIDv4>` (Requerido en transacciones mutativas)
   - `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` (Cabeceras de cuota)

### 📍 Fase 3: Estándar Obligatorio de Paginación y Filtrado (`GET` Collections) (5 min)
Todas las respuestas de listas o colecciones deben utilizar la envolvente:

```typescript
interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
```

### 📍 Fase 4: Detalle Contrato por Endpoint & Esquemas de Validación (15 min)
Para cada endpoint:
1. Declarar URL, Método, Nivel de Acceso y Descripción.
2. Definir **Request Body Schema** y **Query Parameters** en JSON Schema (independiente de la librería de validación runtime que el backend declare en `docs/00_stack_manifest.md`, ej. Zod, Pydantic, Joi).
3. Definir **Respuesta Exitosa** ($200, 201, 204$).
4. Definir **Respuestas de Error** usando la Envolvente Estándar ($400, 401, 403, 404, 409, 422, 429, 500$).

### 📍 Fase 4.B: Diagrama de Comunicación Frontend ↔ Backend (`mermaid sequenceDiagram`)
Generar un diagrama de secuencia en Mermaid que ilustre el flujo completo de extremo a extremo:
1. Petición HTTP desde el cliente frontend (Touch UI).
2. Intercepción por el middleware del framework backend declarado en el stack manifest (JWT Auth & Validación de Esquema Fail-Fast).
3. Invocación al Caso de Uso y Transacción Pesimista en Base de Datos.
4. Mapeo DTO de Respuesta ($201$) o Envolvente RFC 7807 ($400, 401, 422$).
5. Manejo defensivo de pérdida de conexión y fallback local (`IndexedDB`).

```typescript
// Envolvente Estándar de Error (RFC 7807 / Standard Problem Details)
interface StandardErrorEnvelope {
  error: {
    code: string;           // Ej: "INVALID_FEFO_SEQUENCE", "TOO_MANY_REQUESTS"
    message: string;        // Mensaje legible para desarrollador/usuario
    details?: Array<{ field: string; issue: string }>;
    timestamp: string;      // ISO 8601 UTC
    path: string;           // URI de la solicitud
  };
}
```

### 📍 Fase 5: Generación Dual de Especificación YAML (`openapi.yaml`) & Linting (10 min)
1. Compilar el archivo declarativo físico **`docs/03_persistence_and_api/openapi.yaml`** alineado con el estándar **OpenAPI 3.1.0** para permitir mocking, linting e inspección interactiva.
2. Ejecutar la validación estática del contrato mediante: `npx spectral lint docs/03_persistence_and_api/openapi.yaml`.

---

## 📌 Formato de Salida y Cabecera GFM

El archivo generado en `docs/03_persistence_and_api/07_api_specification.md` debe incluir la cabecera:

```markdown
---
document: api_specification
version: 1.2.0
status: approved
inputs:
  - docs/01_product_definition/02_prd.md
  - docs/03_persistence_and_api/06_database_schema.md
outputs:
  - docs/03_persistence_and_api/07_api_specification.md
  - docs/03_persistence_and_api/openapi.yaml
---

# 🔌 Especificación de API REST y Contratos de Dominio

> **Navegación del Framework SDD:**  
> [⬅️ Volver a Esquema de Base de Datos (06_database_schema.md)](./06_database_schema.md) | [📖 Glosario & Reglas](../../../../docs/01_product_definition/01_glosario_y_reglas_negocio.md) | [Siguiente: Estrategia de Seguridad (08_security_strategy.md) ➡️](../../../../docs/04_governance_and_quality/08_security_strategy.md)

---
```
