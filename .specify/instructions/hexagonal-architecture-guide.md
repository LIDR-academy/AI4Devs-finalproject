
# ⬡ Hexagonal Architecture Guide — Meditation Builder (Backend)
**Versión:** 2.0.0

---

## 0. Propósito
Definir **estructura, dependencias y responsabilidades** de la arquitectura hexagonal en el backend (`/backend`).

---

## 1. Árbol de proyecto (normativo)
```
/backend/src/main/java/com/hexagonal/<boundedContext>/
  application/
    mapper/
    service/
    validator/
  domain/
    enums/
    model/
    ports/
      in/
      out/
  infrastructure/
    in/
      kafka/
      rest/
        controller/
        dto/
        mapper/
    out/
      kafka/
      mongodb/
        impl/
        mapper/
        model/
        repository/
      service/
shared/
  errorhandler/
    dto/
    enums/
    exception/
  kafka/
  observability/
  openapi/
  security/
  utils/

/backend/src/main/resources/openapi/
  common/
  <boundedContext>/
```

---

## 2. Roles por capa
### 2.1 Dominio (`domain`)
- **Qué contiene**: Entidades, VOs, reglas, invariantes, puertos in/out.
- **Qué NO**: frameworks, HTTP, JSON, repositorios, mensajes, IA.
- **Objetivo**: modelo de negocio puro, estable, testeable.

### 2.2 Aplicación (`application`)
- **Qué contiene**: Use cases de orquestación, validadores simples, mappers internos.
- **Qué NO**: reglas complejas de negocio; acceso directo a infra.
- **Objetivo**: coordinar dominio a través de puertos; preparar datos.

### 2.3 Infraestructura (`infrastructure`)
- **in/** adapters de **entrada** (REST/Kafka/CLI): traducen protocolo ↔ comandos.
- **out/** adapters de **salida** (DB/Kafka/servicios externos): implementan puertos out.
- **Objetivo**: detalles técnicos con pruebas de integración.

### 2.4 Shared (`shared`)
- Cross‑cutting: error handling, observabilidad, seguridad, openapi común.

---

## 3. Reglas de dependencia (obligatorias)
- `domain` **no depende** de nadie.
- `application` depende de `domain` y **solo** de sus interfaces (puertos).
- `infrastructure` depende de `application` y **de los puertos** de `domain`.
- `shared` puede ser dependido, pero **debe permanecer estable**.

**Nunca**: `domain` ↔ frameworks; `application` ↔ repos/HTTP directos; `controller` ↔ reglas de negocio.

---

## 4. API First y controllers
- OpenAPI en `/backend/src/main/resources/openapi` (carpetas por contexto y `common`).
- Controllers en `infrastructure/in/rest/controller`; **sin lógica**.
- DTOs REST en `infrastructure/in/rest/dto`.
- Mapear 1:1 contrato ↔ controlador.

---

## 5. Persistencia y mensajería
- Repositorios en `infrastructure/out/<tech>/repository` implementan puertos out.
- Mappers persistencia en `infrastructure/out/<tech>/mapper`.
- Modelos de persistencia en `infrastructure/out/<tech>/model` (no son entidades de dominio).
- Kafka in/out según dirección en `infrastructure/in|out/kafka`.

---

## 6. HTTP clientes externos
- Usar **RestClient** (imperativo) para llamadas síncronas.
- Usar **WebClient** **solo** para streaming/reactivo.
- Timeouts y retries razonables; circuit breaker si aplica.
- **No** loguear prompts ni respuestas IA.

---

## 7. Testing por capa (orden de confianza)
1) Dominio (unit) — reglas e invariantes.
2) Aplicación (unit) — orquestación con mocks.
3) Infra (integration) — Testcontainers para persistencia/mensajería.
4) BDD/E2E — sobre artefacto real.

---

## 8. Directrices para agentes (Spec‑Kit / Copilot)
- Mantener árbol de carpetas **tal cual**.
- Cualquier tarea multi‑capa debe **dividirse** en micro‑tareas.
- Rechazar endpoints/repos/colas no justificados por BDD/plan.

**Principio**: el dominio gobierna; la infraestructura obedece.
