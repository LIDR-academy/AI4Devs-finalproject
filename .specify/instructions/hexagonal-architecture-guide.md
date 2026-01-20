
# Hexagonal Architecture Guide – Estructura de carpetas y roles por capa

> **Ámbito**: Guía operativa para mantener una arquitectura hexagonal limpia y consistente en Java.

---
## 1. Árbol de proyecto backend (referencia)

```
src/main/java/com/poc/hexagonal/
  ├── prescription/                 # Bounded Context
  │   ├── application/
  │   │   ├── mapper/
  │   │   ├── service/
  │   │   └── validator/
  │   ├── domain/
  │   │   ├── enums/
  │   │   ├── model/
  │   │   └── ports/
  │   │       ├── in/
  │   │       └── out/  
  │   └── infrastructure/
  │       ├── in/
  │       │   ├── kafka/
  │       │   └── rest/
  │       │       ├── controller/
  │       │       ├── dto/
  │       │       └── mapper/
  │       └── out/
  │           ├── kafka/
  │           ├── mongodb/
  │           │   ├── impl/
  │           │   ├── mapper/
  │           │   ├── model/
  │           │   └── repository/
  │           └── service/
  └── shared/
      ├── errorhandler/
      │   ├── dto/
      │   ├── enums/
      │   └── exception/
      ├── kafka/
      ├── observability/
      ├── openapi/
      ├── security/
      └── utils/
src/main/resources/openapi/
  ├── common/
  └── prescription/
```

---
## 2. Roles por capa

### 2.1. Dominio (`domain`)
- **Qué contiene**: Entidades, VOs, reglas, invariantes, **puertos** (`ports/in`, `ports/out`).
- **Qué NO**: frameworks, anotaciones, acceso a red/DB, JSON, controladores.
- **Objetivo**: Modelo de negocio puro y estable.

### 2.2. Aplicación (`application`)
- **Qué contiene**: **UseCases** que orquestan el dominio; validadores simples; mappers dominio↔DTO aplicación si aplica.
- **Qué NO**: reglas de negocio complejas; acceso a infra directa.
- **Objetivo**: Coordinar puertos, gestionar transacciones, preparar datos para el dominio.

### 2.3. Infraestructura (`infrastructure`)
- **in/** (adaptadores de **entrada**): REST, Kafka, CLI… traducen protocolo → comandos/DTOs de aplicación.
- **out/** (adaptadores de **salida**): MongoDB, Kafka, servicios externos; implementan puertos **out** del dominio.
- **Objetivo**: Implementar detalles técnicos sin filtrar reglas a la capa.

### 2.4. Shared (`shared`)
- Componentes transversales: error handling, observabilidad, seguridad, utilidades, definiciones OpenAPI comunes.

---
## 3. Reglas de dependencia (mandatorias)
- `domain` **no depende** de nadie.
- `application` puede depender de `domain` **y de las interfaces** (puertos) definidas allí.
- `infrastructure` depende de `application` (para comandos/DTOs) y **de `domain` (puertos)** para implementar salidas.
- `shared` puede ser dependido por todas, pero su API debe ser **estable y mínima**.

**Nunca**: `domain` ↔ frameworks; `application` ↔ repos/HTTP directos; `controller` ↔ reglas de negocio.

---
## 4. API First y controllers
- OpenAPI en `src/main/resources/openapi` (carpetas por contexto y `common`).
- Generación de DTOs **en `infrastructure/in/rest/dto`** (o manual si se decide) para mantener separación.
- Controllers en `infrastructure/in/rest/controller`; **sin lógica**, solo mapping + validaciones superficiales.

---
## 5. Persistencia y mensajería
- Repositorios en `infrastructure/out/<tech>/repository` implementan **puertos out**.
- Mappers de persistencia en `infrastructure/out/<tech>/mapper`.
- Modelos de persistencia en `infrastructure/out/<tech>/model` (no son entidades de dominio).
- Producer/consumer de mensajería en `infrastructure/in|out/kafka` según dirección.

---
## 6. Observabilidad, seguridad y errores (shared)
- `observability/`: configuración de logs/traces/metrics.
- `security/`: filtros, policies y helpers (no reglas de negocio).
- `errorhandler/`: DTOs de error, enums de códigos, excepciones mapeadas.

---
## 7. Testing por capa (orden de confianza)
1) **Dominio (unit)**: reglas e invariantes.
2) **Aplicación (unit)**: orquestación con mocks de puertos.
3) **Infra (integration)**: Testcontainers, contratos.
4) **BDD/e2e**: escenarios end‑to‑end sobre artefacto real.

---
## 8. Directrices para agentes (Spec‑Kit)
- Mantener el árbol de carpetas tal cual.
- Cualquier nueva clase debe ubicarse en el subpaquete exacto según su rol.
- Si una tarea requiere tocar más de una capa, **dividirla** en micro‑tareas por capa.
- Rechazar endpoints, repos o colas no justificados por BDD/plan.
