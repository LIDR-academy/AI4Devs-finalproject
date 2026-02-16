
# ⬡ Hexagonal Architecture Guide — Meditation Builder (Backend)
**Versión:** 2.1.0 (Actualizado con 2 bounded contexts implementados)

---

## 0. Propósito
Definir **estructura, dependencias y responsabilidades** de la arquitectura hexagonal en el backend (`/backend`).

**Estado actual del proyecto (Febrero 2026)**:
- ✅ **BC 1: `meditationbuilder`** (US2) - In-memory persistence, OpenAI adapters
- ✅ **BC 2: `meditation.generation`** (US3) - PostgreSQL persistence, Google TTS, FFmpeg, S3
- ❌ **BC 3**: Auth (US1) - Pendiente
- ❌ **BC 4**: List & Play (US4) - Pendiente

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
    exception/
    ports/
      in/
      out/
  infrastructure/
    in/
      rest/                    # Adaptadores REST (implementado)
        controller/
        dto/
        mapper/
      kafka/                   # (ejemplo - no implementado aún)
    out/
      persistence/             # Adaptadores de persistencia (implementado)
        impl/
        mapper/
        model/
        repository/
      service/                 # Adaptadores a servicios externos (implementado)
        dto/
        mapper/
      mongodb/                 # (ejemplo - no implementado aún)
        impl/
        mapper/
        model/
        repository/
      kafka/                   # (ejemplo - no implementado aún)
    config/                    # Configuración de infraestructura

shared/                        # Módulo transversal
  errorhandler/
    dto/
    enums/
    exception/
  observability/
  openapi/
  security/
  utils/

/backend/src/main/resources/openapi/
  common/
  <boundedContext>/
```

**Note**: `kafka/` and `mongodb/` are **examples** of potential future technology choices for messaging and alternative persistence.

**Current implementation** across bounded contexts:
- **Inbound adapters**: `rest/` (HTTP REST Controllers for all BCs)
- **Outbound adapters - BC meditationbuilder**:
  - `persistence/` → InMemoryRepository (temporal composition storage)
  - `service/` → OpenAI adapters (text + image generation)
- **Outbound adapters - BC meditation.generation**:
  - `persistence/` → PostgreSQL via JPA (permanent generation storage)
  - `adapter/tts/` → Google Cloud TTS (voice synthesis)
  - `adapter/ffmpeg/` → FFmpeg (audio/video rendering)
  - `adapter/storage/` → AWS S3 / LocalStack (media file storage)
  - `service/subtitle/` → Subtitle synchronization (SRT generation)

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
- **in/** adapters de **entrada** (REST implementado; Kafka/CLI como ejemplos futuros): traducen protocolo ↔ comandos.
- **out/** adapters de **salida** (persistence/service implementados; DB/Kafka como ejemplos): implementan puertos out.
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
- Repositorios en `infrastructure/out/persistence/` implementan puertos out:
  - **BC meditationbuilder**: `InMemoryCompositionRepository` (temporal, suficiente para composición)
  - **BC meditation.generation**: `PostgresContentRepository` (JPA, persistencia permanente)
- Mappers persistencia en `infrastructure/out/persistence/mapper/`.
- Modelos de persistencia en `infrastructure/out/persistence/model/` o `entity/` (no son entidades de dominio).
- Adaptadores a servicios externos:
  - **BC meditationbuilder**: `infrastructure/out/service/` (OpenAI text+image, MediaCatalog mock)
  - **BC meditation.generation**: `infrastructure/out/adapter/` (Google TTS, FFmpeg, S3)
- Mensajería (Kafka) se ubicaríaPor en `infrastructure/in|out/kafka/` según dirección (**NO IMPLEMENTADO - ejemplo futuro**).

---

## 6. HTTP clientes externos y otros adaptadores
- Usar **RestClient** (imperativo) para llamadas síncronas HTTP.
- Usar **WebClient** **solo** para streaming/reactivo.
- Timeouts y retries razonables; circuit breaker si aplica.
- **No** loguear prompts ni respuestas IA.

**Adaptadores no HTTP implementados (BC generation)**:
- **Google Cloud TTS SDK**: Síntesis de voz (biblioteca nativa Java)
- **FFmpeg CLI**: Renderizado audio/video (process execution)
- **AWS S3 SDK**: Almacenamiento objetos (biblioteca nativa Java + LocalStack para test)

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
